import { after, NextResponse } from "next/server";
import {
  createVideoAnalysisJob,
  isSupabaseVideoJobStoreConfigured,
  updateVideoAnalysisJob
} from "@/lib/video-analysis-jobs";
import type {
  VideoIntelligenceApiResponse,
  VideoUrlIngestionApiResponse,
  VideoUrlType
} from "@/lib/video-intelligence";

export const runtime = "nodejs";
export const maxDuration = 10;

function detectPlatform(value: string): VideoUrlType {
  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("tiktok.com")) return "tiktok";
    if (hostname.includes("instagram.com")) return "instagram-reel";
    if (hostname.includes("youtube.com")) return "youtube-shorts";
    return "unsupported";
  } catch {
    return "unsupported";
  }
}

async function readApiPayload<T>(response: Response, label: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      error: `${label} returned a non-JSON response.`,
      message:
        (await response.text()) ||
        `Titan received an unreadable response from ${label.toLowerCase()}.`
    } as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {
      error: `${label} returned invalid JSON.`,
      message: `Titan received a malformed response from ${label.toLowerCase()}.`
    } as T;
  }
}

async function processVideoAnalysisJob(jobId: string, origin: string) {
  const update = (
    status: "queued" | "processing" | "completed" | "failed" | "partial",
    progressMessage: string,
    patch = {}
  ) => updateVideoAnalysisJob(jobId, { ...patch, progressMessage, status });

  try {
    const job = update("processing", "Resolving TikTok media");

    if (!job) return;

    const ingestionResponse = await fetch(`${origin}/api/video-url-ingestion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ videoUrl: job.inputUrl })
    });
    const ingestionPayload =
      await readApiPayload<VideoUrlIngestionApiResponse>(
        ingestionResponse,
        "Video URL ingestion"
      );

    if (!ingestionResponse.ok || "error" in ingestionPayload) {
      update("failed", "Failed", {
        errorMessage:
          "error" in ingestionPayload
            ? ingestionPayload.message || ingestionPayload.error
            : "Titan could not ingest the TikTok URL."
      });
      return;
    }

    update(
      "processing",
      ingestionPayload.metadata.partial
        ? "Partial analysis fallback"
        : "Extracting frames",
      {
        frameAnalysisResult: {
          frames: ingestionPayload.frames,
          message: ingestionPayload.message
        },
        metadataResult: ingestionPayload.metadata
      }
    );

    update("processing", "Running vision analysis");
    const formData = new FormData();
    formData.append("frames", JSON.stringify(ingestionPayload.frames));
    formData.append("metadata", JSON.stringify(ingestionPayload.metadata));

    const intelligenceResponse = await fetch(`${origin}/api/video-intelligence`, {
      method: "POST",
      body: formData
    });
    const intelligencePayload =
      await readApiPayload<VideoIntelligenceApiResponse>(
        intelligenceResponse,
        "Video intelligence"
      );

    if (!intelligenceResponse.ok || "error" in intelligencePayload) {
      update("failed", "Failed", {
        errorMessage:
          "error" in intelligencePayload
            ? intelligencePayload.error
            : "Titan could not generate the video intelligence audit."
      });
      return;
    }

    update(
      ingestionPayload.metadata.partial ? "partial" : "completed",
      ingestionPayload.metadata.partial ? "Partial analysis" : "Complete",
      {
        finalAuditResult: intelligencePayload.result,
        transcriptResult: {
          message: intelligencePayload.transcriptMessage,
          status: intelligencePayload.transcriptStatus,
          transcript: intelligencePayload.transcript
        }
      }
    );
  } catch (error) {
    updateVideoAnalysisJob(jobId, {
      errorMessage:
        error instanceof Error
          ? error.message
          : "Titan could not process this video analysis job.",
      progressMessage: "Failed",
      status: "failed"
    });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid video analysis job request.",
        message: "Send JSON with input_url."
      },
      { status: 400 }
    );
  }

  const inputUrl =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { input_url?: unknown }).input_url === "string"
      ? (payload as { input_url: string }).input_url.trim()
      : "";
  const userId =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { user_id?: unknown }).user_id === "string"
      ? (payload as { user_id: string }).user_id
      : undefined;
  const workspaceId =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { workspace_id?: unknown }).workspace_id === "string"
      ? (payload as { workspace_id: string }).workspace_id
      : undefined;

  if (!inputUrl) {
    return NextResponse.json(
      {
        error: "Missing TikTok URL.",
        message: "Paste a TikTok video URL before starting a background job."
      },
      { status: 400 }
    );
  }

  const platform = detectPlatform(inputUrl);

  if (platform !== "tiktok") {
    return NextResponse.json(
      {
        error: "Background jobs are currently enabled for TikTok URLs.",
        message:
          "Upload videos and direct media URLs still use the existing immediate analysis flow."
      },
      { status: 400 }
    );
  }

  const shouldProcessLocally = !isSupabaseVideoJobStoreConfigured();
  const job = await createVideoAnalysisJob({
    inputUrl,
    platform,
    userId,
    workspaceId
  });
  const origin = new URL(request.url).origin;

  if (shouldProcessLocally) {
    after(() => {
      void processVideoAnalysisJob(job.id, origin);
    });
  }

  return NextResponse.json(
    {
      job,
      job_id: job.id
    },
    { status: 202 }
  );
}
