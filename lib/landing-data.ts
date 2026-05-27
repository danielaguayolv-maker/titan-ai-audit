export const features = [
  {
    title: "Visibility Intelligence",
    description:
      "Titan studies profile signals, audience behavior, emotional identity, and conversion friction before growth shifts become obvious."
  },
  {
    title: "Strategic Momentum",
    description:
      "Track whether hooks, CTAs, memorability, search alignment, and audience pull are strengthening, flattening, or becoming volatile."
  },
  {
    title: "Execution System",
    description:
      "Turn movement signals into Titan Studio roadmaps, experiments, client-ready reports, and workspace timelines."
  }
];

export const stats = [
  { value: "01", label: "first scan" },
  { value: "30 day", label: "execution roadmap" },
  { value: "∞", label: "memory over time" }
];

export const activationSignals = [
  "Titan studies movement before visibility collapses.",
  "Audience behavior leaves patterns before growth shifts.",
  "Momentum forms before performance becomes obvious."
];

export const productTiers = [
  {
    name: "Free",
    description: "First scan, executive read, and a starter visibility snapshot."
  },
  {
    name: "Pro",
    description: "Memory, evolution, experiments, Titan Studio, and PDF reports."
  },
  {
    name: "Agency",
    description: "Multi-workspace operations, client view, and white-label foundations."
  }
];

export type VisibilityTransformation = {
  clientName: string;
  industry: string;
  services: string[];
  summary: string;
  metric: string;
  mediaLabel: string;
  problem: string;
  gap: string;
  strategy: string;
  execution: string;
  momentumShift: string;
  results: string[];
  titanInsight: string;
};

export const visibilityTransformations: VisibilityTransformation[] = [
  {
    clientName: "888 BBQ",
    industry: "Restaurant / Gourmet Asian BBQ",
    services: [
      "content strategy",
      "short-form video",
      "visibility audit",
      "local discovery"
    ],
    summary:
      "Turned craveable food moments into a stronger local visibility system built around attention, appetite, and customer interest.",
    metric:
      "Viral review clip, improved local discovery, stronger restaurant content system",
    mediaLabel: "Food close-ups, review clips, local discovery screenshots",
    problem:
      "The restaurant had strong product appeal, but the content needed to make people feel the reason to visit before the explanation arrived.",
    gap:
      "Food visibility was present, but local craving, social proof, and repeatable content rhythm needed a clearer system.",
    strategy:
      "Build content around sensory proof: plated reveals, review energy, local search cues, and simple visit-ready CTAs.",
    execution:
      "Short-form video angles were shaped around food texture, customer interest, and local discovery language designed for people deciding where to eat.",
    momentumShift:
      "The content began working less like isolated posts and more like a restaurant visibility engine.",
    results: [
      "Viral review clip momentum",
      "Improved local discovery signals",
      "Clearer short-form restaurant content system"
    ],
    titanInsight:
      "For restaurants, the audience needs to feel the craving before they process the offer."
  },
  {
    clientName: "Da Long Buddhist Temple",
    industry: "Buddhist Temple / Spiritual Community",
    services: ["branding", "social setup", "website", "content direction"],
    summary:
      "Created a peaceful digital presence that made the temple easier to understand, trust, and discover.",
    metric: "New social presence, improved clarity, stronger community discovery",
    mediaLabel: "Brand system, website screens, social setup, content samples",
    problem:
      "The temple needed a digital presence that reflected peace, trust, and community without feeling commercial.",
    gap:
      "The community value was meaningful, but the online identity needed clearer structure and a calmer path for discovery.",
    strategy:
      "Create a grounded brand presence with simple messaging, social setup, website clarity, and content direction built around trust.",
    execution:
      "The digital foundation was shaped around peaceful visuals, direct community information, and content that helps people understand how to connect.",
    momentumShift:
      "The organization moved from limited online visibility into a clearer, more trustworthy community presence.",
    results: [
      "New social presence",
      "Improved digital clarity",
      "Stronger community discovery path"
    ],
    titanInsight:
      "Visibility is not always loud. Sometimes trust forms through calm, clarity, and consistency."
  },
  {
    clientName: "Everblue Ocean Center",
    industry: "Wellness / Chinese Medicine / Herbal Care",
    services: [
      "social audit",
      "content strategy",
      "local visibility",
      "wellness messaging"
    ],
    summary:
      "Clarified the center's offer and shaped educational content into a stronger local wellness positioning system.",
    metric:
      "Stronger profile clarity, improved content pillars, better local positioning",
    mediaLabel: "Profile audit, wellness content pillars, education samples",
    problem:
      "The offer had depth, but the profile and content needed to make the wellness value easier to understand quickly.",
    gap:
      "Educational authority existed, but the messaging needed clearer pillars, local relevance, and more accessible entry points.",
    strategy:
      "Organize the content around wellness education, offer clarity, local search intent, and trust-building explanations.",
    execution:
      "Content direction was refined into clearer educational themes, profile positioning, and local visibility language.",
    momentumShift:
      "The center became easier to understand at a glance, with a stronger foundation for trust and search-driven discovery.",
    results: [
      "Stronger profile clarity",
      "Improved content pillar system",
      "Better local wellness positioning"
    ],
    titanInsight:
      "Wellness content wins when authority feels clear, human, and easy to enter."
  },
  {
    clientName: "Sin City Customs",
    industry: "Custom Products / Apparel / Tumblers",
    services: [
      "product storytelling",
      "content strategy",
      "ecommerce visibility",
      "short-form content"
    ],
    summary:
      "Turned custom products into identity-driven content with clearer offer angles and more emotional product storytelling.",
    metric:
      "Improved product storytelling, stronger offer clarity, better content angles",
    mediaLabel: "Product shots, customization reels, ecommerce samples",
    problem:
      "The products were visually customizable, but the content needed stronger emotional reasons for people to care, gift, buy, or share.",
    gap:
      "Product visibility existed, but identity, occasion, and personalization angles were not doing enough strategic work.",
    strategy:
      "Position custom products through personality, gifting moments, customer identity, and clearer ecommerce-ready CTAs.",
    execution:
      "Short-form concepts were shaped around customization reveals, product details, emotional use cases, and offer clarity.",
    momentumShift:
      "The content started moving from product display into sharper identity-based storytelling.",
    results: [
      "Improved product storytelling",
      "Stronger offer clarity",
      "Better content angles for ecommerce visibility"
    ],
    titanInsight:
      "Custom products become more memorable when the content sells identity, not just inventory."
  }
];
