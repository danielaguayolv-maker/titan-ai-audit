import { CtaButton } from "./cta-button";

export function LeadCapture() {
  return (
    <section id="lead-capture" className="px-5 pb-10 pt-8 sm:px-8 sm:pb-16">
      <div className="premium-surface mx-auto grid max-w-7xl gap-8 rounded-lg p-6 shadow-gold sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-titan-bright">
            Ready for the next local edge?
          </p>
          <h2 className="mt-3 text-3xl font-black text-titan-ivory sm:text-5xl">
            Put Titan Visibility OS behind your next growth workflow.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-titan-ivory/70">
            A focused operating system for visibility audits, content execution,
            trend intelligence, and premium client-ready reporting.
          </p>
        </div>
        <CtaButton>Open Platform</CtaButton>
      </div>
    </section>
  );
}
