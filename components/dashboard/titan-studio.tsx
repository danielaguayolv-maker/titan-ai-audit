"use client";

import type { AiAuditResult, AuditPlatform } from "@/lib/audit-ai";
import { createVisibilityContentPlan } from "@/lib/content-plan";

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
                Audit to 30-Day Visibility Plan
              </h1>
              <p className="mt-3 text-sm font-black uppercase text-titan-bright">
                AI-powered content execution and visibility workflow system.
              </p>
              <p className="text-anywhere mt-5 max-w-3xl text-lg leading-8 text-titan-ivory/66">
                Titan Studio turns the latest Visibility Audit into a practical
                publishing plan for {auditResult.businessName}. It prioritizes the
                weakest visibility signals first, then builds toward conversion.
              </p>
            </div>
            <div className="rounded-lg border border-titan-gold/15 bg-black/24 p-4">
              <p className="text-xs font-bold uppercase text-titan-muted">
                Intelligence source
              </p>
              <p className="mt-2 text-sm font-black uppercase text-titan-bright">
                {isUsingFallback ? "Readiness baseline" : "Latest AI audit"}
              </p>
              <p className="mt-2 text-sm text-titan-ivory/58">
                Score {Math.round(auditResult.overallScore)}/100 - Grade{" "}
                {auditResult.grade}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Weak areas
            </p>
            <div className="mt-5 grid gap-3">
              {plan.weakAreas.map((area) => (
                <div
                  className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={area}
                >
                  <p className="text-anywhere font-black text-titan-ivory">
                    {area}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-7 text-sm font-bold uppercase text-titan-muted">
              Content priorities
            </p>
            <div className="mt-4 grid gap-3">
              {plan.contentPriorities.map((priority) => (
                <p
                  className="text-anywhere rounded-lg border border-titan-gold/10 bg-titan-gold/10 p-4 text-sm leading-6 text-titan-ivory/72"
                  key={priority}
                >
                  {priority}
                </p>
              ))}
            </div>
          </article>

          <article className="premium-surface min-w-0 rounded-lg p-6 sm:p-7">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Publishing rhythm
            </p>
            <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory">
              {plan.postingFrequency}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.recommendedMix.map((item) => (
                <div
                  className="rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                  key={item.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-titan-ivory">{item.label}</p>
                    <span className="rounded-full bg-titan-gold px-3 py-1 text-xs font-black text-black">
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
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ContentList title="Hooks" items={plan.hooks} />
          <ContentList title="Short scripts" items={plan.scripts} />
          <ContentList title="Captions" items={plan.captions} />
          <ContentList title="CTA suggestions" items={plan.ctas} />
        </div>

        <article className="premium-surface mt-5 min-w-0 rounded-lg p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Weekly posting schedule
          </p>
          <h2 className="mt-3 text-3xl font-black text-titan-ivory sm:text-4xl">
            30-day execution map
          </h2>
          <div className="mt-7 grid gap-4 xl:grid-cols-4">
            {plan.weeklySchedule.map((week) => (
              <div
                className="min-w-0 rounded-lg border border-titan-gold/10 bg-black/24 p-4"
                key={week.week}
              >
                <p className="text-xs font-bold uppercase text-titan-muted">
                  {week.week}
                </p>
                <h3 className="text-anywhere mt-2 text-xl font-black text-titan-bright">
                  {week.focus}
                </h3>
                <div className="mt-4 grid gap-3">
                  {week.posts.map((post) => (
                    <div
                      className="rounded-md border border-white/10 bg-white/[0.03] p-3"
                      key={`${week.week}-${post.day}`}
                    >
                      <p className="text-xs font-black uppercase text-titan-ivory/50">
                        {post.day} - {post.format}
                      </p>
                      <p className="text-anywhere mt-2 text-sm font-bold leading-6 text-titan-ivory">
                        {post.topic}
                      </p>
                      <p className="text-anywhere mt-2 text-xs leading-5 text-titan-ivory/54">
                        {post.goal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function ContentList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="premium-surface min-w-0 rounded-lg p-6">
      <p className="text-sm font-bold uppercase text-titan-bright">{title}</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <p
            className="text-anywhere rounded-lg border border-titan-gold/10 bg-black/24 p-4 text-sm leading-6 text-titan-ivory/70"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
