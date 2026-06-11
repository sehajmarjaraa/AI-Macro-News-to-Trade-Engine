import type { DashboardData } from "../types";
import { fmtDate, fmtValue } from "../lib/format";
import { useReveal } from "../hooks/useReveal";

export default function Methodology({ data }: { data: DashboardData }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="methodology" className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-14">
      <div className="section-label mb-6">
        <span className="idx">04</span>
        <span>data &amp; methodology</span>
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Real data &amp; methodology</h2>
      <p className="text-mut text-sm mt-1 max-w-3xl">
        Every figure on this page is real and traceable. Snapshot generated{" "}
        <span className="num text-ink">{new Date(data.generatedAt).toUTCString()}</span> by{" "}
        <span className="num">npm run ingest</span>.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="border border-edge bg-surface p-4 text-sm">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint mb-2">Computation (deterministic, in code)</h3>
          <ul className="text-mut text-[13px] leading-relaxed flex flex-col gap-1.5">
            <li><span className="text-ink">Daily delta</span> — {data.methodology.delta}.</li>
            <li><span className="text-ink">Z-score</span> — {data.methodology.zscore}.</li>
            <li><span className="text-ink">Beta</span> — {data.methodology.beta}.</li>
            <li>All three recomputed in your browser from the committed history; the LLM never computes a dashboard value.</li>
          </ul>
        </div>
        <div className="border border-edge bg-surface p-4 text-sm">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint mb-2">Sources</h3>
          <ul className="text-mut text-[13px] leading-relaxed flex flex-col gap-1.5">
            <li>16 of 18 indicators come from <span className="text-ink">FRED</span> (St. Louis Fed) official series — see each tile for the exact series id.</li>
            <li><span className="text-ink">Commodity fallback:</span> FRED carries no daily copper or agricultural series, so Copper (COMEX HG front month) and Corn (CBOT ZC front month) come from the Yahoo Finance public chart API, labeled as such on their tiles.</li>
            <li>Instrument presets (price, 90-day beta vs SPY) are snapshotted from the same market provider and dated.</li>
            <li>{data.methodology.integrity}</li>
          </ul>
        </div>
        <div className="border border-edge bg-surface p-4 text-sm">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint mb-2">The strategist layer</h3>
          <ul className="text-mut text-[13px] leading-relaxed flex flex-col gap-1.5">
            <li>News parsing, cross-asset calls, and trade expressions are LLM judgment (Claude, structured output, schema-validated with one retry) on top of the real dashboard.</li>
            <li><span className="text-ink">Projected tile levels</span> apply the model's expected direction and magnitude to the real snapshot with deterministic code — illustrative only, shown beside the real value, never overwriting it.</li>
            <li>Preset scenarios are real historical events replayed against the current snapshot, with outputs precomputed so they render offline.</li>
            <li>Your API keys stay in React state, are sent only to their provider, and are never stored.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 border border-edge bg-surface overflow-x-auto">
        <table className="w-full text-[12px] min-w-[640px]">
          <thead>
            <tr className="text-left text-faint uppercase tracking-wider text-[10px] border-b border-edge">
              <th className="px-4 py-2.5 font-medium">Indicator</th>
              <th className="px-4 py-2.5 font-medium">Latest</th>
              <th className="px-4 py-2.5 font-medium">As of</th>
              <th className="px-4 py-2.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {data.indicators.map((i) => (
              <tr key={i.id} className="border-b border-edge/60 last:border-0">
                <td className="px-4 py-2 text-mut">{i.name}</td>
                <td className="px-4 py-2 num text-ink">{i.latest === null ? "null" : `${fmtValue(i.latest, i.decimals)} ${i.unit}`}</td>
                <td className="px-4 py-2 num text-mut">{fmtDate(i.asOf)}</td>
                <td className="px-4 py-2">
                  <a href={i.sourceUrl} target="_blank" rel="noreferrer" className="text-accent/80 hover:text-accent">
                    {i.sourceLabel}
                  </a>
                </td>
              </tr>
            ))}
            {data.instruments.map((i) => (
              <tr key={i.ticker} className="border-b border-edge/60 last:border-0">
                <td className="px-4 py-2 text-mut">{i.name} ({i.ticker})</td>
                <td className="px-4 py-2 num text-ink">
                  {i.price === null ? "null" : `$${fmtValue(i.price, 2)}`}
                  {i.beta90d !== null && <span className="text-faint"> · β{i.beta90d}</span>}
                </td>
                <td className="px-4 py-2 num text-mut">{fmtDate(i.asOf)}</td>
                <td className="px-4 py-2 text-mut">{i.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border border-warn/40 bg-warn/[0.07] p-4 sm:p-5">
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-warn mb-1.5">Disclaimer</h3>
        <p className="text-[13px] text-mut leading-relaxed">
          macro-desk is an educational global-macro demonstration built on public data as of the dates stated above. The
          strategist output — including every trade expression, level, sizing, and conviction score — is an illustrative
          hypothesis generated for demonstration purposes. Nothing on this page is investment advice, a recommendation,
          or an offer to transact in any instrument. Data may be delayed, revised, or wrong; do your own work.
        </p>
      </div>
    </section>
  );
}
