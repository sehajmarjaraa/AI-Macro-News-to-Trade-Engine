import type { Indicator } from "../types";
import { mostStretched } from "../lib/engine";
import { fmtDate, fmtDelta, fmtValue, fmtZ } from "../lib/format";
import { useCountUp } from "../hooks/useCountUp";

function HeroTile({ ind }: { ind: Indicator }) {
  const animated = useCountUp(ind.latest);
  const z = ind.zscore ?? 0;
  const stretched = Math.abs(z) >= 1.5;
  const deltaPos = (ind.delta ?? 0) >= 0;
  return (
    <div className="card-hover border border-edge bg-surface/80 backdrop-blur px-5 py-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-mut truncate">{ind.short}</span>
        <span className={`num text-[11px] ${stretched ? "text-warn" : "text-faint"}`}>{fmtZ(ind.zscore)}</span>
      </div>
      <div className="num text-2xl sm:text-[28px] leading-none text-ink">
        {fmtValue(animated, ind.decimals)}
        <span className="text-xs text-faint ml-1.5">{ind.unit}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`num text-xs ${deltaPos ? "text-up" : "text-down"}`}>{fmtDelta(ind.delta, ind.unit, ind.decimals)}</span>
        <span className="text-[10px] text-faint">{fmtDate(ind.asOf)}</span>
      </div>
    </div>
  );
}

export default function Hero({ indicators, generatedAt }: { indicators: Indicator[]; generatedAt: string }) {
  const top = mostStretched(indicators, 4);
  return (
    <header className="hero-field border-b border-edge">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16">
        <div className="stagger max-w-3xl">
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-up" />
            </span>
            <span className="num uppercase tracking-[0.18em] text-mut">
              live desk · data as of {fmtDate(generatedAt.slice(0, 10))}
            </span>
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-[-0.03em] leading-[1.05]">
            A global macro desk,
            <br />
            <span className="text-mut">running in your browser.</span>
          </h1>

          <p className="mt-5 text-mut text-[15px] sm:text-base leading-relaxed max-w-xl">
            18 real macro indicators from public data — deltas and z-scores computed deterministically, never by the
            model — plus an LLM strategist that turns any news event into a structured cross-asset read with
            illustrative trade expressions.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#strategist" className="btn-primary bg-accent text-bg text-sm font-medium px-5 py-2.5">
              Run an event ↓
            </a>
            <a
              href="#dashboard"
              className="text-sm px-5 py-2.5 border border-edge text-mut hover:text-ink hover:border-edge-2 transition-colors"
            >
              Explore the dashboard
            </a>
          </div>

          <div className="num mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[11px] text-faint">
            <span><span className="text-ink">18</span> indicators · FRED + market data</span>
            <span><span className="text-ink">90d</span> z-score window, pure TypeScript</span>
            <span><span className="text-ink">1</span> LLM call, schema-validated</span>
            <span><span className="text-ink">0</span> keys needed to explore</span>
          </div>

          <p className="mt-6 text-[12px] text-faint">
            Designed &amp; built end-to-end by <span className="text-ink font-medium">Sehaj Marjara</span>
            <span className="mx-2 text-edge-2">|</span>
            <a href="https://linkedin.com/in/sehajmarjara" target="_blank" rel="noreferrer" className="text-mut hover:text-accent underline underline-offset-4 decoration-edge-2 transition-colors">LinkedIn</a>
            <span className="mx-1.5">·</span>
            <a href="https://github.com/sehajmarjaraa" target="_blank" rel="noreferrer" className="text-mut hover:text-accent underline underline-offset-4 decoration-edge-2 transition-colors">GitHub</a>
            <span className="mx-1.5">·</span>
            <a href="mailto:sehajmarjaraa@gmail.com" className="text-mut hover:text-accent underline underline-offset-4 decoration-edge-2 transition-colors">Email</a>
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-faint">Most stretched vs 90-day mean</h2>
            <span className="num text-[10px] text-faint hidden sm:block">|z-score| leaders · tap any tile below for history</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {top.map((ind) => (
              <HeroTile key={ind.id} ind={ind} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
