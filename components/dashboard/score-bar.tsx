import type { CSSProperties } from "react";

type ScoreBarProps = {
  label: string;
  score: number;
  benchmark: string;
  insight: string;
};

export function ScoreBar({ label, score, benchmark, insight }: ScoreBarProps) {
  const severity =
    score < 55 ? "Critical" : score < 70 ? "Priority" : score < 84 ? "Stable" : "Strong";

  return (
    <article className="interactive-card premium-surface min-w-0 max-w-full rounded-lg p-5 sm:p-6">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="text-anywhere text-xl font-black text-titan-ivory">{label}</h3>
          <p className="titan-copy text-anywhere mt-3 text-sm text-titan-ivory/62">
            {insight}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
          <span className="titan-chip bg-titan-gold/10 text-xs font-bold uppercase text-titan-bright">
            {benchmark}
          </span>
          <span className="titan-chip bg-white/10 text-xs font-black uppercase text-titan-ivory/70">
            {severity}
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
