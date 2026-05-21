import { NextResponse } from "next/server";
import { fetchInstagramProfile, fetchTikTokProfile } from "@/lib/apify";
import {
  auditResponseSchema,
  type AuditPlatform,
  type AiAuditResult,
  type BusinessAuditFormData,
  type LiveScanResult,
  type ProfileData
} from "@/lib/audit-ai";

export const runtime = "nodejs";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function parsePlatform(value: unknown): AuditPlatform {
  if (value === "instagram" || value === "tiktok" || value === "general") {
    return value;
  }

  return "general";
}

function detectPlatformFromUrl(url: string): AuditPlatform | null {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes("instagram.com")) {
    return "instagram";
  }

  if (normalizedUrl.includes("tiktok.com")) {
    return "tiktok";
  }

  return null;
}

function getBusinessNameFallback(formData: BusinessAuditFormData) {
  return (
    formData.usernameDisplayName ||
    formData.businessName ||
    formData.profileUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    "Profile audit"
  );
}

function parsedUsernameFromProfileUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const handleSegment = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .find((segment) => segment.startsWith("@"));

    return (handleSegment ?? parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "")
      .replace(/^@/, "");
  } catch {
    return url.split("/").filter(Boolean).at(-1)?.replace(/^@/, "") ?? "";
  }
}

function parseBusinessAuditFormData(value: unknown): BusinessAuditFormData {
  const input = typeof value === "object" && value !== null ? value : {};
  const record = input as Record<string, unknown>;

  const profileUrl = cleanText(record.profileUrl, 220);
  const platform = detectPlatformFromUrl(profileUrl) ?? parsePlatform(record.platform);

  return {
    platform,
    businessName:
      cleanText(record.usernameDisplayName, 120) ||
      cleanText(record.businessName, 120) ||
      profileUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    industry: cleanText(record.industry, 120) || "Local business or creator-led local offer",
    city: cleanText(record.location, 120) || cleanText(record.city, 120),
    website: cleanText(record.website, 180),
    goals: cleanText(record.businessGoal, 900) || cleanText(record.goals, 900),
    currentChallenges:
      cleanText(record.currentChallenges, 900) ||
      "URL-first audit requested. Optional manual profile context may be limited.",
    profileUrl,
    bio: cleanText(record.bio, 900),
    usernameDisplayName: cleanText(record.usernameDisplayName, 160),
    pinnedPostTopics: cleanText(record.pinnedPostTopics, 900),
    recentCaptions: cleanText(record.recentCaptions, 1600),
    targetCustomer: cleanText(record.targetCustomer, 600),
    offer: cleanText(record.offer, 600),
    location: cleanText(record.location, 160),
    businessGoal: cleanText(record.businessGoal, 700)
  };
}

function validateFormData(formData: BusinessAuditFormData) {
  const missingFields = [
    ["profileUrl", formData.profileUrl]
  ].filter(([, value]) => !value);

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields
      .map(([field]) => field)
      .join(", ")}`;
  }

  return null;
}

function getPlatformInstructions(platform: AuditPlatform) {
  if (platform === "instagram") {
    return [
      "Audit mode: Instagram profile.",
      "Evaluate these Instagram-specific areas: bio clarity, profile name SEO, pinned posts, recent captions, content consistency, CTA strength, local keyword use, and offer clarity.",
      "The categoryScores array must use exactly these category names: Profile Clarity, Local SEO, Offer Strength, Content Consistency, CTA Strength, Trust & Authority.",
      "Recommendations should help a local business convert Instagram profile visitors into leads."
    ].join(" ");
  }

  if (platform === "tiktok") {
    return [
      "Audit mode: TikTok profile.",
      "Evaluate these TikTok-specific areas: bio clarity, hook strength, video topics, retention strategy, posting consistency, profile conversion path, keyword/search intent alignment, and CTA strength.",
      "The categoryScores array must use exactly these category names: Hook Strength, Retention Potential, Search/Keyword Alignment, Profile Conversion, Content Consistency, CTA Strength.",
      "Recommendations should help a local business turn TikTok discovery into profile visits, inquiries, and booked leads."
    ].join(" ");
  }

  return [
    "Audit mode: General business page.",
    "Evaluate the page for positioning, offer clarity, local SEO signals, lead capture, content trust, CTA strength, and conversion path.",
    "Category scores should be general local-business growth categories."
  ].join(" ");
}

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

function isAuditResult(value: unknown): value is AiAuditResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Partial<AiAuditResult>;

  return (
    typeof result.businessName === "string" &&
    typeof result.overallScore === "number" &&
    typeof result.grade === "string" &&
    typeof result.personalizedDiagnosis === "string" &&
    Array.isArray(result.categoryScores) &&
    Array.isArray(result.topQuickWins) &&
    typeof result.optimizedBio === "string" &&
    Array.isArray(result.contentRecommendations) &&
    typeof result.leadReadyAuditReport === "object" &&
    result.leadReadyAuditReport !== null
  );
}

function normalizeAuditResult(result: AiAuditResult, formData: BusinessAuditFormData) {
  return {
    ...result,
    businessName: formData.businessName,
    overallScore: Math.max(0, Math.min(100, Math.round(result.overallScore))),
    categoryScores: result.categoryScores.map((category) => ({
      ...category,
      score: Math.max(0, Math.min(100, Math.round(category.score)))
    }))
  };
}

async function scanProfile(formData: BusinessAuditFormData): Promise<{
  profileData: ProfileData | null;
  liveScan: LiveScanResult;
}> {
  const parsedUsername = parsedUsernameFromProfileUrl(formData.profileUrl);

  console.info("[Live Scan] Starting profile scan", {
    platform: formData.platform,
    profileUrl: formData.profileUrl,
    parsedUsername
  });

  try {
    if (formData.platform === "instagram") {
      const profileData = await fetchInstagramProfile(formData.profileUrl);
      const isPartial =
        profileData.scanCompleteness < 55 || profileData.metricsStatus === "limited";

      return {
        profileData,
        liveScan: {
          status: isPartial ? "partial" : "success",
          message: isPartial ? "Live Scan: Partial" : "Live Scan: Success",
          dataPointsFound: profileData.dataPointsFound,
          missingDataPoints: profileData.missingDataPoints,
          scanCompleteness: profileData.scanCompleteness,
          confidenceScore: profileData.confidenceScore,
          metricsStatus: profileData.metricsStatus
        }
      };
    }

    if (formData.platform === "tiktok") {
      const profileData = await fetchTikTokProfile(formData.profileUrl);
      const isPartial =
        profileData.scanCompleteness < 55 || profileData.metricsStatus === "limited";

      return {
        profileData,
        liveScan: {
          status: isPartial ? "partial" : "success",
          message: isPartial ? "Live Scan: Partial" : "Live Scan: Success",
          dataPointsFound: profileData.dataPointsFound,
          missingDataPoints: profileData.missingDataPoints,
          scanCompleteness: profileData.scanCompleteness,
          confidenceScore: profileData.confidenceScore,
          metricsStatus: profileData.metricsStatus
        }
      };
    }

    return {
      profileData: null,
      liveScan: {
        status: "skipped",
        message: "Live Scan: Skipped for general page mode",
        dataPointsFound: [],
        missingDataPoints: ["platform profile data"],
        scanCompleteness: 0,
        confidenceScore: 0,
        metricsStatus: "limited"
      }
    };
  } catch (error) {
    const fallbackReason = error instanceof Error ? error.message : String(error);

    if (formData.platform === "tiktok") {
      console.error("[TikTok Apify] Scan failed", {
        profileUrl: formData.profileUrl,
        parsedUsername,
        error: fallbackReason
      });
    }

    console.error("[Live Scan] Falling back to URL-only mode", {
      platform: formData.platform,
      profileUrl: formData.profileUrl,
      parsedUsername,
      error: fallbackReason
    });

    return {
      profileData: null,
      liveScan: {
        status: "fallback",
        message:
          formData.platform === "tiktok"
            ? "TikTok live scan failed, using URL-only mode"
            : "Live Scan: Failed, using URL-only mode",
        dataPointsFound: [],
        missingDataPoints: [
          "bio",
          "follower count",
          "recent captions/descriptions",
          "engagement metrics",
          "posting frequency estimate"
        ],
        scanCompleteness: 0,
        confidenceScore: 0,
        metricsStatus: "limited",
        fallbackReason
      }
    };
  }
}

function formatProfileDataForPrompt(profileData: ProfileData | null) {
  if (!profileData) {
    return "No live profile data was available. Use URL-only mode plus optional user-provided context.";
  }

  return JSON.stringify(
    {
      platform: profileData.platform,
      profileUrl: profileData.profileUrl,
      username: profileData.username,
      displayName: profileData.displayName,
      bio: profileData.bio,
      followerCount: profileData.followerCount,
      followingCount: profileData.followingCount,
      likeCount: profileData.likeCount,
      contentCount: profileData.contentCount,
      verified: profileData.verified,
      profilePictureUrl: profileData.profilePictureUrl,
      recentContent: profileData.recentContent,
      hashtagsUsed: profileData.hashtagsUsed,
      averageLikes: profileData.averageLikes,
      averageComments: profileData.averageComments,
      averageViews: profileData.averageViews,
      postingFrequencyEstimate: profileData.postingFrequencyEstimate,
      pinnedContent: profileData.pinnedContent,
      metricsStatus: profileData.metricsStatus,
      scanCompleteness: profileData.scanCompleteness,
      missingDataPoints: profileData.missingDataPoints,
      confidenceScore: profileData.confidenceScore,
      dataPointsFound: profileData.dataPointsFound
    },
    null,
    2
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const formData = parseBusinessAuditFormData(body);
  const validationError = validateFormData(formData);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  const { profileData, liveScan } = await scanProfile(formData);

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
              `You are Titan AI Audit, a premium local-business AI audit consultant. Return only structured JSON that matches the schema. Be specific, practical, concise, and lead-ready. Generate a realistic overall score from 0 to 100, a matching letter grade, and 4 to 6 category scores. Include 3 to 5 quick wins, 4 to 6 content recommendations, 4 to 6 report findings, and 3 to 5 next steps. Do not invent private facts. If live profile data is provided, prioritize it. If live profile data is unavailable, clearly operate from URL-only mode plus optional user-provided context. ${getPlatformInstructions(formData.platform)}`
          },
          {
            role: "user",
            content: `Create a Titan AI Audit for this business:
Audit mode: ${formData.platform}
Business name or profile identity: ${getBusinessNameFallback(formData)}
Industry: ${formData.industry}
City/market: ${formData.city || "Not provided"}
Website: ${formData.website || "Not provided"}
Goals: ${formData.goals || "Not provided"}
Current challenges: ${formData.currentChallenges}
Profile URL: ${formData.profileUrl}
Bio: ${formData.bio || "Not provided"}
Username/display name: ${formData.usernameDisplayName || "Not provided"}
Pinned post topics: ${formData.pinnedPostTopics || "Not provided"}
Recent captions or video descriptions: ${formData.recentCaptions || "Not provided"}
Target customer: ${formData.targetCustomer || "Not provided"}
Offer: ${formData.offer || "Not provided"}
Location: ${formData.location || "Not provided"}
Business goal: ${formData.businessGoal || "Not provided"}`
              + `\n\nLive profileData from Apify:\n${formatProfileDataForPrompt(profileData)}`
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "titan_ai_audit",
            strict: true,
            schema: auditResponseSchema
          }
        }
      })
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach OpenAI right now. The local scoring fallback is still available.",
        profileData,
        liveScan
      },
      { status: 502 }
    );
  }

  if (!openAiResponse.ok) {
    const errorText = await openAiResponse.text();

    return NextResponse.json(
      {
        error:
          errorText ||
          "OpenAI could not generate the audit right now. The local scoring fallback is still available.",
        profileData,
        liveScan
      },
      { status: openAiResponse.status }
    );
  }

  const openAiPayload: unknown = await openAiResponse.json();
  const responseText = extractResponseText(openAiPayload);

  try {
    const result: unknown = JSON.parse(responseText);

    if (!isAuditResult(result)) {
      throw new Error("The audit response did not match the expected shape.");
    }

    return NextResponse.json({
      source: "openai",
      result: normalizeAuditResult(result, formData),
      profileData,
      liveScan
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "OpenAI returned an unreadable audit response. The local scoring fallback is still available.",
        profileData,
        liveScan
      },
      { status: 502 }
    );
  }
}
