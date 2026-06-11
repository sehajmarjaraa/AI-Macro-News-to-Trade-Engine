export default function Footer() {
  return (
    <>
      <footer className="border-t border-edge bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-md">
              <div className="text-sm font-semibold tracking-tight">
                <span className="text-accent">macro</span>-desk
              </div>
              <p className="mt-2 text-[13px] text-mut leading-relaxed">
                Designed and built end-to-end by <span className="text-ink">Sehaj Marjara</span> — data pipeline,
                deterministic analytics engine, LLM integration, and interface. Open to conversations across
                investment banking, corporate finance &amp; FP&amp;A, consulting &amp; strategy, and risk.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["LinkedIn", "https://linkedin.com/in/sehajmarjara"],
                  ["GitHub", "https://github.com/sehajmarjaraa"],
                  ["Email", "mailto:sehajmarjaraa@gmail.com?subject=macro-desk"],
                ] as const
              ).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-[12px] px-4 py-2 border border-edge text-mut hover:text-ink hover:border-edge-2 transition-colors"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-edge/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
            <span>Public data · FRED, St. Louis Fed &amp; free market APIs · snapshot dates stated throughout</span>
            <span className="num">React · TypeScript · Tailwind · Claude</span>
          </div>
        </div>
      </footer>
      {/* Always-visible disclaimer */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur border-t border-edge px-4 py-2">
        <p className="max-w-6xl mx-auto text-[10px] sm:text-[11px] text-faint leading-snug text-center">
          Educational global-macro demonstration using public data as of the stated dates. Trade ideas are
          <span className="text-warn"> illustrative hypotheses</span> — not investment advice, not recommendations.
        </p>
      </div>
    </>
  );
}
