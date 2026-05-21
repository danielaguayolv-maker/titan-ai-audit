import type { AiAuditResult, AuditPlatform } from "@/lib/audit-ai";

export type WeeklyVisibilityPlan = {
  week: string;
  focus: string;
  posts: Array<{
    day: string;
    format: string;
    topic: string;
    goal: string;
  }>;
};

export type VisibilityContentPlan = {
  weakAreas: string[];
  contentPriorities: string[];
  postingFrequency: string;
  recommendedMix: Array<{
    label: string;
    share: string;
    purpose: string;
  }>;
  hooks: string[];
  scripts: string[];
  captions: string[];
  ctas: string[];
  weeklySchedule: WeeklyVisibilityPlan[];
};

const platformFrequency: Record<AuditPlatform, string> = {
  instagram: "4 feed posts or Reels per week, plus 3-5 Story touchpoints.",
  tiktok: "5 short videos per week, with 2 repeatable series formats.",
  general: "3 visibility posts per week, plus 1 lead-focused offer post."
};

function getPlatformLabel(platform: AuditPlatform) {
  if (platform === "instagram") return "Instagram";
  if (platform === "tiktok") return "TikTok";
  return "local visibility";
}

function getWeakAreas(auditResult: AiAuditResult) {
  return [...auditResult.categoryScores]
    .sort((first, second) => first.score - second.score)
    .slice(0, 3)
    .map((category) => category.name);
}

export function createVisibilityContentPlan(
  auditResult: AiAuditResult,
  platform: AuditPlatform
): VisibilityContentPlan {
  const weakAreas = getWeakAreas(auditResult);
  const topQuickWin = auditResult.topQuickWins[0];
  const platformLabel = getPlatformLabel(platform);
  const primaryWeakArea = weakAreas[0] ?? "CTA Strength";
  const secondaryWeakArea = weakAreas[1] ?? "Content Consistency";
  const tertiaryWeakArea = weakAreas[2] ?? "Trust & Authority";

  return {
    weakAreas,
    contentPriorities: [
      `Fix ${primaryWeakArea} by making the offer and next action obvious in every high-intent post.`,
      `Improve ${secondaryWeakArea} with repeatable weekly themes instead of one-off content ideas.`,
      `Support ${tertiaryWeakArea} using proof, local specificity, and customer outcome examples.`,
      topQuickWin
        ? `Turn the quick win "${topQuickWin.title}" into the first content series.`
        : "Turn the strongest audit recommendation into the first content series."
    ],
    postingFrequency: platformFrequency[platform],
    recommendedMix: [
      {
        label: "Education",
        share: "35%",
        purpose: `Answer buyer questions tied to ${primaryWeakArea}.`
      },
      {
        label: "Proof",
        share: "25%",
        purpose: "Show outcomes, testimonials, transformations, and behind-the-scenes authority."
      },
      {
        label: "Local relevance",
        share: "20%",
        purpose: `Anchor the ${platformLabel} content in neighborhood, service, or market-specific context.`
      },
      {
        label: "Offer and CTA",
        share: "20%",
        purpose: "Convert attention into messages, bookings, calls, or audit requests."
      }
    ],
    hooks: [
      `If your ${platformLabel} profile is getting views but not leads, check this first.`,
      `Most local businesses lose visibility because their ${primaryWeakArea.toLowerCase()} is unclear.`,
      `Here is the 15-second test we use to spot weak ${platformLabel} conversion.`,
      `Your next customer should understand this before they scroll away.`,
      `Three small profile changes that can turn more local attention into booked conversations.`
    ],
    scripts: [
      `Problem: "People are finding you, but they do not know why to act now." Proof: name the weak signal from the audit. Fix: show the exact profile or content change. CTA: invite them to message or book.`,
      `Before/after: open with the old positioning, show the sharper version, explain why it works, then ask viewers to compare it to their own profile.`,
      `Local authority: name one common customer question, answer it in plain language, add a local example, then close with a direct next step.`,
      `Offer clarity: say who the offer is for, what outcome it creates, what happens next, and why now is the right time to respond.`
    ],
    captions: [
      `Your profile should not make people guess. Tighten the offer, show proof, and make the next step unmistakable.`,
      `Visibility without conversion is expensive. Start with the weakest signal, then build content around the decision your customer is trying to make.`,
      `This week: fewer random posts, more buyer-ready content. Answer the question, show the proof, make the CTA clear.`,
      `A stronger bio and clearer content rhythm can turn passive profile visits into real conversations.`
    ],
    ctas: [
      "DM AUDIT and we will send the first visibility fix.",
      "Book a Titan Visibility Strategy Call.",
      "Send us your profile URL for a quick visibility review.",
      "Tap the link and claim your local visibility audit.",
      "Comment PLAN and we will share the next content move."
    ],
    weeklySchedule: [
      {
        week: "Week 1",
        focus: `Clarify ${primaryWeakArea}`,
        posts: [
          {
            day: "Monday",
            format: platform === "tiktok" ? "Short video" : "Reel",
            topic: "Profile teardown using the weakest audit signal",
            goal: "Make the visibility gap obvious."
          },
          {
            day: "Wednesday",
            format: "Proof post",
            topic: "Customer outcome or transformation example",
            goal: "Build trust before the offer."
          },
          {
            day: "Friday",
            format: "CTA post",
            topic: "Direct invitation to book or message",
            goal: "Create lead action."
          }
        ]
      },
      {
        week: "Week 2",
        focus: `Build consistency around ${secondaryWeakArea}`,
        posts: [
          {
            day: "Monday",
            format: "Educational post",
            topic: "Answer a high-intent buyer question",
            goal: "Capture search and save behavior."
          },
          {
            day: "Wednesday",
            format: "Behind the scenes",
            topic: "Show process, standards, or expertise",
            goal: "Increase authority."
          },
          {
            day: "Friday",
            format: "Local relevance post",
            topic: "Tie the offer to the local market",
            goal: "Strengthen local fit."
          }
        ]
      },
      {
        week: "Week 3",
        focus: `Strengthen ${tertiaryWeakArea}`,
        posts: [
          {
            day: "Monday",
            format: "Myth-busting post",
            topic: "Correct a common customer misconception",
            goal: "Position the business as an expert."
          },
          {
            day: "Wednesday",
            format: "Testimonial or proof",
            topic: "Turn a result into a short story",
            goal: "Reduce buyer hesitation."
          },
          {
            day: "Friday",
            format: "Offer explainer",
            topic: "What happens after someone reaches out",
            goal: "Lower friction to inquire."
          }
        ]
      },
      {
        week: "Week 4",
        focus: "Convert visibility into leads",
        posts: [
          {
            day: "Monday",
            format: "Recap post",
            topic: "Summarize the top visibility lesson",
            goal: "Reinforce expertise."
          },
          {
            day: "Wednesday",
            format: "FAQ post",
            topic: "Answer the biggest objection",
            goal: "Move warm prospects closer."
          },
          {
            day: "Friday",
            format: "Campaign CTA",
            topic: "Book the strategy call or claim the audit",
            goal: "Generate measurable leads."
          }
        ]
      }
    ]
  };
}
