"use client";

import { useEffect, useMemo, useState } from "react";
import type { AiAuditResult, AuditPlatform } from "@/lib/audit-ai";
import {
  createVisibilityContentPlan,
  type VisibilityContentPlan,
  type VisibilityPlanContext,
  type WeeklyVisibilityPlan
} from "@/lib/content-plan";
import {
  createVisibilityEvolutionReport,
  createVisibilityMemoryReport,
  normalizeAccountKey,
  readVisibilityMemoryEntries,
  type VisibilityMemoryEntry
} from "@/lib/visibility-memory";
import {
  makeAuditWorkspaceKey,
  titanStudioPlanStorageKey,
  writeJsonStorage,
  type PersistedTitanStudioPlan
} from "@/lib/workspace-persistence";

type TitanStudioProps = {
  auditResult: AiAuditResult;
  context?: VisibilityPlanContext;
  platform: AuditPlatform;
  isUsingFallback: boolean;
  onClearResults: () => void;
  memoryAccountKey: string;
  memoryEntriesSnapshot: VisibilityMemoryEntry[];
};

type AdaptiveStudioIntelligence = {
  confidenceLabel: "High confidence" | "Moderate confidence" | "Emerging pattern" | "Weak pattern";
  confidenceSummary: string;
  generationReasons: string[];
  adaptiveHooks: string[];
  adaptiveScripts: string[];
  adaptiveCtas: string[];
  adaptiveCaptions: string[];
  adaptivePriorities: string[];
};

function firstUseful(items: string[], fallback: string) {
  return items.find(Boolean) ?? fallback;
}

function sentenceCase(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed;
}

function removeLeadingOpenWith(value: string) {
  return value
    .replace(/^Likely winning structure:\s*/i, "")
    .replace(/^open with\s+/i, "")
    .trim();
}

function nicheSpecificCtas(plan: VisibilityContentPlan, primaryTrigger: string) {
  if (plan.niche.id === "restaurants") {
    return [
      "Reserve tonight",
      "Visit us this weekend",
      "Order online",
      "Tag who you'd bring",
      "Save this for dinner",
      "Call to book"
    ];
  }

  if (plan.niche.id === "realtors") {
    return [
      "Book a showing",
      "Save this neighborhood breakdown",
      "DM for the listing details",
      "Send this to someone house hunting"
    ];
  }

  if (plan.niche.id === "fitness") {
    return [
      "Save this for your next workout",
      "DM 'START' for coaching",
      "Tag your training partner",
      "Book your first session"
    ];
  }

  if (plan.niche.id === "med-spas") {
    return [
      "Book a consultation",
      "Save this before your next treatment",
      "DM us your skin goal",
      "Call to schedule"
    ];
  }

  return [
    `Act while the ${primaryTrigger} moment is still fresh.`,
    "Save this before the decision moment passes.",
    "Tag the person who needs this",
    "Book the next step"
  ];
}

function createAdaptiveStudioIntelligence(
  plan: VisibilityContentPlan,
  memoryReport: ReturnType<typeof createVisibilityMemoryReport>,
  evolutionReport: ReturnType<typeof createVisibilityEvolutionReport>
): AdaptiveStudioIntelligence {
  const hasHistory = memoryReport.auditCount > 0;
  const hasPattern = memoryReport.auditCount >= 2;
  const confidenceLabel =
    memoryReport.auditCount >= 3
      ? "High confidence"
      : memoryReport.auditCount === 2
        ? "Moderate confidence"
        : memoryReport.auditCount === 1
          ? "Emerging pattern"
          : "Weak pattern";
  const triggerRead = firstUseful(
    memoryReport.emotionalPatterns,
    `Audience psychology is currently anchored in ${plan.niche.emotionalTriggers[0]}.`
  );
  const winningStructure = firstUseful(
    memoryReport.predictiveSignals,
    "Likely winning structure: put the most human or sensory moment first."
  );
  const repeatedWin = firstUseful(
    memoryReport.repeatedWins,
    "The account wins when the opening feels specific instead of generic."
  );
  const repeatedWeakness = firstUseful(
    memoryReport.persistentWeaknesses,
    firstUseful(plan.weakAreas, "The account needs a sharper repeated signal.")
  );
  const identityRead = firstUseful(
    evolutionReport.identityEvolution,
    firstUseful(memoryReport.identityAnalysis, "The account is still developing a recognizable identity.")
  );
  const momentumRead = firstUseful(
    evolutionReport.momentumAnalysis,
    "Momentum is still being established."
  );
  const ctaRead = firstUseful(
    memoryReport.pacingHabits,
    "CTA timing should land while the strongest emotional moment is still active."
  );
  const audience = sentenceCase(plan.niche.audienceContexts[0] ?? plan.niche.audience);
  const primaryTrigger = plan.niche.emotionalTriggers[0] ?? "belonging";
  const secondaryTrigger = plan.niche.emotionalTriggers[1] ?? "aspiration";
  const winningOpening = removeLeadingOpenWith(winningStructure);
  const adaptiveCtas = nicheSpecificCtas(plan, primaryTrigger);

  return {
    confidenceLabel,
    confidenceSummary: hasHistory
      ? `${confidenceLabel}: Titan Studio is adapting this plan from ${memoryReport.auditCount} remembered audit${memoryReport.auditCount === 1 ? "" : "s"}, movement signals, and account-specific behavior.`
      : "Weak pattern: no saved account memory yet, so Titan Studio is using the current audit as the starting intelligence layer.",
    generationReasons: [
      hasPattern
        ? "Generated from recurring audience response patterns."
        : "Generated from the latest audit while memory history is still forming.",
      `This structure matches the account read: ${triggerRead}`,
      `Predictive strategy input: ${winningStructure}`,
      `Momentum read: ${momentumRead}`
    ],
    adaptiveHooks: [
      `${confidenceLabel}: ${repeatedWin}`,
      `Open with the ${primaryTrigger} moment before the explanation shows up.`,
      `${audience} should feel the scene before they understand the offer.`,
      `Pattern interrupt: show the reaction first, then let the context catch up.`
    ],
    adaptiveScripts: [
      `Open with ${winningOpening}.`,
      `Delay explanation until after emotional tension forms around ${primaryTrigger}.`,
      `${identityRead} Build the script around that fingerprint instead of starting from a blank template.`,
      `Use the first beat for atmosphere, the second beat for proof, and land "${adaptiveCtas[0]}" while the moment still has heat.`
    ],
    adaptiveCtas,
    adaptiveCaptions: [
      `The audience does not need more information first. They need to feel why it matters.`,
      `${repeatedWeakness}`,
      `This post is built around ${secondaryTrigger}, not another generic content prompt.`,
      `Make the strongest emotional cue easy to name, save, and share.`
    ],
    adaptivePriorities: [
      repeatedWeakness,
      `Protect the recurring win: ${repeatedWin}`,
      `Use the current identity read: ${identityRead}`,
      `Build from predictive strategy: ${winningStructure}`
    ]
  };
}

function mergeTop(baseItems: string[], adaptiveItems: string[], limit = 5) {
  return [...new Set([...adaptiveItems, ...baseItems])].slice(0, limit);
}

function adaptVisibilityPlan(
  plan: VisibilityContentPlan,
  intelligence: AdaptiveStudioIntelligence
): VisibilityContentPlan {
  return {
    ...plan,
    hookTaxonomy: plan.hookTaxonomy.map((group, index) => ({
      ...group,
      hooks:
        index === 0
          ? mergeTop(group.hooks, intelligence.adaptiveHooks, 6)
          : group.hooks
    })),
    contentPriorities: mergeTop(
      plan.contentPriorities,
      intelligence.adaptivePriorities,
      6
    ),
    weeklySchedule: plan.weeklySchedule.map((week, index) => ({
      ...week,
      strategy:
        index === 0
          ? `${week.strategy} ${intelligence.generationReasons[0]}`
          : week.strategy,
      hookIdeas: mergeTop(week.hookIdeas, [intelligence.adaptiveHooks[index % intelligence.adaptiveHooks.length]], 4),
      videoScriptConcepts: mergeTop(
        week.videoScriptConcepts,
        [intelligence.adaptiveScripts[index % intelligence.adaptiveScripts.length]],
        4
      ),
      captionIdeas: mergeTop(
        week.captionIdeas,
        [intelligence.adaptiveCaptions[index % intelligence.adaptiveCaptions.length]],
        4
      ),
      ctaSuggestions: mergeTop(
        week.ctaSuggestions,
        [intelligence.adaptiveCtas[index % intelligence.adaptiveCtas.length]],
        4
      ),
      visibilityPriorities: mergeTop(
        week.visibilityPriorities,
        [intelligence.adaptivePriorities[index % intelligence.adaptivePriorities.length]],
        4
      )
    }))
  };
}

export function TitanStudio({
  auditResult,
  context,
  platform,
  isUsingFallback,
  onClearResults,
  memoryAccountKey,
  memoryEntriesSnapshot
}: TitanStudioProps) {
  const [storedMemoryEntries, setStoredMemoryEntries] = useState<
    VisibilityMemoryEntry[]
  >([]);
  const memoryEntries =
    memoryEntriesSnapshot.length > 0 ? memoryEntriesSnapshot : storedMemoryEntries;
  const accountKey =
    memoryAccountKey ||
    normalizeAccountKey(
      context?.formData?.profileUrl ?? context?.profileData?.profileUrl ?? "",
      auditResult.businessName
    );
  const basePlan = useMemo(
    () => createVisibilityContentPlan(auditResult, platform, context),
    [auditResult, context, platform]
  );
  const memoryReport = useMemo(
    () => createVisibilityMemoryReport(memoryEntries, accountKey),
    [accountKey, memoryEntries]
  );
  const evolutionReport = useMemo(
    () => createVisibilityEvolutionReport(memoryEntries, accountKey),
    [accountKey, memoryEntries]
  );
  const adaptiveIntelligence = useMemo(
    () => createAdaptiveStudioIntelligence(basePlan, memoryReport, evolutionReport),
    [basePlan, evolutionReport, memoryReport]
  );
  const plan = useMemo(
    () => adaptVisibilityPlan(basePlan, adaptiveIntelligence),
    [adaptiveIntelligence, basePlan]
  );

  useEffect(() => {
    setStoredMemoryEntries(readVisibilityMemoryEntries());
  }, []);

  useEffect(() => {
    if (isUsingFallback) {
      return;
    }

    writeJsonStorage<PersistedTitanStudioPlan>(titanStudioPlanStorageKey, {
      savedAt: new Date().toISOString(),
      auditKey: makeAuditWorkspaceKey(
        auditResult,
        context?.formData?.profileUrl ?? context?.profileData?.profileUrl ?? ""
      ),
      plan
    });
  }, [auditResult, context, isUsingFallback, plan]);

  return (
    <section className="px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="premium-surface min-w-0 rounded-lg p-6 shadow-gold sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Titan Studio
              </p>
              <h1 className="text-anywhere mt-3 text-4xl font-black leading-tight text-titan-ivory sm:text-6xl">
                Generate 30-Day Visibility Plan
              </h1>
              <p className="mt-3 text-sm font-black uppercase text-titan-bright">
                AI-powered content execution and visibility workflow system.
              </p>
              <p className="text-anywhere mt-5 max-w-3xl text-lg leading-8 text-titan-ivory/66">
                Titan Studio converts the latest Visibility Audit into a
                strategic growth roadmap for {auditResult.businessName}. The
                plan prioritizes weak hooks, posting consistency, authority,
                CTAs, engagement quality, local search intent, and content gaps.
              </p>
            </div>
            <div className="rounded-lg border border-titan-gold/15 bg-black/24 p-4">
              <p className="text-xs font-bold uppercase text-titan-muted">
                Intelligence source
              </p>
              <p className="mt-2 text-sm font-black uppercase text-titan-bright">
                {isUsingFallback ? "Readiness baseline" : "Latest Visibility Audit"}
              </p>
              <p className="mt-2 text-sm text-titan-ivory/58">
                Score {Math.round(auditResult.overallScore)}/100 - Grade{" "}
                {auditResult.grade}
              </p>
              <div className="mt-4 rounded-md border border-titan-gold/15 bg-titan-gold/10 p-3">
                <p className="text-[11px] font-black uppercase text-titan-muted">
                  Detected Niche
                </p>
                <p className="text-anywhere mt-1 text-sm font-black text-titan-bright">
                  {plan.niche.label}
                </p>
                <p className="mt-1 text-xs font-bold uppercase text-titan-ivory/50">
                  {plan.niche.confidence}% confidence
                </p>
              </div>
              {!isUsingFallback ? (
                <button
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-titan-gold/20 bg-white/[0.03] px-4 text-[11px] font-black uppercase text-titan-ivory/70 transition hover:border-titan-bright hover:text-titan-bright"
                  onClick={onClearResults}
                  type="button"
                >
                  Clear Current Results
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <article className="premium-surface mt-5 min-w-0 rounded-lg p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-titan-muted">
                Adaptive Titan Studio
              </p>
              <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
                Generated from Visibility Intelligence.
              </h2>
              <p className="text-anywhere mt-4 max-w-3xl text-sm leading-6 text-titan-ivory/62">
                Titan Studio is reading account memory, evolution movement,
                emotional patterns, recurring wins, recurring losses, and
                predictive strategy before shaping hooks, scripts, CTAs, captions,
                and the 30-day roadmap.
              </p>
            </div>
            <span className="h-fit rounded-full border border-titan-gold/20 bg-titan-gold/10 px-4 py-2 text-xs font-black uppercase text-titan-bright">
              {adaptiveIntelligence.confidenceLabel}
            </span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-lg border border-titan-gold/10 bg-black/24 p-4">
              <p className="text-xs font-black uppercase text-titan-muted">
                Strategic confidence
              </p>
              <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/68">
                {adaptiveIntelligence.confidenceSummary}
              </p>
              <div className="mt-4 grid gap-2">
                {adaptiveIntelligence.generationReasons.map((reason) => (
                  <p
                    className="text-anywhere rounded-md bg-white/[0.035] p-3 text-sm leading-6 text-titan-ivory/62"
                    key={reason}
                  >
                    {reason}
                  </p>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdaptivePreview
                title="Adaptive hooks"
                items={adaptiveIntelligence.adaptiveHooks}
              />
              <AdaptivePreview
                title="Adaptive CTAs"
                items={adaptiveIntelligence.adaptiveCtas}
              />
              <AdaptivePreview
                title="Script direction"
                items={adaptiveIntelligence.adaptiveScripts}
              />
              <AdaptivePreview
                title="Caption logic"
                items={adaptiveIntelligence.adaptiveCaptions}
              />
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Niche intelligence profile
            </p>
            <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
              Detected Niche: {plan.niche.label}
            </h2>
            <p className="text-anywhere mt-4 leading-7 text-titan-ivory/64">
              {plan.niche.audience}
            </p>
            <div className="mt-5 grid gap-3">
              <PillGroup title="Audience identity contexts" items={plan.niche.audienceContexts.slice(0, 8)} />
              <PillGroup title="Emotional triggers" items={plan.niche.emotionalTriggers} />
              <PillGroup title="Search phrases to seed into content" items={plan.niche.searchPhrases} />
            </div>
          </article>

          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Visibility intelligence map
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {plan.visibilitySignals.map((signal) => (
                <div
                  className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={signal.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-anywhere font-black text-titan-ivory">
                      {signal.label}
                    </p>
                    <span className="rounded-full bg-titan-gold px-3 py-1 text-xs font-black text-black">
                      {signal.score}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase text-titan-muted">
                    {signal.status}
                  </p>
                  <p className="text-anywhere mt-3 text-sm leading-6 text-titan-ivory/62">
                    {signal.insight}
                  </p>
                  <div className="mt-4 grid gap-2">
                    <SignalDiagnostic title="Why it matters" text={signal.whyItMatters} />
                    <SignalDiagnostic title="Attention leak" text={signal.attentionLeak} />
                    <SignalDiagnostic title="Sequence fix" text={signal.sequenceFix} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Execution strategy
            </p>
            <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
              {plan.postingFrequency}
            </h2>
            <div className="mt-6 grid gap-3">
              {plan.contentPriorities.map((priority) => (
                <p
                  className="text-anywhere rounded-lg border border-titan-gold/10 bg-titan-gold/10 p-4 text-sm leading-6 text-titan-ivory/72"
                  key={priority}
                >
                  {priority}
                </p>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.recommendedMix.map((item) => (
                <div
                  className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={item.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-titan-ivory">{item.label}</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-titan-bright">
                      {item.share}
                    </span>
                  </div>
                  <p className="text-anywhere mt-3 text-sm leading-6 text-titan-ivory/62">
                    {item.purpose}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Hook taxonomy
            </p>
            <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
              Categorized hooks for stronger creative variation
            </h2>
            <div className="mt-6 grid gap-3">
              {plan.hookTaxonomy.map((group) => (
                <div
                  className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={group.category}
                >
                  <p className="text-xs font-black uppercase text-titan-bright">
                    {group.category}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {group.hooks.map((hook) => (
                      <p
                        className="text-anywhere rounded-md bg-white/[0.035] p-3 text-sm leading-6 text-titan-ivory/66"
                        key={hook}
                      >
                        {hook}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="premium-surface mt-5 min-w-0 rounded-lg p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Strategic growth roadmap
          </p>
          <h2 className="mt-3 text-3xl font-black text-titan-ivory sm:text-4xl">
            30-day visibility plan
          </h2>
          <p className="text-anywhere mt-4 max-w-3xl leading-7 text-titan-ivory/62">
            Each week compounds the audit intelligence: clarify visibility,
            stabilize content rhythm, build authority, then convert attention
            into leads.
          </p>
          <div className="mt-7 grid gap-5">
            {plan.weeklySchedule.map((week) => (
              <WeekPlanCard key={week.week} week={week} />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function WeekPlanCard({ week }: { week: WeeklyVisibilityPlan }) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/15 bg-black/24 p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-titan-muted">
            {week.week}
          </p>
          <h3 className="text-anywhere mt-2 text-2xl font-black text-titan-bright">
            {week.objective}
          </h3>
          <p className="text-anywhere mt-4 leading-7 text-titan-ivory/68">
            {week.strategy}
          </p>

          <div className="mt-5 grid gap-3">
            <MiniList title="Hook ideas" items={week.hookIdeas} />
            <MiniList title="CTA suggestions" items={week.ctaSuggestions} />
            <MiniList title="Visibility improvement priorities" items={week.visibilityPriorities} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Daily posting recommendations
          </p>
          <div className="mt-4 grid gap-3">
            {week.dailyPosts.map((post) => (
              <div
                className="rounded-md border border-white/10 bg-white/[0.03] p-4"
                key={`${week.week}-${post.day}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-titan-gold px-3 py-1 text-xs font-black text-black">
                    {post.day}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/64">
                    {post.format}
                  </span>
                  <span className="rounded-full border border-titan-gold/15 bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright">
                    {post.visibilitySignal}
                  </span>
                </div>
                <p className="text-anywhere mt-3 font-bold leading-6 text-titan-ivory">
                  {post.topic}
                </p>
                <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/58">
                  {post.goal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <MiniList title="Video/script concepts" items={week.videoScriptConcepts} />
        <MiniList title="Caption ideas" items={week.captionIdeas} />
        <MiniList title="Engagement tasks" items={week.engagementTasks} />
      </div>
    </div>
  );
}

function AdaptivePreview({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-4">
      <p className="text-xs font-black uppercase text-titan-muted">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.slice(0, 3).map((item) => (
          <p
            className="text-anywhere rounded-md bg-white/[0.035] p-3 text-sm leading-6 text-titan-ivory/66"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase text-titan-muted">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <p
            className="text-anywhere rounded-md bg-white/[0.035] p-3 text-sm leading-6 text-titan-ivory/66"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function SignalDiagnostic({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-titan-gold/10 bg-white/[0.03] p-3">
      <p className="text-[11px] font-black uppercase text-titan-bright">
        {title}
      </p>
      <p className="text-anywhere mt-1 text-xs leading-5 text-titan-ivory/58">
        {text}
      </p>
    </div>
  );
}

function PillGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-titan-gold/10 bg-black/24 p-4">
      <p className="text-xs font-black uppercase text-titan-muted">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            className="text-anywhere rounded-full border border-titan-gold/15 bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright"
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
