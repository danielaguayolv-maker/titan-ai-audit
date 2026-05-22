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

export type VisibilityMemoryDebugState = {
  normalizedAccountKey: string;
  storageWriteKey: string;
  storageReadKey: string;
  storedAuditsFound: number;
  matchingAuditsFound: number;
  lastAttemptedSaveAt: string;
  saveMemoryAuditCalled: boolean;
  auditObjectPassedValidation: boolean;
  windowAvailable: boolean;
  saveError: string;
  readError: string;
};

const memoryLimitPerAccount = 8;

export const emptyVisibilityMemoryDebug: VisibilityMemoryDebugState = {
  normalizedAccountKey: "",
  storageWriteKey: visibilityMemoryStorageKey,
  storageReadKey: visibilityMemoryStorageKey,
  storedAuditsFound: 0,
  matchingAuditsFound: 0,
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
    const updatedEntries = upsertVisibilityMemoryEntry(readResult.entries, entry);
    window.localStorage.setItem(
      visibilityMemoryStorageKey,
      JSON.stringify(updatedEntries)
    );

    return {
      entry,
      entries: updatedEntries,
      debug: {
        ...baseDebug,
        normalizedAccountKey: entry.accountKey,
        readError: readResult.debug.readError,
        storedAuditsFound: updatedEntries.length,
        matchingAuditsFound: updatedEntries.filter(
          (storedEntry) => storedEntry.accountKey === entry.accountKey
        ).length
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
        saveError: message
      }
    };
  }
}
