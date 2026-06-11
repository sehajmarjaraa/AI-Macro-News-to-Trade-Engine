import type { Indicator } from "../types";
import { fmtDelta, fmtValue } from "../lib/format";

/** Bloomberg-style ticker tape across the very top — all 18 real indicators. */
export default function Tape({ indicators }: { indicators: Indicator[] }) {
  const live = indicators.filter((i) => i.latest !== null);
  if (!live.length) return null;
  const Cell = ({ ind }: { ind: Indicator }) => {
    const pos = (ind.delta ?? 0) >= 0;
    return (
      <span className="num inline-flex items-baseline gap-2 px-5 py-1.5 text-[11px] whitespace-nowrap border-r border-edge/70">
        <span className="text-faint uppercase tracking-wider">{ind.short}</span>
        <span className="text-ink">{fmtValue(ind.latest, ind.decimals)}</span>
        <span className={pos ? "text-up" : "text-down"}>{fmtDelta(ind.delta, ind.unit, ind.decimals)}</span>
      </span>
    );
  };
  return (
    <div className="tape overflow-hidden border-b border-edge bg-surface/60" aria-hidden="true">
      <div className="tape-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex">
            {live.map((ind) => (
              <Cell key={`${dup}-${ind.id}`} ind={ind} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
