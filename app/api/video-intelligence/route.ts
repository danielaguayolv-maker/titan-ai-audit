import { NextResponse } from "next/server";
import {
  isVideoIntelligenceResult,
  videoIntelligenceResponseSchema,
  type VideoAuditMetadata,
  type VideoFrameSignal
} from "@/lib/video-intelligence";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";
const DEFAULT_VISION_MODEL = "gpt-4o-mini";
const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_FRAMES = 6;

function extractResponseText(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return "";
  }

  const response = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        text?: unknown;
      }>;
    }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => typeof text === "string")
      .join("") ?? ""
  );
}

function parseJsonField<T>(formData: FormData, key: string): T | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function transcribeVideoFile(apiKey: string, videoFile: File | null) {
  if (!videoFile) {
    return {
      transcript: "",
      transcriptMessage: "No uploaded file was available for transcription.",
      transcriptStatus: "unavailable" as const
    };
  }

  if (videoFile.size > MAX_VIDEO_UPLOAD_BYTES) {
    return {
      transcript: "",
      transcriptMessage:
        "Uploaded file is over the MVP transcription limit, so Titan analyzed frames only.",
      transcriptStatus: "unavailable" as const
    };
  }

  try {
    const transcriptionFormData = new FormData();
    transcriptionFormData.append("file", videoFile);
    transcriptionFormData.append("model", "whisper-1");

    const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: transcriptionFormData
    });

    if (!response.ok) {
      const errorText = await response.text();

      return {
        transcript: "",
        transcriptMessage:
          errorText ||
          "OpenAI transcription was unavailable, so Titan analyzed frames only.",
        transcriptStatus: "failed" as const
      };
    }

    const payload = (await response.json()) as { text?: unknown };
    const transcript = typeof payload.text === "string" ? payload.text.trim() : "";

    return {
      transcript,
      transcriptMessage: transcript
        ? "Transcript generated from uploaded video audio."
        : "No spoken transcript was returned, so transcript analysis is limited.",
      transcriptStatus: transcript ? ("success" as const) : ("unavailable" as const)
    };
  } catch (error) {
    return {
      transcript: "",
      transcriptMessage:
        error instanceof Error
          ? error.message
          : "Transcription failed, so Titan analyzed frames only.",
      transcriptStatus: "failed" as const
    };
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid video intelligence request." }, { status: 400 });
  }

  const frames = parseJsonField<VideoFrameSignal[]>(formData, "frames") ?? [];
  const metadata = parseJsonField<VideoAuditMetadata>(formData, "metadata");
  const videoFile = formData.get("videoFile");
  const supportedVideoFile = videoFile instanceof File ? videoFile : null;

  if (!metadata) {
    return NextResponse.json({ error: "Missing video metadata." }, { status: 400 });
  }

  if (frames.length === 0) {
    return NextResponse.json(
      {
        error:
          "No extracted frames were received. Upload a local video or use a CORS-enabled direct video URL."
      },
      { status: 400 }
    );
  }

  const limitedFrames = frames.slice(0, MAX_FRAMES);
  const transcription = await transcribeVideoFile(apiKey, supportedVideoFile);
  const model = process.env.OPENAI_VIDEO_MODEL ?? process.env.OPENAI_MODEL ?? DEFAULT_VISION_MODEL;
  const content = [
    {
      type: "input_text",
      text: [
        "Analyze this single short-form video for Titan Visibility OS.",
        "Use direct visual evidence from the extracted frames where possible.",
        "Use transcript evidence only if a transcript is present.",
        "Clearly avoid overclaiming: if motion, audio, delivery, or exact pacing is not directly measurable from still frames/transcript, label the read as inferred.",
        "If metadata.partial is true, clearly state that this is partial video intelligence and only analyze the provided cover/frame, caption, hashtags, and metadata. Do not claim actual motion, scene changes, audio delivery, or full pacing were directly analyzed.",
        "Return only JSON matching the schema.",
        "",
        `Video metadata: ${JSON.stringify(metadata, null, 2)}`,
        `Extracted frame labels: ${limitedFrames
          .map((frame) => `${frame.label} at ${frame.timestamp.toFixed(2)}s`)
          .join(", ")}`,
        `Transcript status: ${transcription.transcriptStatus}`,
        `Transcript: ${transcription.transcript || "No transcript available."}`,
        "",
        "Required judgment areas: Video Hook Score, First 3 Seconds Analysis, Visual Pacing Read, On-Screen Text / CTA Read, Transcript Read, Emotional Pull, Retention Risk, Recommended Edit, Stronger Opening Rewrite, Stronger CTA Rewrite.",
        "Transparency labels must be one of: Direct visual signal, Transcript signal, Inferred strategic signal."
      ].join("\n")
    },
    ...limitedFrames.map((frame) => ({
      type: "input_image",
      image_url: frame.dataUrl,
      detail: "low"
    }))
  ];

  let openAiResponse: Response;

  try {
    openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You are Titan Visibility OS Video Intelligence, an elite creative strategist, editor, and retention analyst. Analyze only the provided frames, metadata, and transcript. Be direct, visual, restrained, and transparent about what was directly analyzed versus inferred."
          },
          {
            role: "user",
            content
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "titan_video_intelligence_audit",
            strict: true,
            schema: videoIntelligenceResponseSchema
          }
        }
      })
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach OpenAI for video intelligence. Frame extraction completed, but analysis could not run.",
        transcriptMessage: transcription.transcriptMessage,
        transcriptStatus: transcription.transcriptStatus
      },
      { status: 502 }
    );
  }

  if (!openAiResponse.ok) {
    const errorText = await openAiResponse.text();

    return NextResponse.json(
      {
        error:
          errorText || "OpenAI could not generate the video intelligence audit.",
        transcriptMessage: transcription.transcriptMessage,
        transcriptStatus: transcription.transcriptStatus
      },
      { status: openAiResponse.status }
    );
  }

  const payload: unknown = await openAiResponse.json();
  const responseText = extractResponseText(payload);

  try {
    const result: unknown = JSON.parse(responseText);

    if (!isVideoIntelligenceResult(result)) {
      throw new Error("Video intelligence response did not match the expected shape.");
    }

    return NextResponse.json({
      result: {
        ...result,
        videoHookScore: Math.max(
          0,
          Math.min(100, Math.round(result.videoHookScore))
        )
      },
      transcript: transcription.transcript,
      transcriptMessage: transcription.transcriptMessage,
      transcriptStatus: transcription.transcriptStatus
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Video intelligence response could not be parsed.",
        transcriptMessage: transcription.transcriptMessage,
        transcriptStatus: transcription.transcriptStatus
      },
      { status: 502 }
    );
  }
}
