"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type {
  VideoAuditMetadata,
  VideoFrameSignal,
  VideoIntelligenceApiResponse,
  VideoIntelligenceResult
} from "@/lib/video-intelligence";

type RunStatus = "idle" | "extracting" | "analyzing" | "success" | "error";

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

async function extractFramesFromSource({
  file,
  videoUrl
}: {
  file: File | null;
  videoUrl: string;
}) {
  const video = document.createElement("video");
  const objectUrl = file ? URL.createObjectURL(file) : "";
  const source = objectUrl || videoUrl.trim();

  if (!source) {
    throw new Error("Upload a video file or paste a direct CORS-enabled video URL.");
  }

  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.src = source;

  try {
    await waitForVideoEvent(video, "loadedmetadata");

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Titan could not read the video duration.");
    }

    const metadata: VideoAuditMetadata = {
      duration: video.duration,
      fileSize: file?.size,
      format: file?.type || "URL video",
      sourceLabel: file?.name || videoUrl.trim(),
      sourceType: file ? "upload" : "url"
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
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
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

export function VideoIntelligence() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [frames, setFrames] = useState<VideoFrameSignal[]>([]);
  const [metadata, setMetadata] = useState<VideoAuditMetadata | null>(null);
  const [result, setResult] = useState<VideoIntelligenceResult | null>(null);
  const [transcriptStatus, setTranscriptStatus] = useState<
    "success" | "unavailable" | "failed"
  >("unavailable");
  const [transcriptMessage, setTranscriptMessage] = useState("");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [error, setError] = useState("");

  const statusLabel = useMemo(() => {
    if (status === "extracting") return "Extracting key frames";
    if (status === "analyzing") return "Running video intelligence";
    if (status === "success") return "Video audit complete";
    if (status === "error") return "Video audit needs attention";
    return "Ready for one video";
  }, [status]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setVideoFile(event.target.files?.[0] ?? null);
    setFrames([]);
    setMetadata(null);
    setResult(null);
    setError("");
  }

  async function submitVideoAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setFrames([]);
    setMetadata(null);
    setStatus("extracting");

    try {
      const extracted = await extractFramesFromSource({
        file: videoFile,
        videoUrl
      });
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
      const payload = (await response.json()) as VideoIntelligenceApiResponse;

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
                Upload a single video or paste a direct video URL. Titan extracts
                six key frames, attempts transcript analysis for uploads, and
                labels every read as visual, transcript, or inferred.
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
                Or paste direct video URL
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
                URL mode only works for direct, browser-readable videos that
                allow frame extraction. If a site blocks canvas access, upload
                the file instead.
              </p>
              <button
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-titan-gold px-7 text-sm font-black uppercase text-black shadow-gold transition hover:-translate-y-0.5 hover:bg-titan-bright disabled:cursor-not-allowed disabled:opacity-60"
                disabled={status === "extracting" || status === "analyzing"}
                type="submit"
              >
                {status === "extracting" || status === "analyzing"
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
                {metadata ? (
                  <div className="mt-4 grid gap-2 text-xs text-titan-ivory/60">
                    <p>Duration: {metadata.duration.toFixed(1)}s</p>
                    <p>File size: {formatBytes(metadata.fileSize)}</p>
                    <p>Format: {metadata.format ?? "Unknown"}</p>
                  </div>
                ) : null}
                {transcriptMessage ? (
                  <p className="text-anywhere mt-3 text-xs leading-5 text-titan-ivory/52">
                    Transcript {transcriptStatus}: {transcriptMessage}
                  </p>
                ) : null}
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
                      {frame.timestamp.toFixed(2)} seconds
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
