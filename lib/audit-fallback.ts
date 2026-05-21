import {
  type AuditCategory,
  auditCategories,
  optimizedBio,
  overallAuditScore,
  quickWins,
  reportHighlights
} from "@/lib/audit-scoring";
import type { AiAuditResult, AuditPlatform } from "@/lib/audit-ai";

const platformCategoryScores: Record<AuditPlatform, AuditCategory[]> = {
  general: auditCategories,
  instagram: [
    {
      name: "Profile Clarity",
      score: 78,
      benchmark: "Promising",
      insight:
        "The profile explains the business, but the bio can state the local offer and next step more directly."
    },
    {
      name: "Local SEO",
      score: 72,
      benchmark: "Needs Lift",
      insight:
        "Location and service keywords should appear more clearly in the display name, bio, and captions."
    },
    {
      name: "Offer Strength",
      score: 80,
      benchmark: "Strong",
      insight:
        "The offer is understandable, but it needs a sharper reason to act now from the profile."
    },
    {
      name: "Content Consistency",
      score: 69,
      benchmark: "Uneven",
      insight:
        "Recent content needs a more consistent mix of proof, education, offers, and local relevance."
    },
    {
      name: "CTA Strength",
      score: 66,
      benchmark: "At Risk",
      insight:
        "The profile should make the next action unmistakable: call, book, message, or claim the offer."
    },
    {
      name: "Trust & Authority",
      score: 76,
      benchmark: "Competitive",
      insight:
        "More testimonials, outcomes, credentials, and behind-the-scenes proof would raise confidence."
    }
  ],
  tiktok: [
    {
      name: "Hook Strength",
      score: 70,
      benchmark: "Developing",
      insight:
        "Video openings should make the problem, payoff, or local angle obvious in the first seconds."
    },
    {
      name: "Retention Potential",
      score: 68,
      benchmark: "At Risk",
      insight:
        "Topics need stronger pacing, open loops, and payoff structure to keep viewers watching."
    },
    {
      name: "Search/Keyword Alignment",
      score: 74,
      benchmark: "Promising",
      insight:
        "Descriptions should include more buyer-intent phrases and local search language."
    },
    {
      name: "Profile Conversion",
      score: 65,
      benchmark: "Underused",
      insight:
        "The profile needs a clearer path from discovery to booking, messaging, or offer claim."
    },
    {
      name: "Content Consistency",
      score: 72,
      benchmark: "Needs Rhythm",
      insight:
        "Posting themes should repeat around core customer questions, proof, and offer-led videos."
    },
    {
      name: "CTA Strength",
      score: 67,
      benchmark: "At Risk",
      insight:
        "Videos and profile copy should tell viewers exactly what to do next after watching."
    }
  ]
};

export function getGradeFromScore(score: number) {
  if (score >= 90) {
    return "A";
  }

  if (score >= 85) {
    return "B+";
  }

  if (score >= 80) {
    return "B";
  }

  if (score >= 75) {
    return "C+";
  }

  if (score >= 70) {
    return "C";
  }

  return "Needs Focus";
}

export function createFallbackAuditResult(
  platform: AuditPlatform = "general"
): AiAuditResult {
  const categoryScores = platformCategoryScores[platform];
  const platformScore = Math.round(
    categoryScores.reduce((total, category) => total + category.score, 0) /
      categoryScores.length
  );
  const platformLabel =
    platform === "instagram"
      ? "Instagram"
      : platform === "tiktok"
        ? "TikTok"
        : "General business page";

  return {
    businessName: "Awaiting profile audit",
    overallScore: platform === "general" ? overallAuditScore : platformScore,
    grade: getGradeFromScore(platform === "general" ? overallAuditScore : platformScore),
    personalizedDiagnosis:
      `The ${platformLabel} readiness baseline is loaded. Run a live Visibility Audit to replace this guidance with profile-specific diagnosis, scanned data, and execution priorities.`,
    categoryScores,
    topQuickWins: quickWins.map((win) => ({
      title: win.title,
      impact: win.impact,
      effort: win.effort,
      description: win.description
    })),
    optimizedBio,
    contentRecommendations: [
      "Run a live profile scan before finalizing the content plan.",
      "Use the weakest category score to choose the first execution theme.",
      "Pair educational content with proof and a direct next step.",
      "Turn the visibility report into a concise strategy call outline."
    ],
    leadReadyAuditReport: {
      headline: "Visibility baseline summary",
      summary:
        "Use this readiness baseline as a temporary planning layer until a live profile audit is generated.",
      findings: reportHighlights,
      nextSteps: [
        "Run a Visibility Audit with a profile URL.",
        "Open Titan Studio to generate the 30-day execution plan.",
        "Export the final visibility report for client delivery."
      ]
    }
  };
}
