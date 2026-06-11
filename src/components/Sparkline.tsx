import { useMemo } from "react";
import type { Obs } from "../types";

interface Props {
  history: Obs[];
  width?: number;
  height?: number;
  stroke?: string;
}

/** 90-day sparkline rendered from the committed history — pure SVG, no deps. */
export default function Sparkline({ history, width = 560, height = 96, stroke = "var(--color-accent)" }: Props) {
  const { path, area, last } = useMemo(() => {
    const pts = history.slice(-90);
    if (pts.length < 2) return { path: "", area: "", last: null as null | { x: number; y: number } };
    const vs = pts.map((p) => p.v);
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const pad = (max - min) * 0.12 || Math.abs(max) * 0.01 || 1;
    const lo = min - pad;
    const hi = max + pad;
    const x = (i: number) => (i / (pts.length - 1)) * (width - 8) + 4;
    const y = (v: number) => height - 6 - ((v - lo) / (hi - lo)) * (height - 12);
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
    const a = `${d}L${x(pts.length - 1).toFixed(1)},${height}L4,${height}Z`;
    return { path: d, area: a, last: { x: x(pts.length - 1), y: y(pts[pts.length - 1].v) } };
  }, [history, width, height]);

  if (!path) return <div className="text-faint text-xs">No history available.</div>;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="90-day history sparkline">
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkfill)" />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="spark-draw"
        style={{ ["--draw-len" as any]: 1400 }}
      />
      {last && <circle cx={last.x} cy={last.y} r="2.5" fill={stroke} />}
    </svg>
  );
}
