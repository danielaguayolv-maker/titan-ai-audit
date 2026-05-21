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

type VisualDirectionProfile = {
  openings: string[];
  secondBeats: string[];
  proofShots: string[];
  pacing: string[];
  ctaPlacements: string[];
  captionVoices: string[];
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

const visualDirectionProfiles: Record<string, VisualDirectionProfile> = {
  restaurants: {
    openings: [
      "Open with sizzling grill footage and a tight food close-up before the viewer can think about scrolling.",
      "Start on dinner rush energy: servers moving through packed tables, quick crowd cuts, then the plated reveal.",
      "Lead with smoke-and-fire visuals, then cut to real customer reactions before showing the dining room.",
      "Begin with a fast food close-up transition, then pull back into late-night crowd energy."
    ],
    secondBeats: [
      "Cut from the food to the people: laughter, first bites, packed tables, and the reason the room feels alive.",
      "Slow down for one craveable detail, then jump back into movement so the post keeps its pulse.",
      "Move from kitchen heat to guest reaction so the viewer feels the experience, not just the item."
    ],
    proofShots: [
      "line-out-the-door moments",
      "servers moving through packed tables",
      "sizzling grill footage",
      "food close-up transitions",
      "real customer reactions",
      "smoke-and-fire visuals",
      "late-night crowd energy"
    ],
    pacing: [
      "fast first second, two quick cuts, one slow plated reveal, then the CTA on-screen",
      "hook in the first frame, sensory close-up by second two, people by second four",
      "quick kitchen movement, reaction shot, offer text, then a clean reservation prompt"
    ],
    ctaPlacements: [
      "Put the CTA over the plated reveal, not after the energy drops.",
      "Let the CTA appear while the room still feels busy.",
      "Place the save/share prompt on the shot people would want to send to a friend."
    ],
    captionVoices: [
      "If people cannot instantly feel why the spot is worth trying, they scroll.",
      "Make them hungry before you ask them to reserve.",
      "The post should feel like the table is already waiting."
    ]
  },
  agencies: {
    openings: [
      "Open with a screen recording of the problem, then zoom into the exact fix instead of talking around it.",
      "Start on an audit walkthrough: weak profile, missed signal, cleaner version.",
      "Lead with an analytics reveal, then cut to the strategy whiteboard that explains why it happened.",
      "Begin with a campaign breakdown that shows the before, the decision, and the cleaner next move."
    ],
    secondBeats: [
      "Cut from the screen to the thinking: whiteboard, cursor movement, client transformation story, then the takeaway.",
      "Show the messy version for one beat, then make the improved version visually obvious.",
      "Use one clean annotation so the viewer sees the pattern without needing a lecture."
    ],
    proofShots: [
      "screen recordings",
      "audit walkthroughs",
      "campaign breakdowns",
      "strategy whiteboards",
      "analytics reveals",
      "client transformation stories",
      "before/after positioning"
    ],
    pacing: [
      "problem screenshot first, quick markup second, improved version third, CTA on the final frame",
      "fast audit teardown, one pause for the insight, then a direct next step",
      "screen capture, whiteboard beat, result context, then offer"
    ],
    ctaPlacements: [
      "Put the CTA after the viewer sees the fix, not before they believe the problem.",
      "Use the final annotated screen as the CTA frame.",
      "Place the ask after the clearest before/after moment."
    ],
    captionVoices: [
      "Show the difference between random marketing and visible demand.",
      "Make the fix obvious enough that a business owner can feel the cost of ignoring it.",
      "The best proof is the moment the strategy finally clicks."
    ]
  },
  "gaming-creators": {
    openings: [
      "Open on the clutch moment, freeze for half a beat, then show the decision that made it happen.",
      "Start with the mistake everyone recognizes, then cut into the correction before the clip cools off.",
      "Lead with a fast reaction moment, then replay the play from the viewer's point of view."
    ],
    secondBeats: [
      "Cut between gameplay, face reaction, and one short on-screen lesson.",
      "Use the clip first, the explanation second, and the community prompt last.",
      "Let the high-emotion moment breathe, then snap into the takeaway."
    ],
    proofShots: [
      "stream highlights",
      "reaction moments",
      "fast-cut gameplay breakdowns",
      "POV-style openings",
      "rank progress",
      "chat reactions",
      "clutch replays"
    ],
    pacing: [
      "clip first, replay second, lesson third, comment prompt last",
      "fast cut into the play, one freeze-frame, then a quick community question",
      "reaction, gameplay, on-screen text, CTA"
    ],
    ctaPlacements: [
      "Put the follow prompt right after the lesson lands.",
      "Ask for comments when the viewer is already judging the play.",
      "Place the stream CTA after the clip proves the vibe."
    ],
    captionVoices: [
      "Make the first second feel like something is about to happen.",
      "Give players a reason to argue, learn, or come back for the next run.",
      "The clip should feel like a moment from the community, not just a highlight."
    ]
  },
  streamers: {
    openings: [
      "Open with the live reaction, then cut to the chat losing it before explaining the moment.",
      "Start with the inside joke or unexpected clip, then show why the stream had energy.",
      "Lead with the loudest community beat, then give the viewer a reason to catch the next live."
    ],
    secondBeats: [
      "Cut from face reaction to chat, then back to the moment that triggered it.",
      "Show the clip, the community response, and the next stream tease in that order.",
      "Let the chaos hook first, then make the invitation feel easy."
    ],
    proofShots: [
      "stream highlights",
      "chat reactions",
      "Discord moments",
      "clip-worthy reactions",
      "community challenges",
      "live countdowns"
    ],
    pacing: [
      "reaction first, chat second, clip context third, stream CTA last",
      "fast clip, quick chat zoom, one sentence setup, follow prompt",
      "inside joke, replay, next-live invitation"
    ],
    ctaPlacements: [
      "Place the live CTA after the viewer sees the community energy.",
      "Use the chat reaction as the proof frame before the ask.",
      "Invite people while the clip still feels active."
    ],
    captionVoices: [
      "Make new viewers feel like they almost missed the best part.",
      "Turn the clip into an invitation, not just a recap.",
      "The viewer should feel the room before they ever join live."
    ]
  },
  "lifestyle-creators": {
    openings: [
      "Open with a POV-style before moment, then cut into the upgrade people want to save.",
      "Start with the emotional confession clip, then show the small visual shift that changes the day.",
      "Lead with the finished look or routine payoff, then reveal the steps quickly."
    ],
    secondBeats: [
      "Move from honest moment to aesthetic detail to practical next step.",
      "Cut between hands, texture, mirror checks, and the final mood.",
      "Show the transformation before explaining the product or routine."
    ],
    proofShots: [
      "POV-style openings",
      "emotional confession clips",
      "fast-cut storytelling",
      "routine transitions",
      "texture close-ups",
      "before/after mood shifts"
    ],
    pacing: [
      "payoff first, two detail cuts, human moment, save prompt",
      "POV hook, visual sequence, one practical note, CTA",
      "before feeling, after feeling, quick steps, comment prompt"
    ],
    ctaPlacements: [
      "Put the save prompt on the most useful visual step.",
      "Place the link/comment CTA after the viewer sees the finished result.",
      "Ask for follows when the series promise feels clear."
    ],
    captionVoices: [
      "Make the audience feel the upgrade before you explain it.",
      "People save what feels like it could fit into their life tomorrow.",
      "The content should feel useful and aspirational at the same time."
    ]
  },
  "fitness-creators": {
    openings: [
      "Open with progression footage: the struggle, the rep, the confidence shift.",
      "Start with gym energy and a clear form mistake before showing the fix.",
      "Lead with a transformation clip, then cut to the ordinary discipline behind it."
    ],
    secondBeats: [
      "Move from effort to correction to the result people can feel.",
      "Cut between setup, rep, coaching cue, and the visible confidence moment.",
      "Show the uncomfortable part first, then make the next step feel doable."
    ],
    proofShots: [
      "transformation clips",
      "gym energy",
      "progression footage",
      "discipline moments",
      "confidence visuals",
      "form correction close-ups"
    ],
    pacing: [
      "struggle frame, correction, clean rep, CTA",
      "fast gym hook, slower coaching cue, proof moment, comment prompt",
      "before clip, training beat, confidence shot, next step"
    ],
    ctaPlacements: [
      "Put the CTA after the viewer believes the fix is possible.",
      "Use the clean rep as the save prompt frame.",
      "Ask for goals after showing a realistic path."
    ],
    captionVoices: [
      "Make the outcome feel possible, not perfect.",
      "People follow when they see the discipline and the human reason behind it.",
      "The best fitness content makes the next rep feel less intimidating."
    ]
  },
  default: {
    openings: [
      "Open with the most visual proof of the promise, then explain the reason it matters.",
      "Start on motion, emotion, or contrast before adding context.",
      "Lead with the moment a viewer can understand without reading the caption."
    ],
    secondBeats: [
      "Cut from the problem to the proof, then slow down for the human detail.",
      "Show the before, the shift, and the next step in a clean sequence.",
      "Use movement first, context second, CTA last."
    ],
    proofShots: [
      "before/after moments",
      "human reactions",
      "process close-ups",
      "clear result shots",
      "behind-the-scenes clips",
      "customer or audience proof"
    ],
    pacing: [
      "visual hook first, proof second, explanation third, CTA last",
      "fast first beat, slower proof moment, clear next step",
      "contrast, context, credibility, CTA"
    ],
    ctaPlacements: [
      "Place the CTA after the viewer sees the value.",
      "Use the strongest proof shot as the CTA frame.",
      "Ask for action while the outcome still feels fresh."
    ],
    captionVoices: [
      "Make people feel the outcome before asking them to act.",
      "The first three seconds should do more than introduce the topic.",
      "Show the difference between passive attention and real intent."
    ]
  }
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

function getVisualDirectionProfile(nicheId: string) {
  return visualDirectionProfiles[nicheId] ?? visualDirectionProfiles.default;
}

function pick(values: string[], index: number) {
  return values[index % values.length] ?? "";
}

function phraseList(values: string[], start = 0, count = 3) {
  return Array.from({ length: count }, (_, index) => pick(values, start + index)).join(", ");
}

function signalRewrite(label: string, index: number) {
  const rewrites: Record<string, string[]> = {
    "Weak hooks": [
      "Make the first frame carry the promise before the caption has to work.",
      "Use motion, contrast, or tension immediately so the viewer knows why to stay.",
      "Turn the opening into a visual reason to keep watching."
    ],
    "CTA strength": [
      "Let the ask show up while the viewer still feels the value.",
      "Make the next step visible before interest cools off.",
      "Use the CTA as a continuation of the moment, not a separate sales line."
    ],
    "Engagement quality": [
      "Invite replies around a real decision, reaction, or identity moment.",
      "Ask questions people can answer from lived experience, not generic opinions.",
      "Turn comments into signals for what the next post should show."
    ],
    "Content gaps": [
      "Fill the missing shots: proof, process, audience reaction, and one clear offer moment.",
      "Cover the parts of the story viewers need before they trust the next step.",
      "Build posts that show the promise from more than one angle."
    ],
    "Authority signals": [
      "Show the evidence on camera instead of only naming the expertise.",
      "Use visible proof, process, and context so trust has something concrete to attach to.",
      "Let the audience see why the brand is credible before asking them to believe it."
    ]
  };

  return pick(rewrites[label] ?? rewrites["Content gaps"], index);
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
  const visualDirection = getVisualDirectionProfile(niche.id);
  const visual = {
    opening: (index: number) => pick(visualDirection.openings, index),
    secondBeat: (index: number) => pick(visualDirection.secondBeats, index),
    proofShot: (index: number) => pick(visualDirection.proofShots, index),
    pacing: (index: number) => pick(visualDirection.pacing, index),
    ctaPlacement: (index: number) => pick(visualDirection.ctaPlacements, index),
    captionVoice: (index: number) => pick(visualDirection.captionVoices, index)
  };

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
      `${signalRewrite(hookSignal.label, 0)} ${visual.opening(0)}`,
      `Build a repeatable visual rhythm around ${visual.proofShot(0)}, ${visual.proofShot(1)}, and ${visual.proofShot(2)} instead of posting one-off ideas.`,
      `Sequence proof like a director: ${visual.pacing(0)}.`,
      `${visual.ctaPlacement(0)} Use "${cta(0)}" for hot attention and "${cta(2)}" for warmer, conversational moments.`
    ],
    postingFrequency: platformFrequency[platform],
    recommendedMix: [
      {
        label: "Buyer education",
        share: "30%",
        purpose: `Answer "${niche.searchPhrases[0]}" with a visual sequence first, then use the caption to make the search phrase feel natural.`
      },
      {
        label: "Proof and authority",
        share: "25%",
        purpose: `Show ${visual.proofShot(2)}, ${visual.proofShot(3)}, and ${visual.proofShot(4)} so authority feels earned rather than claimed.`
      },
      {
        label: "Local or niche relevance",
        share: "20%",
        purpose: `Anchor the plan in ${platformLabel} language for ${audienceB}, using scenes they recognize immediately.`
      },
      {
        label: "Offer and CTA",
        share: "15%",
        purpose: `${visual.ctaPlacement(1)} Move attention into plain next steps like "${cta(0)}" or "${cta(2)}."`
      },
      {
        label: "Engagement loops",
        share: "10%",
        purpose: `Use prompts around ${emotionA}, ${emotionB}, and ${emotionC} so comments reveal what the audience actually wants.`
      }
    ],
    weeklySchedule: [
      {
        week: "Week 1",
        objective: "Make the first impression sharper, faster, and easier to act on.",
        strategy: `This week fixes the opening frame and the next step. Speak to ${audienceA} with ${emotionA} and ${emotionB} cues, then make the viewer feel the value before asking them to act.`,
        dailyPosts: [
          {
            day: "Monday",
            format: getPlatformNativeFormat(platform, "Short video"),
            topic: `${visual.opening(0)} Then connect it to ${angleA}.`,
            goal: `Make the ${emotionA} payoff obvious before the viewer has time to scroll.`,
            visibilitySignal: hookSignal.label
          },
          {
            day: "Tuesday",
            format: "Caption-led proof post",
            topic: `Pair ${visual.proofShot(1)} with a caption written directly to ${audienceB}.`,
            goal: `Make the audience feel seen, not broadly targeted.`,
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Educational post",
            topic: `Answer "${niche.searchPhrases[0]}" with a quick visual before/after.`,
            goal: "Make the search phrase feel useful on-platform, not pasted into the caption.",
            visibilitySignal: seoSignal.label
          },
          {
            day: "Thursday",
            format: "Behind-the-scenes clip",
            topic: `Show ${visual.proofShot(2)} or ${visual.proofShot(3)} with one human detail.`,
            goal: "Create authority by letting viewers see what makes the brand credible.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Direct CTA post",
            topic: `${visual.ctaPlacement(0)} Invite viewers to ${cta(0).toLowerCase()}.`,
            goal: "Turn warm attention into a next step while the moment still has energy.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[0].hooks[0],
          taxonomy[3].hooks[0],
          taxonomy[6].hooks[0]
        ],
        videoScriptConcepts: [
          `${visual.opening(0)} ${visual.secondBeat(0)} Close with "${cta(0)}" on the strongest proof frame.`,
          `Use this pacing: ${visual.pacing(0)}. Keep the explanation short enough that the visuals do most of the work.`
        ],
        captionIdeas: [
          `If ${audienceA} cannot instantly tell why this is worth their time, they scroll.`,
          visual.captionVoice(0)
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
          signalRewrite(hookSignal.label, 1),
          signalRewrite(ctaSignal.label, 0),
          `Create one repeatable opening format using ${visual.proofShot(0)} without making every post feel copied.`
        ]
      },
      {
        week: "Week 2",
        objective: "Turn scattered posting into a recognizable content rhythm.",
        strategy: `This week turns scattered posts into recognizable scenes. Repeat the strongest visual language so the audience starts knowing what the brand feels like before they read the caption.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Search-intent post",
            topic: `Answer "${niche.searchPhrases[1]}" using ${visual.proofShot(4)} as the first visual.`,
            goal: `Make ${audienceC} feel like the post was made for the exact decision they are trying to make.`,
            visibilitySignal: seoSignal.label
          },
          {
            day: "Tuesday",
            format: "Myth-busting video",
            topic: `Correct a belief with a fast contrast: weak version, stronger version, real-world example.`,
            goal: "Make the audience rethink the problem by seeing the difference on-screen.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Carousel or list post",
            topic: `Three signs ${audienceA} are ready, built around ${visual.proofShot(0)}, ${visual.proofShot(1)}, and ${visual.proofShot(2)}.`,
            goal: `Trigger identity and ${emotionA} recognition without sounding generic.`,
            visibilitySignal: gapSignal.label
          },
          {
            day: "Thursday",
            format: "Proof post",
            topic: `Share ${visual.proofShot(3)} with the context viewers usually miss.`,
            goal: "Make trust visible in the content mix.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Friday",
            format: "Soft CTA post",
            topic: `${visual.ctaPlacement(2)} Invite followers to ${cta(2).toLowerCase()}.`,
            goal: `Create low-friction conversations around ${emotionB}.`,
            visibilitySignal: engagementSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[1].hooks[0],
          taxonomy[5].hooks[1],
          "This is the missing scene that would make the audience understand the offer faster."
        ],
        videoScriptConcepts: [
          `Teach "${niche.searchPhrases[0]}" through visuals: ${visual.pacing(1)}.`,
          `Use ${visual.secondBeat(1)} The viewer should understand the mistake before the voiceover explains it.`
        ],
        captionIdeas: [
          `People do not need more random posts. They need to see the same promise become easier to believe.`,
          visual.captionVoice(1)
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
          `Repeat ${visual.proofShot(0)} twice this week so the audience starts recognizing the theme.`,
          `Use "${niche.searchPhrases[0]}" naturally in the first sentence of two posts.`,
          signalRewrite(gapSignal.label, 0)
        ]
      },
      {
        week: "Week 3",
        objective: "Make trust visible and give the audience something to respond to.",
        strategy: `This week makes credibility something viewers can see. Use proof, process, and human reaction so ${audienceB} feel enough confidence to act.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Authority video",
            topic: `Show the ${visual.proofShot(5)} most competitors leave out.`,
            goal: "Differentiate expertise with visible evidence.",
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Tuesday",
            format: "Testimonial or proof story",
            topic: `Turn one ${visual.proofShot(4)} into a beginning, middle, and payoff.`,
            goal: `Reduce risk and increase ${emotionC}.`,
            visibilitySignal: authoritySignal.label
          },
          {
            day: "Wednesday",
            format: "Objection-handling post",
            topic: `Answer the concern that keeps ${audienceC} from acting with a visual side-by-side.`,
            goal: "Move warm viewers closer to action by making the answer easy to see.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Thursday",
            format: "Community prompt",
            topic: `Ask the audience which outcome they want next after showing ${visual.proofShot(1)}.`,
            goal: "Increase comment quality with a prompt tied to a real visual moment.",
            visibilitySignal: engagementSignal.label
          },
          {
            day: "Friday",
            format: "Local or niche relevance post",
            topic: `Tie the offer to "${niche.searchPhrases[2] ?? niche.searchPhrases[0]}" with a scene the audience recognizes.`,
            goal: "Make the post feel tied to the exact market moment, not a generic content prompt.",
            visibilitySignal: seoSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[1].hooks[1],
          `This is the ${proofB} part most people never see.`,
          "If you are comparing options, this detail matters."
        ],
        videoScriptConcepts: [
          `Start with the objection on-screen, validate it in one line, show ${visual.proofShot(2)}, then close with "${cta(0)}."`,
          `Break down the result visually: ${visual.pacing(2)}. Let the proof carry the credibility.`
        ],
        captionIdeas: [
          `Do not just say the brand is good at this. Show the moment that makes people believe it.`,
          `${audienceB} trust what they can see. Make the path visible.`
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
          signalRewrite(authoritySignal.label, 1),
          "Turn one strong audience question into a full post with a clear first frame and a useful answer.",
          `Show ${visual.proofShot(5)} so trust has something concrete to attach to.`
        ]
      },
      {
        week: "Week 4",
        objective: "Turn attention into conversations and decide what deserves another cycle.",
        strategy: `The final week turns the strongest scenes into action. Keep the creative cinematic, but make every post easier to respond to, save, share, or act on.`,
        dailyPosts: [
          {
            day: "Monday",
            format: "Campaign recap",
            topic: `Recap the month with the strongest opening, proof shot, and CTA frame.`,
            goal: "Show the difference between posting to stay active and posting to create movement.",
            visibilitySignal: gapSignal.label
          },
          {
            day: "Tuesday",
            format: "FAQ video",
            topic: `Answer the final question ${audienceB} ask before acting, then show the answer in motion.`,
            goal: "Remove friction with a visual answer, not a long explanation.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Wednesday",
            format: "Comparison post",
            topic: `Show weak vs. strong ${platformLabel} visibility using ${visual.proofShot(6)}.`,
            goal: "Make the value obvious in one glance.",
            visibilitySignal: hookSignal.label
          },
          {
            day: "Thursday",
            format: "Lead magnet or audit invitation",
            topic: `${visual.ctaPlacement(1)} Offer a simple next step: ${cta(0)}.`,
            goal: "Capture warm demand while the proof is still fresh.",
            visibilitySignal: ctaSignal.label
          },
          {
            day: "Friday",
            format: "Strategy CTA post",
            topic: `Invite ${audienceC} to ${cta(0).toLowerCase()} after the clearest before/after moment.`,
            goal: "Turn the month into conversations without making the post feel disconnected from the content.",
            visibilitySignal: ctaSignal.label
          }
        ],
        hookIdeas: [
          taxonomy[4].hooks[0],
          "This is how profile attention becomes a real next step.",
          "Your content should create movement, not just impressions."
        ],
        videoScriptConcepts: [
          `Recap the month as a mini trailer: strongest hook, best proof, clearest audience reaction, then "${cta(0)}."`,
          `${visual.secondBeat(2)} Show the cost of unclear visibility, then make the next step feel obvious.`
        ],
        captionIdeas: [
          `The goal is not more ${platformLabel} content. The goal is content that makes people feel ready to move.`,
          `${visual.captionVoice(2)} Repeat the scenes people saved, replied to, or acted on.`
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
          signalRewrite(ctaSignal.label, 1),
          "Compare engagement quality against posts with the clearest first frame and strongest visual payoff.",
          "Choose the next cycle based on real audience response, not content volume."
        ]
      }
    ]
  };
}
