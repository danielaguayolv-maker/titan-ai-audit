import { stats } from "@/lib/landing-data";
import { CtaButton } from "./cta-button";

export function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24"
    >
      <div className="subtle-grid pointer-events-none absolute inset-x-0 top-0 h-80" />
      <div className="fade-up relative max-w-3xl">
        <p className="mb-5 inline-flex rounded-full border border-titan-gold/30 bg-titan-gold/10 px-4 py-2 text-xs font-bold uppercase text-titan-bright">
          Premium visibility OS for creators and businesses
        </p>
        <h1 className="max-w-4xl text-5xl font-black leading-[0.96] text-titan-ivory sm:text-6xl lg:text-7xl">
          Turn hidden business gaps into a{" "}
          <span className="gold-text">gold-grade growth plan.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-titan-ivory/72 sm:text-xl">
          Titan Visibility OS gives creators, service companies, clinics,
          retailers, and local operators a sharper system for visibility
          intelligence, content execution, and client-ready reporting.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <CtaButton>Open Visibility OS</CtaButton>
          <CtaButton href="#features" variant="secondary">
            View Features
          </CtaButton>
        </div>
        <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="premium-surface rounded-lg p-4 backdrop-blur"
              key={stat.label}
            >
              <p className="text-2xl font-black text-titan-bright">{stat.value}</p>
              <p className="mt-1 text-xs uppercase text-titan-ivory/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up relative [animation-delay:120ms]">
        <div className="absolute -inset-6 rounded-lg bg-titan-gold/10 blur-3xl" />
        <div className="premium-surface relative overflow-hidden rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between border-b border-titan-gold/15 pb-5">
            <div>
              <p className="text-xs uppercase text-titan-muted">
                Visibility OS Preview
              </p>
              <h2 className="mt-1 text-2xl font-black text-titan-ivory">
                Live Profile Workspace
              </h2>
            </div>
            <div className="rounded-full bg-titan-gold px-4 py-2 text-2xl font-black text-black shadow-gold">
              87
            </div>
          </div>

          <div className="space-y-4">
            {[
              ["Lead Response", "92%", "w-[92%]"],
              ["Reviews + Reputation", "78%", "w-[78%]"],
              ["AI Automation", "64%", "w-[64%]"]
            ].map(([label, value, width]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-titan-ivory/70">{label}</span>
                  <span className="font-bold text-titan-bright">{value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-3 rounded-full bg-titan-gold ${width} score-fill`} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-titan-gold/10 p-4">
              <p className="text-sm font-bold text-titan-bright">Top Opportunity</p>
              <p className="mt-2 text-sm leading-6 text-titan-ivory/70">
                Convert weak visibility signals into a 30-day execution plan.
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-4">
              <p className="text-sm font-bold text-titan-bright">Projected Lift</p>
              <p className="mt-2 text-sm leading-6 text-titan-ivory/70">
                Turn profile attention into stronger content and clearer CTAs.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-titan-gold/15 bg-black/22 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-titan-ivory">Report prep</p>
              <p className="text-xs font-bold uppercase text-titan-bright">Ready</p>
            </div>
            <div className="space-y-2">
              <div className="shimmer h-2 rounded-full bg-white/10" />
              <div className="shimmer h-2 w-3/4 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
