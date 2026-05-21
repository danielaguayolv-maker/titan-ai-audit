import type { CSSProperties } from "react";

type ScoreBarProps = {
  label: string;
  score: number;
  benchmark: string;
  insight: string;
};

export function ScoreBar({ label, score, benchmark, insight }: ScoreBarProps) {
  return (
    <article className="interactive-card premium-surface min-w-0 max-w-full rounded-lg p-5">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-anywhere text-xl font-black text-titan-ivory">{label}</h3>
          <p className="text-anywhere mt-2 max-w-2xl text-sm leading-6 text-titan-ivory/62">
            {insight}
          </p>
        </div>
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <span className="max-w-full rounded-full bg-titan-gold/10 px-3 py-1 text-xs font-bold uppercase text-titan-bright">
            {benchmark}
          </span>
          <span className="text-2xl font-black text-titan-bright">{score}</span>
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10 shadow-inner">
        <div
          className="score-fill h-full rounded-full bg-gradient-to-r from-titan-muted via-titan-gold to-titan-bright"
          style={{ "--score-width": `${score}%` } as CSSProperties}
        />
      </div>
    </article>
  );
}
