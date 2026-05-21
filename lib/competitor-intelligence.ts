import type { AiAuditCategoryScore, AiAuditResult, AuditPlatform, ProfileData } from "@/lib/audit-ai";
import {
  createVisibilityContentPlan,
  type VisibilityContentPlan,
  type VisibilityPlanContext
} from "@/lib/content-plan";

export type CompetitorSnapshot = {
  result: AiAuditResult;
  platform: AuditPlatform;
  profileData: ProfileData | null;
  profileUrl: string;
};

export type CompetitorComparisonDimension = {
  label: string;
  yourSignal: string;
  competitorSignal: string;
  strategicRead: string;
  contentDirection: string;
  scoreDelta: number;
};

export type CompetitorIntelligenceReport = {
  yourNiche: VisibilityContentPlan["niche"];
  competitorNiche: VisibilityContentPlan["niche"];
  dimensions: CompetitorComparisonDimension[];
  whatTheyDoBetter: string[];
  whatYouDoBetter: string[];
  biggestOpportunityGap: string;
  strategicStrengths: string[];
  strategicWeaknesses: string[];
  visibilityGaps: string[];
  contentOpportunities: string[];
  hookStyleDifferences: string[];
  ctaDifferences: string[];
  visualExecutionDifferences: string[];
  audiencePsychologyDifferences: string[];
};

type ComparisonBlueprint = {
  label: string;
  keys: string[];
  strongerCompetitor: string;
  strongerYou: string;
  closeRead: string;
  direction: string;
};

const comparisonBlueprints: ComparisonBlueprint[] = [
  {
    label: "Hook strength",
    keys: ["hook", "profile clarity", "bio", "clarity"],
    strongerCompetitor:
      "The competitor appears to make the opening promise easier to understand before the viewer has to read or think.",
    strongerYou:
      "Your profile has the stronger first-impression signal; the opportunity is to turn that clarity into faster first-frame creative.",
    closeRead:
      "Both accounts are close on hook strength, so the winner will be the account that makes the first visual moment more immediate.",
    direction:
      "Compare first frames: movement, contrast, emotional reaction, and whether the viewer understands the payoff in under three seconds."
  },
  {
    label: "Posting consistency",
    keys: ["content consistency", "consistency", "posting"],
    strongerCompetitor:
      "The competitor likely feels more familiar because the audience sees a more repeatable content rhythm.",
    strongerYou:
      "Your content rhythm has the stronger foundation; tighten the series formats so the audience knows what to expect next.",
    closeRead:
      "Posting rhythm is not the separator yet; stronger recurring formats will matter more than raw volume.",
    direction:
      "Look for repeatable weekly formats, recurring visual scenes, and whether each post feels like part of the same brand world."
  },
  {
    label: "Authority signals",
    keys: ["trust", "authority", "proof", "retention"],
    strongerCompetitor:
      "The competitor is doing more to make proof visible before asking for trust.",
    strongerYou:
      "Your authority cues are stronger; turn them into more on-camera proof, process, and outcome moments.",
    closeRead:
      "Both accounts have authority potential, but the clearer proof sequence will feel safer to the audience.",
    direction:
      "Audit how each account shows evidence: before/after moments, process footage, testimonials, credentials, and real audience reactions."
  },
  {
    label: "CTA strength",
    keys: ["cta", "conversion", "offer"],
    strongerCompetitor:
      "The competitor gives viewers a clearer next step while attention is still warm.",
    strongerYou:
      "Your CTA structure is stronger; keep making the next step feel like a natural continuation of the post.",
    closeRead:
      "CTA clarity is close, so placement matters: the ask should appear on the strongest proof frame, not at the dead end.",
    direction:
      "Compare whether the CTA appears in the bio only, the caption, on-screen text, spoken copy, or all three."
  },
  {
    label: "Engagement quality",
    keys: ["engagement", "retention", "content"],
    strongerCompetitor:
      "The competitor seems better at giving the audience something specific to react to.",
    strongerYou:
      "Your engagement signals are stronger; build more prompts around identity, preference, and lived experience.",
    closeRead:
      "Engagement quality is close, which means the sharper audience question can create the advantage.",
    direction:
      "Look for prompts that create real replies: choices, objections, identity signals, and moments people want to tag or save."
  },
  {
    label: "Local SEO/search intent",
    keys: ["seo", "search", "keyword", "local"],
    strongerCompetitor:
      "The competitor appears to connect content to search intent or local identity more clearly.",
    strongerYou:
      "Your search and local intent signals are stronger; make those phrases feel native inside the first line and visual context.",
    closeRead:
      "Local/search signals are close, so natural phrasing beats keyword stuffing.",
    direction:
      "Compare location language, service/category phrases, neighborhood cues, and whether the first sentence answers a real search."
  },
  {
    label: "Emotional trigger usage",
    keys: ["content", "engagement", "trust", "offer"],
    strongerCompetitor:
      "The competitor is likely creating a stronger emotional reason to keep watching or take action.",
    strongerYou:
      "Your emotional positioning is stronger; make it more visible through reactions, tension, payoff, and identity language.",
    closeRead:
      "Both accounts can push harder on emotion; the sharper identity cue will feel more memorable.",
    direction:
      "Look for aspiration, frustration, belonging, status, relief, transformation, and fear-of-missing-out cues in the first half of each post."
  },
  {
    label: "Visual strategy",
    keys: ["hook", "content", "retention", "authority"],
    strongerCompetitor:
      "The competitor likely creates visual momentum sooner, which makes the content feel more native to short-form platforms.",
    strongerYou:
      "Your visual strategy has stronger raw material; the next step is sequencing those moments with more cinematic pacing.",
    closeRead:
      "Visual strategy is close, so the account that opens with more motion, emotion, or contrast will feel stronger.",
    direction:
      "Reverse-engineer opening movement, reaction shots, delayed reveals, proof frames, and where the CTA lands."
  },
  {
    label: "Content rhythm",
    keys: ["content consistency", "posting", "content"],
    strongerCompetitor:
      "The competitor may have a more recognizable rhythm between education, proof, personality, and offer.",
    strongerYou:
      "Your content rhythm is more strategically balanced; keep building repeatable series so it compounds.",
    closeRead:
      "Content rhythm is close; the advantage will come from repeating winning formats without sounding copied.",
    direction:
      "Compare how often each account rotates between proof, education, audience reaction, and direct offer moments."
  },
  {
    label: "Audience identity language",
    keys: ["profile clarity", "bio", "offer", "local"],
    strongerCompetitor:
      "The competitor likely speaks to the audience's self-image more directly.",
    strongerYou:
      "Your audience language is stronger; keep making the viewer feel recognized in the first sentence.",
    closeRead:
      "Audience identity language is close, so specificity will decide which profile feels more personally relevant.",
    direction:
      "Compare whether each account names the real buyer/viewer: their desire, hesitation, identity, location, or situation."
  }
];

function findCategory(categories: AiAuditCategoryScore[], keys: string[]) {
  return categories.find((category) => {
    const text = `${category.name} ${category.benchmark} ${category.insight}`.toLowerCase();
    return keys.some((key) => text.includes(key));
  });
}

function dimensionScore(result: AiAuditResult, keys: string[]) {
  return findCategory(result.categoryScores, keys)?.score ?? Math.round(result.overallScore);
}

function dimensionSignal(result: AiAuditResult, keys: string[], fallback: string) {
  const category = findCategory(result.categoryScores, keys);
  return category
    ? `${category.name}: ${category.insight}`
    : fallback;
}

function buildPlan(snapshot: CompetitorSnapshot) {
  const context: VisibilityPlanContext = {
    formData: {
      profileUrl: snapshot.profileUrl,
      businessName: snapshot.result.businessName,
      bio: snapshot.profileData?.bio ?? "",
      usernameDisplayName:
        snapshot.profileData?.displayName ?? snapshot.profileData?.username ?? "",
      recentCaptions: snapshot.profileData?.recentContent
        .map((item) => item.caption)
        .filter(Boolean)
        .join("\n"),
      pinnedPostTopics: snapshot.profileData?.pinnedContent
        .map((item) => item.caption)
        .filter(Boolean)
        .join("\n")
    },
    profileData: snapshot.profileData
  };

  return createVisibilityContentPlan(snapshot.result, snapshot.platform, context);
}

function createDimensionComparison(
  blueprint: ComparisonBlueprint,
  yours: CompetitorSnapshot,
  competitor: CompetitorSnapshot
): CompetitorComparisonDimension {
  const yourScore = dimensionScore(yours.result, blueprint.keys);
  const competitorScore = dimensionScore(competitor.result, blueprint.keys);
  const scoreDelta = competitorScore - yourScore;
  const strategicRead =
    scoreDelta > 4
      ? blueprint.strongerCompetitor
      : scoreDelta < -4
        ? blueprint.strongerYou
        : blueprint.closeRead;

  return {
    label: blueprint.label,
    yourSignal: dimensionSignal(yours.result, blueprint.keys, "Signal is developing."),
    competitorSignal: dimensionSignal(competitor.result, blueprint.keys, "Signal is developing."),
    strategicRead,
    contentDirection: blueprint.direction,
    scoreDelta
  };
}

function strongestCompetitorEdges(dimensions: CompetitorComparisonDimension[]) {
  return [...dimensions]
    .sort((first, second) => second.scoreDelta - first.scoreDelta)
    .slice(0, 3);
}

function strongestYourEdges(dimensions: CompetitorComparisonDimension[]) {
  return [...dimensions]
    .sort((first, second) => first.scoreDelta - second.scoreDelta)
    .slice(0, 3);
}

function toActionSentence(dimension: CompetitorComparisonDimension) {
  return `${dimension.label}: ${dimension.strategicRead}`;
}

export function createCompetitorIntelligenceReport(
  yours: CompetitorSnapshot,
  competitor: CompetitorSnapshot
): CompetitorIntelligenceReport {
  const yourPlan = buildPlan(yours);
  const competitorPlan = buildPlan(competitor);
  const dimensions = comparisonBlueprints.map((blueprint) =>
    createDimensionComparison(blueprint, yours, competitor)
  );
  const competitorEdges = strongestCompetitorEdges(dimensions);
  const yourEdges = strongestYourEdges(dimensions);
  const largestGap = competitorEdges[0] ?? dimensions[0];
  const yourVisualCue = yourPlan.contentPriorities[0] ?? "Make the opening frame clearer.";
  const competitorVisualCue =
    competitorPlan.contentPriorities[0] ?? "Competitor opens with a clearer visual promise.";

  return {
    yourNiche: yourPlan.niche,
    competitorNiche: competitorPlan.niche,
    dimensions,
    whatTheyDoBetter: competitorEdges.map(toActionSentence),
    whatYouDoBetter: yourEdges.map(toActionSentence),
    biggestOpportunityGap: `${largestGap.label}: close the gap by studying how the competitor earns attention, then rebuild your version with stronger first-frame movement, clearer proof, and a CTA that appears while interest is warm.`,
    strategicStrengths: [
      ...yourEdges.map((dimension) => `${dimension.label}: protect this advantage and make it more visible in the first half of each post.`),
      `Niche lock: your plan is reading as ${yourPlan.niche.label}, so keep the language native to that audience.`
    ].slice(0, 4),
    strategicWeaknesses: [
      ...competitorEdges.map((dimension) => `${dimension.label}: this is where the competitor can feel easier to understand or act on.`),
      "Do not answer the competitor by copying their format. Steal the underlying behavior: faster proof, clearer identity, stronger sequence."
    ].slice(0, 4),
    visibilityGaps: dimensions
      .filter((dimension) => dimension.scoreDelta > 2)
      .slice(0, 4)
      .map((dimension) => `${dimension.label}: ${dimension.contentDirection}`),
    contentOpportunities: [
      `Create a comparison-style post that shows your strongest ${yourPlan.niche.searchPhrases[0]} angle with a faster visual opening.`,
      `Build one proof-led series around ${yourPlan.niche.audienceContexts[0]} so the audience sees a consistent reason to trust you.`,
      `Turn the biggest competitor edge into a weekly creative test instead of a one-off post.`
    ],
    hookStyleDifferences: [
      `Competitor read: ${competitorVisualCue}`,
      `Your read: ${yourVisualCue}`,
      "The account that shows motion, tension, or payoff first will usually feel more native than the account that starts with context."
    ],
    ctaDifferences: [
      dimensionSignal(yours.result, ["cta", "conversion", "offer"], "Your CTA signal is developing."),
      dimensionSignal(competitor.result, ["cta", "conversion", "offer"], "Competitor CTA signal is developing."),
      "Best next move: place the CTA over the strongest proof shot, not only in the caption or bio."
    ],
    visualExecutionDifferences: [
      "Watch whether the competitor opens with movement faster, delays the reveal for retention, or uses more emotional reaction shots.",
      "Your response should not be more polish for its own sake. It should be clearer sequencing: visual hook, proof, audience emotion, CTA.",
      "Use short-form pacing like a trailer: first frame earns attention, middle proves the promise, final frame makes the next step obvious."
    ],
    audiencePsychologyDifferences: [
      `Your audience identity: ${yourPlan.niche.audience}`,
      `Competitor audience identity: ${competitorPlan.niche.audience}`,
      "Compare how each account speaks to identity, frustration, aspiration, status, belonging, and fear of missing out."
    ]
  };
}
