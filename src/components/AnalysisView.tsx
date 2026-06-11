import type { StrategistOutput } from "../types";

function Score({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <span className="num text-xs text-accent">
      {value}<span className="text-faint">/{max}</span>
    </span>
  );
}

function DirBadge({ call }: { call: string }) {
  const c = call.toLowerCase();
  const up = /(higher|long|steepen|widen|up|bull|buy|strength|outperform|rally|tighter usd|bid)/.test(c);
  const down = /(lower|short|flatten|tighten(?!ing of policy)|down|bear|sell|weak|underperform|fade)/.test(c);
  const color = up && !down ? "text-up" : down ? "text-down" : "text-warn";
  return <span className={`num text-[11px] ${color}`}>{call}</span>;
}

const ASSET_GROUPS: { key: keyof StrategistOutput["cross_asset_implications"]; label: string }[] = [
  { key: "rates", label: "Rates" },
  { key: "fx", label: "FX" },
  { key: "equities", label: "Equities" },
  { key: "commodities", label: "Commodities" },
  { key: "credit", label: "Credit" },
];

export default function AnalysisView({
  output,
  focusTicker,
}: {
  output: StrategistOutput;
  focusTicker: string | null;
}) {
  return (
    <div className="mt-8 flex flex-col gap-8 rise-in">
      {/* News parsing */}
      <div className="border border-edge bg-surface p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-faint">News parsing</h3>
          <span className="text-[11px] text-mut">
            source credibility <Score value={output.news_parsing.source_credibility_score} />
          </span>
        </div>
        <p className="text-ink text-[15px] leading-relaxed">{output.news_parsing.core_fact}</p>
        <p className="text-mut text-sm mt-2">
          <span className="text-faint uppercase text-[10px] tracking-wider mr-2">vs consensus</span>
          {output.news_parsing.directional_surprise_vs_consensus}
        </p>
      </div>

      {/* Cross-asset grid */}
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-faint mb-3">Cross-asset implications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ASSET_GROUPS.map(({ key, label }) => (
            <div key={key} className="border border-edge bg-surface p-4">
              <h4 className="text-xs font-medium text-mut mb-2.5 uppercase tracking-wider">{label}</h4>
              <ul className="flex flex-col gap-2.5">
                {output.cross_asset_implications[key].map((c, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-ink">{c.asset}</span>
                      <DirBadge call={c.call} />
                    </div>
                    <p className="text-mut text-xs mt-0.5 leading-snug">{c.rationale}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Second-order effects shares the grid for density */}
          <div className="border border-edge bg-surface-2 p-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-medium text-warn mb-2.5 uppercase tracking-wider">Where consensus is wrong</h4>
            <p className="text-sm text-mut leading-relaxed">{output.second_order_effects}</p>
          </div>
        </div>
      </div>

      {/* Trade ideas */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-faint">Trade expressions</h3>
          <span className="text-[10px] uppercase tracking-wider text-warn border border-warn/40 bg-warn/10 px-2 py-0.5">
            Illustrative hypotheses — not advice
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {output.trade_ideas.map((t, i) => (
            <div key={i} className="border border-edge bg-surface p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">
                  <span className={`num mr-2 ${t.direction === "LONG" ? "text-up" : "text-down"}`}>{t.direction}</span>
                  {t.instrument}
                </span>
                <span className="text-[11px] text-mut">
                  conviction <Score value={t.conviction_score} />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center border-y border-edge py-2.5">
                {(
                  [
                    ["entry", t.entry_level],
                    ["target", t.target_level],
                    ["stop", t.stop_loss],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <div className="text-[9px] uppercase tracking-wider text-faint">{k}</div>
                    <div className={`num text-xs mt-0.5 break-words ${k === "stop" ? "text-down" : k === "target" ? "text-up" : "text-ink"}`}>{v}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-mut leading-relaxed">{t.thesis}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-faint">
                <span>hold: <span className="num text-mut">{t.expected_holding_period}</span></span>
                <span>size: <span className="num text-mut">{t.sizing_as_pct_risk_budget}</span></span>
              </div>
              <p className="text-[11px] leading-snug">
                <span className="text-down uppercase text-[9px] tracking-wider mr-1.5">kills it</span>
                <span className="text-mut">{t.what_would_invalidate}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Focus instrument read */}
      {output.focus_instrument_read && (
        <div className="border border-accent/40 bg-accent/[0.06] p-5">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-accent mb-2">
            Focus read{focusTicker ? ` · ${focusTicker}` : ""}
          </h3>
          <p className="text-sm text-ink/90 leading-relaxed">{output.focus_instrument_read}</p>
        </div>
      )}
    </div>
  );
}
