import { productTiers } from "@/lib/landing-data";

const activationSteps = [
  {
    title: "Run the first visibility scan",
    body: "Titan reveals the primary blocker, one-sentence intelligence, and the first signal worth acting on."
  },
  {
    title: "Start one strategic experiment",
    body: "Turn a recommendation into a tracked test so the next audit can compare movement instead of starting over."
  },
  {
    title: "Watch momentum form",
    body: "Memory and evolution turn repeated behavior into a strategic timeline: what improved, what regressed, and what keeps repeating."
  }
];

export function ProductActivation() {
  return (
    <section className="border-y border-titan-gold/10 bg-black/24 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase text-titan-muted">
            Product activation
          </p>
          <h2 className="text-anywhere mt-3 text-4xl font-black leading-tight text-titan-ivory sm:text-5xl">
            The first audit is the beginning of a living strategy system.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-titan-ivory/66">
            Titan is designed to create the first “aha” quickly, then become
            more valuable as it remembers account behavior, experiments, and
            strategic movement over time.
          </p>
        </div>

        <div className="grid gap-5">
          {activationSteps.map((step, index) => (
            <article className="premium-surface rounded-lg p-5" key={step.title}>
              <span className="titan-chip bg-titan-gold/10 text-xs font-black uppercase text-titan-bright">
                Milestone {index + 1}
              </span>
              <h3 className="mt-4 text-2xl font-black text-titan-ivory">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-titan-ivory/64">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-3">
            {productTiers.map((tier) => (
              <article className="titan-signal-card rounded-lg p-5" key={tier.name}>
                <p className="text-xs font-black uppercase text-titan-muted">
                  Future tier
                </p>
                <h3 className="mt-3 text-2xl font-black text-titan-bright">
                  {tier.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-titan-ivory/62">
                  {tier.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
