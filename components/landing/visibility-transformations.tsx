import { visibilityTransformations } from "@/lib/landing-data";
import { CtaButton } from "./cta-button";

const mediaSlots = ["photo", "video", "analytics", "content"];
const mediaDescriptions = {
  analytics: "performance proof",
  content: "post samples",
  photo: "brand imagery",
  video: "short-form clips"
};

export function VisibilityTransformations() {
  return (
    <section
      id="transformations"
      className="relative border-y border-titan-gold/10 bg-black/35 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="subtle-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-titan-muted">
              Visibility Transformations
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-titan-ivory sm:text-5xl">
              Strategy work that turns attention into{" "}
              <span className="gold-text">visible momentum.</span>
            </h2>
          </div>
          <p className="titan-copy text-base text-titan-ivory/68 sm:text-lg">
            Titan Visibility OS sits behind the strategy: reading audience
            behavior, offer clarity, emotional triggers, and movement signals so
            each brand knows what to fix, what to test, and where visibility is
            beginning to shift.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {visibilityTransformations.map((study, index) => (
            <article
              className="interactive-card premium-surface group overflow-hidden rounded-lg"
              key={study.clientName}
            >
              <div className="grid min-h-full gap-0 md:grid-cols-[0.92fr_1.08fr]">
                <div className="relative min-h-64 border-b border-titan-gold/10 bg-black/45 p-5 md:border-b-0 md:border-r">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(244,211,123,0.18),transparent_18rem)]" />
                  <div className="relative flex h-full flex-col justify-between gap-8">
                    <div>
                      <div className="mb-5 inline-flex rounded-full border border-titan-gold/20 bg-titan-gold/10 px-3 py-1 text-xs font-black uppercase text-titan-bright">
                        Case 0{index + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {mediaSlots.map((slot) => (
                          <div
                            className="rounded-lg border border-titan-gold/18 bg-black/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                            key={slot}
                          >
                            <div className="mb-3 flex h-16 items-center justify-center rounded-md border border-dashed border-titan-gold/20 bg-gradient-to-br from-titan-gold/18 via-white/[0.035] to-black">
                              <span className="text-lg font-black uppercase text-titan-bright/50">
                                {slot.slice(0, 1)}
                              </span>
                            </div>
                            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-titan-bright/80">
                              {slot}
                            </p>
                            <p className="mt-1 text-[0.65rem] leading-4 text-titan-ivory/42">
                              {mediaDescriptions[slot as keyof typeof mediaDescriptions]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-titan-ivory/58">
                      {study.mediaLabel}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 p-6 sm:p-7">
                  <p className="text-sm font-bold uppercase text-titan-muted">
                    {study.industry}
                  </p>
                  <h3 className="mt-3 text-3xl font-black leading-tight text-titan-ivory">
                    {study.clientName}
                  </h3>
                  <p className="mt-4 leading-7 text-titan-ivory/68">
                    {study.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {study.services.map((service) => (
                      <span
                        className="inline-flex rounded-full border border-titan-gold/18 bg-titan-gold/[0.08] px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-titan-bright/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        key={service}
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 rounded-lg border border-titan-gold/14 bg-titan-gold/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-titan-bright">
                      Momentum signal
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-titan-ivory">
                      {study.metric}
                    </p>
                  </div>

                  <details className="group mt-5 rounded-lg border border-titan-gold/16 bg-black/24 p-4 transition open:border-titan-bright/40 open:bg-black/34">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-black uppercase tracking-[0.14em] text-titan-bright transition hover:text-titan-ivory">
                      <span>View Case Study</span>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-titan-gold/25 bg-titan-gold/10 text-lg leading-none transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="mt-6 grid gap-5">
                      {[
                        ["The Problem", study.problem],
                        ["The Visibility Gap", study.gap],
                        ["The Strategy", study.strategy],
                        ["The Execution", study.execution],
                        ["The Momentum Shift", study.momentumShift],
                        ["Titan Insight", study.titanInsight]
                      ].map(([label, value]) => (
                        <div className="rounded-lg border border-titan-gold/8 bg-white/[0.035] p-5" key={label}>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-titan-muted">
                            {label}
                          </p>
                          <p className="mt-2 leading-7 text-titan-ivory/70">
                            {value}
                          </p>
                        </div>
                      ))}
                      <div className="rounded-lg border border-titan-gold/14 bg-titan-gold/10 p-5">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-titan-bright">
                          Results / Metrics
                        </p>
                        <ul className="mt-3 space-y-2">
                          {study.results.map((result) => (
                            <li className="text-sm leading-6 text-titan-ivory/72" key={result}>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="premium-surface mt-12 grid gap-8 rounded-lg p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-titan-muted">
              The system behind the work
            </p>
            <h3 className="mt-3 text-3xl font-black text-titan-ivory sm:text-4xl">
              Titan does not just generate content.
            </h3>
            <p className="titan-copy mt-4 text-titan-ivory/68">
              It studies visibility movement, audience behavior, emotional
              triggers, and strategic momentum so brands can understand what is
              working, what is weakening, and what to do next.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <CtaButton href="/dashboard">Run Visibility Audit</CtaButton>
            <CtaButton href="#lead-capture" variant="secondary">
              Book a Strategy Call
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
