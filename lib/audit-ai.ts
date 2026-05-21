export type AuditPlatform = "instagram" | "tiktok" | "general";

export type BusinessAuditFormData = {
  platform: AuditPlatform;
  businessName: string;
  industry: string;
  city: string;
  website: string;
  goals: string;
  currentChallenges: string;
  profileUrl: string;
  bio: string;
  usernameDisplayName: string;
  pinnedPostTopics: string;
  recentCaptions: string;
  targetCustomer: string;
  offer: string;
  location: string;
  businessGoal: string;
};

export type AiQuickWin = {
  title: string;
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  description: string;
};

export type LeadReadyAuditReport = {
  headline: string;
  summary: string;
  findings: string[];
  nextSteps: string[];
};

export type AiAuditCategoryScore = {
  name: string;
  score: number;
  benchmark: string;
  insight: string;
};

export type ProfileContentItem = {
  caption: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  url?: string;
  hashtags?: string[];
  isPinned?: boolean;
};

export type ProfileData = {
  platform: AuditPlatform;
  profileUrl: string;
  username?: string;
  displayName?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  likeCount?: number;
  contentCount?: number;
  verified?: boolean;
  profilePictureUrl?: string;
  recentContent: ProfileContentItem[];
  hashtagsUsed: string[];
  averageLikes?: number;
  averageComments?: number;
  averageViews?: number;
  postingFrequencyEstimate?: string;
  pinnedContent: ProfileContentItem[];
  metricsStatus: "confirmed" | "estimated" | "limited";
  scanCompleteness: number;
  missingDataPoints: string[];
  confidenceScore: number;
  dataPointsFound: string[];
};

export type LiveScanResult = {
  status: "scanning" | "success" | "partial" | "failed" | "fallback" | "skipped";
  message: string;
  dataPointsFound: string[];
  missingDataPoints?: string[];
  scanCompleteness?: number;
  confidenceScore?: number;
  metricsStatus?: "confirmed" | "estimated" | "limited";
  fallbackReason?: string;
};

export type AiAuditResult = {
  businessName: string;
  overallScore: number;
  grade: string;
  personalizedDiagnosis: string;
  categoryScores: AiAuditCategoryScore[];
  topQuickWins: AiQuickWin[];
  optimizedBio: string;
  contentRecommendations: string[];
  leadReadyAuditReport: LeadReadyAuditReport;
};

export type AuditApiResponse =
  | {
      source: "openai";
      result: AiAuditResult;
      profileData: ProfileData | null;
      liveScan: LiveScanResult;
    }
  | {
      error: string;
      profileData?: ProfileData | null;
      liveScan?: LiveScanResult;
    };

export const emptyBusinessAuditForm: BusinessAuditFormData = {
  platform: "instagram",
  businessName: "",
  industry: "",
  city: "",
  website: "",
  goals: "",
  currentChallenges: "",
  profileUrl: "",
  bio: "",
  usernameDisplayName: "",
  pinnedPostTopics: "",
  recentCaptions: "",
  targetCustomer: "",
  offer: "",
  location: "",
  businessGoal: ""
};

export const auditResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "businessName",
    "overallScore",
    "grade",
    "personalizedDiagnosis",
    "categoryScores",
    "topQuickWins",
    "optimizedBio",
    "contentRecommendations",
    "leadReadyAuditReport"
  ],
  properties: {
    businessName: {
      type: "string",
      description: "The business name from the audit input."
    },
    overallScore: {
      type: "number",
      description: "A realistic AI readiness score from 0 to 100."
    },
    grade: {
      type: "string",
      description: "A simple letter grade such as A, B+, B, C+, or C."
    },
    personalizedDiagnosis: {
      type: "string",
      description: "A concise, personalized diagnosis for the local business."
    },
    categoryScores: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "score", "benchmark", "insight"],
        properties: {
          name: { type: "string" },
          score: { type: "number" },
          benchmark: { type: "string" },
          insight: { type: "string" }
        }
      }
    },
    topQuickWins: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "impact", "effort", "description"],
        properties: {
          title: { type: "string" },
          impact: { type: "string", enum: ["High", "Medium", "Low"] },
          effort: { type: "string", enum: ["High", "Medium", "Low"] },
          description: { type: "string" }
        }
      }
    },
    optimizedBio: {
      type: "string",
      description: "A polished bio the business could use on profiles or landing pages."
    },
    contentRecommendations: {
      type: "array",
      items: { type: "string" }
    },
    leadReadyAuditReport: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "summary", "findings", "nextSteps"],
      properties: {
        headline: { type: "string" },
        summary: { type: "string" },
        findings: {
          type: "array",
          items: { type: "string" }
        },
        nextSteps: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  }
} as const;
