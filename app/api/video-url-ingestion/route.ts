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
const FFMPEG_BIN = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE_BIN = process.env.FFPROBE_PATH || "ffprobe";

type DownloaderResult = {
  buffer: Buffer;
  contentType: string;
  sourceLabel: string;
};

type VideoDownloader = (url: string) => Promise<DownloaderResult>;

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

  // Future plug-in point:
  // - TikTok: Apify/media downloader actor or signed media extraction service.
  // - Instagram Reels: Apify/media downloader actor with authenticated-safe scraping.
  // - YouTube Shorts: compliant downloader/transcript provider.
  return null;
}

function unsupportedMessage(urlType: VideoUrlType) {
  if (urlType === "tiktok") {
    return "TikTok URL ingestion is detected but not supported yet. Add a TikTok media downloader provider before Titan can extract frames from this URL.";
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

  if (!contentType.toLowerCase().startsWith("video/")) {
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
    contentType,
    sourceLabel: url
  };
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
    const extracted = await extractFramesWithFfmpeg(
      downloaded.buffer,
      downloaded.contentType,
      videoUrl
    );
    const metadata: VideoAuditMetadata = {
      duration: extracted.duration,
      fileSize: downloaded.buffer.byteLength,
      format: downloaded.contentType,
      sourceLabel: downloaded.sourceLabel,
      sourceType: "url"
    };

    return NextResponse.json({
      frames: extracted.frames,
      message:
        "Direct video URL ingested server-side. Frames were extracted with ffmpeg.",
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
