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
  yourPattern: string;
  competitorPattern: string;
  difference: string;
  adaptation: string;
  strategicRead: string;
  whyItMatters: string;
  retentionRead: string;
  sequenceFix: string;
  emotionalTrigger: string;
  contentDirection: string;
  scoreDelta: number;
  confidenceLanguage: "appears to" | "likely" | "shows";
  relativeContext: string;
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
  whyItMatters: string;
  retentionRead: string;
  sequenceFix: string;
  emotionalTrigger: string;
  direction: string;
};

const comparisonBlueprints: ComparisonBlueprint[] = [
  {
    label: "Hook strength",
    keys: ["hook", "profile clarity", "bio", "clarity"],
    strongerCompetitor:
      "The competitor appears to make the opening promise easier to understand before the viewer has to read or think. That matters because the viewer experiences the post as immediately useful instead of asking, 'What am I looking at?'",
    strongerYou:
      "Your profile has the stronger first-impression signal; the opportunity is to turn that clarity into faster first-frame creative so the advantage shows up before the scroll decision happens.",
    closeRead:
      "Both accounts are close on hook strength, so the winner will be the account that makes the first visual moment more immediate and emotionally legible.",
    whyItMatters:
      "Weak hooks hurt because attention is lost before the audience understands the payoff. If context appears before intrigue, the viewer has to work too hard and scrolls before the emotional contrast arrives.",
    retentionRead:
      "Check whether movement starts in the first frame, whether the payoff appears before second three, and whether tension is visible before explanation begins.",
    sequenceFix:
      "Lead with motion or contrast, reveal the stakes immediately after, then slow down for proof once curiosity is already active.",
    emotionalTrigger:
      "Missing trigger: curiosity plus tension. The viewer needs a reason to wonder what happens next.",
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
    whyItMatters:
      "Inconsistent rhythm makes every post feel like a reset. The audience never learns what kind of value to expect, so recognition and habit do not compound.",
    retentionRead:
      "Look for whether the account repeats visual formats, recurring topics, and familiar opening structures without making the feed feel copied.",
    sequenceFix:
      "Create two repeatable series: one proof-led, one education-led. Keep the first visual consistent, but rotate the story, example, and CTA.",
    emotionalTrigger:
      "Missing trigger: familiarity. People return when the account feels recognizable and useful.",
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
    whyItMatters:
      "Authority falls flat when the account claims expertise before showing evidence. Viewers need proof they can see, not credentials they have to trust on faith.",
    retentionRead:
      "Study whether proof appears early enough: process footage, before/after contrast, client/customer reactions, results, or visible expertise before the pitch.",
    sequenceFix:
      "Open with the proof frame, add one line of context, then explain the mechanism that created the result.",
    emotionalTrigger:
      "Missing trigger: trust and risk reduction. The audience wants to feel safe choosing this option.",
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
    whyItMatters:
      "CTA weakness hurts when the viewer emotionally understands the value but does not know what to do next. If the ask only lives in the bio or appears after the energy drops, intent leaks out.",
    retentionRead:
      "Check whether the CTA is spoken, captioned, shown as on-screen text, reinforced in the caption, and timed while the viewer still feels the payoff.",
    sequenceFix:
      "Place the CTA on the strongest proof or reveal frame. Use a low-friction action for warm viewers and a direct action for high-intent viewers.",
    emotionalTrigger:
      "Missing trigger: action confidence. The viewer needs the next step to feel obvious and low-risk.",
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
    whyItMatters:
      "Engagement stays shallow when prompts ask for generic opinions instead of giving people a reason to reveal identity, preference, frustration, or intent.",
    retentionRead:
      "Watch whether the post creates a moment worth responding to before the question appears. A strong prompt lands after recognition, not before it.",
    sequenceFix:
      "Show the relatable moment first, then ask a specific question tied to the viewer's decision, obstacle, or desired outcome.",
    emotionalTrigger:
      "Missing trigger: identity and participation. People comment when the post lets them say something about themselves.",
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
    whyItMatters:
      "Search intent is weak when the account uses broad captions that do not match how buyers actually look for help, places, creators, or solutions.",
    retentionRead:
      "Look for whether the search phrase appears near the beginning and is supported by a visual that proves the account belongs in that query.",
    sequenceFix:
      "Start with the recognizable local or category scene, use the search phrase naturally in the first sentence, then show proof tied to that exact intent.",
    emotionalTrigger:
      "Missing trigger: relevance. The viewer should feel, 'This is for someone like me, right now, in this market.'",
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
    whyItMatters:
      "Emotion is the difference between information and movement. If the post explains the offer but never creates aspiration, relief, status, belonging, or urgency, viewers understand it without feeling pulled toward it.",
    retentionRead:
      "Check whether the emotional payoff arrives before the explanation gets heavy. If the viewer has to wait too long to feel something, retention softens.",
    sequenceFix:
      "Open with the emotion, prove it with a real scene, then explain the offer after the viewer already feels the stakes.",
    emotionalTrigger:
      "Missing trigger: felt outcome. The content needs to show what changes for the viewer, not just what the account sells.",
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
    whyItMatters:
      "Visual strategy controls whether the viewer feels momentum. Static openings, late payoff, and slow context make the post feel like work instead of a scene worth watching.",
    retentionRead:
      "Analyze movement density, delayed reveals, visual payoff timing, editing rhythm, and whether tension releases at the moment curiosity peaks.",
    sequenceFix:
      "Start with the strongest visual, delay one reveal just long enough to create curiosity, then land emotional proof before the CTA.",
    emotionalTrigger:
      "Missing trigger: anticipation. The viewer should feel that a payoff is coming and stay to see it.",
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
    whyItMatters:
      "A weak content rhythm makes the account feel reactive. A strong rhythm teaches the audience how to consume the brand: proof, lesson, emotion, offer, repeat.",
    retentionRead:
      "Look for whether each week has a repeatable arc or if every post asks the audience to recalibrate from scratch.",
    sequenceFix:
      "Build a weekly loop: hook-heavy proof, audience identity post, authority breakdown, then CTA-led conversion post.",
    emotionalTrigger:
      "Missing trigger: momentum. The audience should feel the account is leading them somewhere.",
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
    whyItMatters:
      "Audience language is weak when people can understand the offer but cannot recognize themselves in it. Specific identity cues make the content feel personal before it becomes persuasive.",
    retentionRead:
      "Check whether the post names the viewer's situation before pitching the solution. Identity should arrive before the offer.",
    sequenceFix:
      "Lead with the audience's lived moment, show the tension they already feel, then introduce the brand as the bridge.",
    emotionalTrigger:
      "Missing trigger: recognition. The viewer needs to feel seen before they feel sold to.",
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

function scanConfidenceLanguage(snapshot: CompetitorSnapshot) {
  const completeness = snapshot.profileData?.scanCompleteness ?? 0;
  const dataPointCount = snapshot.profileData?.dataPointsFound.length ?? 0;

  if (completeness >= 70 && dataPointCount >= 5) {
    return "shows" as const;
  }

  if (completeness >= 40 || dataPointCount >= 3) {
    return "likely" as const;
  }

  return "appears to" as const;
}

function lowerConfidence(
  first: ReturnType<typeof scanConfidenceLanguage>,
  second: ReturnType<typeof scanConfidenceLanguage>
) {
  if (first === "appears to" || second === "appears to") {
    return "appears to" as const;
  }

  if (first === "likely" || second === "likely") {
    return "likely" as const;
  }

  return "shows" as const;
}

function strengthContext(score: number, label: "your" | "competitor") {
  const owner = label === "your" ? "You" : "The competitor";

  if (score >= 82) {
    return `${owner} are strong here and should protect the edge.`;
  }

  if (score >= 68) {
    return `${owner} have a relative advantage, but this is still not fully optimized.`;
  }

  if (score >= 52) {
    return `${owner} are ahead comparatively, but still leaving performance on the table.`;
  }

  return `${owner} may be ahead only because the other account is weaker here; this still needs serious tightening.`;
}

function currentPattern(
  owner: "Your" | "Competitor",
  dimension: string,
  signal: string,
  confidence: "appears to" | "likely" | "shows"
) {
  return `${owner} current pattern ${confidence} centered on ${dimension.toLowerCase()}: ${signal}`;
}

function differenceRead(
  dimension: string,
  scoreDelta: number,
  confidence: "appears to" | "likely" | "shows"
) {
  if (scoreDelta > 4) {
    return `Difference: the competitor ${confidence} ahead on ${dimension.toLowerCase()}, so study the behavior creating the edge before changing the creative.`;
  }

  if (scoreDelta < -4) {
    return `Difference: your account ${confidence} ahead on ${dimension.toLowerCase()}, but the edge should be sharpened rather than treated as finished.`;
  }

  return `Difference: both accounts are close on ${dimension.toLowerCase()}, so execution details like pacing, first frame, and CTA placement will decide the advantage.`;
}

function adaptationRead(blueprint: ComparisonBlueprint, scoreDelta: number) {
  if (scoreDelta > 4) {
    return `What to adapt without copying: borrow the competitor's underlying timing behavior, then express it through your own niche visuals. ${blueprint.sequenceFix}`;
  }

  if (scoreDelta < -4) {
    return `What to adapt without copying: keep your relative edge, but pressure-test it against stronger execution. ${blueprint.retentionRead}`;
  }

  return `What to adapt without copying: run a controlled creative test around the sequence. ${blueprint.sequenceFix}`;
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
  const yourSignal = dimensionSignal(yours.result, blueprint.keys, "Signal is developing.");
  const competitorSignal = dimensionSignal(
    competitor.result,
    blueprint.keys,
    "Signal is developing."
  );
  const confidenceLanguage = lowerConfidence(
    scanConfidenceLanguage(yours),
    scanConfidenceLanguage(competitor)
  );
  const strategicRead =
    scoreDelta > 4
      ? `${blueprint.strongerCompetitor} ${strengthContext(competitorScore, "competitor")}`
      : scoreDelta < -4
        ? `${blueprint.strongerYou} ${strengthContext(yourScore, "your")}`
        : blueprint.closeRead;
  const relativeContext =
    scoreDelta > 4
      ? strengthContext(competitorScore, "competitor")
      : scoreDelta < -4
        ? strengthContext(yourScore, "your")
        : "No clear edge yet. Treat this as a close signal and focus on execution quality.";

  return {
    label: blueprint.label,
    yourSignal,
    competitorSignal,
    yourPattern: currentPattern("Your", blueprint.label, yourSignal, scanConfidenceLanguage(yours)),
    competitorPattern: currentPattern(
      "Competitor",
      blueprint.label,
      competitorSignal,
      scanConfidenceLanguage(competitor)
    ),
    difference: differenceRead(blueprint.label, scoreDelta, confidenceLanguage),
    adaptation: adaptationRead(blueprint, scoreDelta),
    strategicRead,
    whyItMatters: blueprint.whyItMatters,
    retentionRead: blueprint.retentionRead,
    sequenceFix: blueprint.sequenceFix,
    emotionalTrigger: blueprint.emotionalTrigger,
    contentDirection: blueprint.direction,
    scoreDelta,
    confidenceLanguage,
    relativeContext
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

function diagnosticOpportunity(dimension: CompetitorComparisonDimension) {
  return `${dimension.label}: ${dimension.relativeContext} ${dimension.adaptation}`;
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
    biggestOpportunityGap: `${largestGap.label}: close the gap by identifying where attention is being lost, then rebuild the sequence. ${largestGap.whyItMatters} ${largestGap.sequenceFix} Adapt the behavior without copying the format: borrow the timing, pacing, and emotional trigger, then express it in your own niche language.`,
    strategicStrengths: [
      ...yourEdges.map((dimension) => `${dimension.label}: protect this advantage by making it visible before the midpoint of the post. ${dimension.emotionalTrigger}`),
      `Niche lock: your plan is reading as ${yourPlan.niche.label}, so keep the language native to that audience.`
    ].slice(0, 4),
    strategicWeaknesses: [
      ...competitorEdges.map(diagnosticOpportunity),
      "Do not answer the competitor by copying their format. Borrow the underlying behavior: earlier proof, clearer identity, tighter pacing, and better CTA timing."
    ].slice(0, 4),
    visibilityGaps: dimensions
      .filter((dimension) => dimension.scoreDelta > 2)
      .slice(0, 4)
      .map((dimension) => `${dimension.label}: ${dimension.contentDirection}`),
    contentOpportunities: [
      `Create a comparison-style post that shows your strongest ${yourPlan.niche.searchPhrases[0]} angle with movement in the first frame, proof by second three, and the CTA on the payoff shot.`,
      `Build one proof-led series around ${yourPlan.niche.audienceContexts[0]} so the audience sees a consistent reason to trust you before they are asked to act.`,
      `Turn the biggest competitor edge into a weekly creative test: one opening style, one delayed reveal, one CTA placement, then compare saves, replies, and profile actions.`
    ],
    hookStyleDifferences: [
      `Your current pattern: ${yourVisualCue}`,
      `Competitor current pattern: ${competitorVisualCue}`,
      `Difference: ${dimensions.find((dimension) => dimension.label === "Hook strength")?.difference ?? "Compare which account creates intrigue before context."}`,
      `What to adapt without copying: ${dimensions.find((dimension) => dimension.label === "Hook strength")?.adaptation ?? "Borrow the timing behavior, not the competitor's exact creative format."}`
    ],
    ctaDifferences: [
      `Your current pattern: ${dimensionSignal(yours.result, ["cta", "conversion", "offer"], "Your CTA signal is developing.")}`,
      `Competitor current pattern: ${dimensionSignal(competitor.result, ["cta", "conversion", "offer"], "Competitor CTA signal is developing.")}`,
      `Difference: ${dimensions.find((dimension) => dimension.label === "CTA strength")?.difference ?? "Compare which CTA appears while attention is still warm."}`,
      `What to adapt without copying: ${dimensions.find((dimension) => dimension.label === "CTA strength")?.adaptation ?? "Place the CTA over the strongest proof shot, reinforce it in caption and on-screen copy, and match it to viewer intent."}`
    ],
    visualExecutionDifferences: [
      "Watch whether the competitor opens with movement faster, delays the reveal until curiosity peaks, or uses more emotional reaction shots before explaining.",
      "Your response should not be more polish for its own sake. It should be clearer sequencing: visual hook, tension, proof, audience emotion, CTA.",
      "Use short-form pacing like a trailer: first frame earns attention, second beat creates curiosity, middle proves the promise, final frame makes the next step obvious."
    ],
    audiencePsychologyDifferences: [
      `Your audience identity: ${yourPlan.niche.audience}`,
      `Competitor audience identity: ${competitorPlan.niche.audience}`,
      "Compare how each account speaks to identity, frustration, aspiration, status, belonging, and fear of missing out."
    ]
  };
}
