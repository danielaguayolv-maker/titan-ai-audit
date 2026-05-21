import type { CSSProperties } from "react";
import type { AiAuditResult } from "@/lib/audit-ai";

type ScoreSummaryProps = {
  auditResult: AiAuditResult;
  isUsingFallback: boolean;
};

export function ScoreSummary({ auditResult, isUsingFallback }: ScoreSummaryProps) {
  const categories = auditResult.categoryScores;
  const topCategory =
    categories.length > 0
      ? categories.reduce((best, category) =>
          category.score > best.score ? category : best
        )
      : null;
  const lowestCategory =
    categories.length > 0
      ? categories.reduce((lowest, category) =>
          category.score < lowest.score ? category : lowest
        )
      : null;
  const overallScore = Math.max(0, Math.min(100, Math.round(auditResult.overallScore)));

  return (
    <section className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,1.08fr)]">
      <div className="subtle-grid pointer-events-none absolute inset-x-0 top-0 h-72" />
      <div className="fade-up premium-surface relative min-w-0 max-w-full rounded-lg p-6 sm:p-8">
        <p className="text-sm font-bold uppercase text-titan-muted">
          Audit dashboard
        </p>
        <h1 className="text-anywhere mt-4 text-3xl font-black leading-tight text-titan-ivory sm:text-5xl xl:text-6xl">
          <span className="block max-w-full">{auditResult.businessName}</span>
          <span className="gold-text block">AI readiness score</span>
        </h1>
        <p className="text-anywhere mt-5 max-w-2xl text-lg leading-8 text-titan-ivory/66">
          {auditResult.personalizedDiagnosis}
        </p>
      </div>

      <div className="fade-up relative grid min-w-0 max-w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 [animation-delay:120ms]">
        <div className="luxury-border min-w-0 max-w-full rounded-lg bg-titan-gold p-6 text-black shadow-gold">
          <p className="text-sm font-black uppercase">Overall score</p>
          <div className="mt-5 flex min-w-0 items-end gap-3">
            <p className="text-6xl font-black leading-none sm:text-7xl">{overallScore}</p>
            <p className="pb-2 text-lg font-black">/100</p>
          </div>
          <p className="mt-3 inline-flex rounded-full bg-black/15 px-3 py-1 text-sm font-black uppercase">
            Grade {auditResult.grade}
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              key={overallScore}
              className="score-fill h-full rounded-full bg-black"
              style={{ "--score-width": `${overallScore}%` } as CSSProperties}
            />
          </div>
          <p className="mt-3 font-bold">
            {isUsingFallback ? "Local fallback score" : "Updated from latest AI audit"}
          </p>
        </div>
        {topCategory ? (
          <div className="interactive-card premium-surface min-w-0 max-w-full rounded-lg p-6">
            <p className="text-sm font-bold uppercase text-titan-muted">Strongest area</p>
            <p className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">{topCategory.name}</p>
            <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/62">
              Score {topCategory.score}: {topCategory.insight}
            </p>
          </div>
        ) : null}
        {lowestCategory ? (
          <div className="interactive-card premium-surface min-w-0 max-w-full rounded-lg p-6">
            <p className="text-sm font-bold uppercase text-titan-muted">Priority gap</p>
            <p className="text-anywhere mt-3 text-2xl font-black text-titan-ivory">{lowestCategory.name}</p>
            <p className="text-anywhere mt-2 text-sm leading-6 text-titan-ivory/62">
              Score {lowestCategory.score}: {lowestCategory.insight}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
