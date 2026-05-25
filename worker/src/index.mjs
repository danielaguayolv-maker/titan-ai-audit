import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SUPABASE_URL = requiredEnv("SUPABASE_URL").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = requiredEnv("OPENAI_API_KEY");
const APIFY_TOKEN = process.env.APIFY_TOKEN?.trim() ?? "";
const APIFY_TIKTOK_VIDEO_ACTOR_ID =
  process.env.APIFY_TIKTOK_VIDEO_ACTOR_ID?.trim() ||
  process.env.APIFY_TIKTOK_ACTOR_ID?.trim() ||
  "";
const OPENAI_MODEL =
  process.env.OPENAI_VIDEO_MODEL?.trim() ||
  process.env.OPENAI_MODEL?.trim() ||
  "gpt-4o-mini";
const FFMPEG_BIN = process.env.FFMPEG_PATH?.trim() || "ffmpeg";
const FFPROBE_BIN = process.env.FFPROBE_PATH?.trim() || "ffprobe";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 5000);
const JOB_STALE_MINUTES = Number(process.env.JOB_STALE_MINUTES ?? 20);
const MAX_VIDEO_BYTES = 120 * 1024 * 1024;

const APIFY_BASE_URL = "https://api.apify.com/v2";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";

const TIKTOK_DOWNLOAD_HEADERS = {
  Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.tiktok.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "videoHookScore",
    "firstThreeSecondsAnalysis",
    "visualPacingRead",
    "onScreenTextCtaRead",
    "transcriptRead",
    "emotionalPull",
    "retentionRisk",
    "recommendedEdit",
    "strongerOpeningRewrite",
    "strongerCtaRewrite",
    "transparencyNotes"
  ],
  properties: {
    videoHookScore: { type: "number" },
    firstThreeSecondsAnalysis: sectionSchema(),
    visualPacingRead: sectionSchema(),
    onScreenTextCtaRead: sectionSchema(),
    transcriptRead: sectionSchema(),
    emotionalPull: sectionSchema(),
    retentionRisk: sectionSchema(),
    recommendedEdit: sectionSchema(),
    strongerOpeningRewrite: { type: "string" },
    strongerCtaRewrite: { type: "string" },
    transparencyNotes: {
      type: "array",
      items: { type: "string" }
    }
  }
};

function sectionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["signalType", "summary", "evidence"],
    properties: {
      signalType: {
        type: "string",
        enum: [
          "Direct visual signal",
          "Transcript signal",
          "Inferred strategic signal"
        ]
      },
      summary: { type: "string" },
      evidence: {
        type: "array",
        items: { type: "string" }
      }
    }
  };
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function supabaseHeaders(prefer) {
  return {
    ...(prefer ? { Prefer: prefer } : {}),
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json"
  };
}

async function supabaseJson(response, label) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${label} failed with status ${response.status}. ${text.slice(0, 240)}`);
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(`${label} returned non-JSON response. ${text.slice(0, 240)}`);
  }

  return response.json();
}

async function pollQueuedJob() {
  const staleCutoff = new Date(Date.now() - JOB_STALE_MINUTES * 60_000).toISOString();
  const query = new URLSearchParams({
    limit: "1",
    order: "created_at.asc",
    or: `(status.eq.queued,and(status.eq.processing,updated_at.lt.${staleCutoff}))`,
    select: "*"
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/video_analysis_jobs?${query}`, {
    headers: supabaseHeaders(),
    method: "GET"
  });
  const rows = await supabaseJson(response, "Poll queued jobs");
  return rows[0] ?? null;
}

async function updateJob(id, patch) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/video_analysis_jobs?id=eq.${encodeURIComponent(id)}`,
    {
      body: JSON.stringify({
        ...patch,
        updated_at: new Date().toISOString()
      }),
      headers: supabaseHeaders("return=representation"),
      method: "PATCH"
    }
  );
  const rows = await supabaseJson(response, `Update job ${id}`);
  return rows[0] ?? null;
}

async function claimJob(row) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/video_analysis_jobs?id=eq.${encodeURIComponent(row.id)}&status=in.(queued,processing)`,
    {
      body: JSON.stringify({
        error_message: null,
        progress_message: "Resolving TikTok media",
        status: "processing",
        updated_at: new Date().toISOString()
      }),
      headers: supabaseHeaders("return=representation"),
      method: "PATCH"
    }
  );
  const rows = await supabaseJson(response, `Claim job ${row.id}`);
  return rows[0] ?? null;
}

function actorPath(actorId) {
  return actorId.replace("/", "~");
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function collectRecords(value, depth = 0) {
  if (depth > 8) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectRecords(item, depth + 1));
  if (!isRecord(value)) return [];
  return [value, ...Object.values(value).flatMap((item) => collectRecords(item, depth + 1))];
}

function firstString(records, keys) {
  for (const record of records) {
    for (const key of keys) {
      const value = stringValue(record[key]);
      if (value) return value;
    }
  }
  return undefined;
}

function firstNumber(records, keys) {
  for (const record of records) {
    for (const key of keys) {
      const value = numberValue(record[key]);
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

function isHttpUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function detectUrlType(value) {
  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    if (/\.(mp4|mov|m4v|webm)(\?.*)?$/.test(`${pathname}${parsedUrl.search}`)) {
      return "direct-video";
    }
    if (hostname.includes("tiktok.com")) return "tiktok";
    return "unsupported";
  } catch {
    return "unsupported";
  }
}

function looksLikeVideoUrl(value) {
  if (!isHttpUrl(value)) return false;
  const lower = value.toLowerCase();
  return /\.(mp4|mov|m4v|webm)(\?|#|$)/.test(lower) ||
    lower.includes("video") ||
    lower.includes("play") ||
    lower.includes("download");
}

function looksLikeImageUrl(value) {
  if (!isHttpUrl(value)) return false;
  return /\.(jpg|jpeg|png|webp)(\?|#|$)/.test(value.toLowerCase());
}

function collectMediaCandidates(value, pathParts = [], depth = 0) {
  const mediaFields = [
    "videourl",
    "url",
    "downloadaddr",
    "playaddr",
    "urllist",
    "mediaurls",
    "videometa",
    "webvideourl",
    "diggurl",
    "originalvideourl",
    "downloadurl"
  ];

  if (depth > 8) return [];
  if (typeof value === "string") {
    const path = pathParts.join(".");
    const isMediaPath = pathParts.some((part) =>
      mediaFields.includes(part.replace(/\[\d+\]$/, "").toLowerCase())
    );
    return isMediaPath && looksLikeVideoUrl(value)
      ? [{ fieldPath: path, url: value.trim() }]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectMediaCandidates(item, [...pathParts, `[${index}]`], depth + 1)
    );
  }
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, nested]) =>
    collectMediaCandidates(nested, [...pathParts, key], depth + 1)
  );
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.url)) return false;
    seen.add(candidate.url);
    return true;
  });
}

function firstImageUrl(records) {
  const keys = [
    "cover",
    "coverUrl",
    "dynamicCover",
    "originCover",
    "thumbnail",
    "thumbnailUrl",
    "imageUrl",
    "poster"
  ];
  const candidates = [];
  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string") candidates.push(value);
      if (Array.isArray(value)) candidates.push(...value.filter((item) => typeof item === "string"));
    }
  }
  return candidates.find(looksLikeImageUrl) ?? candidates.find(isHttpUrl);
}

function extractHashtags(records, caption = "") {
  const hashtags = new Set();
  for (const match of caption.matchAll(/#([\p{L}\p{N}_]+)/gu)) {
    hashtags.add(match[1]);
  }
  for (const record of records) {
    const value = record.hashtags ?? record.hashtagNames ?? record.tags;
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (typeof item === "string") hashtags.add(item.replace(/^#/, ""));
      if (isRecord(item)) {
        const name = stringValue(item.name) ?? stringValue(item.title) ?? stringValue(item.hashtagName);
        if (name) hashtags.add(name.replace(/^#/, ""));
      }
    }
  }
  return Array.from(hashtags).slice(0, 20);
}

async function apifyJson(response, label) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${label} failed with status ${response.status}. ${text.slice(0, 240)}`);
  }
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(`${label} returned non-JSON response. ${text.slice(0, 240)}`);
  }
  return response.json();
}

async function runApifyTikTok(url) {
  if (!APIFY_TOKEN || !APIFY_TIKTOK_VIDEO_ACTOR_ID) {
    throw new Error("TikTok downloader is not configured. Add APIFY_TOKEN and APIFY_TIKTOK_VIDEO_ACTOR_ID.");
  }

  const input = {
    maxItems: 1,
    postURLs: [url],
    resultsLimit: 1,
    shouldDownloadCovers: false,
    shouldDownloadVideos: false,
    startUrls: [url],
    urls: [url],
    videoUrls: [url]
  };
  const runResponse = await fetch(
    `${APIFY_BASE_URL}/acts/${actorPath(APIFY_TIKTOK_VIDEO_ACTOR_ID)}/runs?token=${encodeURIComponent(APIFY_TOKEN)}&waitForFinish=120`,
    {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    }
  );
  const runPayload = await apifyJson(runResponse, "Apify TikTok actor run");
  const datasetId = runPayload?.data?.defaultDatasetId;
  const status = runPayload?.data?.status;

  if (!datasetId) throw new Error("Apify did not return a dataset for TikTok media.");
  if (status && !["SUCCEEDED", "READY"].includes(status)) {
    throw new Error(`Apify TikTok actor finished with status ${status}.`);
  }

  const datasetResponse = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${encodeURIComponent(APIFY_TOKEN)}&clean=true&limit=10`
  );
  const items = await apifyJson(datasetResponse, "Apify TikTok dataset");
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

async function probeCandidate(candidate) {
  try {
    const response = await fetch(candidate.url, {
      headers: { ...TIKTOK_DOWNLOAD_HEADERS, Range: "bytes=0-0" },
      redirect: "follow"
    });
    const contentType = response.headers.get("content-type") ?? "";
    await response.body?.cancel?.();
    return response.ok || response.status === 206
      ? contentType.toLowerCase().startsWith("video/")
      : false;
  } catch {
    return false;
  }
}

async function resolveTikTokMedia(inputUrl) {
  const items = await runApifyTikTok(inputUrl);
  if (items.length === 0) throw new Error("Apify returned no TikTok media items.");

  const records = collectRecords(items);
  const caption = firstString(records, ["text", "caption", "description", "desc", "title"]);
  const authorHandle = firstString(records, ["uniqueId", "username", "author", "authorName", "nickname", "name", "handle"]);
  const coverImageUrl = firstImageUrl(records);
  const candidates = uniqueCandidates(
    items.flatMap((item, index) =>
      collectMediaCandidates(item, [`item[${index}]`])
    )
  );
  let resolvedVideoUrl;

  for (const candidate of candidates) {
    if (await probeCandidate(candidate)) {
      resolvedVideoUrl = candidate.url;
      break;
    }
  }

  return {
    authorHandle,
    caption,
    coverImageUrl,
    duration: firstNumber(records, ["duration", "durationSec", "videoDuration"]) ?? 0,
    engagementMetrics: {
      comments: firstNumber(records, ["commentCount", "comments"]),
      likes: firstNumber(records, ["diggCount", "likeCount", "likes", "heartCount"]),
      shares: firstNumber(records, ["shareCount", "shares"]),
      views: firstNumber(records, ["playCount", "viewCount", "views", "videoViews"])
    },
    hashtags: extractHashtags(records, caption),
    resolvedVideoUrl,
    sourceLabel: authorHandle ? `TikTok @${authorHandle}` : "TikTok video"
  };
}

async function downloadVideo(url) {
  const response = await fetch(url, {
    headers: TIKTOK_DOWNLOAD_HEADERS,
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`Video download failed with status ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("video/")) {
    throw new Error(`Resolved media returned ${contentType || "unknown content type"} instead of video.`);
  }
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_VIDEO_BYTES) throw new Error("Video exceeds worker download limit.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_VIDEO_BYTES) throw new Error("Video exceeds worker download limit.");
  return { buffer, contentType };
}

function extensionForContentType(contentType, sourceUrl) {
  try {
    const extension = path.extname(new URL(sourceUrl).pathname);
    if (extension) return extension;
  } catch {
  }
  if (contentType.includes("quicktime")) return ".mov";
  if (contentType.includes("webm")) return ".webm";
  if (contentType.includes("x-m4v")) return ".m4v";
  return ".mp4";
}

async function videoDuration(filePath) {
  const { stdout } = await execFileAsync(FFPROBE_BIN, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath
  ]);
  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("ffprobe could not read video duration.");
  return duration;
}

function frameTimestamps(duration) {
  return [
    { label: "First frame", timestamp: 0 },
    { label: "1 second", timestamp: Math.min(1, Math.max(0, duration - 0.1)) },
    { label: "2 seconds", timestamp: Math.min(2, Math.max(0, duration - 0.1)) },
    { label: "3 seconds", timestamp: Math.min(3, Math.max(0, duration - 0.1)) },
    { label: "Midpoint", timestamp: Math.max(0, duration / 2) },
    { label: "Final frame", timestamp: Math.max(0, duration - 0.1) }
  ];
}

async function extractFrames(buffer, contentType, sourceUrl) {
  const workDir = path.join(tmpdir(), `titan-worker-video-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });
  try {
    const inputPath = path.join(workDir, `input${extensionForContentType(contentType, sourceUrl)}`);
    await writeFile(inputPath, buffer);
    const duration = await videoDuration(inputPath);
    const frames = [];
    for (const frame of frameTimestamps(duration)) {
      const outputPath = path.join(workDir, `${frame.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`);
      await execFileAsync(FFMPEG_BIN, [
        "-y",
        "-ss",
        frame.timestamp.toFixed(3),
        "-i",
        inputPath,
        "-frames:v",
        "1",
        "-vf",
        "scale=min(720\\,iw):-2",
        "-q:v",
        "4",
        outputPath
      ]);
      const image = await readFile(outputPath);
      frames.push({
        dataUrl: `data:image/jpeg;base64,${image.toString("base64")}`,
        label: frame.label,
        timestamp: frame.timestamp
      });
    }
    return { duration, frames, inputPath };
  } catch (error) {
    await rm(workDir, { force: true, recursive: true });
    throw error;
  }
}

async function fetchCoverFrame(coverImageUrl) {
  const response = await fetch(coverImageUrl, {
    headers: { "User-Agent": "TitanVisibilityWorker/1.0" },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`Cover image fetch failed with status ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const image = Buffer.from(await response.arrayBuffer());
  return {
    dataUrl: `data:${contentType};base64,${image.toString("base64")}`,
    label: "TikTok cover image",
    timestamp: 0
  };
}

async function transcribeVideo(inputPath) {
  if (!inputPath) {
    return {
      message: "No downloaded video file was available for transcription.",
      status: "unavailable",
      transcript: ""
    };
  }
  try {
    const file = new File([await readFile(inputPath)], path.basename(inputPath), {
      type: "video/mp4"
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");
    const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
      body: formData,
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      method: "POST"
    });
    if (!response.ok) {
      return {
        message: "OpenAI transcription was unavailable, so Titan analyzed frames only.",
        status: "failed",
        transcript: ""
      };
    }
    const payload = await response.json();
    const transcript = typeof payload.text === "string" ? payload.text.trim() : "";
    return {
      message: transcript
        ? "Transcript generated from downloaded video audio."
        : "No spoken transcript was returned.",
      status: transcript ? "success" : "unavailable",
      transcript
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Transcription failed.",
      status: "failed",
      transcript: ""
    };
  }
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  return payload?.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((text) => typeof text === "string")
    .join("") ?? "";
}

async function analyzeFrames(frames, metadata, transcriptResult) {
  const content = [
    {
      type: "input_text",
      text: [
        "Analyze this single short-form video for Titan Visibility OS.",
        "Use direct visual evidence from the extracted frames where possible.",
        "Use transcript evidence only if a transcript is present.",
        "Clearly avoid overclaiming: if motion, audio, delivery, or exact pacing is not directly measurable from still frames/transcript, label the read as inferred.",
        "If metadata.partial is true, clearly state that this is partial video intelligence and only analyze the provided cover/frame, caption, hashtags, and metadata.",
        "Return only JSON matching the schema.",
        "",
        `Video metadata: ${JSON.stringify(metadata, null, 2)}`,
        `Extracted frame labels: ${frames.map((frame) => `${frame.label} at ${frame.timestamp.toFixed(2)}s`).join(", ")}`,
        `Transcript status: ${transcriptResult.status}`,
        `Transcript: ${transcriptResult.transcript || "No transcript available."}`
      ].join("\n")
    },
    ...frames.slice(0, 6).map((frame) => ({
      type: "input_image",
      image_url: frame.dataUrl,
      detail: "low"
    }))
  ];
  const response = await fetch(OPENAI_RESPONSES_URL, {
    body: JSON.stringify({
      input: [
        {
          role: "system",
          content:
            "You are Titan Visibility OS Video Intelligence, an elite creative strategist, editor, and retention analyst. Analyze only the provided frames, metadata, and transcript. Be direct, visual, restrained, and transparent about what was directly analyzed versus inferred."
        },
        { role: "user", content }
      ],
      model: OPENAI_MODEL,
      text: {
        format: {
          name: "titan_video_intelligence_audit",
          schema: responseSchema,
          strict: true,
          type: "json_schema"
        }
      }
    }),
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI vision analysis failed with status ${response.status}. ${text.slice(0, 240)}`);
  }
  const text = extractResponseText(await response.json());
  const result = JSON.parse(text);
  result.videoHookScore = Math.max(0, Math.min(100, Math.round(result.videoHookScore)));
  return result;
}

async function processJob(job) {
  let workDirToClean;
  try {
    await updateJob(job.id, {
      error_message: null,
      progress_message: "Resolving TikTok media",
      status: "processing"
    });

    const urlType = job.platform === "unsupported" ? detectUrlType(job.input_url) : job.platform;
    const metadataBase = urlType === "tiktok"
      ? await resolveTikTokMedia(job.input_url)
      : urlType === "direct-video"
        ? {
            duration: 0,
            resolvedVideoUrl: job.input_url,
            sourceLabel: job.input_url
          }
        : {
            duration: 0,
            sourceLabel: job.input_url
          };

    let frames = [];
    let metadata;
    let transcriptResult;

    if (metadataBase.resolvedVideoUrl) {
      try {
        await updateJob(job.id, { progress_message: "Downloading video" });
        const downloaded = await downloadVideo(metadataBase.resolvedVideoUrl);
        await updateJob(job.id, { progress_message: "Extracting frames" });
        const extracted = await extractFrames(downloaded.buffer, downloaded.contentType, metadataBase.resolvedVideoUrl);
        workDirToClean = path.dirname(extracted.inputPath);
        frames = extracted.frames;
        metadata = {
          ...metadataBase,
          duration: extracted.duration,
          fileSize: downloaded.buffer.byteLength,
          format: downloaded.contentType,
          partial: false,
          sourceLabel: metadataBase.sourceLabel,
          sourceType: "url",
          urlType
        };
        await updateJob(job.id, {
          frame_analysis_result: { frames, message: "Frames extracted by Railway worker." },
          metadata_result: metadata,
          progress_message: "Transcribing audio"
        });
        transcriptResult = await transcribeVideo(extracted.inputPath);
      } catch (mediaError) {
        if (!metadataBase.coverImageUrl || urlType !== "tiktok") {
          throw mediaError;
        }

        await updateJob(job.id, { progress_message: "Partial analysis fallback" });
        frames = [await fetchCoverFrame(metadataBase.coverImageUrl)];
        metadata = {
          ...metadataBase,
          duration: metadataBase.duration ?? 0,
          format: "Cover image + metadata",
          partial: true,
          partialReason: `The worker found a TikTok media URL, but download or frame extraction failed. Titan analyzed cover, caption, hashtags, and metadata only. Worker detail: ${
            mediaError instanceof Error ? mediaError.message : "unknown media error"
          }`,
          sourceLabel: metadataBase.sourceLabel,
          sourceType: "url",
          urlType
        };
        transcriptResult = {
          message: "No downloaded video file was available for transcription.",
          status: "unavailable",
          transcript: ""
        };
        await updateJob(job.id, {
          frame_analysis_result: { frames, message: "Partial cover frame extracted by Railway worker after media download failed." },
          metadata_result: metadata,
          transcript_result: transcriptResult
        });
      }
    } else if (metadataBase.coverImageUrl) {
      await updateJob(job.id, { progress_message: "Partial analysis fallback" });
      frames = [await fetchCoverFrame(metadataBase.coverImageUrl)];
      metadata = {
        ...metadataBase,
        duration: metadataBase.duration ?? 0,
        format: "Cover image + metadata",
        partial: true,
        partialReason:
          "The worker found TikTok metadata and cover imagery, but no downloadable video URL. Titan analyzed cover, caption, hashtags, and metadata only.",
        sourceLabel: metadataBase.sourceLabel,
        sourceType: "url",
        urlType
      };
      transcriptResult = {
        message: "No downloaded video file was available for transcription.",
        status: "unavailable",
        transcript: ""
      };
      await updateJob(job.id, {
        frame_analysis_result: { frames, message: "Partial cover frame extracted by Railway worker." },
        metadata_result: metadata,
        transcript_result: transcriptResult
      });
    } else {
      throw new Error("No downloadable video or cover image was available.");
    }

    await updateJob(job.id, {
      progress_message: "Running vision analysis",
      transcript_result: transcriptResult
    });
    const finalAuditResult = await analyzeFrames(frames, metadata, transcriptResult);
    await updateJob(job.id, {
      final_audit_result: finalAuditResult,
      progress_message: metadata.partial ? "Partial analysis" : "Complete",
      status: metadata.partial ? "partial" : "completed"
    });
  } catch (error) {
    await updateJob(job.id, {
      error_message: error instanceof Error ? error.message : "Worker failed to process video job.",
      progress_message: "Failed",
      status: "failed"
    });
  } finally {
    if (workDirToClean) {
      await rm(workDirToClean, { force: true, recursive: true }).catch(() => undefined);
    }
  }
}

async function main() {
  console.log("Titan Video Intelligence worker started.");
  for (;;) {
    try {
      const queuedJob = await pollQueuedJob();
      if (!queuedJob) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      const claimedJob = await claimJob(queuedJob);
      if (claimedJob) {
        console.log(`Processing video job ${claimedJob.id}`);
        await processJob(claimedJob);
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      await sleep(POLL_INTERVAL_MS);
    }
  }
}

void main();
