import type { AiAuditCategoryScore } from "@/lib/audit-ai";
import { ScoreBar } from "./score-bar";

type CategoryScoresProps = {
  categories: AiAuditCategoryScore[];
};

export function CategoryScores({ categories }: CategoryScoresProps) {
  if (categories.length === 0) {
    return (
      <section className="border-y border-titan-gold/10 bg-black/28 px-5 py-16 sm:px-8">
        <div className="premium-surface mx-auto w-full max-w-7xl rounded-lg p-8 text-center">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Category scores
          </p>
          <h2 className="mt-3 text-3xl font-black text-titan-ivory">
            Audit scores are waiting for input.
          </h2>
          <p className="titan-copy mx-auto mt-4 text-titan-ivory/62">
            Once a business profile is scored, category diagnostics will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-titan-gold/10 bg-black/28 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-titan-muted">
              Category scores
            </p>
            <h2 className="text-anywhere mt-3 text-3xl font-black text-titan-ivory sm:text-5xl">
              Platform-specific scorecard.
            </h2>
          </div>
          <p className="titan-copy min-w-0 text-sm text-titan-ivory/58">
            Category labels and explanations update based on the selected audit
            mode, then refresh again when the AI audit returns.
          </p>
        </div>

        <div className="mt-9 grid min-w-0 gap-4">
          {categories.map((category) => (
            <ScoreBar
              benchmark={category.benchmark}
              insight={category.insight}
              key={`${category.name}-${category.score}`}
              label={category.name}
              score={category.score}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
