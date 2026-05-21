import type { AiAuditCategoryScore, AiAuditResult, AuditPlatform } from "@/lib/audit-ai";

export type VisibilitySignal = {
  label: string;
  score: number;
  status: string;
  insight: string;
};

export type DailyPostingRecommendation = {
  day: string;
  format: string;
  topic: string;
  goal: string;
  visibilitySignal: string;
};

export type WeeklyVisibilityPlan = {
  week: string;
  objective: string;
  strategy: string;
  dailyPosts: DailyPostingRecommendation[];
  hookIdeas: string[];
  videoScriptConcepts: string[];
  captionIdeas: string[];
  ctaSuggestions: string[];
  engagementTasks: string[];
  visibilityPriorities: string[];
};

export type VisibilityContentPlan = {
  weakAreas: string[];
  visibilitySignals: VisibilitySignal[];
  contentPriorities: string[];
  postingFrequency: string;
  recommendedMix: Array<{
    label: string;
    share: string;
    purpose: string;
  }>;
  weeklySchedule: WeeklyVisibilityPlan[];
};

const platformFrequency: Record<AuditPlatform, string> = {
  instagram: "4 Reels or feed posts per week, 3-5 Story touchpoints, and 15 minutes of daily engagement.",
  tiktok: "5 short videos per week, 2 repeatable series formats, and daily comment/reply engagement.",
  general: "3 visibility posts per week, 1 offer-led post, and daily response/relationship follow-up."
};

const visibilityDimensions = [
  {
    label: "Weak hooks",
    keys: ["hook", "profile clarity", "bio", "clarity"],
    fallback: "Open each post with a sharper problem, payoff, local angle, or curiosity gap."
  },
  {
    label: "Posting consistency",
    keys: ["content consistency", "consistency", "posting"],
    fallback: "Turn scattered ideas into a repeatable weekly publishing rhythm."
  },
  {
    label: "Authority signals",
    keys: ["trust", "authority", "proof", "retention"],
    fallback: "Add proof, outcomes, testimonials, process details, and credibility signals."
  },
  {
    label: "CTA strength",
    keys: ["cta", "conversion", "offer"],
    fallback: "Make every high-intent post tell the viewer exactly what to do next."
  },
  {
    label: "Engagement quality",
    keys: ["engagement", "retention", "content"],
    fallback: "Use comments, questions, and replies to create stronger audience signal loops."
  },
  {
    label: "Local SEO/search intent",
    keys: ["seo", "search", "keyword", "local"],
    fallback: "Use service, location, and buyer-intent language in topics, captions, and profiles."
  },
  {
    label: "Content gaps",
    keys: ["gap", "content", "offer", "profile"],
    fallback: "Fill the missing mix of education, proof, local relevance, and offer-led content."
  }
];

function getPlatformLabel(platform: AuditPlatform) {
  if (platform === "instagram") return "Instagram";
  if (platform === "tiktok") return "TikTok";
  return "local visibility";
}

function getWeakCategories(auditResult: AiAuditResult) {
  return [...auditResult.categoryScores]
    .sort((first, second) => first.score - second.score)
    .slice(0, 4);
}

function findCategory(
  categories: AiAuditCategoryScore[],
  keys: string[]
): AiAuditCategoryScore | undefined {
  return categories.find((category) => {
    const haystack = `${category.name} ${category.benchmark} ${category.insight}`.toLowerCase();
    return keys.some((key) => haystack.includes(key));
  });
}

function buildVisibilitySignals(auditResult: AiAuditResult): VisibilitySignal[] {
  const weakCategories = getWeakCategories(auditResult);

  return visibilityDimensions.map((dimension, index) => {
    const category =
      findCategory(auditResult.categoryScores, dimension.keys) ??
      weakCategories[index % Math.max(weakCategories.length, 1)];

    return {
      label: dimension.label,
      score: category?.score ?? Math.round(auditResult.overallScore),
      status: category?.benchmark ?? "Needs focus",
      insight: category?.insight ?? dimension.fallback
    };
  });
}

function signalByLabel(signals: VisibilitySignal[], label: string) {
  return signals.find((signal) => signal.label === label) ?? signals[0];
}

export function createVisibilityContentPlan(
  auditResult: AiAuditResult,
  platform: AuditPlatform
): VisibilityContentPlan {
  const weakCategories = getWeakCategories(auditResult);
  const weakAreas = weakCategories.map((category) => category.name);
  const visibilitySignals = buildVisibilitySignals(auditResult);
  const platformLabel = getPlatformLabel(platform);
  const hookSignal = signalByLabel(visibilitySignals, "Weak hooks");
  const consistencySignal = signalByLabel(visibilitySignals, "Posting consistency");
  const authoritySignal = signalByLabel(visibilitySignals, "Authority signals");
  const ctaSignal = signalByLabel(visibilitySignals, "CTA strength");
  const engagementSignal = signalByLabel(visibilitySignals, "Engagement quality");
  const seoSignal = signalByLabel(visibilitySignals, "Local SEO/search intent");
  const gapSignal = signalByLabel(visibilitySignals, "Content gaps");

  return {
    weakAreas,
    visibilitySignals,
    contentPriorities: [
      `Lead with ${hookSignal.label.toLowerCase()}: ${hookSignal.insight}`,
      `Stabilize ${consistencySignal.label.toLowerCase()}: ${consistencySignal.insight}`,
      `Raise ${authoritySignal.label.toLowerCase()}: ${authoritySignal.insight}`,
      `Convert with ${ctaSignal.label.toLowerCase()}: ${ctaSignal.insight}`
    ],
    postingFrequency: platformFrequency[platform],
    recommendedMix: [
      {
        label: "Buyer education",
        share: "30%",
        purpose: `Answer search-intent questions tied to ${seoSignal.status.toLowerCase()}.`
      },
      {
        label: "Proof and authority",
        share: "25%",
        purpose: "Show outcomes, process, testimonials, credentials, and behind-the-scenes standards."
      },
      {
        label: "Local or niche relevance",
        share: "20%",
        purpose: `Anchor the plan in ${platformLabel} search language, audience context, and market specifics.`
      },
      {
        label: "Offer and CTA",
        share: "15%",
        purpose: "Move attention into messages, bookings, calls, lead magnets, or audits."
      },
      {
        label: "Engagement loops",
        share: "10%",
        purpose: "Create prompts, replies, and community touchpoints that improve signal quality."
      }
    ],
    weeklySchedule: [
      {
        week: "Week 1",
        objective: "Clarify the profile promise and strengthen first-touch hooks.",
        strategy: `The audit shows ${hookSignal.label.toLowerCase()} and ${ctaSignal.label.toLowerCase()} need attention. This week makes the offer understandable before a viewer scrolls away.`,
        dailyPosts: [
          {
            day: "Monday",
            format: platform === "tiktok" ? "Short video" : "Reel",
            topic: "Show the biggest visibility leak found in the audit",
            goal: "Make the core problem obvious in the first three seconds.",
            visibilitySignal: hookSignal.label
          },
          {
            day: "Tuesday",
            format: "Caption-led proof post",
            topic: "Explain who the offer helps and what outcome they want",
            goal: "Tighten positioning and attract the right audience.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Educational post",
            topic: "Answer the most common buyer question before they inquire",
            goal: "Build trust through clarity.",
            visibilitySignal: seoSignal.label
          },
          {
            day: "Thursday",
            format: "Behind-the-scenes clip",
            topic: "Show process, standards, or how the work gets done",
            goal: "Create authority without a hard sell.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Direct CTA post",
            topic: "Invite viewers to book, message, or request a visibility review",
            goal: "Convert profile attention into a measurable next step.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          "Your profile may be getting attention but losing leads here.",
          "If people visit your page and do not act, check this first.",
          `The fastest way to improve ${platformLabel} visibility is not posting more.`
        ],
        videoScriptConcepts: [
          "Open with the audit gap, show the visible symptom, explain the fix, close with one direct CTA.",
          "Use a before/after profile promise: vague positioning first, sharper offer second, then explain the conversion difference."
        ],
        captionIdeas: [
          "Visibility starts with clarity. If your audience has to guess what you do, they will not take the next step.",
          "A stronger first impression can turn silent profile visits into real conversations."
        ],
        ctaSuggestions: [
          "DM VISIBILITY for the first profile fix.",
          "Book a Titan Visibility Strategy Call.",
          "Send your profile URL for a quick review."
        ],
        engagementTasks: [
          "Reply to every comment with a follow-up question within 24 hours.",
          "Comment on 10 local or niche-relevant posts using buyer language.",
          "Pin or save the strongest audience question for next week's content."
        ],
        visibilityPriorities: [
          hookSignal.insight,
          ctaSignal.insight,
          "Create one repeatable hook format that can be reused for the next three weeks."
        ]
      },
      {
        week: "Week 2",
        objective: "Build posting consistency around buyer intent and content gaps.",
        strategy: `This week addresses ${consistencySignal.label.toLowerCase()} and ${gapSignal.label.toLowerCase()} by turning weak categories into repeatable content pillars.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Search-intent post",
            topic: "Answer a question your ideal customer searches before buying",
            goal: "Improve discoverability and relevance.",
            visibilitySignal: seoSignal.label
          },
          {
            day: "Tuesday",
            format: "Myth-busting video",
            topic: "Correct a belief that keeps prospects from acting",
            goal: "Create authority and retention.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Carousel or list post",
            topic: "Three signs the audience needs the offer",
            goal: "Make self-identification easy.",
            visibilitySignal: gapSignal.label
          },
          {
            day: "Thursday",
            format: "Proof post",
            topic: "Share a result, review, transformation, or process win",
            goal: "Add trust signals to the content mix.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Soft CTA post",
            topic: "Invite followers to ask for help with the specific problem",
            goal: "Create low-friction conversations.",
            visibilitySignal: engagementSignal.label
          }
        ],
        hookIdeas: [
          "Before you hire someone for this, ask this question.",
          "Most people miss this step until it costs them leads.",
          "Here is what I would fix first if this were my profile."
        ],
        videoScriptConcepts: [
          "Teach one buyer-intent question, give a quick example, then point to the offer as the next logical step.",
          "Show a common mistake, explain why it happens, and give the corrected version."
        ],
        captionIdeas: [
          "Consistency is not posting every thought. It is repeating the right signals until your audience knows why to trust you.",
          "This week's content should make the buying decision easier, not just fill the calendar."
        ],
        ctaSuggestions: [
          "Comment PLAN if you want the next step.",
          "Message us the word FIX and we will point you to the first improvement.",
          "Save this before you update your profile."
        ],
        engagementTasks: [
          "Ask one question in Stories or comments that reveals buyer objections.",
          "Turn the best comment into tomorrow's post angle.",
          "Track which post earns the most saves, replies, or profile visits."
        ],
        visibilityPriorities: [
          consistencySignal.insight,
          gapSignal.insight,
          "Define four content pillars: education, proof, local relevance, and offer."
        ]
      },
      {
        week: "Week 3",
        objective: "Increase authority, engagement quality, and trust density.",
        strategy: `The roadmap now shifts from clarity to credibility. Stronger ${authoritySignal.label.toLowerCase()} and ${engagementSignal.label.toLowerCase()} help turn attention into confidence.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Authority video",
            topic: "Explain the standard or process most competitors do not show",
            goal: "Differentiate expertise.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Tuesday",
            format: "Testimonial or proof story",
            topic: "Turn one customer result into a narrative",
            goal: "Reduce risk for new prospects.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Objection-handling post",
            topic: "Answer the concern that keeps people from booking",
            goal: "Move warm viewers closer to action.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Thursday",
            format: "Community prompt",
            topic: "Ask the audience what they are trying to improve next",
            goal: "Increase comment quality and content inputs.",
            visibilitySignal: engagementSignal.label
          },
          {
            day: "Friday",
            format: "Local or niche relevance post",
            topic: "Tie the offer to a specific market, moment, or audience segment",
            goal: "Improve relevance and search context.",
            visibilitySignal: seoSignal.label
          }
        ],
        hookIdeas: [
          "Here is what a strong result looks like behind the scenes.",
          "This is the part of the process most people never see.",
          "If you are comparing options, this detail matters."
        ],
        videoScriptConcepts: [
          "Start with an objection, validate it, show the proof, explain the process, close with a next step.",
          "Break down a result into three decisions that made it possible."
        ],
        captionIdeas: [
          "Authority is built through evidence. Show the process, the result, and the reason it worked.",
          "People trust what they can understand. Make the path visible."
        ],
        ctaSuggestions: [
          "Want us to map this for your brand? Book a strategy call.",
          "DM PROOF and we will show you what to fix first.",
          "Ask us what this would look like for your profile."
        ],
        engagementTasks: [
          "Reply to high-intent comments with a specific next step.",
          "Create a saved response for common objections.",
          "Identify three audience questions that deserve dedicated posts."
        ],
        visibilityPriorities: [
          authoritySignal.insight,
          engagementSignal.insight,
          "Shift from generic proof to specific proof tied to buyer hesitation."
        ]
      },
      {
        week: "Week 4",
        objective: "Convert visibility into leads and refine the next growth cycle.",
        strategy: `The final week packages the strongest content signals into a conversion push, then uses performance feedback to decide the next 30-day cycle.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Campaign recap",
            topic: "Summarize the biggest visibility improvement from the month",
            goal: "Reinforce the strategic arc.",
            visibilitySignal: gapSignal.label
          },
          {
            day: "Tuesday",
            format: "FAQ video",
            topic: "Answer the final question before someone books or messages",
            goal: "Remove friction.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Comparison post",
            topic: "Show the difference between weak visibility and strong visibility",
            goal: "Make the value easy to understand.",
            visibilitySignal: hookSignal.label
          },
          {
            day: "Thursday",
            format: "Lead magnet or audit invitation",
            topic: "Offer a simple next step connected to the audit finding",
            goal: "Capture warm demand.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Friday",
            format: "Strategy CTA post",
            topic: "Invite the audience to book a Titan Visibility Strategy Call",
            goal: "Turn the month into pipeline.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          "If you only fix one visibility problem this month, fix this.",
          "This is how we turn profile attention into a real next step.",
          "Your content should create decisions, not just impressions."
        ],
        videoScriptConcepts: [
          "Recap the month: gap, fix, proof, next step. Keep it simple and conversion-focused.",
          "Show the cost of unclear visibility, then make the strategy call the obvious next move."
        ],
        captionIdeas: [
          "A visibility plan should end with action. The goal is not more content. The goal is clearer demand.",
          "Use the signals from this month to decide what to repeat, what to cut, and what to scale."
        ],
        ctaSuggestions: [
          "Book a Titan Visibility Strategy Call.",
          "Download the report and choose your first implementation priority.",
          "Message STRATEGY and we will map the next 30 days."
        ],
        engagementTasks: [
          "Review the top three posts by saves, replies, profile visits, or clicks.",
          "Document the best-performing hook and CTA.",
          "Turn the strongest audience response into the next month's first campaign."
        ],
        visibilityPriorities: [
          ctaSignal.insight,
          "Compare engagement quality against the posts with the clearest hooks.",
          "Choose the next cycle based on evidence, not content volume."
        ]
      }
    ]
  };
}
