import { features } from "@/lib/landing-data";

export function Features() {
  return (
    <section id="features" className="border-y border-titan-gold/10 bg-black/28 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase text-titan-muted">
            SaaS audit suite
          </p>
          <h2 className="mt-3 text-4xl font-black text-titan-ivory sm:text-5xl">
            Built to make local growth problems obvious.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              className="interactive-card premium-surface rounded-lg p-6"
              key={feature.title}
            >
              <div className="mb-8 flex size-12 items-center justify-center rounded-full bg-titan-gold text-lg font-black text-black shadow-gold">
                0{index + 1}
              </div>
              <h3 className="text-2xl font-black text-titan-ivory">{feature.title}</h3>
              <p className="mt-4 leading-7 text-titan-ivory/66">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
