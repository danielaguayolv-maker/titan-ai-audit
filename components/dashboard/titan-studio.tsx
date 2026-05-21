"use client";

import type { AiAuditResult, AuditPlatform } from "@/lib/audit-ai";
import {
  createVisibilityContentPlan,
  type WeeklyVisibilityPlan
} from "@/lib/content-plan";

type TitanStudioProps = {
  auditResult: AiAuditResult;
  platform: AuditPlatform;
  isUsingFallback: boolean;
};

export function TitanStudio({
  auditResult,
  platform,
  isUsingFallback
}: TitanStudioProps) {
  const plan = createVisibilityContentPlan(auditResult, platform);

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
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Niche intelligence profile
            </p>
            <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
              {plan.niche.label}
            </h2>
            <p className="text-anywhere mt-4 leading-7 text-titan-ivory/64">
              {plan.niche.audience}
            </p>
            <div className="mt-5 grid gap-3">
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
