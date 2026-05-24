export function Process() {
  const steps = [
    ["Scan", "Paste a profile URL and let Titan read public visibility signals."],
    ["Detect", "Reveal the primary blocker and the one sentence that explains the account."],
    ["Experiment", "Start one strategic test so movement can be tracked."],
    ["Evolve", "Return as Titan builds memory, momentum, and strategic history."]
  ];

  return (
    <section id="process" className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-bold uppercase text-titan-muted">
            Operator friendly
          </p>
          <h2 className="mt-3 text-4xl font-black text-titan-ivory sm:text-5xl">
            From audit signal to boardroom-ready action.
          </h2>
          <p className="mt-5 text-lg leading-8 text-titan-ivory/66">
            Titan Visibility OS is designed for operators who want audit
            intelligence, content execution, and reporting without drowning in
            disconnected dashboards.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map(([step, body], index) => (
            <div className="interactive-card luxury-border rounded-lg bg-titan-charcoal/80 p-6" key={step}>
              <p className="text-sm font-bold uppercase text-titan-muted">
                Step {index + 1}
              </p>
              <h3 className="mt-4 text-3xl font-black text-titan-bright">{step}</h3>
              <p className="mt-4 leading-7 text-titan-ivory/64">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
