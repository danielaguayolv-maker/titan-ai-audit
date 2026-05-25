"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type {
  VideoAnalysisJobCreateResponse,
  VideoAnalysisJobRecord,
  VideoAnalysisJobStatusResponse,
  VideoAuditMetadata,
  VideoFrameSignal,
  VideoIntelligenceApiResponse,
  VideoIntelligenceResult,
  VideoUrlIngestionApiResponse
} from "@/lib/video-intelligence";

type RunStatus =
  | "idle"
  | "queued"
  | "resolving-media"
  | "extracting"
  | "ingesting-url"
  | "extracting-frames"
  | "analyzing"
  | "partial"
  | "success"
  | "error";

const fieldClass =
  "mt-2 w-full rounded-lg border border-titan-gold/15 bg-black/30 px-4 py-3 text-sm text-titan-ivory outline-none transition placeholder:text-titan-ivory/30 focus:border-titan-bright focus:ring-2 focus:ring-titan-gold/20";

const frameTargets = [
  { label: "First frame", time: 0 },
  { label: "1 second", time: 1 },
  { label: "2 seconds", time: 2 },
  { label: "3 seconds", time: 3 },
  { label: "Midpoint", time: "midpoint" },
  { label: "Final frame", time: "final" }
] as const;

function formatBytes(bytes?: number) {
  if (!bytes) return "Unknown";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDuration(duration: number) {
  return Number.isFinite(duration) && duration > 0
    ? `${duration.toFixed(1)}s`
    : "Unknown";
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: keyof HTMLMediaElementEventMap) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener("error", handleError);
    };
    const handleEvent = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("The video could not be loaded for frame extraction."));
    };

    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

async function seekVideo(video: HTMLVideoElement, timestamp: number) {
  const clampedTimestamp = Math.max(0, Math.min(timestamp, Math.max(0, video.duration - 0.08)));

  if (Math.abs(video.currentTime - clampedTimestamp) < 0.04) {
    return;
  }

  video.currentTime = clampedTimestamp;
  await waitForVideoEvent(video, "seeked");
}

function captureFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  const maxWidth = 720;
  const scale = Math.min(1, maxWidth / Math.max(1, video.videoWidth));
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare frame capture canvas.");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

async function extractFramesFromFile(file: File) {
  const video = document.createElement("video");
  const objectUrl = URL.createObjectURL(file);

  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.src = objectUrl;

  try {
    await waitForVideoEvent(video, "loadedmetadata");

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Titan could not read the video duration.");
    }

    const metadata: VideoAuditMetadata = {
      duration: video.duration,
      fileSize: file.size,
      format: file.type || "Uploaded video",
      sourceLabel: file.name,
      sourceType: "upload"
    };
    const frames: VideoFrameSignal[] = [];

    for (const target of frameTargets) {
      const timestamp =
        target.time === "midpoint"
          ? video.duration / 2
          : target.time === "final"
            ? video.duration - 0.1
            : Math.min(target.time, video.duration - 0.1);

      await seekVideo(video, timestamp);
      frames.push({
        dataUrl: captureFrame(video),
        label: target.label,
        timestamp: Math.max(0, timestamp)
      });
    }

    return { frames, metadata };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function ingestVideoUrlServerSide(videoUrl: string) {
  const response = await fetch("/api/video-url-ingestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ videoUrl })
  });
  const payload = await readApiPayload<VideoUrlIngestionApiResponse>(
    response,
    "Video URL ingestion"
  );

  if (!response.ok || "error" in payload) {
    throw new Error(
      "error" in payload
        ? payload.message || payload.error
        : "Titan could not ingest this video URL."
    );
  }

  return {
    frames: payload.frames,
    metadata: payload.metadata
  };
}

function isTikTokUrl(value: string) {
  try {
    return new URL(value).hostname.toLowerCase().includes("tiktok.com");
  } catch {
    return false;
  }
}

async function createVideoAnalysisJob({
  accessToken,
  inputUrl,
  userId,
  workspaceId
}: {
  accessToken?: string;
  inputUrl: string;
  userId?: string;
  workspaceId?: string;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (accessToken && !accessToken.startsWith("local-")) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch("/api/video-analysis-jobs", {
    method: "POST",
    headers,
    body: JSON.stringify({
      input_url: inputUrl,
      platform: "tiktok",
      user_id: userId,
      workspace_id: workspaceId
    })
  });
  const payload = await readApiPayload<VideoAnalysisJobCreateResponse>(
    response,
    "Video analysis job"
  );

  if (!response.ok || "error" in payload) {
    throw new Error(
      "error" in payload
        ? payload.message || payload.error
        : "Titan could not create the video analysis job."
    );
  }

  return payload.job;
}

async function getVideoAnalysisJob(jobId: string, accessToken?: string) {
  const headers: Record<string, string> = {};

  if (accessToken && !accessToken.startsWith("local-")) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`/api/video-analysis-jobs/${jobId}`, {
    cache: "no-store",
    headers
  });
  const payload = await readApiPayload<VideoAnalysisJobStatusResponse>(
    response,
    "Video analysis job status"
  );

  if (!response.ok || "error" in payload) {
    throw new Error(
      "error" in payload
        ? payload.message || payload.error
        : "Titan could not read the video analysis job."
    );
  }

  return payload.job;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function readApiPayload<T>(
  response: Response,
  label: string
): Promise<T> {
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

function SectionCard({
  title,
  section
}: {
  title: string;
  section: VideoIntelligenceResult[keyof Pick<
    VideoIntelligenceResult,
    | "firstThreeSecondsAnalysis"
    | "visualPacingRead"
    | "onScreenTextCtaRead"
    | "transcriptRead"
    | "emotionalPull"
    | "retentionRisk"
    | "recommendedEdit"
  >];
}) {
  return (
    <article className="titan-signal-card min-w-0 rounded-lg p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-anywhere text-xl font-black text-titan-ivory">
          {title}
        </h3>
        <span className="titan-chip bg-titan-gold/10 text-[10px] font-black uppercase text-titan-bright">
          {section.signalType}
        </span>
      </div>
      <p className="text-anywhere mt-4 text-sm leading-6 text-titan-ivory/68">
        {section.summary}
      </p>
      <div className="mt-4 grid gap-2">
        {section.evidence.map((item) => (
          <p
            className="text-anywhere rounded-lg border border-titan-gold/10 bg-black/20 p-3 text-xs leading-5 text-titan-ivory/58"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}

export function VideoIntelligence({
  accessToken,
  userId,
  workspaceId
}: {
  accessToken?: string;
  userId?: string;
  workspaceId?: string;
}) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [frames, setFrames] = useState<VideoFrameSignal[]>([]);
  const [metadata, setMetadata] = useState<VideoAuditMetadata | null>(null);
  const [result, setResult] = useState<VideoIntelligenceResult | null>(null);
  const [activeJob, setActiveJob] = useState<VideoAnalysisJobRecord | null>(null);
  const [transcriptStatus, setTranscriptStatus] = useState<
    "success" | "unavailable" | "failed"
  >("unavailable");
  const [transcriptMessage, setTranscriptMessage] = useState("");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [error, setError] = useState("");

  const statusLabel = useMemo(() => {
    if (activeJob?.progressMessage) return activeJob.progressMessage;
    if (status === "queued") return "Queued";
    if (status === "resolving-media") return "Resolving TikTok media";
    if (status === "extracting") return "Extracting key frames";
    if (status === "ingesting-url") return "Ingesting video URL server-side";
    if (status === "extracting-frames") return "Extracting frames";
    if (status === "analyzing") return "Running video intelligence";
    if (status === "partial") return "Partial analysis";
    if (status === "success") return "Video audit complete";
    if (status === "error") return "Video audit needs attention";
    return "Ready for one video";
  }, [activeJob?.progressMessage, status]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setVideoFile(event.target.files?.[0] ?? null);
    setFrames([]);
    setMetadata(null);
    setResult(null);
    setActiveJob(null);
    setError("");
  }

  async function pollVideoAnalysisJob(jobId: string) {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      await wait(attempt === 0 ? 800 : 2000);
      const job = await getVideoAnalysisJob(jobId, accessToken);
      setActiveJob(job);

      if (job.progressMessage === "Resolving TikTok media") {
        setStatus("resolving-media");
      } else if (job.progressMessage === "Extracting frames") {
        setStatus("extracting-frames");
      } else if (job.progressMessage === "Running vision analysis") {
        setStatus("analyzing");
      } else if (job.status === "queued") {
        setStatus("queued");
      }

      if (job.frameAnalysisResult?.frames.length) {
        setFrames(job.frameAnalysisResult.frames);
      }

      if (job.metadataResult) {
        setMetadata(job.metadataResult);
      }

      if (job.status === "completed" || job.status === "partial") {
        if (job.finalAuditResult) {
          setResult(job.finalAuditResult);
        }

        if (job.transcriptResult) {
          setTranscriptStatus(job.transcriptResult.status);
          setTranscriptMessage(job.transcriptResult.message);
        }

        setStatus(job.status === "partial" ? "partial" : "success");
        return;
      }

      if (job.status === "failed") {
        throw new Error(
          job.errorMessage || "Titan could not complete the video analysis job."
        );
      }
    }

    throw new Error(
      "Titan is still processing this TikTok video. Check the job again in a moment."
    );
  }

  async function submitVideoAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setFrames([]);
    setMetadata(null);
    setStatus("extracting");
    setActiveJob(null);

    try {
      const trimmedVideoUrl = videoUrl.trim();

      if (!videoFile && isTikTokUrl(trimmedVideoUrl)) {
        setStatus("queued");
        const job = await createVideoAnalysisJob({
          accessToken,
          inputUrl: trimmedVideoUrl,
          userId,
          workspaceId
        });
        setActiveJob(job);
        await pollVideoAnalysisJob(job.id);
        return;
      }

      const extracted = videoFile
        ? await extractFramesFromFile(videoFile)
        : await (async () => {
            setStatus("ingesting-url");
            return ingestVideoUrlServerSide(trimmedVideoUrl);
          })();
      setFrames(extracted.frames);
      setMetadata(extracted.metadata);
      setStatus("analyzing");

      const formData = new FormData();
      formData.append("frames", JSON.stringify(extracted.frames));
      formData.append("metadata", JSON.stringify(extracted.metadata));

      if (videoFile) {
        formData.append("videoFile", videoFile);
      }

      const response = await fetch("/api/video-intelligence", {
        method: "POST",
        body: formData
      });
      const payload = await readApiPayload<VideoIntelligenceApiResponse>(
        response,
        "Video intelligence"
      );

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload
            ? payload.error
            : "Titan could not generate the video intelligence audit."
        );
      }

      setResult(payload.result);
      setTranscriptStatus(payload.transcriptStatus);
      setTranscriptMessage(payload.transcriptMessage);
      setStatus("success");
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Titan could not complete the video intelligence audit."
      );
    }
  }

  return (
    <section className="px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
      <div className="mx-auto w-full max-w-7xl">
        <article className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] xl:items-start">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Video Intelligence
              </p>
              <h1 className="text-anywhere mt-3 text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
                Audit one video with direct frame-level intelligence.
              </h1>
              <p className="titan-copy text-anywhere mt-5 text-lg text-titan-ivory/66">
                Upload a single video or paste a supported video URL. Titan
                extracts six key frames, attempts transcript analysis for
                uploads, and labels every read as visual, transcript, or
                inferred.
              </p>
              <div className="titan-readable-grid mt-8">
                {[
                  "First 3 seconds",
                  "Visual payoff timing",
                  "On-screen CTA",
                  "Emotional pull",
                  "Retention risk",
                  "Rewrite direction"
                ].map((item) => (
                  <div className="titan-signal-card rounded-lg p-4" key={item}>
                    <p className="text-xs font-black uppercase text-titan-muted">
                      Signal
                    </p>
                    <p className="mt-2 font-black text-titan-bright">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <form className="titan-panel rounded-lg p-4 sm:p-5" onSubmit={submitVideoAudit}>
              <p className="text-xs font-black uppercase text-titan-muted">
                Single video MVP
              </p>
              <label className="mt-4 block text-sm font-bold text-titan-ivory/72">
                Upload video
                <input
                  accept="video/*"
                  className={fieldClass}
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              <label className="mt-4 block text-sm font-bold text-titan-ivory/72">
                Or paste supported video URL
                <input
                  className={fieldClass}
                  onChange={(event) => {
                    setVideoUrl(event.target.value);
                    setFrames([]);
                    setMetadata(null);
                    setResult(null);
                    setError("");
                  }}
                  placeholder="https://example.com/video.mp4"
                  type="url"
                  value={videoUrl}
                />
              </label>
              <p className="mt-3 text-xs leading-5 text-titan-ivory/50">
                URL mode runs server-side. Direct video files are supported when
                server ffmpeg is available. TikTok URLs use the Apify downloader
                provider when configured; if no downloadable video is returned,
                Titan falls back to cover image, caption, and metadata only.
              </p>
              <button
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-titan-gold px-7 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  status === "extracting" ||
                  status === "queued" ||
                  status === "resolving-media" ||
                  status === "ingesting-url" ||
                  status === "extracting-frames" ||
                  status === "analyzing"
                }
                type="submit"
              >
                {status === "extracting" ||
                status === "queued" ||
                status === "resolving-media" ||
                status === "ingesting-url" ||
                status === "extracting-frames" ||
                status === "analyzing"
                  ? statusLabel
                  : "Run Video Intelligence"}
              </button>

              <div className="mt-5 rounded-lg border border-titan-gold/10 bg-black/20 p-4">
                <p className="text-xs font-black uppercase text-titan-muted">
                  Status
                </p>
                <p className="mt-2 text-sm font-black text-titan-bright">
                  {statusLabel}
                </p>
                {activeJob ? (
                  <div className="mt-4 rounded-lg border border-titan-gold/10 bg-black/20 p-3 text-xs leading-5 text-titan-ivory/60">
                    <p className="font-black uppercase text-titan-muted">
                      Background job
                    </p>
                    <p className="text-anywhere mt-2">Job ID: {activeJob.id}</p>
                    <p>Status: {activeJob.status}</p>
                    <p>Progress: {activeJob.progressMessage}</p>
                    {activeJob.errorMessage ? (
                      <p className="text-red-100/80">
                        Error: {activeJob.errorMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {metadata ? (
                  <div className="mt-4 grid gap-2 text-xs text-titan-ivory/60">
                    <p>Duration: {formatDuration(metadata.duration)}</p>
                    <p>File size: {formatBytes(metadata.fileSize)}</p>
                    <p>Format: {metadata.format ?? "Unknown"}</p>
                    {metadata.authorHandle ? (
                      <p>Author: @{metadata.authorHandle}</p>
                    ) : null}
                    {metadata.caption ? (
                      <p className="text-anywhere">Caption: {metadata.caption}</p>
                    ) : null}
                  </div>
                ) : null}
                {metadata?.partial ? (
                  <div className="text-anywhere mt-4 rounded-lg border border-titan-bright/30 bg-titan-gold/10 p-3 text-xs leading-5 text-titan-ivory/70">
                    <span className="font-black uppercase text-titan-bright">
                      Partial video intelligence:
                    </span>{" "}
                    {metadata.partialReason ??
                      "Titan analyzed available image and metadata signals only."}
                  </div>
                ) : null}
                {transcriptMessage ? (
                  <p className="text-anywhere mt-3 text-xs leading-5 text-titan-ivory/52">
                    Transcript {transcriptStatus}: {transcriptMessage}
                  </p>
                ) : null}
                <div className="mt-4 rounded-lg border border-titan-gold/10 bg-black/20 p-3">
                  <p className="text-[10px] font-black uppercase text-titan-muted">
                    URL support
                  </p>
                  <div className="mt-2 grid gap-1 text-xs leading-5 text-titan-ivory/52">
                    <p>Direct .mp4/.mov/.m4v/.webm: supported when server ffmpeg is available.</p>
                    <p>TikTok: supported through Apify when APIFY_TOKEN and APIFY_TIKTOK_VIDEO_ACTOR_ID are configured.</p>
                    <p>Instagram Reels and YouTube Shorts: detected, downloader hooks pending.</p>
                  </div>
                </div>
              </div>
              {error ? (
                <p className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100/80">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        </article>

        {frames.length > 0 ? (
          <article className="premium-surface mt-5 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Extracted key frames
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {frames.map((frame) => (
                <div className="titan-signal-card overflow-hidden rounded-lg" key={frame.label}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${frame.label} at ${frame.timestamp.toFixed(1)} seconds`}
                    className="aspect-video w-full object-cover"
                    src={frame.dataUrl}
                  />
                  <div className="p-3">
                    <p className="font-black text-titan-ivory">{frame.label}</p>
                    <p className="mt-1 text-xs text-titan-ivory/52">
                      {frame.timestamp > 0
                        ? `${frame.timestamp.toFixed(2)} seconds`
                        : metadata?.partial
                          ? "Cover image signal"
                          : "0.00 seconds"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {result ? (
          <div className="mt-5 grid gap-5">
            <article className="premium-surface rounded-lg p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-titan-muted">
                    Video Hook Score
                  </p>
                  <h2 className="mt-2 text-5xl font-black text-titan-bright">
                    {result.videoHookScore}
                  </h2>
                </div>
                <div className="rounded-lg border border-titan-gold/15 bg-black/24 p-4">
                  <p className="text-xs font-black uppercase text-titan-muted">
                    Transparency
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Direct visual signal", "Transcript signal", "Inferred strategic signal"].map((item) => (
                      <span
                        className="titan-chip bg-titan-gold/10 text-[10px] font-black uppercase text-titan-bright"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <div className="titan-readable-grid">
              <SectionCard
                section={result.firstThreeSecondsAnalysis}
                title="First 3 Seconds Analysis"
              />
              <SectionCard section={result.visualPacingRead} title="Visual Pacing Read" />
              <SectionCard
                section={result.onScreenTextCtaRead}
                title="On-Screen Text / CTA Read"
              />
              <SectionCard section={result.transcriptRead} title="Transcript Read" />
              <SectionCard section={result.emotionalPull} title="Emotional Pull" />
              <SectionCard section={result.retentionRisk} title="Retention Risk" />
              <SectionCard section={result.recommendedEdit} title="Recommended Edit" />
            </div>

            <article className="premium-surface rounded-lg p-6 sm:p-7">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Rewrites
              </p>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="titan-panel rounded-lg p-4">
                  <p className="text-xs font-black uppercase text-titan-muted">
                    Stronger opening
                  </p>
                  <p className="text-anywhere mt-3 text-sm leading-6 text-titan-ivory/70">
                    {result.strongerOpeningRewrite}
                  </p>
                </div>
                <div className="titan-panel rounded-lg p-4">
                  <p className="text-xs font-black uppercase text-titan-muted">
                    Stronger CTA
                  </p>
                  <p className="text-anywhere mt-3 text-sm leading-6 text-titan-ivory/70">
                    {result.strongerCtaRewrite}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                {result.transparencyNotes.map((note) => (
                  <p
                    className="text-anywhere rounded-lg border border-titan-gold/10 bg-black/20 p-3 text-xs leading-5 text-titan-ivory/58"
                    key={note}
                  >
                    {note}
                  </p>
                ))}
              </div>
            </article>
          </div>
        ) : null}
      </div>
    </section>
  );
}
