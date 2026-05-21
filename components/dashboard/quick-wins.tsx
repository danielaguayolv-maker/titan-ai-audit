import type { AiQuickWin } from "@/lib/audit-ai";

type QuickWinsProps = {
  quickWins: AiQuickWin[];
};

export function QuickWins({ quickWins }: QuickWinsProps) {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-sm font-bold uppercase text-titan-muted">Quick wins</p>
        <h2 className="text-anywhere mt-3 max-w-3xl text-3xl font-black text-titan-ivory sm:text-5xl">
          Three moves that can sharpen lead capture fast.
        </h2>

        <div className="mt-9 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
          {quickWins.map((win) => (
            <article
              className="interactive-card premium-surface min-w-0 max-w-full rounded-lg p-6"
              key={win.title}
            >
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-titan-gold px-3 py-1 text-xs font-black uppercase text-black">
                  {win.impact}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-titan-ivory/70">
                  {win.effort} effort
                </span>
              </div>
              <h3 className="text-anywhere text-2xl font-black text-titan-ivory">{win.title}</h3>
              <p className="text-anywhere mt-4 leading-7 text-titan-ivory/64">{win.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
