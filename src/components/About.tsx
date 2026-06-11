import { useReveal } from "../hooks/useReveal";

const PILLARS = [
  {
    n: "01",
    title: "Macro & cross-asset thinking",
    body:
      "The desk reasons the way a markets seat does: curve shape, breakevens, credit spreads, vol, FX, and commodities read together, with 90-day z-scores surfacing what's stretched. Every scenario maps an event to direction, magnitude, and horizon across all five asset classes — not just a headline take.",
    tags: ["rates · credit · FX", "z-scores", "scenario analysis"],
  },
  {
    n: "02",
    title: "Rigor you can audit",
    body:
      "Every figure is sourced and dated — FRED series IDs on every tile, snapshot timestamps throughout. Deltas, z-scores, and betas are deterministic code anyone can re-run, and an integrity rule guarantees an unreachable source commits as null, never a made-up number. The same discipline diligence and audit work demand.",
    tags: ["provenance", "reproducible", "integrity rule"],
  },
  {
    n: "03",
    title: "Risk discipline",
    body:
      "Each trade expression carries an entry anchored to a real level, a target, a stop, sizing as a share of risk budget, a conviction score, and — most importantly — the single data point that would kill the idea. Views are only useful when you know what invalidates them.",
    tags: ["sizing", "invalidation", "conviction"],
  },
  {
    n: "04",
    title: "AI used responsibly",
    body:
      "One LLM call with strictly structured, schema-validated output handles judgment — parsing the news, making the calls — while a hard boundary keeps it from ever computing a number. Knowing where a model adds value and where it must not be trusted is the actual skill being demonstrated.",
    tags: ["structured outputs", "human-defined guardrails", "Claude API"],
  },
];

const FLOW = ["FRED + market APIs", "ingest.ts → snapshot.json", "browser engine (math)", "Claude (judgment)", "desk UI"];

const STACK = ["React 19", "TypeScript", "Vite", "Tailwind v4", "Anthropic SDK", "Zod", "Node ingest", "static deploy"];

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="about" className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-y border-edge scroll-mt-14">
      <div className="section-label mb-6">
        <span className="idx">03</span>
        <span>behind the build</span>
      </div>

      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">What this project demonstrates</h2>
        <p className="text-mut text-sm mt-1">
          A working macro process — data sourcing, deterministic analytics, cross-asset judgment, and risk framing —
          built end-to-end by one person.
        </p>
      </div>

      {/* Architecture flow */}
      <div className="mt-6 border border-edge bg-surface px-4 py-3.5 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {FLOW.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className={`num text-[11px] px-2.5 py-1 border ${i === 3 ? "border-accent/50 text-accent bg-accent/10" : "border-edge text-mut"}`}>
                {step}
              </span>
              {i < FLOW.length - 1 && <span className="text-faint text-xs">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PILLARS.map((p) => (
          <div key={p.n} className="card-hover border border-edge bg-surface p-5">
            <div className="flex items-baseline gap-3">
              <span className="num text-[11px] text-accent">{p.n}</span>
              <h3 className="text-sm font-medium text-ink">{p.title}</h3>
            </div>
            <p className="mt-2.5 text-[13px] text-mut leading-relaxed">{p.body}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="num text-[10px] px-2 py-0.5 border border-edge text-faint">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Builder */}
      <div className="mt-2 card-hover border border-accent/30 bg-accent/[0.05] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <h3 className="text-sm font-medium text-ink">
            About the builder
          </h3>
          <p className="mt-2 text-[13px] text-mut leading-relaxed">
            I'm <span className="text-ink font-medium">Sehaj Marjara</span> — a finance graduate from Michigan State's
            Broad College of Business ('26) who likes building the tools I'd want on a desk. I made macro-desk to show
            how I think: source the data honestly, do the math deterministically, form a view across assets, and state
            what would prove it wrong. Currently exploring roles across investment banking, corporate finance &amp;
            FP&amp;A, consulting &amp; strategy, and risk.
          </p>
        </div>
        <div className="flex sm:flex-col gap-2 shrink-0">
          <a
            href="https://linkedin.com/in/sehajmarjara"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] px-4 py-2 bg-accent text-bg font-medium text-center btn-primary"
          >
            LinkedIn ↗
          </a>
          <a
            href="mailto:sehajmarjaraa@gmail.com?subject=macro-desk"
            className="text-[12px] px-4 py-2 border border-edge text-mut hover:text-ink hover:border-edge-2 text-center transition-colors"
          >
            Email me
          </a>
          <a
            href="https://github.com/sehajmarjaraa"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] px-4 py-2 border border-edge text-mut hover:text-ink hover:border-edge-2 text-center transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-faint mr-1.5">stack</span>
        {STACK.map((s) => (
          <span key={s} className="num text-[11px] px-2.5 py-1 bg-surface-2 border border-edge text-mut">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
