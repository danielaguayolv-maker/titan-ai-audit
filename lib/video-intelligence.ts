export type VideoFrameSignal = {
  label: string;
  timestamp: number;
  dataUrl: string;
};

export type VideoAuditMetadata = {
  duration: number;
  fileSize?: number;
  format?: string;
  sourceType: "upload" | "url";
  sourceLabel: string;
  urlType?: VideoUrlType;
  partial?: boolean;
  partialReason?: string;
  resolvedVideoUrl?: string;
  coverImageUrl?: string;
  caption?: string;
  hashtags?: string[];
  authorHandle?: string;
  engagementMetrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
};

export type VideoAuditSection = {
  signalType: "Direct visual signal" | "Transcript signal" | "Inferred strategic signal";
  summary: string;
  evidence: string[];
};

export type VideoIntelligenceResult = {
  videoHookScore: number;
  firstThreeSecondsAnalysis: VideoAuditSection;
  visualPacingRead: VideoAuditSection;
  onScreenTextCtaRead: VideoAuditSection;
  transcriptRead: VideoAuditSection;
  emotionalPull: VideoAuditSection;
  retentionRisk: VideoAuditSection;
  recommendedEdit: VideoAuditSection;
  strongerOpeningRewrite: string;
  strongerCtaRewrite: string;
  transparencyNotes: string[];
};

export type VideoIntelligenceApiResponse =
  | {
      result: VideoIntelligenceResult;
      transcript: string;
      transcriptStatus: "success" | "unavailable" | "failed";
      transcriptMessage: string;
    }
  | {
      error: string;
      transcriptStatus?: "unavailable" | "failed";
      transcriptMessage?: string;
    };

export type VideoUrlType =
  | "direct-video"
  | "tiktok"
  | "instagram-reel"
  | "youtube-shorts"
  | "unsupported";

export type VideoUrlIngestionResult = {
  frames: VideoFrameSignal[];
  metadata: VideoAuditMetadata;
  urlType: VideoUrlType;
  message: string;
};

export type VideoUrlIngestionApiResponse =
  | VideoUrlIngestionResult
  | {
      error: string;
      urlType: VideoUrlType;
      message: string;
    };

export type VideoAnalysisJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "partial";

export type VideoAnalysisJobRecord = {
  createdAt: string;
  errorMessage?: string;
  finalAuditResult?: VideoIntelligenceResult;
  frameAnalysisResult?: {
    frames: VideoFrameSignal[];
    message?: string;
  };
  id: string;
  inputUrl: string;
  metadataResult?: VideoAuditMetadata;
  platform: VideoUrlType;
  progressMessage: string;
  status: VideoAnalysisJobStatus;
  transcriptResult?: {
    message: string;
    status: "success" | "unavailable" | "failed";
    transcript?: string;
  };
  updatedAt: string;
  userId?: string;
  workspaceId?: string;
};

export type VideoAnalysisJobCreateResponse =
  | {
      job: VideoAnalysisJobRecord;
      job_id: string;
    }
  | {
      error: string;
      message: string;
    };

export type VideoAnalysisJobStatusResponse =
  | {
      job: VideoAnalysisJobRecord;
    }
  | {
      error: string;
      message: string;
    };

const sectionSchema = {
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
} as const;

export const videoIntelligenceResponseSchema = {
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
    firstThreeSecondsAnalysis: sectionSchema,
    visualPacingRead: sectionSchema,
    onScreenTextCtaRead: sectionSchema,
    transcriptRead: sectionSchema,
    emotionalPull: sectionSchema,
    retentionRisk: sectionSchema,
    recommendedEdit: sectionSchema,
    strongerOpeningRewrite: { type: "string" },
    strongerCtaRewrite: { type: "string" },
    transparencyNotes: {
      type: "array",
      items: { type: "string" }
    }
  }
} as const;

export function isVideoIntelligenceResult(
  value: unknown
): value is VideoIntelligenceResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Partial<VideoIntelligenceResult>;

  return (
    typeof result.videoHookScore === "number" &&
    typeof result.strongerOpeningRewrite === "string" &&
    typeof result.strongerCtaRewrite === "string" &&
    Array.isArray(result.transparencyNotes) &&
    Boolean(result.firstThreeSecondsAnalysis) &&
    Boolean(result.visualPacingRead) &&
    Boolean(result.onScreenTextCtaRead) &&
    Boolean(result.transcriptRead) &&
    Boolean(result.emotionalPull) &&
    Boolean(result.retentionRisk) &&
    Boolean(result.recommendedEdit)
  );
}
