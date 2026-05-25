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
const APIFY_TIKTOK_DOWNLOADER_ACTOR_ID =
  process.env.APIFY_TIKTOK_DOWNLOADER_ACTOR_ID?.trim() ?? "";
const APIFY_TIKTOK_SECONDARY_VIDEO_ACTOR_ID =
  process.env.APIFY_TIKTOK_SECONDARY_VIDEO_ACTOR_ID?.trim() ?? "";
const OPENAI_MODEL =
  process.env.OPENAI_VIDEO_MODEL?.trim() ||
  process.env.OPENAI_MODEL?.trim() ||
  "gpt-4o-mini";
const FFMPEG_BIN = process.env.FFMPEG_PATH?.trim() || "ffmpeg";
const FFPROBE_BIN = process.env.FFPROBE_PATH?.trim() || "ffprobe";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 5000);
const HEARTBEAT_INTERVAL_MS = Number(process.env.HEARTBEAT_INTERVAL_MS ?? 20000);
const JOB_STALE_MINUTES = Number(process.env.JOB_STALE_MINUTES ?? 5);
const JOB_TIMEOUT_MS = Number(process.env.JOB_TIMEOUT_MS ?? 180000);
const MAX_VIDEO_BYTES = 120 * 1024 * 1024;

const APIFY_BASE_URL = "https://api.apify.com/v2";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";

let currentJobId = null;
let heartbeatTimer = null;
let heartbeatProgressMessage = "Processing";
let shuttingDown = false;

const TIKTOK_DOWNLOAD_HEADERS = {
  Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.tiktok.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
};

const TIKTOK_MEDIA_FIELD_NAMES = [
  "animatedCover",
  "bitrateInfo",
  "bit_rate",
  "cdnUrl",
  "download",
  "downloadAddr",
  "downloadUrl",
  "downloadURL",
  "download_url",
  "downloadedVideoUrl",
  "downloadedVideoURL",
  "downloadLink",
  "downloadURL",
  "hdplay",
  "mediaUrl",
  "mediaURL",
  "mediaUrls",
  "media_urls",
  "noWatermark",
  "noWatermarkUrl",
  "noWatermarkURL",
  "noWatermarkVideoUrl",
  "originCover",
  "originalVideoUrl",
  "play",
  "playAddr",
  "playApi",
  "playUrl",
  "playURL",
  "play_url",
  "src",
  "url",
  "urlList",
  "url_list",
  "video",
  "videoMeta",
  "videoUrl",
  "videoURL",
  "video_url",
  "webVideoUrl",
  "wmplay"
].map((field) => field.toLowerCase());

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

class JobTimeoutError extends Error {
  constructor() {
    super("Video analysis job exceeded the MVP processing timeout.");
    this.name = "JobTimeoutError";
  }
}

class AudioOnlyMediaError extends Error {
  constructor(message, streamInfo = {}) {
    super(message);
    this.name = "AudioOnlyMediaError";
    this.streamInfo = streamInfo;
  }
}

function isJobTimedOut(startedAt) {
  return Date.now() - startedAt > JOB_TIMEOUT_MS;
}

function assertJobNotTimedOut(startedAt) {
  if (isJobTimedOut(startedAt)) {
    throw new JobTimeoutError();
  }
}

function safeHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return "invalid-url";
  }
}

function summarizeShape(value, depth = 0) {
  if (depth > 5) return "[depth-limit]";
  if (Array.isArray(value)) {
    return value.slice(0, 3).map((item) => summarizeShape(item, depth + 1));
  }
  if (!isRecord(value)) return typeof value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      summarizeShape(nestedValue, depth + 1)
    ])
  );
}

function topLevelKeySummary(items) {
  return items.map((item, index) => ({
    actorId: item.__titanActorId,
    index,
    keys: Object.keys(item).filter((key) => key !== "__titanActorId").sort()
  }));
}

function safeActorConfigSummary() {
  return {
    downloaderActorId: APIFY_TIKTOK_DOWNLOADER_ACTOR_ID || "not-configured",
    primaryActorId: APIFY_TIKTOK_VIDEO_ACTOR_ID || "not-configured",
    secondaryActorId: APIFY_TIKTOK_SECONDARY_VIDEO_ACTOR_ID || "not-configured"
  };
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
    status: "eq.queued",
    select: "*"
  });
  console.log("[Titan worker] Polling for queued video jobs", {
    staleCutoff
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/video_analysis_jobs?${query}`, {
    headers: supabaseHeaders(),
    method: "GET"
  });
  const rows = await supabaseJson(response, "Poll queued jobs");
  return rows[0] ?? null;
}

async function recoverStaleJobs() {
  const staleCutoff = new Date(Date.now() - JOB_STALE_MINUTES * 60_000).toISOString();
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/video_analysis_jobs?status=eq.processing&updated_at=lt.${encodeURIComponent(staleCutoff)}`,
    {
      body: JSON.stringify({
        error_message:
          "Worker recovered this job after it was stuck in processing.",
        progress_message: "Recovered stale processing job; queued for retry",
        status: "queued",
        updated_at: new Date().toISOString()
      }),
      headers: supabaseHeaders("return=representation"),
      method: "PATCH"
    }
  );
  const rows = await supabaseJson(response, "Recover stale processing jobs");

  if (rows.length > 0) {
    console.warn("[Titan worker] Recovered stale processing jobs", {
      count: rows.length,
      jobIds: rows.map((row) => row.id)
    });
  }
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
  const claimed = rows[0] ?? null;

  if (claimed) {
    console.log("[Titan worker] Job claimed", {
      jobId: claimed.id,
      platform: claimed.platform
    });
  }

  return claimed;
}

async function updateProgress(jobId, progressMessage, patch = {}) {
  heartbeatProgressMessage = progressMessage;
  return updateJob(jobId, {
    ...patch,
    progress_message: progressMessage
  });
}

function startHeartbeat(jobId) {
  stopHeartbeat();
  currentJobId = jobId;
  heartbeatTimer = setInterval(() => {
    void updateJob(jobId, {
      progress_message: heartbeatProgressMessage
    }).catch((error) => {
      console.warn("[Titan worker] Heartbeat update failed", {
        error: error instanceof Error ? error.message : "unknown error",
        jobId
      });
    });
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  currentJobId = null;
}

async function handleShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.warn("[Titan worker] Shutdown signal received", {
    activeJobId: currentJobId,
    signal
  });

  if (currentJobId) {
    try {
      await updateJob(currentJobId, {
        error_message: "Worker received shutdown signal during processing",
        progress_message: "Worker stopped before completing analysis",
        status: "failed"
      });
    } catch (error) {
      console.error("[Titan worker] Failed to mark active job stopped", {
        error: error instanceof Error ? error.message : "unknown error",
        jobId: currentJobId
      });
    }
  }

  stopHeartbeat();
  process.exit(0);
}

process.once("SIGTERM", () => {
  void handleShutdown("SIGTERM");
});

process.once("SIGINT", () => {
  void handleShutdown("SIGINT");
});

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

function looksLikeVideoResponse(url, contentType, contentDisposition = "") {
  const lowerContentType = contentType.toLowerCase();
  const lowerDisposition = contentDisposition.toLowerCase();

  return (
    lowerContentType.startsWith("video/") ||
    lowerContentType.includes("mpegurl") ||
    lowerContentType.includes("x-mpegurl") ||
    (lowerContentType.includes("octet-stream") &&
      (looksLikeVideoUrl(url) ||
        lowerDisposition.includes(".mp4") ||
        lowerDisposition.includes("video")))
  );
}

function isAudioContentType(contentType) {
  const lowerContentType = contentType.toLowerCase();
  return lowerContentType.startsWith("audio/") ||
    lowerContentType.includes("audio/mpeg") ||
    lowerContentType.includes("audio/mp3");
}

function isClearlyNonVideoContentType(contentType) {
  const lowerContentType = contentType.toLowerCase();
  return lowerContentType.startsWith("image/") ||
    lowerContentType.startsWith("text/") ||
    lowerContentType.includes("application/json") ||
    lowerContentType.includes("application/xml") ||
    lowerContentType.includes("text/html");
}

function looksLikeImageUrl(value) {
  if (!isHttpUrl(value)) return false;
  return /\.(jpg|jpeg|png|webp)(\?|#|$)/.test(value.toLowerCase());
}

function collectMediaCandidates(value, pathParts = [], depth = 0) {
  if (depth > 8) return [];
  if (typeof value === "string") {
    const path = pathParts.join(".");
    const isMediaPath = pathParts.some((part) =>
      TIKTOK_MEDIA_FIELD_NAMES.includes(part.replace(/\[\d+\]$/, "").toLowerCase())
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
  const priorityTerms = [
    "downloadaddr",
    "downloadurl",
    "nowatermark",
    "originalvideourl",
    "videourl",
    "videometa",
    "mediaurls",
    "playaddr",
    "playurl",
    "url_list",
    "urllist",
    "webvideourl",
    "hdplay",
    "wmplay",
    "play"
  ];

  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.url)) return false;
      seen.add(candidate.url);
      return true;
    })
    .sort((first, second) => {
      const firstPath = first.fieldPath.toLowerCase();
      const secondPath = second.fieldPath.toLowerCase();
      const firstRank = priorityTerms.findIndex((term) => firstPath.includes(term));
      const secondRank = priorityTerms.findIndex((term) => secondPath.includes(term));
      return (firstRank === -1 ? 99 : firstRank) - (secondRank === -1 ? 99 : secondRank);
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

async function runSingleApifyTikTokActor(url, actorId) {
  const input = {
    maxItems: 1,
    postURLs: [url],
    resultsLimit: 1,
    shouldDownloadCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
    shouldDownloadVideos: false,
    startUrls: [url],
    urls: [url],
    videoUrls: [url]
  };
  console.log("[Titan worker] Running TikTok downloader actor", {
    actorId,
    inputKeys: Object.keys(input)
  });
  const runResponse = await fetch(
    `${APIFY_BASE_URL}/acts/${actorPath(actorId)}/runs?token=${encodeURIComponent(APIFY_TOKEN)}&waitForFinish=120`,
    {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    }
  );
  const runPayload = await apifyJson(runResponse, `Apify TikTok actor run (${actorId})`);
  const datasetId = runPayload?.data?.defaultDatasetId;
  const status = runPayload?.data?.status;

  if (!datasetId) throw new Error(`Apify actor ${actorId} did not return a dataset.`);
  if (status && !["SUCCEEDED", "READY"].includes(status)) {
    throw new Error(`Apify TikTok actor ${actorId} finished with status ${status}.`);
  }

  const datasetResponse = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${encodeURIComponent(APIFY_TOKEN)}&clean=true&limit=10`
  );
  const items = await apifyJson(datasetResponse, `Apify TikTok dataset (${actorId})`);
  const datasetItems = Array.isArray(items) ? items.filter(isRecord) : [];

  console.log("[Titan worker] Safe Apify TikTok result shape", {
    actorId,
    itemCount: datasetItems.length,
    shape: summarizeShape(datasetItems)
  });

  return datasetItems.map((item) => ({
    ...item,
    __titanActorId: actorId
  }));
}

async function runApifyTikTok(url) {
  const actorIds = [
    APIFY_TIKTOK_VIDEO_ACTOR_ID,
    APIFY_TIKTOK_DOWNLOADER_ACTOR_ID,
    APIFY_TIKTOK_SECONDARY_VIDEO_ACTOR_ID
  ].filter(Boolean);

  if (!APIFY_TOKEN || actorIds.length === 0) {
    throw new Error("TikTok downloader is not configured. Add APIFY_TOKEN and APIFY_TIKTOK_VIDEO_ACTOR_ID.");
  }

  console.log("[Titan worker] TikTok downloader actor configuration", {
    ...safeActorConfigSummary(),
    actorExecutionOrder: [...new Set(actorIds)]
  });

  const allItems = [];
  const failures = [];

  for (const actorId of [...new Set(actorIds)]) {
    try {
      allItems.push(...(await runSingleApifyTikTokActor(url, actorId)));
    } catch (error) {
      failures.push(`${actorId}: ${error instanceof Error ? error.message : "unknown error"}`);
      console.warn("[Titan worker] TikTok actor failed", {
        actorId,
        error: error instanceof Error ? error.message : "unknown error"
      });
    }
  }

  if (allItems.length === 0) {
    throw new Error(`No TikTok downloader actor returned usable items. ${failures.join(" | ")}`);
  }

  console.log("[Titan worker] TikTok downloader aggregate result", {
    actorConfig: safeActorConfigSummary(),
    itemCount: allItems.length,
    topLevelKeys: topLevelKeySummary(allItems)
  });

  return allItems;
}

async function probeCandidate(candidate) {
  const attempts = [
    {
      headers: TIKTOK_DOWNLOAD_HEADERS,
      method: "HEAD"
    },
    {
      headers: { ...TIKTOK_DOWNLOAD_HEADERS, Range: "bytes=0-0" },
      method: "GET"
    }
  ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(candidate.url, {
        headers: attempt.headers,
        method: attempt.method,
        redirect: "follow"
      });
      const contentType = response.headers.get("content-type") ?? "";
      const disposition = response.headers.get("content-disposition") ?? "";
      await response.body?.cancel?.();
      const okStatus = response.ok || response.status === 206;
      const audioOnly = isAudioContentType(contentType);
      const okMedia = !audioOnly && looksLikeVideoResponse(response.url || candidate.url, contentType, disposition);
      const result = {
        contentType,
        fieldPath: candidate.fieldPath,
        finalHostname: safeHostname(response.url || candidate.url),
        hasAudioStream: audioOnly ? true : undefined,
        hasVideoStream: undefined,
        hostname: safeHostname(candidate.url),
        method: attempt.method,
        ok: okStatus && okMedia,
        reason: okStatus
          ? audioOnly
            ? `audio-only content-type ${contentType}`
            : okMedia
            ? "video-like response"
            : `non-video content-type ${contentType || "unknown"}`
          : `HTTP ${response.status}`,
        status: response.status
      };
      console.log("[Titan worker] TikTok media candidate probe", result);

      if (result.ok) {
        return result;
      }
    } catch (error) {
      console.warn("[Titan worker] TikTok media candidate probe failed", {
        error: error instanceof Error ? error.message : "unknown error",
        fieldPath: candidate.fieldPath,
        hostname: safeHostname(candidate.url),
        method: attempt.method
      });
    }
  }

  return null;
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
      collectMediaCandidates(item, [`item[${index}]`]).map((candidate) => ({
        ...candidate,
        actorId: item.__titanActorId
      }))
    )
  );
  console.log("[Titan worker] TikTok media candidates discovered", {
    candidates: candidates.map((candidate) => ({
      actorId: candidate.actorId,
      fieldPath: candidate.fieldPath,
      hostname: safeHostname(candidate.url)
    })),
    total: candidates.length
  });
  let resolvedVideoUrl;
  let selectedProbe;

  for (const candidate of candidates) {
    const probe = await probeCandidate(candidate);

    if (probe) {
      resolvedVideoUrl = candidate.url;
      selectedProbe = probe;
      break;
    }
  }

  if (selectedProbe) {
    console.log("[Titan worker] TikTok selected downloadable media candidate", {
      contentType: selectedProbe.contentType,
      fieldPath: selectedProbe.fieldPath,
      hostname: selectedProbe.hostname,
      method: selectedProbe.method,
      status: selectedProbe.status
    });
  } else {
    console.warn("[Titan worker] TikTok downloader did not expose downloadable media", {
      candidateCount: candidates.length,
      fallbackPartialMode: Boolean(coverImageUrl),
      reason: candidates.length
        ? "candidate URLs were found, but none returned a video-like response"
        : "no candidate video URL fields were found"
    });
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
    mediaCandidates: candidates,
    sourceLabel: authorHandle ? `TikTok @${authorHandle}` : "TikTok video"
  };
}

async function downloadVideo(url, candidate = {}) {
  const response = await fetch(url, {
    headers: TIKTOK_DOWNLOAD_HEADERS,
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`Video download failed with status ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "";
  const disposition = response.headers.get("content-disposition") ?? "";
  if (isAudioContentType(contentType)) {
    console.warn("[Titan worker] Media candidate rejected before download", {
      candidateField: candidate.fieldPath,
      contentType,
      hasAudioStream: true,
      hasVideoStream: false,
      rejectionReason: "audio content-type",
      selectedMediaHostname: safeHostname(response.url || url)
    });
    throw new AudioOnlyMediaError(
      "TikTok provider returned audio-only media.",
      {
        candidateField: candidate.fieldPath,
        contentType,
        hasAudioStream: true,
        hasVideoStream: false,
        rejectionReason: "audio content-type",
        selectedMediaHostname: safeHostname(response.url || url)
      }
    );
  }
  const canProbeWithFfprobe = !contentType || !isClearlyNonVideoContentType(contentType);
  if (!looksLikeVideoResponse(response.url || url, contentType, disposition) && !canProbeWithFfprobe) {
    throw new Error(`Resolved media returned ${contentType || "unknown content type"} instead of video.`);
  }
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_VIDEO_BYTES) throw new Error("Video exceeds worker download limit.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_VIDEO_BYTES) throw new Error("Video exceeds worker download limit.");
  return {
    buffer,
    contentType: contentType.toLowerCase().includes("octet-stream")
      ? "video/mp4"
      : contentType,
    responseUrl: response.url || url
  };
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

async function inspectMediaStreams(filePath) {
  const { stdout } = await execFileAsync(FFPROBE_BIN, [
    "-v",
    "error",
    "-show_streams",
    "-of",
    "json",
    filePath
  ]);
  const payload = JSON.parse(stdout || "{}");
  const streams = Array.isArray(payload.streams) ? payload.streams : [];
  return {
    hasAudioStream: streams.some((stream) => stream.codec_type === "audio"),
    hasVideoStream: streams.some((stream) => stream.codec_type === "video")
  };
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

async function extractFrames(buffer, contentType, sourceUrl, candidate = {}) {
  const workDir = path.join(tmpdir(), `titan-worker-video-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });
  try {
    const inputPath = path.join(workDir, `input${extensionForContentType(contentType, sourceUrl)}`);
    await writeFile(inputPath, buffer);
    const streamInfo = await inspectMediaStreams(inputPath);
    const rejectionReason = streamInfo.hasVideoStream
      ? null
      : streamInfo.hasAudioStream
        ? "audio-only media; no video stream found by ffprobe"
        : "no video stream found by ffprobe";

    console.log("[Titan worker] Media candidate ffprobe stream diagnostics", {
      candidateField: candidate.fieldPath,
      contentType,
      hasAudioStream: streamInfo.hasAudioStream,
      hasVideoStream: streamInfo.hasVideoStream,
      rejectionReason,
      selectedMediaHostname: safeHostname(sourceUrl)
    });

    if (!streamInfo.hasVideoStream) {
      throw new AudioOnlyMediaError(
        streamInfo.hasAudioStream
          ? "TikTok provider returned audio-only media."
          : "Resolved media did not contain a video stream.",
        {
          ...streamInfo,
          candidateField: candidate.fieldPath,
          contentType,
          rejectionReason,
          selectedMediaHostname: safeHostname(sourceUrl)
        }
      );
    }

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
    return { duration, frames, inputPath, streamInfo };
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
  const startedAt = Date.now();

  startHeartbeat(job.id);

  try {
    console.log("[Titan worker] Processing video job", {
      jobId: job.id,
      platform: job.platform
    });
    await updateProgress(job.id, "Resolving TikTok media", {
      error_message: null,
      status: "processing"
    });

    const urlType = job.platform === "unsupported" ? detectUrlType(job.input_url) : job.platform;
    console.log("[Titan worker] TikTok resolver started", {
      jobId: job.id,
      urlType
    });
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

    const mediaCandidates = uniqueCandidates([
      ...(metadataBase.resolvedVideoUrl
        ? [{
            actorId: metadataBase.selectedProbe?.actorId,
            fieldPath: "selectedMediaCandidate",
            url: metadataBase.resolvedVideoUrl
          }]
        : []),
      ...(Array.isArray(metadataBase.mediaCandidates) ? metadataBase.mediaCandidates : []),
      ...(urlType === "direct-video" && metadataBase.resolvedVideoUrl
        ? [{ fieldPath: "input_url", url: metadataBase.resolvedVideoUrl }]
        : [])
    ]);

    if (mediaCandidates.length > 0) {
      let lastMediaError;
      let audioOnlyCandidateCount = 0;

      for (const candidate of mediaCandidates) {
        try {
          await updateProgress(job.id, "Downloading video");
          const downloaded = await downloadVideo(candidate.url, candidate);
          assertJobNotTimedOut(startedAt);
          await updateProgress(job.id, "Extracting frames");
          const extracted = await extractFrames(downloaded.buffer, downloaded.contentType, downloaded.responseUrl || candidate.url, candidate);
          assertJobNotTimedOut(startedAt);
          workDirToClean = path.dirname(extracted.inputPath);
          frames = extracted.frames;
          metadata = {
            ...metadataBase,
            duration: extracted.duration,
            fileSize: downloaded.buffer.byteLength,
            format: downloaded.contentType,
            partial: false,
            resolvedVideoUrl: candidate.url,
            sourceLabel: metadataBase.sourceLabel,
            sourceType: "url",
            urlType
          };
          await updateProgress(job.id, "Transcribing audio", {
            frame_analysis_result: { frames, message: "Frames extracted by Railway worker." },
            metadata_result: metadata
          });
          transcriptResult = await transcribeVideo(extracted.inputPath);
          assertJobNotTimedOut(startedAt);
          break;
        } catch (mediaError) {
          lastMediaError = mediaError;

          if (mediaError instanceof JobTimeoutError) {
            if (metadataBase.coverImageUrl && urlType === "tiktok") {
              console.warn("[Titan worker] Job timeout; switching to partial TikTok analysis", {
                jobId: job.id,
                timeoutMs: JOB_TIMEOUT_MS
              });
              break;
            }
            throw mediaError;
          }

          if (mediaError instanceof AudioOnlyMediaError) {
            audioOnlyCandidateCount += 1;
          }

          console.warn("[Titan worker] Media candidate rejected during download/extraction", {
            candidateField: candidate.fieldPath,
            contentType: mediaError instanceof AudioOnlyMediaError
              ? mediaError.streamInfo.contentType
              : undefined,
            hasAudioStream: mediaError instanceof AudioOnlyMediaError
              ? mediaError.streamInfo.hasAudioStream
              : undefined,
            hasVideoStream: mediaError instanceof AudioOnlyMediaError
              ? mediaError.streamInfo.hasVideoStream
              : undefined,
            rejectionReason: mediaError instanceof AudioOnlyMediaError
              ? mediaError.streamInfo.rejectionReason
              : mediaError instanceof Error
                ? mediaError.message
                : "unknown media error",
            selectedMediaHostname: safeHostname(candidate.url)
          });

          if (urlType !== "tiktok") throw mediaError;
        }
      }

      if (frames.length === 0) {
        if (!metadataBase.coverImageUrl || urlType !== "tiktok") {
          throw lastMediaError ?? new Error("No downloadable video was available.");
        }

        const partialReason = audioOnlyCandidateCount > 0
          ? "TikTok provider returned audio-only media, so Titan analyzed cover, caption, hashtags, and metadata."
          : `The worker found TikTok media candidates, but download or frame extraction failed. Titan analyzed cover, caption, hashtags, and metadata only. Worker detail: ${
              lastMediaError instanceof Error ? lastMediaError.message : "unknown media error"
            }`;

        console.warn("[Titan worker] TikTok partial fallback triggered after media candidate failures", {
          audioOnlyCandidateCount,
          candidateCount: mediaCandidates.length,
          coverImageAvailable: Boolean(metadataBase.coverImageUrl),
          reason: lastMediaError instanceof Error ? lastMediaError.message : "unknown media error"
        });
        await updateProgress(job.id, "Partial analysis fallback");
        frames = [await fetchCoverFrame(metadataBase.coverImageUrl)];
        metadata = {
          ...metadataBase,
          duration: metadataBase.duration ?? 0,
          format: "Cover image + metadata",
          partial: true,
          partialReason,
          sourceLabel: metadataBase.sourceLabel,
          sourceType: "url",
          urlType
        };
        transcriptResult = {
          message: "No downloaded video file was available for transcription.",
          status: "unavailable",
          transcript: ""
        };
        await updateProgress(job.id, "Running vision analysis", {
          frame_analysis_result: { frames, message: "Partial cover frame extracted by Railway worker after media candidates failed." },
          metadata_result: metadata,
          transcript_result: transcriptResult
        });
      }
    } else if (metadataBase.coverImageUrl) {
      console.warn("[Titan worker] TikTok partial fallback triggered", {
        coverImageAvailable: true,
        reason: "no downloadable video URL selected from downloader output"
      });
      await updateProgress(job.id, "Partial analysis fallback");
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
      await updateProgress(job.id, "Running vision analysis", {
        frame_analysis_result: { frames, message: "Partial cover frame extracted by Railway worker." },
        metadata_result: metadata,
        transcript_result: transcriptResult
      });
    } else {
      throw new Error("No downloadable video or cover image was available.");
    }

    assertJobNotTimedOut(startedAt);
    await updateProgress(job.id, "Running vision analysis", {
      transcript_result: transcriptResult
    });
    const finalAuditResult = await analyzeFrames(frames, metadata, transcriptResult);
    await updateProgress(job.id, metadata.partial ? "Partial analysis" : "Complete", {
      final_audit_result: finalAuditResult,
      status: metadata.partial ? "partial" : "completed"
    });
    console.log("[Titan worker] Video job finished", {
      jobId: job.id,
      status: metadata.partial ? "partial" : "completed"
    });
  } catch (error) {
    await updateJob(job.id, {
      error_message:
        error instanceof JobTimeoutError
          ? "Video analysis job exceeded the MVP processing timeout."
          : error instanceof Error
            ? error.message
            : "Worker failed to process video job.",
      progress_message:
        error instanceof JobTimeoutError
          ? "Worker timed out before completing analysis"
          : "Failed",
      status: "failed"
    });
    console.error("[Titan worker] Video job failed", {
      error: error instanceof Error ? error.message : "unknown error",
      jobId: job.id
    });
  } finally {
    if (workDirToClean) {
      await rm(workDirToClean, { force: true, recursive: true }).catch(() => undefined);
    }
    stopHeartbeat();
  }
}

async function main() {
  console.log("Titan Video Intelligence worker started.", {
    heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
    jobStaleMinutes: JOB_STALE_MINUTES,
    jobTimeoutMs: JOB_TIMEOUT_MS,
    pollIntervalMs: POLL_INTERVAL_MS
  });
  for (;;) {
    try {
      if (shuttingDown) {
        break;
      }
      await recoverStaleJobs();
      const queuedJob = await pollQueuedJob();
      if (!queuedJob) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      const claimedJob = await claimJob(queuedJob);
      if (claimedJob) {
        await processJob(claimedJob);
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      await sleep(POLL_INTERVAL_MS);
    }
  }
}

void main();
