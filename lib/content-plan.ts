import type { AiAuditCategoryScore, AiAuditResult, AuditPlatform } from "@/lib/audit-ai";

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
  emotionalTriggers: string[];
  searchPhrases: string[];
  contentAngles: string[];
  proofSignals: string[];
  ctaLanguage: string[];
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
    label: string;
    audience: string;
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
    label: "Restaurants",
    keywords: ["restaurant", "bbq", "pizza", "cafe", "bar", "food", "menu", "dining", "chef"],
    audience: "hungry locals choosing where to eat now, where to bring friends, or what spot feels worth the trip",
    emotionalTriggers: ["craving", "belonging", "local status", "fear of missing out", "comfort"],
    searchPhrases: ["best BBQ in Las Vegas", "date night restaurant near me", "family dinner spot in town"],
    contentAngles: ["signature dish reveal", "busy-night proof", "chef/process story", "local favorite ranking"],
    proofSignals: ["full dining room", "customer reactions", "fresh prep", "reviews", "limited menu items"],
    ctaLanguage: ["Reserve tonight", "Order the special", "Tag who you are bringing", "Save this for dinner"]
  },
  {
    id: "local-businesses",
    label: "Local businesses",
    keywords: ["local", "shop", "store", "boutique", "salon", "clinic", "studio", "neighborhood"],
    audience: "nearby customers looking for a trusted local option before they spend time or money",
    emotionalTriggers: ["trust", "belonging", "convenience", "community pride", "status"],
    searchPhrases: ["best local shop near me", "trusted service in my area", "nearby business open today"],
    contentAngles: ["local customer story", "neighborhood guide", "why locals choose us", "behind-the-counter proof"],
    proofSignals: ["repeat customers", "local landmarks", "staff expertise", "reviews", "community involvement"],
    ctaLanguage: ["Visit this week", "Message us before you stop by", "Save this local guide", "Book your spot"]
  },
  {
    id: "service-businesses",
    label: "Service businesses",
    keywords: ["service", "repair", "contractor", "plumber", "hvac", "cleaning", "roofing", "law", "dental"],
    audience: "problem-aware prospects who want proof, speed, clarity, and low-risk next steps",
    emotionalTriggers: ["frustration", "relief", "trust", "urgency", "transformation"],
    searchPhrases: ["emergency HVAC repair near me", "best dental cleaning in town", "trusted contractor near me"],
    contentAngles: ["problem diagnosis", "before and after", "costly mistake", "what to expect after booking"],
    proofSignals: ["before/after footage", "certifications", "response time", "reviews", "process walkthroughs"],
    ctaLanguage: ["Book an inspection", "Request an estimate", "DM the issue", "Call before it gets worse"]
  },
  {
    id: "gaming-creators",
    label: "Gaming creators",
    keywords: ["gaming", "gameplay", "fps", "ranked", "build", "loadout", "clips", "esports"],
    audience: "players who want skill, entertainment, identity, and a reason to follow the next session",
    emotionalTriggers: ["identity", "status", "belonging", "mastery", "fear of missing out"],
    searchPhrases: ["best loadout for ranked", "how to win more games", "new meta build"],
    contentAngles: ["rank climb lesson", "loadout test", "mistake breakdown", "clutch story"],
    proofSignals: ["match results", "rank progress", "clip retention", "live reactions", "community challenges"],
    ctaLanguage: ["Follow for the next climb", "Drop your rank", "Join the stream", "Save this build"]
  },
  {
    id: "lifestyle-creators",
    label: "Lifestyle creators",
    keywords: ["lifestyle", "beauty", "fashion", "travel", "home", "routine", "vlog", "wellness"],
    audience: "aspirational followers looking for taste, identity, routines, and products that feel like them",
    emotionalTriggers: ["aspiration", "identity", "belonging", "status", "transformation"],
    searchPhrases: ["morning routine for busy creators", "affordable outfit ideas", "weekend reset routine"],
    contentAngles: ["routine breakdown", "taste edit", "before/after lifestyle shift", "favorite finds"],
    proofSignals: ["personal story", "use-in-real-life clips", "community saves", "comments", "visual consistency"],
    ctaLanguage: ["Save this routine", "Comment LINK", "Follow for the full series", "Shop the edit"]
  },
  {
    id: "streamers",
    label: "Streamers",
    keywords: ["stream", "streamer", "twitch", "live", "chat", "discord", "subathon"],
    audience: "viewers deciding whether the stream feels entertaining, interactive, and worth returning to",
    emotionalTriggers: ["belonging", "fear of missing out", "identity", "status", "inside jokes"],
    searchPhrases: ["best moments from stream", "live stream highlights", "funny chat moments"],
    contentAngles: ["stream highlight", "chat challenge", "clip of the day", "behind-the-stream setup"],
    proofSignals: ["chat reactions", "viewer milestones", "clips", "community memes", "schedule consistency"],
    ctaLanguage: ["Catch the next live", "Join the Discord", "Drop a clip request", "Follow before tonight's stream"]
  },
  {
    id: "fitness-creators",
    label: "Fitness creators",
    keywords: ["fitness", "gym", "coach", "workout", "fat loss", "strength", "nutrition", "trainer"],
    audience: "people who want visible progress, discipline, confidence, and a plan they can actually follow",
    emotionalTriggers: ["transformation", "frustration", "identity", "aspiration", "status"],
    searchPhrases: ["beginner strength workout", "fat loss meal prep ideas", "best glute workout at home"],
    contentAngles: ["form fix", "progress story", "myth busting", "simple weekly plan"],
    proofSignals: ["client wins", "progress photos", "form demos", "credentials", "repeatable frameworks"],
    ctaLanguage: ["DM PLAN", "Save this workout", "Apply for coaching", "Comment your goal"]
  },
  {
    id: "personal-brands",
    label: "Personal brands",
    keywords: ["personal brand", "founder", "coach", "consultant", "speaker", "author", "expert"],
    audience: "buyers, partners, and followers evaluating credibility, worldview, and whether the person can help them win",
    emotionalTriggers: ["status", "aspiration", "identity", "trust", "transformation"],
    searchPhrases: ["how to build authority online", "founder lessons", "consultant content strategy"],
    contentAngles: ["contrarian belief", "lesson learned", "framework reveal", "client insight"],
    proofSignals: ["case studies", "frameworks", "specific opinions", "results", "earned credibility"],
    ctaLanguage: ["DM STRATEGY", "Book a consultation", "Save the framework", "Follow for the next breakdown"]
  },
  {
    id: "realtors",
    label: "Realtors",
    keywords: ["realtor", "real estate", "homes", "listing", "buyer", "seller", "mortgage"],
    audience: "buyers and sellers trying to feel confident about timing, neighborhoods, pricing, and representation",
    emotionalTriggers: ["security", "status", "fear of missing out", "aspiration", "trust"],
    searchPhrases: ["best neighborhoods in Austin", "homes for sale near me", "should I sell my house now"],
    contentAngles: ["neighborhood breakdown", "listing story", "buyer mistake", "market update"],
    proofSignals: ["sold results", "market data", "tour footage", "client wins", "local expertise"],
    ctaLanguage: ["DM HOME", "Book a buyer consult", "Ask for the neighborhood list", "Save this market update"]
  },
  {
    id: "med-spas",
    label: "Med spas",
    keywords: ["med spa", "botox", "filler", "skin", "aesthetic", "laser", "facial", "injector"],
    audience: "appearance-conscious prospects who want natural results, safety, expertise, and confidence",
    emotionalTriggers: ["transformation", "status", "trust", "aspiration", "fear of regret"],
    searchPhrases: ["best Botox near me", "natural lip filler results", "laser facial in my city"],
    contentAngles: ["natural result breakdown", "treatment myth", "before/after education", "safety explanation"],
    proofSignals: ["before/after results", "credentials", "consultation process", "patient comfort", "natural outcomes"],
    ctaLanguage: ["Book a consultation", "DM GLOW", "Save before your appointment", "Ask what treatment fits your goal"]
  },
  {
    id: "agencies",
    label: "Agencies",
    keywords: ["agency", "marketing", "media", "ads", "branding", "seo", "content", "growth"],
    audience: "business owners who want sharper growth, proof of expertise, and confidence the agency can execute",
    emotionalTriggers: ["growth ambition", "frustration", "status", "trust", "transformation"],
    searchPhrases: ["best marketing agency for local businesses", "content strategy for service business", "SEO agency near me"],
    contentAngles: ["audit teardown", "case study", "strategy framework", "mistake breakdown"],
    proofSignals: ["client results", "screenshots", "process", "strategy maps", "before/after analytics"],
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

function inferNiche(auditResult: AiAuditResult) {
  const text = getAuditText(auditResult);
  const scoredProfiles = nicheProfiles.map((profile) => ({
    profile,
    score: profile.keywords.reduce(
      (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
      0
    )
  }));
  const bestMatch = scoredProfiles.sort((first, second) => second.score - first.score)[0];

  return bestMatch?.score > 0
    ? bestMatch.profile
    : nicheProfiles.find((profile) => profile.id === "local-businesses") ?? nicheProfiles[0];
}

function getPlatformNativeFormat(platform: AuditPlatform, fallback: string) {
  if (platform === "tiktok") return "TikTok short video";
  if (platform === "instagram") return "Instagram Reel";
  return fallback;
}

function hookTaxonomy(profile: NicheProfile, platform: AuditPlatform): HookTaxonomyGroup[] {
  const phrase = profile.searchPhrases[0];
  const angle = profile.contentAngles[0];
  const proof = profile.proofSignals[0];
  const trigger = profile.emotionalTriggers[0];
  const platformLabel = getPlatformLabel(platform);

  return [
    {
      category: "Curiosity Hooks",
      hooks: [
        `Most ${profile.label.toLowerCase()} profiles lose attention before people understand this one thing.`,
        `I checked the visibility signals, and this ${angle} gap is probably costing profile actions.`
      ]
    },
    {
      category: "Authority Hooks",
      hooks: [
        `Here is the ${proof} signal I would show first if I wanted more trust on ${platformLabel}.`,
        `If your audience is comparing options, this proof point makes the decision easier.`
      ]
    },
    {
      category: "Storytelling Hooks",
      hooks: [
        `A viewer found the profile, hesitated, and left. Here is the content path that would bring them back.`,
        `Before the offer gets stronger, the audience needs to see this ${profile.label.toLowerCase()} story.`
      ]
    },
    {
      category: "Emotional Hooks",
      hooks: [
        `If your audience wants ${trigger}, your first sentence has to make that outcome feel close.`,
        `People do not just want information here. They want ${profile.emotionalTriggers[1] ?? trigger}.`
      ]
    },
    {
      category: "Conversion Hooks",
      hooks: [
        `If someone is ready to act today, this is the CTA they need to see.`,
        `Stop ending posts with vague engagement bait. Tell them to ${profile.ctaLanguage[0].toLowerCase()}.`
      ]
    },
    {
      category: "Local SEO Hooks",
      hooks: [
        `Use phrases like "${phrase}" in the first sentence, caption, and profile language.`,
        `If someone searched "${profile.searchPhrases[1] ?? phrase}", this post should feel made for them.`
      ]
    },
    {
      category: "Pattern Interrupt Hooks",
      hooks: [
        `Posting more is not the strategy. Making ${angle} obvious is.`,
        `The content is not the problem. The missing ${proof} signal is.`
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
  platform: AuditPlatform
): VisibilityContentPlan {
  const weakCategories = getWeakCategories(auditResult);
  const weakAreas = weakCategories.map((category) => category.name);
  const visibilitySignals = buildVisibilitySignals(auditResult);
  const niche = inferNiche(auditResult);
  const platformLabel = getPlatformLabel(platform);
  const hookSignal = signalByLabel(visibilitySignals, "Weak hooks");
  const consistencySignal = signalByLabel(visibilitySignals, "Posting consistency");
  const authoritySignal = signalByLabel(visibilitySignals, "Authority signals");
  const ctaSignal = signalByLabel(visibilitySignals, "CTA strength");
  const engagementSignal = signalByLabel(visibilitySignals, "Engagement quality");
  const seoSignal = signalByLabel(visibilitySignals, "Local SEO/search intent");
  const gapSignal = signalByLabel(visibilitySignals, "Content gaps");

  return {
    niche: {
      label: niche.label,
      audience: niche.audience,
      emotionalTriggers: niche.emotionalTriggers,
      searchPhrases: niche.searchPhrases
    },
    weakAreas,
    visibilitySignals,
    hookTaxonomy: hookTaxonomy(niche, platform),
    contentPriorities: [
      `Lead with niche-native hooks for ${niche.audience}: ${hookSignal.insight}`,
      `Build a repeatable ${niche.label.toLowerCase()} rhythm using ${niche.contentAngles.slice(0, 3).join(", ")}.`,
      `Raise authority with ${niche.proofSignals.slice(0, 3).join(", ")} instead of generic credibility claims.`,
      `Convert with CTAs like "${niche.ctaLanguage[0]}" and "${niche.ctaLanguage[1]}" when the post earns high-intent attention.`
    ],
    postingFrequency: platformFrequency[platform],
    recommendedMix: [
      {
        label: "Buyer education",
        share: "30%",
        purpose: `Answer search-intent questions such as "${niche.searchPhrases[0]}" and "${niche.searchPhrases[1]}."`
      },
      {
        label: "Proof and authority",
        share: "25%",
        purpose: `Show ${niche.proofSignals.slice(0, 3).join(", ")} so authority feels concrete.`
      },
      {
        label: "Local or niche relevance",
        share: "20%",
        purpose: `Anchor the plan in ${platformLabel} language for ${niche.audience}.`
      },
      {
        label: "Offer and CTA",
        share: "15%",
        purpose: `Move attention into actions like "${niche.ctaLanguage[0]}" or "${niche.ctaLanguage[2]}."`
      },
      {
        label: "Engagement loops",
        share: "10%",
        purpose: `Create prompts around ${niche.emotionalTriggers.slice(0, 3).join(", ")} to improve signal quality.`
      }
    ],
    weeklySchedule: [
      {
        week: "Week 1",
        objective: `Clarify the ${niche.label.toLowerCase()} promise and strengthen first-touch hooks.`,
        strategy: `The audit shows ${hookSignal.label.toLowerCase()} and ${ctaSignal.label.toLowerCase()} need attention. This week uses ${niche.emotionalTriggers[0]} and ${niche.emotionalTriggers[1]} psychology so the offer feels relevant before a viewer scrolls away.`,
        dailyPosts: [
          {
            day: "Monday",
            format: getPlatformNativeFormat(platform, "Short video"),
            topic: `Show the biggest ${niche.label.toLowerCase()} visibility leak using ${niche.contentAngles[0]}`,
            goal: `Make the ${niche.emotionalTriggers[0]} payoff obvious in the first three seconds.`,
            visibilitySignal: hookSignal.label
          },
          {
            day: "Tuesday",
            format: "Caption-led proof post",
            topic: `Explain who the offer helps and connect it to ${niche.audience}`,
            goal: `Tighten positioning around ${niche.emotionalTriggers[2]} and attract the right audience.`,
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
            topic: `Show ${niche.proofSignals[1]} or ${niche.proofSignals[2]}`,
            goal: "Create authority without sounding like a hard sell.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Direct CTA post",
            topic: `Invite viewers to ${niche.ctaLanguage[0].toLowerCase()}`,
            goal: "Convert profile attention into a measurable next step.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          hookTaxonomy(niche, platform)[0].hooks[0],
          hookTaxonomy(niche, platform)[3].hooks[0],
          hookTaxonomy(niche, platform)[6].hooks[0]
        ],
        videoScriptConcepts: [
          `Open with the audit gap, show a ${niche.contentAngles[0]} example, explain the fix, close with "${niche.ctaLanguage[0]}."`,
          `Use a before/after promise: weak ${niche.label.toLowerCase()} positioning first, sharper outcome second, then explain the conversion difference.`
        ],
        captionIdeas: [
          `Visibility starts with clarity. If ${niche.audience} have to guess, they will not take the next step.`,
          `A stronger first impression can move people from ${niche.emotionalTriggers[1]} to action.`
        ],
        ctaSuggestions: [
          niche.ctaLanguage[0],
          "Book a Titan Visibility Strategy Call.",
          niche.ctaLanguage[2]
        ],
        engagementTasks: [
          `Reply to every comment with a ${niche.label.toLowerCase()}-specific follow-up question within 24 hours.`,
          `Comment on 10 niche-relevant posts using phrases like "${niche.searchPhrases[0]}."`,
          `Pin or save the strongest ${niche.emotionalTriggers[0]} question for next week's content.`
        ],
        visibilityPriorities: [
          hookSignal.insight,
          ctaSignal.insight,
          "Create one repeatable hook format that can be reused for the next three weeks."
        ]
      },
      {
        week: "Week 2",
        objective: `Build consistency around ${niche.label.toLowerCase()} buyer intent and content gaps.`,
        strategy: `This week addresses ${consistencySignal.label.toLowerCase()} and ${gapSignal.label.toLowerCase()} by turning weak categories into ${niche.contentAngles.slice(0, 3).join(", ")} pillars.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Search-intent post",
            topic: `Answer "${niche.searchPhrases[1]}" with a specific example`,
            goal: `Improve discoverability for ${niche.audience}.`,
            visibilitySignal: seoSignal.label
          },
          {
            day: "Tuesday",
            format: "Myth-busting video",
            topic: `Correct a belief that blocks ${niche.emotionalTriggers[4] ?? niche.emotionalTriggers[0]}`,
            goal: "Create authority and retention without repeating the same advice.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Carousel or list post",
            topic: `Three signs ${niche.audience} need the offer`,
            goal: `Trigger identity and ${niche.emotionalTriggers[0]} recognition.`,
            visibilitySignal: gapSignal.label
          },
          {
            day: "Thursday",
            format: "Proof post",
            topic: `Share ${niche.proofSignals[0]} with context`,
            goal: "Add trust signals to the content mix.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Soft CTA post",
            topic: `Invite followers to ${niche.ctaLanguage[2].toLowerCase()}`,
            goal: `Create low-friction conversations around ${niche.emotionalTriggers[1]}.`,
            visibilitySignal: engagementSignal.label
          }
        ],
        hookIdeas: [
          hookTaxonomy(niche, platform)[1].hooks[0],
          hookTaxonomy(niche, platform)[5].hooks[1],
          `Here is the ${niche.label.toLowerCase()} content gap I would fix before posting more.`
        ],
        videoScriptConcepts: [
          `Teach one buyer-intent question like "${niche.searchPhrases[0]}", give a quick example, then point to "${niche.ctaLanguage[0]}."`,
          `Show a common ${niche.label.toLowerCase()} mistake, explain why it happens, and give the corrected version.`
        ],
        captionIdeas: [
          `Consistency is not posting every thought. It is repeating ${niche.proofSignals[0]}, ${niche.contentAngles[1]}, and clear CTAs until the audience knows why to trust you.`,
          `This week's content should make the ${niche.label.toLowerCase()} decision easier, not just fill the calendar.`
        ],
        ctaSuggestions: [
          niche.ctaLanguage[1],
          `Message us the word FIX and we will point you to the first ${niche.label.toLowerCase()} improvement.`,
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
        objective: `Increase ${niche.label.toLowerCase()} authority, engagement quality, and trust density.`,
        strategy: `The roadmap now shifts from clarity to credibility. Stronger ${authoritySignal.label.toLowerCase()} and ${engagementSignal.label.toLowerCase()} help ${niche.audience} feel enough confidence to act.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Authority video",
            topic: `Explain the ${niche.proofSignals[1]} most competitors do not show`,
            goal: "Differentiate expertise.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Tuesday",
            format: "Testimonial or proof story",
            topic: `Turn one ${niche.proofSignals[0]} into a narrative`,
            goal: `Reduce risk and increase ${niche.emotionalTriggers[3] ?? "trust"}.`,
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Objection-handling post",
            topic: `Answer the concern that keeps ${niche.audience} from acting`,
            goal: "Move warm viewers closer to action.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Thursday",
            format: "Community prompt",
            topic: `Ask the audience what ${niche.emotionalTriggers[6] ?? "transformation"} they want next`,
            goal: "Increase comment quality and content inputs.",
            visibilitySignal: engagementSignal.label
          },
          {
            day: "Friday",
            format: "Local or niche relevance post",
            topic: `Tie the offer to "${niche.searchPhrases[2] ?? niche.searchPhrases[0]}"`,
            goal: "Improve relevance and search context.",
            visibilitySignal: seoSignal.label
          }
        ],
        hookIdeas: [
          hookTaxonomy(niche, platform)[1].hooks[1],
          `This is the ${niche.proofSignals[1]} part most people never see.`,
          `If you are comparing ${niche.label.toLowerCase()} options, this detail matters.`
        ],
        videoScriptConcepts: [
          `Start with a ${niche.label.toLowerCase()} objection, validate it, show ${niche.proofSignals[0]}, explain the process, close with "${niche.ctaLanguage[0]}."`,
          `Break down a result into three decisions that created ${niche.emotionalTriggers[6] ?? "transformation"}.`
        ],
        captionIdeas: [
          `Authority is built through evidence. Show ${niche.proofSignals[0]}, ${niche.proofSignals[1]}, and why it worked.`,
          `${niche.audience} trust what they can understand. Make the path visible.`
        ],
        ctaSuggestions: [
          "Want us to map this for your brand? Book a strategy call.",
          `DM PROOF and we will show you the first ${niche.label.toLowerCase()} trust signal to fix.`,
          `Ask what this would look like for your ${platformLabel} profile.`
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
        objective: `Convert ${niche.label.toLowerCase()} visibility into leads and refine the next growth cycle.`,
        strategy: `The final week packages the strongest content signals into a conversion push, then uses performance feedback to decide the next 30-day cycle for ${niche.audience}.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Campaign recap",
            topic: `Summarize the biggest ${niche.label.toLowerCase()} visibility improvement from the month`,
            goal: "Reinforce the strategic arc.",
            visibilitySignal: gapSignal.label
          },
          {
            day: "Tuesday",
            format: "FAQ video",
            topic: `Answer the final ${niche.label.toLowerCase()} question before someone acts`,
            goal: "Remove friction.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Comparison post",
            topic: `Show weak vs. strong ${platformLabel} visibility using ${niche.contentAngles[2]}`,
            goal: "Make the value easy to understand.",
            visibilitySignal: hookSignal.label
          },
          {
            day: "Thursday",
            format: "Lead magnet or audit invitation",
            topic: `Offer a simple next step: ${niche.ctaLanguage[0]}`,
            goal: "Capture warm demand.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Friday",
            format: "Strategy CTA post",
            topic: `Invite ${niche.audience} to book a Titan Visibility Strategy Call`,
            goal: "Turn the month into pipeline.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          hookTaxonomy(niche, platform)[4].hooks[0],
          `This is how ${niche.label.toLowerCase()} profile attention becomes a real next step.`,
          `Your content should create ${niche.emotionalTriggers[6] ?? "transformation"}, not just impressions.`
        ],
        videoScriptConcepts: [
          `Recap the month: ${gapSignal.label.toLowerCase()}, fix, ${niche.proofSignals[0]}, next step. Keep it simple and conversion-focused.`,
          `Show the cost of unclear ${niche.label.toLowerCase()} visibility, then make the strategy call the obvious next move.`
        ],
        captionIdeas: [
          `A visibility plan should end with action. The goal is not more ${platformLabel} content. The goal is clearer demand.`,
          `Use ${niche.emotionalTriggers[0]}, ${niche.proofSignals[0]}, and CTA signals to decide what to repeat, cut, and scale.`
        ],
        ctaSuggestions: [
          "Book a Titan Visibility Strategy Call.",
          "Download the report and choose your first implementation priority.",
          niche.ctaLanguage[3] ?? "Message STRATEGY and we will map the next 30 days."
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
