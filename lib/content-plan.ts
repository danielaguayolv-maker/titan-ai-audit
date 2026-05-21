import type {
  AiAuditCategoryScore,
  AiAuditResult,
  AuditPlatform,
  BusinessAuditFormData,
  ProfileData
} from "@/lib/audit-ai";

export type VisibilitySignal = {
  label: string;
  score: number;
  status: string;
  insight: string;
};

type HookCategory =
  | "Curiosity Hooks"
  | "Authority Hooks"
  | "Storytelling Hooks"
  | "Emotional Hooks"
  | "Conversion Hooks"
  | "Local SEO Hooks"
  | "Pattern Interrupt Hooks";

type NicheProfile = {
  id: string;
  label: string;
  keywords: string[];
  audience: string;
  audienceContexts: string[];
  emotionalTriggers: string[];
  searchPhrases: string[];
  contentAngles: string[];
  angleVariants: string[];
  proofSignals: string[];
  proofVariants: string[];
  ctaLanguage: string[];
};

export type VisibilityPlanContext = {
  formData?: Partial<BusinessAuditFormData>;
  profileData?: ProfileData | null;
};

export type HookTaxonomyGroup = {
  category: HookCategory;
  hooks: string[];
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
  niche: {
    id: string;
    label: string;
    confidence: number;
    audience: string;
    audienceContexts: string[];
    emotionalTriggers: string[];
    searchPhrases: string[];
  };
  weakAreas: string[];
  visibilitySignals: VisibilitySignal[];
  hookTaxonomy: HookTaxonomyGroup[];
  contentPriorities: string[];
  postingFrequency: string;
  recommendedMix: Array<{
    label: string;
    share: string;
    purpose: string;
  }>;
  weeklySchedule: WeeklyVisibilityPlan[];
};

const nicheProfiles: NicheProfile[] = [
  {
    id: "restaurants",
    label: "Restaurant",
    keywords: ["restaurant", "bbq", "pizza", "cafe", "bar", "food", "menu", "dining", "chef"],
    audience: "hungry locals choosing where to eat now, where to bring friends, or what spot feels worth the trip",
    audienceContexts: [
      "locals planning dinner tonight",
      "Vegas food lovers",
      "people searching where to eat",
      "date-night couples",
      "tourists looking for BBQ nearby",
      "families deciding dinner spots",
      "people craving comfort food",
      "groups choosing where to go tonight"
    ],
    emotionalTriggers: ["craving", "belonging", "local status", "fear of missing out", "comfort"],
    searchPhrases: ["best BBQ in Las Vegas", "date night restaurant near me", "family dinner spot in town"],
    contentAngles: ["signature dish reveal", "busy-night proof", "chef/process story", "local favorite ranking"],
    angleVariants: [
      "plated food close-ups",
      "kitchen energy",
      "prep-line close-ups",
      "comfort-food cravings",
      "late-night order moments",
      "date-night decision clips"
    ],
    proofSignals: ["full dining room", "customer reactions", "fresh prep", "reviews", "limited menu items"],
    proofVariants: [
      "busy atmosphere",
      "packed tables",
      "active service moments",
      "customer reactions",
      "peak-hour footage",
      "kitchen energy",
      "crowd momentum",
      "waitlist energy"
    ],
    ctaLanguage: [
      "Reserve tonight",
      "Order online",
      "Call to book",
      "Visit us this weekend",
      "Save this for dinner",
      "Tag who you're bringing"
    ]
  },
  {
    id: "local-businesses",
    label: "Local business",
    keywords: ["local", "shop", "store", "boutique", "salon", "clinic", "studio", "neighborhood"],
    audience: "nearby customers looking for a trusted local option before they spend time or money",
    audienceContexts: [
      "locals comparing nearby options",
      "neighbors looking for a place they can trust",
      "busy customers deciding quickly",
      "community-minded shoppers",
      "people who prefer a human recommendation",
      "repeat buyers looking for familiarity"
    ],
    emotionalTriggers: ["trust", "belonging", "convenience", "community pride", "status"],
    searchPhrases: ["best local shop near me", "trusted service in my area", "nearby business open today"],
    contentAngles: ["local customer story", "neighborhood guide", "why locals choose us", "behind-the-counter proof"],
    angleVariants: [
      "staff recommendation clips",
      "neighborhood moments",
      "customer favorite picks",
      "local routine content",
      "what to try first",
      "owner point-of-view posts"
    ],
    proofSignals: ["repeat customers", "local landmarks", "staff expertise", "reviews", "community involvement"],
    proofVariants: [
      "regular customer moments",
      "neighborhood recognition",
      "staff expertise",
      "review snippets",
      "community events",
      "before-the-rush footage",
      "local landmark references"
    ],
    ctaLanguage: ["Visit this week", "Message us before you stop by", "Save this local guide", "Book your spot"]
  },
  {
    id: "service-businesses",
    label: "Local service business",
    keywords: ["service", "repair", "contractor", "plumber", "hvac", "cleaning", "roofing", "law", "dental"],
    audience: "problem-aware prospects who want proof, speed, clarity, and low-risk next steps",
    audienceContexts: [
      "homeowners trying to avoid a bigger repair",
      "busy families who need the problem handled",
      "price-aware prospects comparing providers",
      "people frustrated by unclear service pages",
      "urgent buyers who need a next step now",
      "locals looking for someone credible"
    ],
    emotionalTriggers: ["frustration", "relief", "trust", "urgency", "transformation"],
    searchPhrases: ["emergency HVAC repair near me", "best dental cleaning in town", "trusted contractor near me"],
    contentAngles: ["problem diagnosis", "before and after", "costly mistake", "what to expect after booking"],
    angleVariants: [
      "what caused this problem",
      "repair walkthrough",
      "price confusion explainer",
      "before-the-call checklist",
      "customer relief story",
      "mistake prevention post"
    ],
    proofSignals: ["before/after footage", "certifications", "response time", "reviews", "process walkthroughs"],
    proofVariants: [
      "before/after proof",
      "arrival window clarity",
      "technician walkthroughs",
      "review screenshots",
      "licensed expertise",
      "cleanup after the job",
      "problem solved moments"
    ],
    ctaLanguage: ["Book an inspection", "Request an estimate", "DM the issue", "Call before it gets worse"]
  },
  {
    id: "gaming-creators",
    label: "Gaming creator",
    keywords: ["gaming", "gameplay", "fps", "ranked", "build", "loadout", "clips", "esports"],
    audience: "players who want skill, entertainment, identity, and a reason to follow the next session",
    audienceContexts: [
      "competitive players chasing rank",
      "nostalgic gamers",
      "dad gamers with limited time",
      "casual audiences who want funny moments",
      "stream communities looking for inside jokes",
      "players testing the meta"
    ],
    emotionalTriggers: ["identity", "status", "belonging", "mastery", "fear of missing out"],
    searchPhrases: ["best loadout for ranked", "how to win more games", "new meta build"],
    contentAngles: ["rank climb lesson", "loadout test", "mistake breakdown", "clutch story"],
    angleVariants: [
      "ranked decision breakdown",
      "loadout comparison",
      "clutch replay",
      "tilt recovery moment",
      "patch reaction",
      "one mistake that threw the round"
    ],
    proofSignals: ["match results", "rank progress", "clip retention", "live reactions", "community challenges"],
    proofVariants: [
      "rank progress",
      "match results",
      "clutch clips",
      "chat reactions",
      "community challenges",
      "before/after gameplay",
      "win-streak proof"
    ],
    ctaLanguage: ["Follow for the next climb", "Drop your rank", "Join the stream", "Save this build"]
  },
  {
    id: "lifestyle-creators",
    label: "Lifestyle creator",
    keywords: ["lifestyle", "beauty", "fashion", "travel", "home", "routine", "vlog", "wellness"],
    audience: "aspirational followers looking for taste, identity, routines, and products that feel like them",
    audienceContexts: [
      "followers building a new routine",
      "style-curious audiences",
      "people looking for a better version of their day",
      "viewers who save aesthetic ideas",
      "busy creators wanting simple upgrades",
      "followers who buy into taste and identity"
    ],
    emotionalTriggers: ["aspiration", "identity", "belonging", "status", "transformation"],
    searchPhrases: ["morning routine for busy creators", "affordable outfit ideas", "weekend reset routine"],
    contentAngles: ["routine breakdown", "taste edit", "before/after lifestyle shift", "favorite finds"],
    angleVariants: [
      "day-in-the-life shift",
      "routine reset",
      "favorite find edit",
      "style decision breakdown",
      "small upgrade story",
      "before/after mood change"
    ],
    proofSignals: ["personal story", "use-in-real-life clips", "community saves", "comments", "visual consistency"],
    proofVariants: [
      "real-life use clips",
      "saved routine moments",
      "personal story details",
      "visual consistency",
      "comment questions",
      "before/after routine footage",
      "repeatable lifestyle cues"
    ],
    ctaLanguage: ["Save this routine", "Comment LINK", "Follow for the full series", "Shop the edit"]
  },
  {
    id: "streamers",
    label: "Streamer",
    keywords: ["stream", "streamer", "twitch", "live", "chat", "discord", "subathon"],
    audience: "viewers deciding whether the stream feels entertaining, interactive, and worth returning to",
    audienceContexts: [
      "lurkers deciding whether to join chat",
      "regulars looking for community moments",
      "clip watchers who missed the live",
      "Discord members wanting inside jokes",
      "new viewers testing the vibe",
      "fans who do not want to miss the next stream"
    ],
    emotionalTriggers: ["belonging", "fear of missing out", "identity", "status", "inside jokes"],
    searchPhrases: ["best moments from stream", "live stream highlights", "funny chat moments"],
    contentAngles: ["stream highlight", "chat challenge", "clip of the day", "behind-the-stream setup"],
    angleVariants: [
      "chat reaction highlight",
      "clip-worthy moment",
      "stream schedule tease",
      "community challenge",
      "Discord joke setup",
      "unexpected live moment"
    ],
    proofSignals: ["chat reactions", "viewer milestones", "clips", "community memes", "schedule consistency"],
    proofVariants: [
      "chat reactions",
      "viewer milestones",
      "clip momentum",
      "community memes",
      "inside jokes",
      "live countdowns",
      "stream schedule proof"
    ],
    ctaLanguage: ["Catch the next live", "Join the Discord", "Drop a clip request", "Follow before tonight's stream"]
  },
  {
    id: "fitness-creators",
    label: "Fitness creator",
    keywords: ["fitness", "gym", "coach", "workout", "fat loss", "strength", "nutrition", "trainer"],
    audience: "people who want visible progress, discipline, confidence, and a plan they can actually follow",
    audienceContexts: [
      "beginners afraid of looking lost",
      "transformation seekers",
      "high-performers chasing discipline",
      "busy parents rebuilding confidence",
      "people tired of starting over",
      "lifters trying to fix form"
    ],
    emotionalTriggers: ["transformation", "frustration", "identity", "aspiration", "status"],
    searchPhrases: ["beginner strength workout", "fat loss meal prep ideas", "best glute workout at home"],
    contentAngles: ["form fix", "progress story", "myth busting", "simple weekly plan"],
    angleVariants: [
      "form correction",
      "progress proof",
      "simple meal decision",
      "beginner confidence clip",
      "workout mistake fix",
      "discipline identity post"
    ],
    proofSignals: ["client wins", "progress photos", "form demos", "credentials", "repeatable frameworks"],
    proofVariants: [
      "client wins",
      "progress photos",
      "form demos",
      "training cues",
      "repeatable frameworks",
      "weekly check-ins",
      "confidence milestones"
    ],
    ctaLanguage: ["DM PLAN", "Save this workout", "Apply for coaching", "Comment your goal"]
  },
  {
    id: "personal-brands",
    label: "Personal brand",
    keywords: ["personal brand", "founder", "coach", "consultant", "speaker", "author", "expert"],
    audience: "buyers, partners, and followers evaluating credibility, worldview, and whether the person can help them win",
    audienceContexts: [
      "buyers evaluating trust",
      "operators looking for leadership",
      "aspiring experts modeling authority",
      "followers deciding whether the worldview fits",
      "partners looking for signal",
      "clients trying to reduce risk"
    ],
    emotionalTriggers: ["status", "aspiration", "identity", "trust", "transformation"],
    searchPhrases: ["how to build authority online", "founder lessons", "consultant content strategy"],
    contentAngles: ["contrarian belief", "lesson learned", "framework reveal", "client insight"],
    angleVariants: [
      "contrarian point of view",
      "hard-earned lesson",
      "framework breakdown",
      "client pattern",
      "leadership stance",
      "decision-making story"
    ],
    proofSignals: ["case studies", "frameworks", "specific opinions", "results", "earned credibility"],
    proofVariants: [
      "case study details",
      "specific opinions",
      "named frameworks",
      "client patterns",
      "visible results",
      "earned credibility",
      "clear point of view"
    ],
    ctaLanguage: ["DM STRATEGY", "Book a consultation", "Save the framework", "Follow for the next breakdown"]
  },
  {
    id: "realtors",
    label: "Realtor",
    keywords: ["realtor", "real estate", "homes", "listing", "buyer", "seller", "mortgage"],
    audience: "buyers and sellers trying to feel confident about timing, neighborhoods, pricing, and representation",
    audienceContexts: [
      "first-time buyers",
      "sellers watching the market",
      "families comparing neighborhoods",
      "relocators trying to understand the area",
      "investors scanning for opportunity",
      "homeowners wondering if now is the moment"
    ],
    emotionalTriggers: ["security", "status", "fear of missing out", "aspiration", "trust"],
    searchPhrases: ["best neighborhoods in Austin", "homes for sale near me", "should I sell my house now"],
    contentAngles: ["neighborhood breakdown", "listing story", "buyer mistake", "market update"],
    angleVariants: [
      "neighborhood walk-through",
      "listing story",
      "buyer mistake",
      "market timing explainer",
      "price reality check",
      "school-zone or commute context"
    ],
    proofSignals: ["sold results", "market data", "tour footage", "client wins", "local expertise"],
    proofVariants: [
      "sold stories",
      "market data",
      "tour footage",
      "client wins",
      "neighborhood context",
      "pricing insight",
      "local expertise"
    ],
    ctaLanguage: ["DM HOME", "Book a buyer consult", "Ask for the neighborhood list", "Save this market update"]
  },
  {
    id: "med-spas",
    label: "Med spa",
    keywords: ["med spa", "botox", "filler", "skin", "aesthetic", "laser", "facial", "injector"],
    audience: "appearance-conscious prospects who want natural results, safety, expertise, and confidence",
    audienceContexts: [
      "first-time treatment prospects",
      "clients afraid of unnatural results",
      "people preparing for an event",
      "skincare buyers comparing providers",
      "confidence-driven clients",
      "people researching safety before booking"
    ],
    emotionalTriggers: ["transformation", "status", "trust", "aspiration", "fear of regret"],
    searchPhrases: ["best Botox near me", "natural lip filler results", "laser facial in my city"],
    contentAngles: ["natural result breakdown", "treatment myth", "before/after education", "safety explanation"],
    angleVariants: [
      "natural result breakdown",
      "treatment myth",
      "consultation walk-through",
      "safety explanation",
      "before/after education",
      "maintenance timeline"
    ],
    proofSignals: ["before/after results", "credentials", "consultation process", "patient comfort", "natural outcomes"],
    proofVariants: [
      "natural before/after results",
      "provider credentials",
      "consultation process",
      "comfort cues",
      "treatment room trust",
      "subtle result close-ups",
      "aftercare clarity"
    ],
    ctaLanguage: ["Book a consultation", "DM GLOW", "Save before your appointment", "Ask what treatment fits your goal"]
  },
  {
    id: "agencies",
    label: "Marketing agency",
    keywords: ["agency", "marketing", "media", "ads", "branding", "seo", "content", "growth"],
    audience: "business owners who want sharper growth, proof of expertise, and confidence the agency can execute",
    audienceContexts: [
      "owners tired of random marketing",
      "founders comparing agencies",
      "local businesses needing clearer demand",
      "operators who want proof before a call",
      "teams frustrated by weak content",
      "brands ready to tighten execution"
    ],
    emotionalTriggers: ["growth ambition", "frustration", "status", "trust", "transformation"],
    searchPhrases: ["best marketing agency for local businesses", "content strategy for service business", "SEO agency near me"],
    contentAngles: ["audit teardown", "case study", "strategy framework", "mistake breakdown"],
    angleVariants: [
      "audit teardown",
      "strategy map",
      "case study breakdown",
      "content mistake",
      "before/after positioning",
      "operator lesson"
    ],
    proofSignals: ["client results", "screenshots", "process", "strategy maps", "before/after analytics"],
    proofVariants: [
      "client results",
      "strategy screenshots",
      "before/after positioning",
      "process clarity",
      "campaign learning",
      "analytics context",
      "operator-ready roadmap"
    ],
    ctaLanguage: ["Book a strategy call", "Request an audit", "DM GROWTH", "Download the roadmap"]
  }
];

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

function getAuditText(auditResult: AiAuditResult) {
  return [
    auditResult.businessName,
    auditResult.personalizedDiagnosis,
    auditResult.optimizedBio,
    ...auditResult.contentRecommendations,
    ...auditResult.categoryScores.flatMap((category) => [
      category.name,
      category.benchmark,
      category.insight
    ]),
    ...auditResult.topQuickWins.flatMap((win) => [win.title, win.description]),
    auditResult.leadReadyAuditReport.headline,
    auditResult.leadReadyAuditReport.summary,
    ...auditResult.leadReadyAuditReport.findings,
    ...auditResult.leadReadyAuditReport.nextSteps
  ]
    .join(" ")
    .toLowerCase();
}

function getPlanContextText(
  auditResult: AiAuditResult,
  context?: VisibilityPlanContext
) {
  const formData = context?.formData;
  const profileData = context?.profileData;

  return [
    formData?.businessName,
    formData?.industry,
    formData?.goals,
    formData?.currentChallenges,
    formData?.profileUrl,
    formData?.bio,
    formData?.usernameDisplayName,
    formData?.pinnedPostTopics,
    formData?.recentCaptions,
    formData?.targetCustomer,
    formData?.offer,
    formData?.location,
    formData?.businessGoal,
    profileData?.username,
    profileData?.displayName,
    profileData?.bio,
    profileData?.profileUrl,
    profileData?.postingFrequencyEstimate,
    ...(profileData?.hashtagsUsed ?? []),
    ...(profileData?.recentContent ?? []).flatMap((item) => [
      item.caption,
      ...(item.hashtags ?? [])
    ]),
    ...(profileData?.pinnedContent ?? []).flatMap((item) => [
      item.caption,
      ...(item.hashtags ?? [])
    ]),
    getAuditText(auditResult)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function countKeywordHits(text: string, keywords: string[]) {
  return keywords.reduce((total, keyword) => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = text.match(new RegExp(`\\b${escapedKeyword}\\b`, "gi"));

    return total + (matches?.length ?? 0);
  }, 0);
}

function inferNiche(auditResult: AiAuditResult, context?: VisibilityPlanContext) {
  const text = getPlanContextText(auditResult, context);
  const scoredProfiles = nicheProfiles.map((profile) => {
    const keywordScore = countKeywordHits(text, profile.keywords) * 8;
    const searchScore = countKeywordHits(text, profile.searchPhrases) * 5;
    const angleScore = countKeywordHits(text, [
      ...profile.contentAngles,
      ...profile.angleVariants,
      ...profile.proofSignals,
      ...profile.proofVariants
    ]);

    return {
      profile,
      score: keywordScore + searchScore + angleScore
    };
  });
  const bestMatch = scoredProfiles.sort((first, second) => second.score - first.score)[0];
  const fallbackProfile =
    nicheProfiles.find((profile) => profile.id === "local-businesses") ?? nicheProfiles[0];
  const selectedProfile = bestMatch?.score > 0 ? bestMatch.profile : fallbackProfile;
  const confidence = bestMatch?.score
    ? Math.min(96, Math.max(58, 48 + bestMatch.score * 4))
    : 45;

  return {
    profile: selectedProfile,
    confidence
  };
}

const nicheContaminationTerms: Record<string, string[]> = {
  restaurants: [
    "restaurant",
    "restaurants",
    "bbq",
    "pizza",
    "cafe",
    "bar",
    "menu",
    "dining",
    "chef",
    "foodies",
    "dinner",
    "kitchen",
    "plated",
    "waitlist",
    "tables",
    "comfort food",
    "reserve tonight",
    "order online"
  ],
  agencies: [
    "agency",
    "agencies",
    "marketing agency",
    "media agency",
    "ads",
    "branding",
    "seo agency",
    "growth agency",
    "strategy call",
    "request an audit",
    "roadmap"
  ],
  creators: [
    "gaming",
    "gameplay",
    "ranked",
    "loadout",
    "stream",
    "streamer",
    "twitch",
    "discord",
    "lifestyle",
    "routine",
    "vlog"
  ],
  fitness: ["fitness", "gym", "workout", "fat loss", "strength", "trainer", "meal prep"],
  realtors: ["realtor", "real estate", "listing", "mortgage", "neighborhood list", "homes for sale"],
  "med-spas": ["med spa", "botox", "filler", "injector", "laser facial", "treatment room"],
  "service-businesses": ["contractor", "plumber", "hvac", "roofing", "repair", "inspection", "estimate"]
};

const contaminationGroupsByNiche: Record<string, string[]> = {
  restaurants: ["agencies", "creators", "fitness", "realtors", "med-spas", "service-businesses"],
  agencies: ["restaurants", "creators", "fitness", "realtors", "med-spas", "service-businesses"],
  "gaming-creators": ["restaurants", "agencies", "fitness", "realtors", "med-spas", "service-businesses"],
  streamers: ["restaurants", "agencies", "fitness", "realtors", "med-spas", "service-businesses"],
  "lifestyle-creators": ["restaurants", "agencies", "fitness", "realtors", "med-spas", "service-businesses"],
  "fitness-creators": ["restaurants", "agencies", "realtors", "med-spas", "service-businesses"],
  realtors: ["restaurants", "agencies", "creators", "fitness", "med-spas", "service-businesses"],
  "med-spas": ["restaurants", "agencies", "creators", "fitness", "realtors", "service-businesses"],
  "service-businesses": ["restaurants", "agencies", "creators", "fitness", "realtors", "med-spas"],
  "local-businesses": ["restaurants", "agencies", "creators", "fitness", "realtors", "med-spas", "service-businesses"]
};

function getForeignTerms(nicheId: string) {
  return (contaminationGroupsByNiche[nicheId] ?? [])
    .flatMap((group) => nicheContaminationTerms[group] ?? [])
    .filter(Boolean);
}

function hasForeignNicheLanguage(text: string, nicheId: string) {
  const normalizedText = text.toLowerCase();

  return getForeignTerms(nicheId).some((term) => normalizedText.includes(term));
}

function lockSignalToNiche(signal: VisibilitySignal, niche: NicheProfile) {
  if (!hasForeignNicheLanguage(signal.insight, niche.id)) {
    return signal;
  }

  const fallback =
    visibilityDimensions.find((dimension) => dimension.label === signal.label)?.fallback ??
    "Keep the recommendation tied to this brand's current audience, offer, and platform.";

  return {
    ...signal,
    insight: fallback
  };
}

function getPlatformNativeFormat(platform: AuditPlatform, fallback: string) {
  if (platform === "tiktok") return "TikTok short video";
  if (platform === "instagram") return "Instagram Reel";
  return fallback;
}

function isTitanBrand(auditResult: AiAuditResult) {
  return /titan/i.test(auditResult.businessName);
}

function getBrandCtas(profile: NicheProfile, auditResult: AiAuditResult) {
  if (isTitanBrand(auditResult)) {
    return [
      "Book a Titan Visibility Strategy Call",
      "Download the visibility report",
      "Generate the 30-day visibility plan",
      "Message Titan for implementation support"
    ];
  }

  return profile.ctaLanguage;
}

function pick(values: string[], index: number) {
  return values[index % values.length] ?? "";
}

function phraseList(values: string[], start = 0, count = 3) {
  return Array.from({ length: count }, (_, index) => pick(values, start + index)).join(", ");
}

function hookTaxonomy(
  profile: NicheProfile,
  platform: AuditPlatform,
  ctaLanguage: string[] = profile.ctaLanguage
): HookTaxonomyGroup[] {
  const phrase = profile.searchPhrases[0];
  const angle = pick(profile.angleVariants, 1);
  const proof = pick(profile.proofVariants, 2);
  const trigger = profile.emotionalTriggers[0];
  const audience = pick(profile.audienceContexts, 1);
  const platformLabel = getPlatformLabel(platform);

  return [
    {
      category: "Curiosity Hooks",
      hooks: [
        `Most people do not leave because the offer is bad. They leave because the first moment feels unclear.`,
        `If ${audience} land on the profile, this is the detail that makes them keep watching.`
      ]
    },
    {
      category: "Authority Hooks",
      hooks: [
        `Here is the ${proof} signal I would show before asking anyone to take the next step.`,
        `If the audience is comparing options, this makes the safer choice feel obvious.`
      ]
    },
    {
      category: "Storytelling Hooks",
      hooks: [
        `Someone found the profile, hesitated, and left. This is the story that would pull them back.`,
        `Before the offer gets stronger, the audience needs to see the moment behind ${angle}.`
      ]
    },
    {
      category: "Emotional Hooks",
      hooks: [
        `If the audience wants ${trigger}, the first sentence has to make that outcome feel close.`,
        `People do not just want information here. They want to feel ${profile.emotionalTriggers[1] ?? trigger}.`
      ]
    },
    {
      category: "Conversion Hooks",
      hooks: [
        "If someone is ready to act today, this is the next step they need to see.",
        `Stop ending posts with vague engagement bait. Say "${pick(ctaLanguage, 0)}" when the intent is warm.`
      ]
    },
    {
      category: "Local SEO Hooks",
      hooks: [
        `Use a phrase like "${phrase}" in the first sentence without making it sound stuffed in.`,
        `If someone searched "${profile.searchPhrases[1] ?? phrase}", the post should feel like the answer, not an ad.`
      ]
    },
    {
      category: "Pattern Interrupt Hooks",
      hooks: [
        `Posting more is not the strategy. Making ${angle} impossible to miss is.`,
        `The content volume is not the problem. The missing ${proof} signal is.`
      ]
    }
  ];
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
  platform: AuditPlatform,
  context?: VisibilityPlanContext
): VisibilityContentPlan {
  const weakCategories = getWeakCategories(auditResult);
  const weakAreas = weakCategories.map((category) => category.name);
  const nicheResolution = inferNiche(auditResult, context);
  const niche = nicheResolution.profile;
  const visibilitySignals = buildVisibilitySignals(auditResult).map((signal) =>
    lockSignalToNiche(signal, niche)
  );
  const platformLabel = getPlatformLabel(platform);
  const hookSignal = signalByLabel(visibilitySignals, "Weak hooks");
  const consistencySignal = signalByLabel(visibilitySignals, "Posting consistency");
  const authoritySignal = signalByLabel(visibilitySignals, "Authority signals");
  const ctaSignal = signalByLabel(visibilitySignals, "CTA strength");
  const engagementSignal = signalByLabel(visibilitySignals, "Engagement quality");
  const seoSignal = signalByLabel(visibilitySignals, "Local SEO/search intent");
  const gapSignal = signalByLabel(visibilitySignals, "Content gaps");
  const audienceA = pick(niche.audienceContexts, 0);
  const audienceB = pick(niche.audienceContexts, 2);
  const audienceC = pick(niche.audienceContexts, 4);
  const angleA = pick(niche.angleVariants, 0);
  const angleB = pick(niche.angleVariants, 2);
  const angleC = pick(niche.angleVariants, 4);
  const proofA = pick(niche.proofVariants, 0);
  const proofB = pick(niche.proofVariants, 2);
  const proofC = pick(niche.proofVariants, 4);
  const emotionA = pick(niche.emotionalTriggers, 0);
  const emotionB = pick(niche.emotionalTriggers, 1);
  const emotionC = pick(niche.emotionalTriggers, 3);
  const brandCtas = getBrandCtas(niche, auditResult);
  const cta = (index: number) => pick(brandCtas, index) || "Message us for the next step";
  const taxonomy = hookTaxonomy(niche, platform, brandCtas);

  return {
    niche: {
      id: niche.id,
      label: niche.label,
      confidence: nicheResolution.confidence,
      audience: niche.audience,
      audienceContexts: niche.audienceContexts,
      emotionalTriggers: niche.emotionalTriggers,
      searchPhrases: niche.searchPhrases
    },
    weakAreas,
    visibilitySignals,
    hookTaxonomy: taxonomy,
    contentPriorities: [
      `Make the first three seconds feel built for ${audienceA}: ${hookSignal.insight}`,
      `Build a repeatable rhythm around ${phraseList(niche.angleVariants, 0, 3)} instead of posting one-off ideas.`,
      `Use proof people can see, such as ${phraseList(niche.proofVariants, 0, 3)}, before asking for action.`,
      `Match CTAs to intent: use "${cta(0)}" for hot attention and "${cta(2)}" for warmer, conversational moments.`
    ],
    postingFrequency: platformFrequency[platform],
    recommendedMix: [
      {
        label: "Buyer education",
        share: "30%",
        purpose: `Answer search-intent questions like "${niche.searchPhrases[0]}" in a way that feels native to the post, not like keyword stuffing.`
      },
      {
        label: "Proof and authority",
        share: "25%",
        purpose: `Show ${phraseList(niche.proofVariants, 1, 3)} so authority feels earned rather than claimed.`
      },
      {
        label: "Local or niche relevance",
        share: "20%",
        purpose: `Anchor the plan in ${platformLabel} language for ${audienceB}.`
      },
      {
        label: "Offer and CTA",
        share: "15%",
        purpose: `Move attention into plain next steps like "${cta(0)}" or "${cta(2)}."`
      },
      {
        label: "Engagement loops",
        share: "10%",
        purpose: `Use prompts around ${phraseList(niche.emotionalTriggers, 0, 3)} so comments reveal what the audience actually wants.`
      }
    ],
    weeklySchedule: [
      {
        week: "Week 1",
        objective: "Make the first impression sharper, faster, and easier to act on.",
        strategy: `The audit shows ${hookSignal.label.toLowerCase()} and ${ctaSignal.label.toLowerCase()} need attention. This week speaks to ${audienceA} with ${emotionA} and ${emotionB} cues, then gives them a next step before the interest cools.`,
        dailyPosts: [
          {
            day: "Monday",
            format: getPlatformNativeFormat(platform, "Short video"),
            topic: `Show the biggest visibility leak using ${angleA}`,
            goal: `Make the ${emotionA} payoff obvious before the scroll continues.`,
            visibilitySignal: hookSignal.label
          },
          {
            day: "Tuesday",
            format: "Caption-led proof post",
            topic: `Explain who the offer helps and connect it to ${audienceB}`,
            goal: `Make the audience feel seen instead of broadly targeted.`,
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Educational post",
            topic: `Answer a search-intent question like "${niche.searchPhrases[0]}"`,
            goal: "Build trust while adding platform-native search language.",
            visibilitySignal: seoSignal.label
          },
          {
            day: "Thursday",
            format: "Behind-the-scenes clip",
            topic: `Show ${proofB} or ${proofC}`,
            goal: "Create authority without sounding like a hard sell.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Direct CTA post",
            topic: `Invite viewers to ${cta(0).toLowerCase()}`,
            goal: "Convert profile attention into a measurable next step.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[0].hooks[0],
          taxonomy[3].hooks[0],
          taxonomy[6].hooks[0]
        ],
        videoScriptConcepts: [
          `Open with the audit gap, show a post built around ${angleA}, explain the fix, close with "${cta(0)}."`,
          "Use a before/after promise: unclear positioning first, sharper outcome second, then explain what changed."
        ],
        captionIdeas: [
          `Visibility starts with clarity. If ${audienceA} have to guess, they will not take the next step.`,
          `A stronger first impression can move people from passive interest to action.`
        ],
        ctaSuggestions: [
          cta(0),
          cta(1),
          cta(2)
        ],
        engagementTasks: [
          "Reply to every comment with a follow-up question that reveals intent, not just appreciation.",
          `Comment on 10 niche-relevant posts using phrases like "${niche.searchPhrases[0]}."`,
          `Pin or save the strongest ${emotionA} question for next week's content.`
        ],
        visibilityPriorities: [
          "Make the first line specific enough that the right viewer recognizes themselves.",
          "Place the next step in the caption and spoken/video copy instead of only in the bio.",
          "Create one repeatable hook format that can be reused without sounding copied."
        ]
      },
      {
        week: "Week 2",
        objective: "Turn scattered posting into a recognizable content rhythm.",
        strategy: `This week addresses ${consistencySignal.label.toLowerCase()} and ${gapSignal.label.toLowerCase()} by turning weak categories into ${phraseList(niche.angleVariants, 1, 3)} pillars.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Search-intent post",
            topic: `Answer "${niche.searchPhrases[1]}" with a specific example`,
            goal: `Make ${audienceC} feel like the post was made for their exact search.`,
            visibilitySignal: seoSignal.label
          },
          {
            day: "Tuesday",
            format: "Myth-busting video",
            topic: `Correct a belief that keeps the audience from taking the next step`,
            goal: "Make the audience rethink the problem without sounding like a lecture.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Carousel or list post",
            topic: `Three signs ${audienceA} are ready for the offer`,
            goal: `Trigger identity and ${emotionA} recognition.`,
            visibilitySignal: gapSignal.label
          },
          {
            day: "Thursday",
            format: "Proof post",
            topic: `Share ${proofA} with context`,
            goal: "Add trust signals to the content mix.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Soft CTA post",
            topic: `Invite followers to ${cta(2).toLowerCase()}`,
            goal: `Create low-friction conversations around ${emotionB}.`,
            visibilitySignal: engagementSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[1].hooks[0],
          taxonomy[5].hooks[1],
          "Here is the content gap I would fix before posting more."
        ],
        videoScriptConcepts: [
          `Teach one buyer-intent question like "${niche.searchPhrases[0]}", give a quick example, then point to "${cta(0)}."`,
          `Use ${angleB} to show a common mistake, explain why it happens, and give the corrected version.`
        ],
        captionIdeas: [
          `Consistency is not posting every thought. It is repeating ${proofA}, ${angleB}, and clear CTAs until the audience knows why to trust you.`,
          "This week's content should make the decision easier, not just fill the calendar."
        ],
        ctaSuggestions: [
          cta(1),
          cta(2),
          cta(4)
        ],
        engagementTasks: [
          "Ask one question in Stories or comments that reveals buyer objections.",
          "Turn the best comment into tomorrow's post angle.",
          "Track which post earns the most saves, replies, or profile visits."
        ],
        visibilityPriorities: [
          "Repeat the strongest pillar twice this week so the audience starts recognizing the theme.",
          "Use one search-intent phrase naturally in the first sentence of two posts.",
          "Balance the week across education, proof, local relevance, and offer."
        ]
      },
      {
        week: "Week 3",
        objective: "Make trust visible and give the audience something to respond to.",
        strategy: `The roadmap now shifts from clarity to credibility. Stronger ${authoritySignal.label.toLowerCase()} and ${engagementSignal.label.toLowerCase()} help ${audienceB} feel enough confidence to act.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Authority video",
            topic: `Explain the ${proofB} most competitors do not show`,
            goal: "Differentiate expertise.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Tuesday",
            format: "Testimonial or proof story",
            topic: `Turn one ${proofA} into a narrative`,
            goal: `Reduce risk and increase ${emotionC}.`,
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Objection-handling post",
            topic: `Answer the concern that keeps ${audienceC} from acting`,
            goal: "Move warm viewers closer to action.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Thursday",
            format: "Community prompt",
            topic: `Ask the audience what transformation they want next`,
            goal: "Increase comment quality and content inputs.",
            visibilitySignal: engagementSignal.label
          },
          {
            day: "Friday",
            format: "Local or niche relevance post",
            topic: `Tie the offer to "${niche.searchPhrases[2] ?? niche.searchPhrases[0]}"`,
            goal: "Make the post feel tied to the exact market moment.",
            visibilitySignal: seoSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[1].hooks[1],
          `This is the ${proofB} part most people never see.`,
          "If you are comparing options, this detail matters."
        ],
        videoScriptConcepts: [
          `Start with an objection, validate it, show ${proofA}, explain the process, close with "${cta(0)}."`,
          "Break down a result into three decisions that made the outcome feel achievable."
        ],
        captionIdeas: [
          `Authority is built through evidence. Show ${proofA}, ${proofB}, and why it worked.`,
          `${audienceB} trust what they can understand. Make the path visible.`
        ],
        ctaSuggestions: [
          cta(0),
          cta(3),
          cta(4)
        ],
        engagementTasks: [
          "Reply to high-intent comments with a specific next step.",
          "Create a saved response for common objections.",
          "Identify three audience questions that deserve dedicated posts."
        ],
        visibilityPriorities: [
          "Use proof that removes hesitation, not proof that only looks impressive.",
          "Turn one strong audience question into a full post instead of only replying in comments.",
          "Show the process behind the result so trust has something concrete to attach to."
        ]
      },
      {
        week: "Week 4",
        objective: "Turn attention into conversations and decide what deserves another cycle.",
        strategy: `The final week packages the strongest content signals into a conversion push, then uses qualitative feedback to decide the next 30-day cycle for ${audienceA}.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Campaign recap",
            topic: "Summarize the biggest visibility improvement from the month",
            goal: "Show people the difference between random posting and intentional visibility.",
            visibilitySignal: gapSignal.label
          },
          {
            day: "Tuesday",
            format: "FAQ video",
            topic: `Answer the final question ${audienceB} ask before acting`,
            goal: "Remove friction.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Comparison post",
            topic: `Show weak vs. strong ${platformLabel} visibility using ${angleC}`,
            goal: "Make the value easy to understand.",
            visibilitySignal: hookSignal.label
          },
          {
            day: "Thursday",
            format: "Lead magnet or audit invitation",
            topic: `Offer a simple next step: ${cta(0)}`,
            goal: "Capture warm demand.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Friday",
            format: "Strategy CTA post",
            topic: `Invite ${audienceC} to ${cta(0).toLowerCase()}`,
            goal: "Turn the month into pipeline.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[4].hooks[0],
          "This is how profile attention becomes a real next step.",
          "Your content should create movement, not just impressions."
        ],
        videoScriptConcepts: [
          `Recap the month: ${gapSignal.label.toLowerCase()}, fix, ${proofA}, next step. Keep it simple and conversion-focused.`,
          "Show the cost of unclear visibility, then make the next step feel obvious."
        ],
        captionIdeas: [
          `A visibility plan should end with action. The goal is not more ${platformLabel} content. The goal is clearer demand.`,
          `Use ${emotionA}, ${proofA}, and CTA signals to decide what to repeat, cut, and scale.`
        ],
        ctaSuggestions: [
          cta(0),
          cta(1),
          cta(3)
        ],
        engagementTasks: [
          "Review the top three posts by saves, replies, profile visits, or clicks.",
          "Document the best-performing hook and CTA.",
          "Turn the strongest audience response into the next month's first campaign."
        ],
        visibilityPriorities: [
          "Make the final CTA feel like the natural next step from the month's best-performing content.",
          "Compare engagement quality against posts with the clearest first three seconds.",
          "Choose the next cycle based on real audience response, not content volume."
        ]
      }
    ]
  };
}
