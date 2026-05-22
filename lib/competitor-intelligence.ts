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
  sharpRead: string;
  visualTaste: string;
  whyItMatters: string;
  retentionRead: string;
  sequenceFix: string;
  emotionalRead: string;
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
  emotionalBrandDifferences: string[];
  memorabilityDifferences: string[];
  presenceDifferences: string[];
  culturalIdentityDifferences: string[];
  aestheticIdentityDifferences: string[];
  emotionalContrastDifferences: string[];
};

type ComparisonBlueprint = {
  label: string;
  keys: string[];
  strongerCompetitor: string;
  strongerYou: string;
  closeRead: string;
  sharpRead: string;
  visualTaste: string;
  tacticalMove: string;
  whyItMatters: string;
  retentionRead: string;
  sequenceFix: string;
  emotionalRead: string;
  direction: string;
};

const comparisonBlueprints: ComparisonBlueprint[] = [
  {
    label: "Hook strength",
    keys: ["hook", "profile clarity", "bio", "clarity"],
    strongerCompetitor:
      "The competitor gets to the point faster. The viewer understands the promise before the caption has to carry it.",
    strongerYou:
      "Your first impression is cleaner. Now make that clarity hit in the first frame, before the scroll decision happens.",
    closeRead:
      "The hook battle is close. The feed that opens with more motion, tension, or payoff will feel stronger.",
    sharpRead:
      "The payoff arrives after the viewer has already decided whether to stay.",
    visualTaste:
      "The stronger feed feels sensory before it feels informational: motion first, context second.",
    tacticalMove:
      "Cut the setup. Open on the moment the viewer would replay.",
    whyItMatters:
      "The payoff arrives after the scroll decision, so the post starts at a disadvantage.",
    retentionRead:
      "Movement, payoff, and tension all need to show up before the explanation starts carrying the post.",
    sequenceFix:
      "Open on movement, contrast, or the reaction shot. Let context arrive after the viewer already wants the answer.",
    emotionalRead:
      "The opening explains too quickly when it should create a little unresolved tension.",
    direction:
      "Compare first frames: movement, contrast, emotional reaction, and whether the viewer understands the payoff in under three seconds."
  },
  {
    label: "Posting consistency",
    keys: ["content consistency", "consistency", "posting"],
    strongerCompetitor:
      "The competitor feels easier to recognize because the content rhythm repeats more clearly.",
    strongerYou:
      "Your content rhythm has the stronger foundation; tighten the series formats so the audience knows what to expect next.",
    closeRead:
      "Posting rhythm is not the separator yet; stronger recurring formats will matter more than raw volume.",
    sharpRead:
      "The feed needs a recognizable pulse, not just more posts.",
    visualTaste:
      "A good rhythm feels like a series the audience can enter midstream and still understand.",
    tacticalMove:
      "Repeat one visual series twice before inventing another format.",
    whyItMatters:
      "Inconsistent rhythm makes every post feel like a reset. The audience never learns what kind of value to expect, so recognition and habit do not compound.",
    retentionRead:
      "The rhythm should repeat visually without making the feed feel copied.",
    sequenceFix:
      "Create two repeatable series: one proof-led, one education-led. Keep the first visual consistent, but rotate the story, example, and CTA.",
    emotionalRead:
      "Familiarity is doing the work here. People return when they know what kind of payoff the next post will give them.",
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
    sharpRead:
      "Proof has to arrive before the claim.",
    visualTaste:
      "The best authority posts feel witnessed, not announced.",
    tacticalMove:
      "Put the receipt on screen first, then explain why it matters.",
    whyItMatters:
      "Authority falls flat when the account claims expertise before showing evidence. Viewers need proof they can see, not credentials they have to trust on faith.",
    retentionRead:
      "Proof should appear early: process footage, before/after contrast, customer reactions, results, or visible expertise before the pitch.",
    sequenceFix:
      "Open with the proof frame, add one line of context, then explain the mechanism that created the result.",
    emotionalRead:
      "trust and risk reduction. The audience wants to feel safe choosing this option.",
    direction:
      "Audit how each account shows evidence: before/after moments, process footage, testimonials, credentials, and real audience reactions."
  },
  {
    label: "CTA strength",
    keys: ["cta", "conversion", "offer"],
    strongerCompetitor:
      "The competitor asks while the viewer is still warm, instead of waiting until the moment cools off.",
    strongerYou:
      "Your CTA structure is stronger; keep making the next step feel like a natural continuation of the post.",
    closeRead:
      "CTA clarity is close, so placement matters: the ask should appear on the strongest proof frame, not at the dead end.",
    sharpRead:
      "The ask is strongest while the viewer still feels the payoff.",
    visualTaste:
      "A clean CTA feels like the natural next shot, not a sales line pasted onto the end.",
    tacticalMove:
      "Drop the CTA while the proof frame is still alive.",
    whyItMatters:
      "CTA weakness hurts when the viewer emotionally understands the value but does not know what to do next. If the ask only lives in the bio or appears after the energy drops, intent leaks out.",
    retentionRead:
      "The CTA should be spoken, shown, captioned, and timed while the viewer still feels the payoff.",
    sequenceFix:
      "Place the CTA on the strongest proof or reveal frame. Use a low-friction action for warm viewers and a direct action for high-intent viewers.",
    emotionalRead:
      "The next step has to feel obvious while the proof is still on screen.",
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
    sharpRead:
      "The comment prompt needs a moment worth reacting to.",
    visualTaste:
      "Good engagement feels like the viewer is being invited into the scene, not asked to help the algorithm.",
    tacticalMove:
      "Ask the question after recognition lands, not before.",
    whyItMatters:
      "Engagement stays shallow when prompts ask for generic opinions instead of giving people a reason to reveal identity, preference, frustration, or intent.",
    retentionRead:
      "Watch whether the post creates a moment worth responding to before the question appears. A strong prompt lands after recognition, not before it.",
    sequenceFix:
      "Show the relatable moment first, then ask a specific question tied to the viewer's decision, obstacle, or desired outcome.",
    emotionalRead:
      "identity and participation. People comment when the post lets them say something about themselves.",
    direction:
      "Look for prompts that create real replies: choices, objections, identity signals, and moments people want to tag or save."
  },
  {
    label: "Local SEO/search intent",
    keys: ["seo", "search", "keyword", "local"],
    strongerCompetitor:
      "The competitor ties the content to local or search intent more cleanly.",
    strongerYou:
      "Your search and local intent signals are stronger; make those phrases feel native inside the first line and visual context.",
    closeRead:
      "Local/search signals are close, so natural phrasing beats keyword stuffing.",
    sharpRead:
      "The search phrase should feel like how a real person would ask for this.",
    visualTaste:
      "Local content works best when the place, problem, or craving is visible before the keyword appears.",
    tacticalMove:
      "Put the location or buyer-intent phrase in the first caption line and back it with a recognizable scene.",
    whyItMatters:
      "Search intent is weak when the account uses broad captions that do not match how buyers actually look for help, places, creators, or solutions.",
    retentionRead:
      "The search phrase belongs near the beginning, backed by a visual that proves the account fits the query.",
    sequenceFix:
      "Start with the recognizable local or category scene, use the search phrase naturally in the first sentence, then show proof tied to that exact intent.",
    emotionalRead:
      "relevance. The viewer should feel, 'This is for someone like me, right now, in this market.'",
    direction:
      "Compare location language, service/category phrases, neighborhood cues, and whether the first sentence answers a real search."
  },
  {
    label: "Emotional trigger usage",
    keys: ["content", "engagement", "trust", "offer"],
    strongerCompetitor:
      "The competitor gives the viewer a stronger emotional reason to stay.",
    strongerYou:
      "Your emotional positioning is stronger. Put it on screen through reactions, tension, payoff, and identity language.",
    closeRead:
      "Both accounts can push harder on emotion; the sharper identity cue will feel more memorable.",
    sharpRead:
      "The viewer understands the offer before they feel why it matters.",
    visualTaste:
      "Emotion lands through faces, friction, relief, status, and the moment something changes.",
    tacticalMove:
      "Show the feeling first, then let the offer explain it.",
    whyItMatters:
      "Emotion is the difference between information and movement. If the post explains the offer but never creates aspiration, relief, status, belonging, or urgency, viewers understand it without feeling pulled toward it.",
    retentionRead:
      "The emotional payoff has to arrive before the explanation gets heavy.",
    sequenceFix:
      "Open with the emotion, prove it with a real scene, then explain the offer after the viewer already feels the stakes.",
    emotionalRead:
      "The content has to show what changes for the viewer, not just what the account sells.",
    direction:
      "Look for aspiration, frustration, belonging, status, relief, transformation, and fear-of-missing-out cues in the first half of each post."
  },
  {
    label: "Visual strategy",
    keys: ["hook", "content", "retention", "authority"],
    strongerCompetitor:
      "The competitor creates visual momentum sooner, which makes the content feel more native to short-form platforms.",
    strongerYou:
      "Your visual strategy has stronger raw material; the next step is sequencing those moments with more cinematic pacing.",
    closeRead:
      "Visual strategy is close, so the account that opens with more motion, emotion, or contrast will feel stronger.",
    sharpRead:
      "The edit explains too early instead of letting curiosity breathe.",
    visualTaste:
      "The best frame is not always the prettiest frame. It is the one with motion, tension, or proof.",
    tacticalMove:
      "Hold the reveal one beat longer and cut out the dead air before it.",
    whyItMatters:
      "Visual strategy controls whether the viewer feels momentum. Static openings, late payoff, and slow context make the post feel like work instead of a scene worth watching.",
    retentionRead:
      "Analyze movement density, delayed reveals, visual payoff timing, editing rhythm, and whether tension releases at the moment curiosity peaks.",
    sequenceFix:
      "Start with the strongest visual, hold the reveal one beat longer, then land emotional proof before the CTA.",
    emotionalRead:
      "The viewer should feel the payoff coming and stay for the reveal.",
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
    sharpRead:
      "The feed needs fewer isolated posts and more recognizable arcs.",
    visualTaste:
      "Strong rhythm feels like proof, lesson, texture, offer. Not chaos, not repetition.",
    tacticalMove:
      "Build the week around one recurring proof format and one recurring audience moment.",
    whyItMatters:
      "A weak content rhythm makes the account feel reactive. A strong rhythm teaches the audience how to consume the brand: proof, lesson, emotion, offer, repeat.",
    retentionRead:
      "Each week should have a repeatable arc; otherwise every post asks the audience to recalibrate.",
    sequenceFix:
      "Build a weekly loop: hook-heavy proof, audience identity post, authority breakdown, then CTA-led conversion post.",
    emotionalRead:
      "momentum. The audience should feel the account is leading them somewhere.",
    direction:
      "Compare how often each account rotates between proof, education, audience reaction, and direct offer moments."
  },
  {
    label: "Audience identity language",
    keys: ["profile clarity", "bio", "offer", "local"],
    strongerCompetitor:
      "The competitor speaks to the audience's self-image more directly.",
    strongerYou:
      "Your audience language is stronger; keep making the viewer feel recognized in the first sentence.",
    closeRead:
      "Audience identity language is close, so specificity will decide which profile feels more personally relevant.",
    sharpRead:
      "Recognition has to land before the pitch.",
    visualTaste:
      "Identity shows up in the small details: who is in the room, what they are deciding, what they are afraid to waste.",
    tacticalMove:
      "Name the viewer's situation before naming the offer.",
    whyItMatters:
      "Audience language is weak when people can understand the offer but cannot recognize themselves in it. Specific identity cues make the content feel personal before it becomes persuasive.",
    retentionRead:
      "Name the viewer's situation before pitching the solution. Identity comes before the offer.",
    sequenceFix:
      "Lead with the audience's lived moment, show the tension they already feel, then introduce the brand as the bridge.",
    emotionalRead:
      "The viewer has to feel seen before they feel sold to.",
    direction:
      "Compare whether each account names the real buyer/viewer: their desire, hesitation, identity, location, or situation."
  },
  {
    label: "Emotional brand atmosphere",
    keys: ["bio", "content", "trust", "engagement", "offer"],
    strongerCompetitor:
      "The competitor sells more of the feeling around the brand, not just the thing being offered.",
    strongerYou:
      "Your brand atmosphere is clearer. Push that feeling harder so the account becomes easier to remember.",
    closeRead:
      "Both accounts explain what they do, but neither fully owns an atmosphere yet.",
    sharpRead:
      "The audience understands the offer, but not the room it lives in.",
    visualTaste:
      "Atmosphere is texture: sound, pace, faces, reactions, lighting, crowd energy, inside jokes, and the feeling of being there.",
    tacticalMove:
      "Make one post this week about the feeling around the brand, not the offer itself.",
    whyItMatters:
      "An account can be clear and still forgettable if the emotional tone never settles into a recognizable vibe.",
    retentionRead:
      "The brand should leave a mood behind after the video ends.",
    sequenceFix:
      "Lead with atmosphere, then reveal the product or offer inside that world.",
    emotionalRead:
      "The viewer should understand what it feels like to belong here.",
    direction:
      "Compare emotional tone, social energy, atmosphere, vibe consistency, and whether the brand feels like a place or personality people want to be around."
  },
  {
    label: "Memorability",
    keys: ["content", "profile clarity", "trust", "engagement"],
    strongerCompetitor:
      "The competitor leaves a stronger mental image after the post ends.",
    strongerYou:
      "Your account has more memorable raw material; it needs a more repeatable signature.",
    closeRead:
      "Neither account has a strong enough memory hook yet.",
    sharpRead:
      "Nothing sticks if every post resets the visual language.",
    visualTaste:
      "The strongest creators leave one image behind: a face, a phrase, a shot, a ritual, a sound, a recurring scene.",
    tacticalMove:
      "Choose one visual anchor and repeat it until the audience starts recognizing it before the caption.",
    whyItMatters:
      "Memorability is what makes people recall the account later, not just enjoy a post in the moment.",
    retentionRead:
      "A memorable account has a recurring cue the audience can picture after they close the app.",
    sequenceFix:
      "Give each post one signature image or phrase instead of trying to make every frame carry equal weight.",
    emotionalRead:
      "The best content leaves a residue: craving, confidence, curiosity, belonging, or status.",
    direction:
      "Compare visual anchors, recurring identity cues, signature edits, memorable moments, and whether the account has a recognizable emotional pattern."
  },
  {
    label: "Creator / brand presence",
    keys: ["authority", "trust", "bio", "content", "profile"],
    strongerCompetitor:
      "The competitor feels more present. The account has more personality behind the content.",
    strongerYou:
      "Your brand presence is stronger; let that confidence show more often instead of hiding behind information.",
    closeRead:
      "Both accounts could use more human presence.",
    sharpRead:
      "The viewer sees the product, but not enough of the personality behind it.",
    visualTaste:
      "Presence is confidence on camera, decisive captions, human voice, staff energy, creator POV, and the feeling that someone is actually leading the room.",
    tacticalMove:
      "Put a person, voice, or point of view closer to the front of the content.",
    whyItMatters:
      "Product-only content can inform people without making them feel connected to the brand.",
    retentionRead:
      "People follow personalities, confidence, and point of view faster than they follow polished information.",
    sequenceFix:
      "Open with the human angle, then use the product or proof to support it.",
    emotionalRead:
      "The account should feel like it comes from the brand, not just about the brand.",
    direction:
      "Compare personality, charisma, confidence, staff or creator energy, human voice, and whether the viewer feels a relationship forming."
  },
  {
    label: "Cultural / social identity",
    keys: ["local", "community", "engagement", "content", "seo"],
    strongerCompetitor:
      "The competitor feels more socially alive and easier to place inside a real community.",
    strongerYou:
      "Your local or cultural identity is clearer; make it feel more lived-in and less caption-dependent.",
    closeRead:
      "Both accounts could feel more culturally specific.",
    sharpRead:
      "The content could happen anywhere, which makes it harder to feel attached to.",
    visualTaste:
      "Cultural identity shows up in people, place, rituals, language, neighborhood cues, shared references, and the kind of energy followers want to claim.",
    tacticalMove:
      "Show the community around the offer, not just the offer.",
    whyItMatters:
      "Content becomes more contagious when it gives people a place, group, or identity to attach themselves to.",
    retentionRead:
      "The account should feel locally or socially specific enough that the right audience feels ownership.",
    sequenceFix:
      "Start with the social scene, then reveal the brand's role inside it.",
    emotionalRead:
      "Belonging is the lever here. People share what makes them feel part of something.",
    direction:
      "Compare local cues, cultural relevance, community feeling, social proof, aspirational identity, and whether the account feels emotionally contagious."
  },
  {
    label: "Aesthetic identity",
    keys: ["content", "profile", "visual", "brand", "style"],
    strongerCompetitor:
      "The competitor has a clearer aesthetic personality. The content feels more owned before the caption explains anything.",
    strongerYou:
      "Your aesthetic reads more intentional. It needs a sharper signature, not more polish.",
    closeRead:
      "Both accounts look presentable. Neither has a visual world that feels unmistakable yet.",
    sharpRead:
      "The content is clean, but not lived-in.",
    visualTaste:
      "This is the taste read: chaotic vs polished, sensory vs informational, raw vs commercial, cinematic vs transactional, intimate vs loud.",
    tacticalMove:
      "Choose a visual lane and let a few fingerprints stay in the frame.",
    whyItMatters:
      "Aesthetic identity makes the account recognizable before the viewer reads the name.",
    retentionRead:
      "If every post carries a different visual mood, the brand never settles in memory.",
    sequenceFix:
      "Repeat one aesthetic cue: lighting, camera distance, texture, edit rhythm, color, or social scene.",
    emotionalRead:
      "The account needs a look that feels owned, not assembled.",
    direction:
      "Compare whether each account feels chaotic or polished, sensory or informational, raw or commercial, cinematic or transactional, intimate or loud, social or product-focused."
  },
  {
    label: "Emotional contrast",
    keys: ["hook", "retention", "engagement", "content"],
    strongerCompetitor:
      "The competitor creates more emotional lift. The energy changes instead of staying flat.",
    strongerYou:
      "Your emotional contrast is stronger. Use the spike with more restraint so it feels intentional.",
    closeRead:
      "Both accounts stay too level in places. The reveal needs a bigger temperature change.",
    sharpRead:
      "Everything stays emotionally level. Nothing spikes.",
    visualTaste:
      "Good edits have temperature changes: calm, tension, release, noise, quiet, payoff.",
    tacticalMove:
      "Build one post around a spike: surprise, reaction, crowd sound, before/after, reveal.",
    whyItMatters:
      "Without contrast, even good content feels smaller than it should.",
    retentionRead:
      "The energy should rise or shift before the viewer gets comfortable.",
    sequenceFix:
      "Set the calm frame, break it, then pay it off.",
    emotionalRead:
      "The audience needs a small jolt, not just a clear message.",
    direction:
      "Compare emotional spikes, tension and release, escalation, surprise, payoff contrast, and whether the reveal feels bigger than the setup."
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
  const owner = label === "your" ? "Your account" : "The competitor";

  if (score >= 82) {
    return `${owner} has the sharper read here. Leave it lean and bring it forward.`;
  }

  if (score >= 68) {
    return `${owner} is stronger, but the idea still needs a more memorable shape.`;
  }

  if (score >= 52) {
    return `${owner} wins the comparison, not the room. There is still energy left on the table.`;
  }

  return `${owner} only looks cleaner because the other side is softer. Not dominant yet.`;
}

function accountName(snapshot: CompetitorSnapshot, fallback: string) {
  return snapshot.result.businessName || snapshot.profileData?.displayName || fallback;
}

function currentPattern(
  snapshot: CompetitorSnapshot,
  role: "your" | "competitor",
  dimension: string,
  signal: string,
  confidence: "appears to" | "likely" | "shows"
) {
  const name = role === "your" ? "Your account" : accountName(snapshot, "The competitor");
  const subject = confidence === "shows" ? name : `${name} ${confidence}`;

  if (dimension === "Hook strength") {
    return role === "your"
      ? `${subject} opens through explanation and positioning: ${signal}`
      : `${subject} gets the viewer into the point faster: ${signal}`;
  }

  if (dimension === "CTA strength") {
    return role === "your"
      ? `${subject} has a clearer ask than the competitor, but the ask still needs to land closer to the proof: ${signal}`
      : `${subject} uses the warmer moment more directly: ${signal}`;
  }

  if (dimension === "Emotional brand atmosphere") {
    return role === "your"
      ? `${subject} shows the offer more than the feeling around it: ${signal}`
      : `${subject} sells more of the room, mood, and social energy: ${signal}`;
  }

  if (dimension === "Memorability") {
    return role === "your"
      ? `${subject} has useful content, but the memory cue is still faint: ${signal}`
      : `${subject} leaves a more repeatable image or feeling behind: ${signal}`;
  }

  if (dimension === "Creator / brand presence") {
    return role === "your"
      ? `${subject} keeps personality slightly behind the product: ${signal}`
      : `${subject} feels more inhabited by a person, staff, or point of view: ${signal}`;
  }

  if (dimension === "Cultural / social identity") {
    return role === "your"
      ? `${subject} could make the local or social world more visible: ${signal}`
      : `${subject} feels easier to place inside a community: ${signal}`;
  }

  if (dimension === "Aesthetic identity") {
    return role === "your"
      ? `${subject} reads more functional than distinctive: ${signal}`
      : `${subject} has a more specific visual personality: ${signal}`;
  }

  if (dimension === "Emotional contrast") {
    return role === "your"
      ? `${subject} keeps the emotional temperature too even: ${signal}`
      : `${subject} creates more lift, surprise, or release: ${signal}`;
  }

  return role === "your"
    ? `${subject} carries this signal: ${signal}`
    : `${subject} pushes this signal differently: ${signal}`;
}

function differenceRead(
  blueprint: ComparisonBlueprint,
  scoreDelta: number,
  confidence: "appears to" | "likely" | "shows"
) {
  const dimension = blueprint.label;
  const competitorSubject =
    confidence === "shows" ? "The competitor" : `The competitor ${confidence}`;

  if (dimension === "Emotional brand atmosphere") {
    if (scoreDelta > 4) {
      return `${competitorSubject} sells the feeling of being there. Your side still feels more informational.`;
    }

    if (scoreDelta < -4) {
      return `Your atmosphere is doing more work. Keep that mood consistent enough to become recognizable.`;
    }

    return "Both accounts are clear enough. Neither fully owns the mood yet.";
  }

  if (dimension === "Memorability") {
    if (scoreDelta > 4) {
      return `${competitorSubject} leaves a stronger afterimage. Yours needs a recurring visual cue.`;
    }

    if (scoreDelta < -4) {
      return `Your account is more memorable here. Now make the signature impossible to miss.`;
    }

    return "The memory hook is still light on both sides.";
  }

  if (dimension === "Creator / brand presence") {
    if (scoreDelta > 4) {
      return `${competitorSubject} feels more present. Yours still reads like content about the brand more than content from the brand.`;
    }

    if (scoreDelta < -4) {
      return `Your presence is stronger. Use it with more confidence and less hiding behind polish.`;
    }

    return "Both accounts could use more human voltage.";
  }

  if (dimension === "Cultural / social identity") {
    if (scoreDelta > 4) {
      return `${competitorSubject} feels more socially alive. Yours could happen in more places than it should.`;
    }

    if (scoreDelta < -4) {
      return `Your world feels more specific. Lean into the local cues and shared rituals.`;
    }

    return "Neither account feels culturally sticky enough yet.";
  }

  if (dimension === "Aesthetic identity") {
    if (scoreDelta > 4) {
      return `${competitorSubject} has the more legible aesthetic. Your side feels cleaner than it feels owned.`;
    }

    if (scoreDelta < -4) {
      return `Your aesthetic has more character. Do not smooth out the parts people would remember.`;
    }

    return "Both accounts look fine. Fine is the problem.";
  }

  if (dimension === "Emotional contrast") {
    if (scoreDelta > 4) {
      return `${competitorSubject} creates more emotional change. Yours stays too even, so the reveal lands smaller.`;
    }

    if (scoreDelta < -4) {
      return `Your content has more emotional lift. Let the quiet beat make the spike feel bigger.`;
    }

    return "The energy stays level on both sides. Nothing really jumps out yet.";
  }

  if (scoreDelta > 4) {
    const opener =
      confidence === "shows"
        ? `The competitor has the stronger ${dimension.toLowerCase()} read.`
        : `The competitor ${confidence} ahead on ${dimension.toLowerCase()}.`;

    return `${opener} ${blueprint.sharpRead}`;
  }

  if (scoreDelta < -4) {
    const opener =
      confidence === "shows"
        ? `Your account is ahead on ${dimension.toLowerCase()}.`
        : `Your account ${confidence} ahead on ${dimension.toLowerCase()}.`;

    return `${opener} Keep the advantage. Do not overexplain it.`;
  }

  return `Both accounts are close on ${dimension.toLowerCase()}. The difference is taste now: what feels alive, specific, and worth remembering.`;
}

function adaptationRead(blueprint: ComparisonBlueprint, scoreDelta: number) {
  if (scoreDelta > 4) {
    return blueprint.tacticalMove;
  }

  if (scoreDelta < -4) {
    return blueprint.retentionRead;
  }

  return blueprint.visualTaste;
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
        : "No clear winner yet. The feed with the sharper first frame, cleaner proof beat, and better-timed ask will pull ahead.";

  return {
    label: blueprint.label,
    yourSignal,
    competitorSignal,
    yourPattern: currentPattern(
      yours,
      "your",
      blueprint.label,
      yourSignal,
      scanConfidenceLanguage(yours)
    ),
    competitorPattern: currentPattern(
      competitor,
      "competitor",
      blueprint.label,
      competitorSignal,
      scanConfidenceLanguage(competitor)
    ),
    difference: differenceRead(blueprint, scoreDelta, confidenceLanguage),
    adaptation: adaptationRead(blueprint, scoreDelta),
    strategicRead,
    sharpRead: blueprint.sharpRead,
    visualTaste: blueprint.visualTaste,
    whyItMatters: blueprint.whyItMatters,
    retentionRead: blueprint.retentionRead,
    sequenceFix: blueprint.sequenceFix,
    emotionalRead: blueprint.emotionalRead,
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
  if (dimension.scoreDelta > 4) {
    return `${dimension.label}: ${dimension.difference} ${dimension.adaptation}`;
  }

  return `${dimension.label}: ${dimension.adaptation}`;
}

function observationLine(dimension: CompetitorComparisonDimension) {
  if (Math.abs(dimension.scoreDelta) <= 4) {
    return `${dimension.adaptation}`;
  }

  return `${dimension.difference} ${dimension.adaptation}`;
}

function dimensionByLabel(dimensions: CompetitorComparisonDimension[], label: string) {
  return dimensions.find((dimension) => dimension.label === label) ?? dimensions[0];
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
  const hookDimension = dimensionByLabel(dimensions, "Hook strength");
  const ctaDimension = dimensionByLabel(dimensions, "CTA strength");
  const emotionalBrandDimension = dimensionByLabel(dimensions, "Emotional brand atmosphere");
  const memorabilityDimension = dimensionByLabel(dimensions, "Memorability");
  const presenceDimension = dimensionByLabel(dimensions, "Creator / brand presence");
  const culturalDimension = dimensionByLabel(dimensions, "Cultural / social identity");
  const aestheticDimension = dimensionByLabel(dimensions, "Aesthetic identity");
  const contrastDimension = dimensionByLabel(dimensions, "Emotional contrast");
  const yourVisualCue = yourPlan.contentPriorities[0] ?? "Make the opening frame clearer.";
  const competitorVisualCue =
    competitorPlan.contentPriorities[0] ?? "Competitor opens with a clearer visual promise.";

  return {
    yourNiche: yourPlan.niche,
    competitorNiche: competitorPlan.niche,
    dimensions,
    whatTheyDoBetter: competitorEdges.map(toActionSentence),
    whatYouDoBetter: yourEdges.map(toActionSentence),
    biggestOpportunityGap: `${largestGap.label}: ${largestGap.sharpRead} ${largestGap.sequenceFix}`,
    strategicStrengths: [
      ...yourEdges.map((dimension) => `${dimension.label}: ${dimension.adaptation}`),
      `Niche lock: your plan is reading as ${yourPlan.niche.label}, so keep the language native to that audience.`
    ].slice(0, 4),
    strategicWeaknesses: [
      ...competitorEdges.map(diagnosticOpportunity),
      "Do not copy the format. Change what the viewer feels first."
    ].slice(0, 4),
    visibilityGaps: dimensions
      .filter((dimension) => dimension.scoreDelta > 2)
      .slice(0, 4)
      .map((dimension) => `${dimension.label}: ${dimension.sharpRead ?? dimension.contentDirection}`),
    contentOpportunities: [
      `Create one post that sells the atmosphere before the offer. Let the room, hands, faces, texture, or screen movement carry the first beat.`,
      `Give the account one recurring cue people can recognize without reading the handle.`,
      `Put a stronger point of view near the front. Less content about the brand; more content from the brand.`
    ],
    hookStyleDifferences: [
      `Your feed reads this way: ${yourVisualCue}`,
      `The competitor reads this way: ${competitorVisualCue}`,
      observationLine(hookDimension)
    ],
    ctaDifferences: [
      `Your CTA behavior: ${dimensionSignal(yours.result, ["cta", "conversion", "offer"], "Your CTA signal is developing.")}`,
      `Competitor CTA behavior: ${dimensionSignal(competitor.result, ["cta", "conversion", "offer"], "Competitor CTA signal is developing.")}`,
      observationLine(ctaDimension)
    ],
    visualExecutionDifferences: [
      "Look at what hits first: movement, face, food pull, screen reveal, reaction, or explanation. The first frame tells you who understands the platform better.",
      "Cut before the viewer fully processes the frame. Let the second beat explain what the first beat made them feel.",
      "Drop the CTA while the proof is still alive on screen, not after the emotional peak has passed."
    ],
    audiencePsychologyDifferences: [
      `Your audience identity: ${yourPlan.niche.audience}`,
      `Competitor audience identity: ${competitorPlan.niche.audience}`,
      "The stronger account makes the viewer feel like the content belongs to their life, not just their feed."
    ],
    emotionalBrandDifferences: [
      observationLine(emotionalBrandDimension),
      emotionalBrandDimension.visualTaste,
      "The audience can understand the offer and still feel nothing about the place."
    ],
    memorabilityDifferences: [
      observationLine(memorabilityDimension),
      memorabilityDimension.visualTaste,
      "One image should survive the scroll."
    ],
    presenceDifferences: [
      observationLine(presenceDimension),
      presenceDimension.visualTaste,
      "The account needs a pulse, not just a posting schedule."
    ],
    culturalIdentityDifferences: [
      observationLine(culturalDimension),
      culturalDimension.visualTaste,
      "People share what says something about them."
    ],
    aestheticIdentityDifferences: [
      observationLine(aestheticDimension),
      aestheticDimension.visualTaste,
      "The content can be polished and still feel unowned. Give it fingerprints."
    ],
    emotionalContrastDifferences: [
      observationLine(contrastDimension),
      contrastDimension.visualTaste,
      "The reveal feels bigger when the energy changes first."
    ]
  };
}
