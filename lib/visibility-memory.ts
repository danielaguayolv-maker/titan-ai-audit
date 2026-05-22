import type {
  AiAuditCategoryScore,
  AiAuditResult,
  AuditPlatform,
  BusinessAuditFormData,
  ProfileData
} from "@/lib/audit-ai";

export const visibilityMemoryStorageKey = "titan-visibility-memory-v1";

export type VisibilityMemoryEntry = {
  id: string;
  createdAt: string;
  accountKey: string;
  businessName: string;
  platform: AuditPlatform;
  profileUrl: string;
  score: number;
  grade: string;
  categoryScores: AiAuditCategoryScore[];
  hookPattern: string;
  ctaPlacementHabit: string;
  pacingBehavior: string;
  emotionalTone: string;
  visualStyle: string;
  postingRhythm: string;
  audienceIdentityLanguage: string;
  recurringStrengths: string[];
  recurringWeaknesses: string[];
  emotionalTriggers: string[];
  visualSignatures: string[];
  aestheticConsistency: string;
};

export type VisibilityMemoryReport = {
  accountKey: string;
  auditCount: number;
  lastAuditAt?: string;
  comparedToLastAudit: string[];
  trendMovement: string[];
  evolvingStrengths: string[];
  persistentWeaknesses: string[];
  repeatedWins: string[];
  repeatedMistakes: string[];
  emotionalPatterns: string[];
  pacingHabits: string[];
  creatorPresenceTrends: string[];
  identityAnalysis: string[];
  predictiveSignals: string[];
};

export type EvolutionMovementStatus =
  | "improving"
  | "declining"
  | "stable"
  | "inconsistent"
  | "emerging";

export type VisibilityEvolutionMetric = {
  label: string;
  status: EvolutionMovementStatus;
  currentScore: number;
  previousScore?: number;
  delta: number;
  summary: string;
};

export type VisibilityAuditTimelineItem = {
  id: string;
  createdAt: string;
  score: number;
  grade: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export type VisibilityEvolutionReport = {
  auditCount: number;
  improvements: string[];
  regressions: string[];
  repeatedWeaknesses: string[];
  strengtheningSignals: string[];
  emergingPatterns: string[];
  unstablePatterns: string[];
  movementScores: VisibilityEvolutionMetric[];
  identityEvolution: string[];
  momentumAnalysis: string[];
  timeline: VisibilityAuditTimelineItem[];
};

export type VisibilityMemoryDebugState = {
  activeSaveFunctionVersion: string;
  normalizedAccountKey: string;
  storageWriteKey: string;
  storageReadKey: string;
  storedAuditsFound: number;
  matchingAuditsFound: number;
  auditCountBeforeSave: number;
  auditCountAfterSave: number;
  serializedJsonLength: number;
  memoryObjectBeforeWrite: string;
  rawLocalStorageValueAfterSet: string;
  lastAttemptedSaveAt: string;
  saveMemoryAuditCalled: boolean;
  auditObjectPassedValidation: boolean;
  windowAvailable: boolean;
  saveError: string;
  readError: string;
};

const memoryLimitPerAccount = 8;

const evolutionMetrics = [
  {
    label: "Hook Strength",
    keys: ["hook", "profile clarity", "bio", "clarity"]
  },
  {
    label: "Retention Potential",
    keys: ["retention", "watch", "pacing", "hook"]
  },
  {
    label: "CTA Strength",
    keys: ["cta", "conversion", "offer"]
  },
  {
    label: "Memorability",
    keys: ["memorability", "memory", "visual", "content"]
  },
  {
    label: "Emotional Identity",
    keys: ["emotion", "identity", "brand", "audience"]
  },
  {
    label: "Profile Conversion",
    keys: ["profile", "conversion", "bio", "offer"]
  },
  {
    label: "Content Consistency",
    keys: ["consistency", "posting", "content"]
  },
  {
    label: "Search/Keyword Alignment",
    keys: ["search", "keyword", "seo", "local"]
  }
] as const;

export const emptyVisibilityMemoryDebug: VisibilityMemoryDebugState = {
  activeSaveFunctionVersion: "",
  normalizedAccountKey: "",
  storageWriteKey: visibilityMemoryStorageKey,
  storageReadKey: visibilityMemoryStorageKey,
  storedAuditsFound: 0,
  matchingAuditsFound: 0,
  auditCountBeforeSave: 0,
  auditCountAfterSave: 0,
  serializedJsonLength: 0,
  memoryObjectBeforeWrite: "",
  rawLocalStorageValueAfterSet: "",
  lastAttemptedSaveAt: "",
  saveMemoryAuditCalled: false,
  auditObjectPassedValidation: false,
  windowAvailable: false,
  saveError: "",
  readError: ""
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function normalizeAccountKey(profileUrl: string, businessName: string) {
  if (profileUrl.trim()) {
    try {
      const parsedUrl = new URL(profileUrl);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

      if (hostname.includes("tiktok.com")) {
        const username = pathSegments.find((segment) => segment.startsWith("@"));
        return username ? `${hostname}/${username.toLowerCase()}` : hostname;
      }

      if (hostname.includes("instagram.com")) {
        const username = pathSegments[0];
        return username ? `${hostname}/${username.toLowerCase()}` : hostname;
      }

      return `${hostname}/${pathSegments.join("/")}`.toLowerCase().replace(/\/+$/, "");
    } catch {
      return normalizeText(profileUrl).replace(/\/+$/, "");
    }
  }

  return normalizeText(businessName) || "unknown-account";
}

function allAuditText(
  auditResult: AiAuditResult,
  context?: { formData?: BusinessAuditFormData; profileData?: ProfileData | null }
) {
  return [
    auditResult.businessName,
    auditResult.personalizedDiagnosis,
    auditResult.optimizedBio,
    ...auditResult.contentRecommendations,
    ...auditResult.topQuickWins.flatMap((win) => [win.title, win.description]),
    ...auditResult.leadReadyAuditReport.findings,
    ...auditResult.leadReadyAuditReport.nextSteps,
    ...auditResult.categoryScores.flatMap((category) => [
      category.name,
      category.benchmark,
      category.insight
    ]),
    context?.formData?.bio,
    context?.formData?.recentCaptions,
    context?.formData?.targetCustomer,
    context?.formData?.offer,
    context?.profileData?.bio,
    context?.profileData?.postingFrequencyEstimate,
    ...(context?.profileData?.hashtagsUsed ?? []),
    ...(context?.profileData?.recentContent.map((item) => item.caption) ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function categoryByNeed(categories: AiAuditCategoryScore[], keywords: string[]) {
  return categories.find((category) => {
    const text = normalizeText(`${category.name} ${category.benchmark} ${category.insight}`);
    return keywords.some((keyword) => text.includes(keyword));
  });
}

function weakestCategories(categories: AiAuditCategoryScore[]) {
  return [...categories].sort((first, second) => first.score - second.score).slice(0, 3);
}

function strongestCategories(categories: AiAuditCategoryScore[]) {
  return [...categories].sort((first, second) => second.score - first.score).slice(0, 3);
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function detectVisualSignatures(text: string, profileData?: ProfileData | null) {
  const signatures = [
    includesAny(text, ["crowd", "room", "table", "audience", "community"])
      ? "people and room energy"
      : "",
    includesAny(text, ["reaction", "face", "customer", "client"])
      ? "reaction-led proof"
      : "",
    includesAny(text, ["before", "after", "transformation", "result"])
      ? "before-after contrast"
      : "",
    includesAny(text, ["screen", "walkthrough", "analytics", "dashboard"])
      ? "screen-led breakdowns"
      : "",
    includesAny(text, ["close-up", "closeup", "food", "dish", "product"])
      ? "product close-ups"
      : "",
    includesAny(text, ["story", "pov", "behind", "process"])
      ? "behind-the-scenes POV"
      : ""
  ].filter(Boolean);

  const hashtags = profileData?.hashtagsUsed.slice(0, 3).map((tag) => `#${tag.replace(/^#/, "")}`) ?? [];
  return [...new Set([...signatures, ...hashtags])].slice(0, 5);
}

function detectEmotionalTriggers(text: string) {
  const triggers = [
    includesAny(text, ["belong", "community", "local", "culture"]) ? "belonging" : "",
    includesAny(text, ["status", "premium", "authority", "expert"]) ? "status" : "",
    includesAny(text, ["frustration", "problem", "pain", "stuck"]) ? "frustration" : "",
    includesAny(text, ["aspiration", "dream", "goal", "better"]) ? "aspiration" : "",
    includesAny(text, ["fear", "miss", "urgent", "limited"]) ? "fear of missing out" : "",
    includesAny(text, ["change", "transform", "confidence", "result"]) ? "transformation" : ""
  ].filter(Boolean);

  return [...new Set(triggers)].slice(0, 5);
}

function describeScore(category: AiAuditCategoryScore | undefined, fallback: string) {
  if (!category) {
    return fallback;
  }

  if (category.score >= 80) {
    return `${category.name} is becoming a repeatable strength.`;
  }

  if (category.score >= 65) {
    return `${category.name} is usable, but not yet unmistakable.`;
  }

  return `${category.name} is still leaking attention.`;
}

function detectAestheticConsistency(text: string, categories: AiAuditCategoryScore[]) {
  const consistency = categoryByNeed(categories, ["consistency", "visual", "content"]);

  if (consistency && consistency.score >= 78) {
    return "The account is developing recognizable visual habits.";
  }

  if (includesAny(text, ["drift", "inconsistent", "random", "scattered"])) {
    return "Visual identity is drifting between ideas.";
  }

  if (includesAny(text, ["polished", "clean", "premium"])) {
    return "The content looks polished. The fingerprint still needs to get louder.";
  }

  return "The aesthetic is visible, but not fully owned yet.";
}

export function createVisibilityMemoryEntry(
  auditResult: AiAuditResult,
  platform: AuditPlatform,
  context?: { formData?: BusinessAuditFormData; profileData?: ProfileData | null }
): VisibilityMemoryEntry {
  const text = allAuditText(auditResult, context);
  const profileUrl = context?.formData?.profileUrl ?? context?.profileData?.profileUrl ?? "";
  const hookCategory = categoryByNeed(auditResult.categoryScores, ["hook", "profile clarity", "bio"]);
  const ctaCategory = categoryByNeed(auditResult.categoryScores, ["cta", "conversion", "offer"]);
  const rhythmCategory = categoryByNeed(auditResult.categoryScores, ["consistency", "posting", "content"]);
  const authorityCategory = categoryByNeed(auditResult.categoryScores, ["trust", "authority", "proof"]);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    accountKey: normalizeAccountKey(profileUrl, auditResult.businessName),
    businessName: auditResult.businessName,
    platform,
    profileUrl,
    score: Math.round(auditResult.overallScore),
    grade: auditResult.grade,
    categoryScores: auditResult.categoryScores,
    hookPattern: describeScore(hookCategory, "Hook pattern is still forming."),
    ctaPlacementHabit: describeScore(ctaCategory, "CTA behavior is still forming."),
    pacingBehavior: includesAny(text, ["slow", "delayed", "late", "pacing"])
      ? "The account tends to make the audience wait before the payoff."
      : "Pacing is becoming easier to read.",
    emotionalTone: includesAny(text, ["room", "crowd", "belonging", "reaction"])
      ? "The strongest emotional material comes from people, atmosphere, and shared energy."
      : "The tone still leans more informational than emotionally contagious.",
    visualStyle: includesAny(text, ["polished", "premium", "clean"])
      ? "Polished, controlled, and slightly cautious."
      : includesAny(text, ["raw", "behind", "pov"])
        ? "Raw, process-led, and closer to the creator."
        : "Functional, with room for a stronger visual point of view.",
    postingRhythm:
      context?.profileData?.postingFrequencyEstimate ??
      describeScore(rhythmCategory, "Posting rhythm is still forming."),
    audienceIdentityLanguage: includesAny(text, ["local", "families", "creators", "clients", "buyers"])
      ? "Audience identity is starting to show up in the language."
      : "The audience can understand the offer before they fully recognize themselves in it.",
    recurringStrengths: strongestCategories(auditResult.categoryScores).map((category) => category.name),
    recurringWeaknesses: weakestCategories(auditResult.categoryScores).map((category) => category.name),
    emotionalTriggers: detectEmotionalTriggers(text),
    visualSignatures: detectVisualSignatures(text, context?.profileData),
    aestheticConsistency: detectAestheticConsistency(text, auditResult.categoryScores)
  };
}

export function validateVisibilityMemoryAudit(auditResult: AiAuditResult) {
  return Boolean(
    auditResult &&
      typeof auditResult.businessName === "string" &&
      typeof auditResult.overallScore === "number" &&
      typeof auditResult.grade === "string" &&
      typeof auditResult.personalizedDiagnosis === "string" &&
      Array.isArray(auditResult.categoryScores) &&
      auditResult.categoryScores.length > 0 &&
      Array.isArray(auditResult.topQuickWins) &&
      Array.isArray(auditResult.contentRecommendations) &&
      auditResult.leadReadyAuditReport &&
      Array.isArray(auditResult.leadReadyAuditReport.findings) &&
      Array.isArray(auditResult.leadReadyAuditReport.nextSteps)
  );
}

function countOccurrences(entries: VisibilityMemoryEntry[], field: "recurringStrengths" | "recurringWeaknesses") {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    entry[field].forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  });

  return [...counts.entries()].sort((first, second) => second[1] - first[1]);
}

function categoryScore(entry: VisibilityMemoryEntry, categoryName: string) {
  return entry.categoryScores.find((category) => category.name === categoryName)?.score;
}

function scoreTrend(latest: VisibilityMemoryEntry, previous?: VisibilityMemoryEntry) {
  if (!previous) {
    return "First memory point captured. Pattern recognition starts now.";
  }

  const delta = latest.score - previous.score;

  if (delta >= 5) {
    return `Visibility score moved up ${delta} points since the last audit.`;
  }

  if (delta <= -5) {
    return `Visibility score moved down ${Math.abs(delta)} points since the last audit.`;
  }

  return "Visibility score is holding steady. The movement is inside the category patterns.";
}

function comparedCategoryMovement(latest: VisibilityMemoryEntry, previous?: VisibilityMemoryEntry) {
  if (!previous) {
    return ["No previous audit yet. Run another scan later to reveal movement."];
  }

  return latest.categoryScores
    .map((category) => {
      const previousScore = categoryScore(previous, category.name);
      if (previousScore === undefined) {
        return "";
      }

      const delta = category.score - previousScore;
      if (delta >= 5) {
        return `${category.name} improved since the last audit.`;
      }

      if (delta <= -5) {
        return `${category.name} softened since the last audit.`;
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, 4);
}

export function createVisibilityMemoryReport(
  entries: VisibilityMemoryEntry[],
  accountKey: string
): VisibilityMemoryReport {
  const accountEntries = entries
    .filter((entry) => entry.accountKey === accountKey)
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
    .slice(-memoryLimitPerAccount);
  const latest = accountEntries.at(-1);
  const previous = accountEntries.at(-2);

  if (!latest) {
    return {
      accountKey,
      auditCount: 0,
      comparedToLastAudit: ["No memory has been captured for this account yet."],
      trendMovement: ["Run a live Visibility Audit to start the pattern history."],
      evolvingStrengths: [],
      persistentWeaknesses: [],
      repeatedWins: [],
      repeatedMistakes: [],
      emotionalPatterns: [],
      pacingHabits: [],
      creatorPresenceTrends: [],
      identityAnalysis: [],
      predictiveSignals: []
    };
  }

  const repeatedStrengths = countOccurrences(accountEntries, "recurringStrengths").filter(([, count]) => count > 1);
  const repeatedWeaknesses = countOccurrences(accountEntries, "recurringWeaknesses").filter(([, count]) => count > 1);
  const comparedMovement = comparedCategoryMovement(latest, previous);

  return {
    accountKey,
    auditCount: accountEntries.length,
    lastAuditAt: latest.createdAt,
    comparedToLastAudit: [
      scoreTrend(latest, previous),
      ...(comparedMovement.length > 0
        ? comparedMovement
        : ["The last audit and current audit are close. The account is repeating its habits."])
    ].slice(0, 4),
    trendMovement: [
      latest.hookPattern,
      latest.ctaPlacementHabit,
      latest.pacingBehavior
    ],
    evolvingStrengths:
      repeatedStrengths.length > 0
        ? repeatedStrengths.slice(0, 3).map(([name]) => `${name} keeps showing up as an advantage.`)
        : latest.recurringStrengths.slice(0, 3).map((name) => `${name} is the current strongest signal.`),
    persistentWeaknesses:
      repeatedWeaknesses.length > 0
        ? repeatedWeaknesses.slice(0, 3).map(([name]) => `${name} keeps returning as a weak point.`)
        : latest.recurringWeaknesses.slice(0, 3).map((name) => `${name} needs another audit cycle before it becomes a pattern.`),
    repeatedWins: [
      latest.visualSignatures.length > 0
        ? `The account wins when ${latest.visualSignatures[0]} appears early.`
        : "The account wins when the opening feels specific instead of generic.",
      latest.emotionalTriggers.length > 0
        ? `${latest.emotionalTriggers[0]} is becoming one of the stronger emotional levers.`
        : "The strongest posts need a clearer emotional lever."
    ],
    repeatedMistakes: [
      repeatedWeaknesses[0]
        ? `${repeatedWeaknesses[0][0]} is no longer a one-off issue.`
        : "The account still has a few snapshot weaknesses, but not enough history to call them habits.",
      latest.ctaPlacementHabit
    ],
    emotionalPatterns: [
      latest.emotionalTone,
      latest.emotionalTriggers.length > 0
        ? `Recurring triggers: ${latest.emotionalTriggers.join(", ")}.`
        : "No dominant emotional trigger has repeated enough yet."
    ],
    pacingHabits: [
      latest.pacingBehavior,
      latest.ctaPlacementHabit
    ],
    creatorPresenceTrends: [
      latest.audienceIdentityLanguage,
      latest.visualStyle
    ],
    identityAnalysis: [
      latest.aestheticConsistency,
      latest.visualSignatures.length > 0
        ? `Brand fingerprints: ${latest.visualSignatures.join(", ")}.`
        : "No strong visual fingerprint has repeated yet."
    ],
    predictiveSignals: [
      latest.visualSignatures.length > 0
        ? `Likely winning structure: open with ${latest.visualSignatures[0]}, then let the offer arrive second.`
        : "Likely winning structure: put the most human or sensory moment first.",
      repeatedWeaknesses[0]
        ? `Likely weak structure: any post that repeats the ${repeatedWeaknesses[0][0].toLowerCase()} weakness without a stronger first beat.`
        : "Likely weak structure: polished content that resolves before curiosity forms."
    ]
  };
}

function accountHistory(entries: VisibilityMemoryEntry[], accountKey: string) {
  return entries
    .filter((entry) => entry.accountKey === accountKey)
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
    .slice(-memoryLimitPerAccount);
}

function metricScore(entry: VisibilityMemoryEntry | undefined, keys: readonly string[]) {
  if (!entry) {
    return 0;
  }

  return categoryByNeed(entry.categoryScores, [...keys])?.score ?? entry.score;
}

function movementStatus(
  currentScore: number,
  previousScore: number | undefined,
  historyScores: number[]
): EvolutionMovementStatus {
  if (previousScore === undefined || historyScores.length < 2) {
    return "emerging";
  }

  const delta = currentScore - previousScore;
  const recentDeltas = historyScores
    .slice(1)
    .map((score, index) => score - historyScores[index]);
  const hasMixedDirection =
    recentDeltas.some((recentDelta) => recentDelta >= 4) &&
    recentDeltas.some((recentDelta) => recentDelta <= -4);

  if (hasMixedDirection) {
    return "inconsistent";
  }

  if (delta >= 5) {
    return "improving";
  }

  if (delta <= -5) {
    return "declining";
  }

  return "stable";
}

function movementSummary(label: string, status: EvolutionMovementStatus, delta: number) {
  if (status === "emerging") {
    return `${label} has its first memory point. Titan needs another audit to read movement.`;
  }

  if (status === "improving") {
    return `${label} improved since the previous audit.`;
  }

  if (status === "declining") {
    return `${label} slipped by ${Math.abs(delta)} points since the previous audit.`;
  }

  if (status === "inconsistent") {
    return `${label} is moving unevenly. The signal shows up, then disappears.`;
  }

  return `${label} is stable. The account is repeating the same behavior.`;
}

function repeatedItems(entries: VisibilityMemoryEntry[], field: "recurringStrengths" | "recurringWeaknesses") {
  return countOccurrences(entries, field)
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
}

export function createVisibilityEvolutionReport(
  entries: VisibilityMemoryEntry[],
  accountKey: string
): VisibilityEvolutionReport {
  const history = accountHistory(entries, accountKey);
  const latest = history.at(-1);
  const previous = history.at(-2);
  const repeatedWeaknessNames = repeatedItems(history, "recurringWeaknesses");
  const repeatedStrengthNames = repeatedItems(history, "recurringStrengths");

  if (!latest) {
    return {
      auditCount: 0,
      improvements: [],
      regressions: [],
      repeatedWeaknesses: [],
      strengtheningSignals: [],
      emergingPatterns: ["Run a completed Visibility Audit to start evolution tracking."],
      unstablePatterns: [],
      movementScores: [],
      identityEvolution: [],
      momentumAnalysis: [],
      timeline: []
    };
  }

  const movementScores = evolutionMetrics.map((metric) => {
    const currentScore = metricScore(latest, metric.keys);
    const previousScore = previous ? metricScore(previous, metric.keys) : undefined;
    const historyScores = history.map((entry) => metricScore(entry, metric.keys));
    const delta = previousScore === undefined ? 0 : currentScore - previousScore;
    const status = movementStatus(currentScore, previousScore, historyScores);

    return {
      label: metric.label,
      status,
      currentScore,
      previousScore,
      delta,
      summary: movementSummary(metric.label, status, delta)
    };
  });

  const improvements = movementScores
    .filter((metric) => metric.status === "improving")
    .map((metric) => metric.summary);
  const regressions = movementScores
    .filter((metric) => metric.status === "declining")
    .map((metric) => metric.summary);
  const unstablePatterns = movementScores
    .filter((metric) => metric.status === "inconsistent")
    .map((metric) => metric.summary);
  const emergingPatterns = [
    ...movementScores
      .filter((metric) => metric.status === "emerging")
      .slice(0, 3)
      .map((metric) => `${metric.label} is being tracked as a new movement signal.`),
    latest.visualSignatures.length > 0
      ? `Visual identity is forming around ${latest.visualSignatures.slice(0, 2).join(" and ")}.`
      : "Visual fingerprints are still forming."
  ].slice(0, 4);

  const identityEvolution = [
    history.length > 1 && latest.aestheticConsistency !== previous?.aestheticConsistency
      ? latest.aestheticConsistency
      : "The account is developing more recognizable emotional patterns.",
    latest.emotionalTone,
    latest.audienceIdentityLanguage,
    latest.visualStyle
  ].slice(0, 4);

  const improvingCount = movementScores.filter((metric) => metric.status === "improving").length;
  const decliningCount = movementScores.filter((metric) => metric.status === "declining").length;
  const inconsistentCount = movementScores.filter((metric) => metric.status === "inconsistent").length;
  const momentumRead =
    improvingCount >= 3
      ? "Strengthening momentum. Multiple signals are moving in the right direction."
      : decliningCount >= 2
        ? "Flattening momentum. The account is losing ground in visible places."
        : inconsistentCount >= 2
          ? "Inconsistent execution. The account has useful instincts, but they are not repeating cleanly."
          : "Momentum is steady. The next move is making the winning signals more repeatable.";

  const timeline = [...history]
    .reverse()
    .map((entry, index) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      score: entry.score,
      grade: entry.grade,
      summary:
        index === 0
          ? "Latest audit snapshot."
          : `Previous snapshot: ${entry.recurringStrengths[0] ?? "visibility"} led while ${entry.recurringWeaknesses[0] ?? "consistency"} needed work.`,
      strengths: entry.recurringStrengths.slice(0, 3),
      weaknesses: entry.recurringWeaknesses.slice(0, 3)
    }));

  return {
    auditCount: history.length,
    improvements:
      improvements.length > 0
        ? improvements
        : ["No major improvement spike yet. The account is still establishing a baseline."],
    regressions:
      regressions.length > 0
        ? regressions
        : ["No major regression detected in the latest movement read."],
    repeatedWeaknesses:
      repeatedWeaknessNames.length > 0
        ? repeatedWeaknessNames.map((name) => `${name} keeps returning across audits.`)
        : latest.recurringWeaknesses.map((name) => `${name} is a current weakness. One more audit will show whether it persists.`),
    strengtheningSignals:
      repeatedStrengthNames.length > 0
        ? repeatedStrengthNames.map((name) => `${name} is becoming more reliable.`)
        : latest.recurringStrengths.map((name) => `${name} is currently carrying the account.`),
    emergingPatterns,
    unstablePatterns:
      unstablePatterns.length > 0
        ? unstablePatterns
        : ["No unstable movement pattern is dominant yet."],
    movementScores,
    identityEvolution,
    momentumAnalysis: [
      momentumRead,
      latest.emotionalTriggers[0]
        ? `The strongest emotional trigger continues to be ${latest.emotionalTriggers[0]}.`
        : "The dominant emotional trigger is still unresolved.",
      latest.pacingBehavior
    ],
    timeline
  };
}

export function readVisibilityMemoryEntriesWithDebug() {
  if (typeof window === "undefined") {
    return {
      entries: [] as VisibilityMemoryEntry[],
      debug: {
        ...emptyVisibilityMemoryDebug,
        readError: "window is unavailable; localStorage read skipped"
      }
    };
  }

  try {
    const stored = window.localStorage.getItem(visibilityMemoryStorageKey);
    const parsedEntries = stored ? (JSON.parse(stored) as unknown) : [];
    const entries = Array.isArray(parsedEntries)
      ? (parsedEntries as VisibilityMemoryEntry[])
      : [];

    return {
      entries,
      debug: {
        ...emptyVisibilityMemoryDebug,
        storageReadKey: visibilityMemoryStorageKey,
        storedAuditsFound: entries.length,
        windowAvailable: true
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown memory read error";
    console.error("Titan Visibility Memory read failed", error);
    return {
      entries: [] as VisibilityMemoryEntry[],
      debug: {
        ...emptyVisibilityMemoryDebug,
        storageReadKey: visibilityMemoryStorageKey,
        windowAvailable: true,
        readError: message
      }
    };
  }
}

export function readVisibilityMemoryEntries() {
  return readVisibilityMemoryEntriesWithDebug().entries;
}

export function writeVisibilityMemoryEntries(entries: VisibilityMemoryEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(visibilityMemoryStorageKey, JSON.stringify(entries));
  } catch (error) {
    console.error("Titan Visibility Memory write failed", error);
  }
}

export function upsertVisibilityMemoryEntry(
  entries: VisibilityMemoryEntry[],
  entry: VisibilityMemoryEntry
) {
  const merged = [...entries, entry];
  const accountEntries = merged
    .filter((item) => item.accountKey === entry.accountKey)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(memoryLimitPerAccount);
  const otherEntries = merged.filter((item) => item.accountKey !== entry.accountKey);

  return [...otherEntries, ...accountEntries].slice(-80);
}

export function saveVisibilityMemoryEntry(entry: VisibilityMemoryEntry) {
  const currentEntries = readVisibilityMemoryEntries();
  const updatedEntries = upsertVisibilityMemoryEntry(currentEntries, entry);
  writeVisibilityMemoryEntries(updatedEntries);
  return updatedEntries;
}

export function saveMemoryAudit(
  auditResult: AiAuditResult,
  platform: AuditPlatform,
  context: { formData?: BusinessAuditFormData; profileData?: ProfileData | null }
) {
  const attemptedAt = new Date().toISOString();
  const profileUrl = context.formData?.profileUrl ?? context.profileData?.profileUrl ?? "";
  const normalizedAccountKey = normalizeAccountKey(profileUrl, auditResult.businessName);
  const auditObjectPassedValidation = validateVisibilityMemoryAudit(auditResult);
  const baseDebug: VisibilityMemoryDebugState = {
    ...emptyVisibilityMemoryDebug,
    activeSaveFunctionVersion: "append-fix-v2",
    normalizedAccountKey,
    storageWriteKey: visibilityMemoryStorageKey,
    storageReadKey: visibilityMemoryStorageKey,
    lastAttemptedSaveAt: attemptedAt,
    saveMemoryAuditCalled: true,
    auditObjectPassedValidation,
    windowAvailable: typeof window !== "undefined"
  };

  if (typeof window === "undefined") {
    return {
      entry: null,
      entries: [] as VisibilityMemoryEntry[],
      debug: {
        ...baseDebug,
        saveError: "window is unavailable; localStorage write skipped"
      }
    };
  }

  const readResult = readVisibilityMemoryEntriesWithDebug();

  if (!auditObjectPassedValidation) {
    return {
      entry: null,
      entries: readResult.entries,
      debug: {
        ...baseDebug,
        readError: readResult.debug.readError,
        storedAuditsFound: readResult.entries.length,
        matchingAuditsFound: readResult.entries.filter(
          (entry) => entry.accountKey === normalizedAccountKey
        ).length,
        saveError: "audit object failed memory validation"
      }
    };
  }

  try {
    const entry = createVisibilityMemoryEntry(auditResult, platform, context);
    const existingEntries = Array.isArray(readResult.entries) ? readResult.entries : [];
    const updatedEntries = [...existingEntries, entry].slice(-80);
    const serializedMemory = JSON.stringify(updatedEntries);

    window.localStorage.setItem(visibilityMemoryStorageKey, serializedMemory);

    const rawLocalStorageValueAfterSet =
      window.localStorage.getItem(visibilityMemoryStorageKey) ?? "";
    const parsedEntriesAfterSet = rawLocalStorageValueAfterSet
      ? (JSON.parse(rawLocalStorageValueAfterSet) as unknown)
      : [];
    const verifiedEntriesAfterSet = Array.isArray(parsedEntriesAfterSet)
      ? (parsedEntriesAfterSet as VisibilityMemoryEntry[])
      : [];

    return {
      entry,
      entries: verifiedEntriesAfterSet,
      debug: {
        ...baseDebug,
        normalizedAccountKey: entry.accountKey,
        readError: readResult.debug.readError,
        storedAuditsFound: verifiedEntriesAfterSet.length,
        matchingAuditsFound: verifiedEntriesAfterSet.filter(
          (storedEntry) => storedEntry.accountKey === entry.accountKey
        ).length,
        auditCountBeforeSave: readResult.entries.length,
        auditCountAfterSave: verifiedEntriesAfterSet.length,
        serializedJsonLength: serializedMemory.length,
        memoryObjectBeforeWrite: JSON.stringify(updatedEntries, null, 2),
        rawLocalStorageValueAfterSet
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown memory save error";
    console.error("Titan Visibility Memory save failed", error);

    return {
      entry: null,
      entries: readResult.entries,
      debug: {
        ...baseDebug,
        readError: readResult.debug.readError,
        storedAuditsFound: readResult.entries.length,
        matchingAuditsFound: readResult.entries.filter(
          (entry) => entry.accountKey === normalizedAccountKey
        ).length,
        auditCountBeforeSave: readResult.entries.length,
        auditCountAfterSave: readResult.entries.length,
        saveError: message
      }
    };
  }
}
