import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import type {
  VideoAuditMetadata,
  VideoFrameSignal,
  VideoUrlType
} from "@/lib/video-intelligence";

export const runtime = "nodejs";
export const maxDuration = 60;

const execFileAsync = promisify(execFile);
const MAX_DIRECT_VIDEO_BYTES = 80 * 1024 * 1024;
const APIFY_BASE_URL = "https://api.apify.com/v2";
const FFMPEG_BIN = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE_BIN = process.env.FFPROBE_PATH || "ffprobe";
const TIKTOK_VIDEO_ACTOR_ID =
  process.env.APIFY_TIKTOK_VIDEO_ACTOR_ID?.trim() ||
  process.env.APIFY_TIKTOK_ACTOR_ID?.trim() ||
  "";

type DownloaderResult = {
  buffer?: Buffer;
  contentType?: string;
  sourceLabel: string;
  coverFrame?: VideoFrameSignal;
  metadata?: Partial<VideoAuditMetadata>;
  partial?: boolean;
  partialReason?: string;
};

type VideoDownloader = (url: string) => Promise<DownloaderResult>;

type JsonRecord = Record<string, unknown>;

function detectVideoUrlType(value: string): VideoUrlType {
  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();

    if (/\.(mp4|mov|m4v|webm)(\?.*)?$/.test(`${pathname}${parsedUrl.search}`)) {
      return "direct-video";
    }

    if (hostname.includes("tiktok.com")) {
      return "tiktok";
    }

    if (hostname.includes("instagram.com") && /\/(reel|reels|p)\//.test(pathname)) {
      return "instagram-reel";
    }

    if (
      hostname.includes("youtube.com") &&
      pathname.split("/").filter(Boolean)[0] === "shorts"
    ) {
      return "youtube-shorts";
    }

    return "unsupported";
  } catch {
    return "unsupported";
  }
}

function getDownloader(urlType: VideoUrlType): VideoDownloader | null {
  if (urlType === "direct-video") {
    return downloadDirectVideo;
  }

  if (urlType === "tiktok") {
    return resolveTikTokVideo;
  }

  // Future plug-in point:
  // - Instagram Reels: Apify/media downloader actor with authenticated-safe scraping.
  // - YouTube Shorts: compliant downloader/transcript provider.
  return null;
}

function unsupportedMessage(urlType: VideoUrlType) {
  if (urlType === "tiktok") {
    return "TikTok URL ingestion is detected, but the downloader is not configured. Add APIFY_TOKEN and APIFY_TIKTOK_VIDEO_ACTOR_ID to resolve TikTok media.";
  }

  if (urlType === "instagram-reel") {
    return "Instagram Reel ingestion is detected but not supported yet. Add an Instagram media downloader provider before Titan can extract frames from this URL.";
  }

  if (urlType === "youtube-shorts") {
    return "YouTube Shorts ingestion is detected but not supported yet. Add a YouTube media downloader/transcript provider before Titan can extract frames from this URL.";
  }

  return "This URL is not a supported direct video file. For MVP URL ingestion, paste a direct .mp4, .mov, .m4v, or .webm file URL.";
}

async function assertFfmpegAvailable() {
  try {
    await Promise.all([
      execFileAsync(FFMPEG_BIN, ["-version"]),
      execFileAsync(FFPROBE_BIN, ["-version"])
    ]);
  } catch {
    throw new Error(
      "Server-side URL frame extraction requires ffmpeg and ffprobe in the runtime. Configure FFMPEG_PATH/FFPROBE_PATH or add a hosted media extraction service."
    );
  }
}

async function downloadDirectVideo(url: string): Promise<DownloaderResult> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "TitanVisibilityOS/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Direct video download failed with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const lowerContentType = contentType.toLowerCase();
  const sourceLooksLikeMedia = /\.(mp4|mov|m4v|webm)(\?|#|$)/.test(
    response.url.toLowerCase()
  );

  if (
    !lowerContentType.startsWith("video/") &&
    !(lowerContentType.includes("octet-stream") && sourceLooksLikeMedia)
  ) {
    throw new Error(
      "The URL responded, but it did not return a video content type. Use a direct media file URL."
    );
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);

  if (contentLength > MAX_DIRECT_VIDEO_BYTES) {
    throw new Error("Direct video URL is over the MVP 80MB ingestion limit.");
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength > MAX_DIRECT_VIDEO_BYTES) {
    throw new Error("Direct video URL is over the MVP 80MB ingestion limit.");
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: lowerContentType.includes("octet-stream") ? "video/mp4" : contentType,
    sourceLabel: url
  };
}

function actorPath(actorId: string) {
  return actorId.replace("/", "~");
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function collectRecords(value: unknown, depth = 0): JsonRecord[] {
  if (depth > 5) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectRecords(item, depth + 1));
  }
  if (!isRecord(value)) return [];
  return [
    value,
    ...Object.values(value).flatMap((nestedValue) =>
      collectRecords(nestedValue, depth + 1)
    )
  ];
}

function firstStringFromKeys(records: JsonRecord[], keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = stringValue(record[key]);
      if (value) return value;
    }
  }
  return undefined;
}

function firstNumberFromKeys(records: JsonRecord[], keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = numberValue(record[key]);
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

function isHttpUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function looksLikeVideoUrl(value: string) {
  if (!isHttpUrl(value)) return false;
  const lowerValue = value.toLowerCase();
  return (
    /\.(mp4|mov|m4v|webm)(\?|#|$)/.test(lowerValue) ||
    lowerValue.includes("video") ||
    lowerValue.includes("play")
  );
}

function looksLikeImageUrl(value: string) {
  if (!isHttpUrl(value)) return false;
  return /\.(jpg|jpeg|png|webp)(\?|#|$)/.test(value.toLowerCase());
}

function firstVideoUrl(records: JsonRecord[]) {
  const keys = [
    "downloadUrl",
    "downloadURL",
    "downloadLink",
    "downloadAddr",
    "videoUrl",
    "videoURL",
    "video_url",
    "videoUrlNoWaterMark",
    "videoUrlNoWatermark",
    "noWatermark",
    "noWatermarkUrl",
    "noWatermarkURL",
    "playAddr",
    "playUrl",
    "playURL",
    "mediaUrl",
    "mediaURL",
    "src",
    "url"
  ];

  const candidates: string[] = [];

  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string") {
        candidates.push(value);
      } else if (Array.isArray(value)) {
        candidates.push(...value.filter((item): item is string => typeof item === "string"));
      }
    }
  }

  return candidates.find(looksLikeVideoUrl);
}

function firstImageUrl(records: JsonRecord[]) {
  const keys = [
    "cover",
    "coverUrl",
    "coverURL",
    "dynamicCover",
    "originCover",
    "thumbnail",
    "thumbnailUrl",
    "thumbnailURL",
    "image",
    "imageUrl",
    "imageURL",
    "poster",
    "displayImage"
  ];

  const candidates: string[] = [];

  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string") {
        candidates.push(value);
      } else if (Array.isArray(value)) {
        candidates.push(...value.filter((item): item is string => typeof item === "string"));
      }
    }
  }

  return candidates.find(looksLikeImageUrl) ?? candidates.find(isHttpUrl);
}

function extractHashtags(records: JsonRecord[], caption?: string) {
  const hashtags = new Set<string>();

  if (caption) {
    for (const match of caption.matchAll(/#([\p{L}\p{N}_]+)/gu)) {
      hashtags.add(match[1]);
    }
  }

  for (const record of records) {
    const value = record.hashtags ?? record.hashtagNames ?? record.tags;
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      if (typeof item === "string" && item.trim()) {
        hashtags.add(item.replace(/^#/, "").trim());
      } else if (isRecord(item)) {
        const name =
          stringValue(item.name) ??
          stringValue(item.title) ??
          stringValue(item.hashtagName);
        if (name) hashtags.add(name.replace(/^#/, "").trim());
      }
    }
  }

  return Array.from(hashtags).slice(0, 20);
}

async function runApifyActor(actorId: string, input: JsonRecord) {
  const token = process.env.APIFY_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "TikTok URL detected but downloader not configured. Add APIFY_TOKEN before Titan can resolve TikTok media."
    );
  }

  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${actorPath(actorId)}/runs?token=${encodeURIComponent(token)}&waitForFinish=60`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    }
  );

  const runPayload: unknown = await response.json().catch(() => null);
  const runData = isRecord(runPayload) && isRecord(runPayload.data) ? runPayload.data : null;
  const status = stringValue(runData?.status);
  const defaultDatasetId = stringValue(runData?.defaultDatasetId);

  console.info("[Titan Video URL] Apify TikTok run", {
    actorId,
    defaultDatasetId: Boolean(defaultDatasetId),
    inputKeys: Object.keys(input),
    status
  });

  if (!response.ok) {
    throw new Error(
      `TikTok downloader Apify run failed with status ${response.status}.`
    );
  }

  if (!defaultDatasetId) {
    throw new Error("TikTok downloader did not return a dataset.");
  }

  if (status && !["SUCCEEDED", "READY"].includes(status)) {
    throw new Error(`TikTok downloader finished with Apify status ${status}.`);
  }

  const datasetResponse = await fetch(
    `${APIFY_BASE_URL}/datasets/${defaultDatasetId}/items?token=${encodeURIComponent(token)}&clean=true&limit=10`
  );

  if (!datasetResponse.ok) {
    throw new Error(
      `TikTok downloader dataset fetch failed with status ${datasetResponse.status}.`
    );
  }

  const items: unknown = await datasetResponse.json();
  const datasetItems = Array.isArray(items) ? items.filter(isRecord) : [];

  console.info("[Titan Video URL] Apify TikTok dataset", {
    actorId,
    firstItemKeys: datasetItems[0] ? Object.keys(datasetItems[0]) : [],
    itemCount: datasetItems.length
  });

  return datasetItems;
}

function tiktokActorInput(videoUrl: string): JsonRecord {
  return {
    maxItems: 1,
    postURLs: [videoUrl],
    resultsLimit: 1,
    shouldDownloadCovers: false,
    shouldDownloadVideos: false,
    startUrls: [videoUrl],
    urls: [videoUrl],
    videoUrls: [videoUrl]
  };
}

function normalizeTikTokMedia(items: JsonRecord[]) {
  const records = collectRecords(items);
  const caption = firstStringFromKeys(records, [
    "text",
    "caption",
    "description",
    "desc",
    "title"
  ]);
  const authorHandle = firstStringFromKeys(records, [
    "uniqueId",
    "username",
    "author",
    "authorName",
    "nickname",
    "name",
    "handle"
  ]);
  const engagementMetrics = {
    likes: firstNumberFromKeys(records, ["diggCount", "likeCount", "likes", "heartCount"]),
    comments: firstNumberFromKeys(records, ["commentCount", "comments"]),
    shares: firstNumberFromKeys(records, ["shareCount", "shares"]),
    views: firstNumberFromKeys(records, ["playCount", "viewCount", "views", "videoViews"])
  };

  return {
    authorHandle,
    caption,
    coverImageUrl: firstImageUrl(records),
    duration: firstNumberFromKeys(records, ["duration", "durationSec", "videoDuration"]),
    engagementMetrics,
    hashtags: extractHashtags(records, caption),
    resolvedVideoUrl: firstVideoUrl(records)
  };
}

async function fetchCoverFrame(coverImageUrl: string): Promise<VideoFrameSignal> {
  const response = await fetch(coverImageUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "TitanVisibilityOS/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`TikTok cover image fetch failed with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("TikTok cover URL did not return an image.");
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return {
    dataUrl: `data:${contentType};base64,${imageBuffer.toString("base64")}`,
    label: "TikTok cover image",
    timestamp: 0
  };
}

async function resolveTikTokVideo(url: string): Promise<DownloaderResult> {
  if (!TIKTOK_VIDEO_ACTOR_ID) {
    throw new Error(
      "TikTok URL detected but downloader not configured. Add APIFY_TIKTOK_VIDEO_ACTOR_ID or APIFY_TIKTOK_ACTOR_ID."
    );
  }

  const items = await runApifyActor(TIKTOK_VIDEO_ACTOR_ID, tiktokActorInput(url));

  if (items.length === 0) {
    throw new Error("TikTok media could not be resolved because Apify returned no items.");
  }

  const normalized = normalizeTikTokMedia(items);
  const metadata: Partial<VideoAuditMetadata> = {
    authorHandle: normalized.authorHandle,
    caption: normalized.caption,
    coverImageUrl: normalized.coverImageUrl,
    duration: normalized.duration ?? 0,
    engagementMetrics: normalized.engagementMetrics,
    hashtags: normalized.hashtags,
    resolvedVideoUrl: normalized.resolvedVideoUrl,
    urlType: "tiktok"
  };

  if (normalized.resolvedVideoUrl) {
    try {
      const downloaded = await downloadDirectVideo(normalized.resolvedVideoUrl);
      return {
        ...downloaded,
        metadata,
        sourceLabel: normalized.authorHandle
          ? `TikTok @${normalized.authorHandle}`
          : "TikTok video"
      };
    } catch (error) {
      if (normalized.coverImageUrl) {
        return {
          coverFrame: await fetchCoverFrame(normalized.coverImageUrl),
          metadata,
          partial: true,
          partialReason: `Apify returned a TikTok media candidate, but it was not downloadable as video. Titan analyzed the cover image, caption, hashtags, and metadata only. Resolver detail: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
          sourceLabel: normalized.authorHandle
            ? `TikTok @${normalized.authorHandle}`
            : "TikTok video"
        };
      }

      throw new Error(
        `TikTok media URL resolved, but the video download failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
    }
  }

  if (normalized.coverImageUrl) {
    return {
      coverFrame: await fetchCoverFrame(normalized.coverImageUrl),
      metadata,
      partial: true,
      partialReason:
        "Apify returned TikTok metadata and a cover image, but no downloadable video URL. Titan analyzed the cover image, caption, hashtags, and metadata only.",
      sourceLabel: normalized.authorHandle
        ? `TikTok @${normalized.authorHandle}`
        : "TikTok video"
    };
  }

  throw new Error(
    "TikTok media could not be resolved. Apify returned data, but no downloadable video URL or cover image was found."
  );
}

function extensionForContentType(contentType: string, sourceUrl: string) {
  try {
    const extension = path.extname(new URL(sourceUrl).pathname);

    if (extension) {
      return extension;
    }
  } catch {
    // Fall through to content-type mapping.
  }

  if (contentType.includes("quicktime")) return ".mov";
  if (contentType.includes("webm")) return ".webm";
  if (contentType.includes("x-m4v")) return ".m4v";
  return ".mp4";
}

async function getVideoDuration(filePath: string) {
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

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("ffprobe could not read a valid video duration.");
  }

  return duration;
}

function frameTimestamps(duration: number) {
  return [
    { label: "First frame", timestamp: 0 },
    { label: "1 second", timestamp: Math.min(1, Math.max(0, duration - 0.1)) },
    { label: "2 seconds", timestamp: Math.min(2, Math.max(0, duration - 0.1)) },
    { label: "3 seconds", timestamp: Math.min(3, Math.max(0, duration - 0.1)) },
    { label: "Midpoint", timestamp: Math.max(0, duration / 2) },
    { label: "Final frame", timestamp: Math.max(0, duration - 0.1) }
  ];
}

async function extractFrame(filePath: string, outputPath: string, timestamp: number) {
  await execFileAsync(FFMPEG_BIN, [
    "-y",
    "-ss",
    timestamp.toFixed(3),
    "-i",
    filePath,
    "-frames:v",
    "1",
    "-vf",
    "scale=min(720\\,iw):-2",
    "-q:v",
    "4",
    outputPath
  ]);
}

async function extractFramesWithFfmpeg(
  videoBuffer: Buffer,
  contentType: string,
  sourceUrl: string
) {
  await assertFfmpegAvailable();

  const workDir = path.join(tmpdir(), `titan-video-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });

  try {
    const extension = extensionForContentType(contentType, sourceUrl);
    const inputPath = path.join(workDir, `input${extension}`);
    await writeFile(inputPath, videoBuffer);
    const duration = await getVideoDuration(inputPath);
    const frames: VideoFrameSignal[] = [];

    for (const frame of frameTimestamps(duration)) {
      const outputPath = path.join(
        workDir,
        `${frame.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`
      );
      await extractFrame(inputPath, outputPath, frame.timestamp);
      const image = await readFile(outputPath);
      frames.push({
        dataUrl: `data:image/jpeg;base64,${image.toString("base64")}`,
        label: frame.label,
        timestamp: frame.timestamp
      });
    }

    return { duration, frames };
  } finally {
    await rm(workDir, { force: true, recursive: true });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid video URL ingestion request.",
        message: "Send JSON with a videoUrl field.",
        urlType: "unsupported" satisfies VideoUrlType
      },
      { status: 400 }
    );
  }

  const videoUrl =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { videoUrl?: unknown }).videoUrl === "string"
      ? (payload as { videoUrl: string }).videoUrl.trim()
      : "";

  if (!videoUrl) {
    return NextResponse.json(
      {
        error: "Missing video URL.",
        message: "Paste a direct video URL or upload a video file.",
        urlType: "unsupported" satisfies VideoUrlType
      },
      { status: 400 }
    );
  }

  const urlType = detectVideoUrlType(videoUrl);
  const downloader = getDownloader(urlType);

  if (!downloader) {
    const message = unsupportedMessage(urlType);

    return NextResponse.json(
      {
        error: message,
        message,
        urlType
      },
      { status: urlType === "unsupported" ? 400 : 501 }
    );
  }

  try {
    const downloaded = await downloader(videoUrl);
    let extracted: { duration: number; frames: VideoFrameSignal[] };

    if (downloaded.buffer && downloaded.contentType) {
      try {
        extracted = await extractFramesWithFfmpeg(
          downloaded.buffer,
          downloaded.contentType,
          downloaded.metadata?.resolvedVideoUrl ?? videoUrl
        );
      } catch (error) {
        const detail =
          error instanceof Error
            ? error.message
            : "Titan could not extract frames from the resolved video.";
        const prefix =
          urlType === "tiktok"
            ? "TikTok video URL resolved, but frame extraction failed"
            : "Video URL resolved, but frame extraction failed";

        throw new Error(`${prefix}: ${detail}`);
      }
    } else if (downloaded.coverFrame) {
      extracted = {
        duration: downloaded.metadata?.duration ?? 0,
        frames: [downloaded.coverFrame]
      };
    } else {
      throw new Error("Video media could not be resolved for frame extraction.");
    }

    const metadata: VideoAuditMetadata = {
      ...downloaded.metadata,
      duration: extracted.duration,
      fileSize: downloaded.buffer?.byteLength,
      format: downloaded.contentType ?? "Cover image + metadata",
      partial: downloaded.partial,
      partialReason: downloaded.partialReason,
      sourceLabel: downloaded.sourceLabel,
      sourceType: "url",
      urlType
    };

    return NextResponse.json({
      frames: extracted.frames,
      message: downloaded.partial
        ? "Partial TikTok video intelligence ready. Titan found metadata and a cover image, but no downloadable video URL."
        : urlType === "tiktok"
          ? "TikTok media resolved through the downloader provider. Frames were extracted server-side."
          : "Direct video URL ingested server-side. Frames were extracted with ffmpeg.",
      metadata,
      urlType
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Titan could not ingest this video URL.";

    return NextResponse.json(
      {
        error: message,
        message,
        urlType
      },
      { status: 502 }
    );
  }
}
