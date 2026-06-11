import { useEffect, useMemo, useState } from "react";
import type { Indicator } from "../types";
import { sortByAbsZ } from "../lib/engine";
import { fmtDate, fmtDelta, fmtValue, fmtZ } from "../lib/format";
import { projectAffected } from "../lib/project";
import { useReveal } from "../hooks/useReveal";
import Sparkline from "./Sparkline";

type SortMode = "absz" | "category";
type Affected = { dir: string; mag: string; horizon: string };

const CATEGORY_ORDER = ["rates", "inflation", "fx", "vol", "equities", "credit", "commodities"];

function Tile({
  ind,
  affected,
  projected,
  pulseToken,
  expanded,
  onToggle,
}: {
  ind: Indicator;
  affected: Affected | null;
  projected: boolean;
  pulseToken: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const z = ind.zscore;
  const stretched = z !== null && Math.abs(z) >= 1.5;
  const deltaPos = (ind.delta ?? 0) >= 0;
  // Illustrative projected level for this event (deterministic math on the
  // strategist's expected direction + magnitude). Only when a read is active.
  const proj =
    affected && projected
      ? projectAffected(ind, affected.dir as "UP" | "DOWN" | "UNCHANGED", affected.mag)
      : null;
  const showProj = proj !== null && proj.delta !== 0;
  return (
    <div
      className={`relative bg-surface border transition-colors duration-300 ${
        affected ? "border-accent/70" : "border-edge hover:border-edge-2"
      } ${expanded ? "col-span-full" : ""}`}
    >
      {/* Keyed by pulseToken so the highlight ring REPLAYS on every scenario switch */}
      {affected && <span key={pulseToken} className="tile-pulse-ring" aria-hidden="true" />}
      <button
        onClick={onToggle}
        className="relative z-[2] w-full text-left px-4 py-3.5 flex flex-col gap-2 cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-mut truncate">{ind.short}</span>
          <div className="flex items-center gap-2 shrink-0">
            {affected && (
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-accent/15 text-accent border border-accent/30">
                {affected.dir} · {affected.horizon}
              </span>
            )}
            <span className={`num text-[11px] ${stretched ? "text-warn" : "text-faint"}`}>{fmtZ(z)}</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          {showProj ? (
            // Scenario-projected headline (illustrative) with snapshot kept visible
            <span className="num text-xl text-accent">
              {fmtValue(proj!.value, ind.decimals)}
              <span className="text-[11px] text-accent/60 ml-1">{ind.unit}</span>
            </span>
          ) : (
            <span className="num text-xl text-ink">
              {ind.latest === null ? (
                <span className="text-faint text-sm">unavailable</span>
              ) : (
                <>
                  {fmtValue(ind.latest, ind.decimals)}
                  <span className="text-[11px] text-faint ml-1">{ind.unit}</span>
                </>
              )}
            </span>
          )}
          <span className={`num text-xs ${deltaPos ? "text-up" : "text-down"}`}>
            {fmtDelta(ind.delta, ind.unit, ind.decimals)}
          </span>
        </div>
        {showProj && (
          <div className="flex items-center justify-between gap-2 text-[10px] -mt-0.5">
            <span className="num text-accent/80">
              proj {proj!.deltaLabel} · illustrative
            </span>
            <span className="num text-faint">
              snapshot {fmtValue(ind.latest, ind.decimals)}
            </span>
          </div>
        )}
        {/* Deviation bar: |z| vs the ±3σ band, centered at the 90-day mean */}
        <div className="zbar" aria-hidden="true">
          {z !== null &&
            (() => {
              const mag = (Math.min(Math.abs(z), 3) / 3) * 50;
              return (
                <span
                  className={`zbar-fill ${stretched ? "bg-warn" : "bg-accent/80"}`}
                  style={{ left: `${z >= 0 ? 50 : 50 - mag}%`, width: `${Math.max(mag, 1)}%` }}
                />
              );
            })()}
        </div>
        <div className="flex items-center justify-between text-[10px] text-faint">
          <span className="truncate">{ind.name}</span>
          <span className="num shrink-0 ml-2">{fmtDate(ind.asOf)}</span>
        </div>
      </button>
      {expanded && (
        <div className="relative z-[2] px-4 pb-4 rise-in">
          {ind.history.length ? (
            <Sparkline history={ind.history} stroke={stretched ? "var(--color-warn)" : "var(--color-accent)"} />
          ) : (
            <p className="text-xs text-faint">
              Source unreachable at ingest time — committed as null per the integrity rule.{" "}
              {ind.error && <span className="num">({ind.error})</span>}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-mut">
            <span>
              Source:{" "}
              <a href={ind.sourceUrl} target="_blank" rel="noreferrer" className="text-accent/90 hover:text-accent underline underline-offset-2 decoration-edge-2">
                {ind.sourceLabel}
              </a>
            </span>
            <span className="num text-faint">
              as of {fmtDate(ind.asOf)} · 90-day window · last {Math.min(ind.history.length, 90)} obs
            </span>
          </div>
          {affected && (
            <p className="mt-2 text-[11px] text-accent/90">
              Strategist call: {affected.dir}, {affected.mag}, horizon {affected.horizon}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({
  indicators,
  affectedMap,
  readLabel,
}: {
  indicators: Indicator[];
  affectedMap: Map<string, Affected>;
  readLabel: string | null;
}) {
  const [sort, setSort] = useState<SortMode>("absz");
  const [flaggedFirst, setFlaggedFirst] = useState(true);
  const [projected, setProjected] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ref = useReveal<HTMLElement>();

  // Bump a token whenever the flagged set changes (App rebuilds affectedMap on
  // every scenario / live run) so affected tiles REPLAY their highlight ring —
  // this is the visible signal that the dashboard reacted to the new read.
  const [pulseToken, setPulseToken] = useState(0);
  useEffect(() => {
    setPulseToken((t) => t + 1);
  }, [affectedMap]);

  const flaggedCount = affectedMap.size;

  const sorted = useMemo(() => {
    const base =
      sort === "absz"
        ? sortByAbsZ(indicators)
        : [...indicators].sort(
            (a, b) =>
              CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.short.localeCompare(b.short),
          );
    if (!flaggedFirst || flaggedCount === 0) return base;
    // Stable partition: flagged tiles float to the top, order otherwise preserved.
    const hit: Indicator[] = [];
    const rest: Indicator[] = [];
    for (const i of base) (affectedMap.has(i.id) ? hit : rest).push(i);
    return [...hit, ...rest];
  }, [indicators, sort, flaggedFirst, affectedMap, flaggedCount]);

  return (
    <section ref={ref} id="dashboard" className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-14">
      <div className="section-label mb-6">
        <span className="idx">02</span>
        <span>dashboard</span>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">The dashboard</h2>
          <p className="text-mut text-sm mt-0.5 max-w-xl">
            18 real indicators — one dated snapshot, deltas and z-scores computed in your browser. Run a scenario and
            flagged tiles show an <span className="text-accent">illustrative projected level</span> for the event,
            with the real snapshot kept beside it.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-faint mr-1">sort</span>
          {(
            [
              ["absz", "|z-score|"],
              ["category", "category"],
            ] as [SortMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              className={`px-2.5 py-1 border cursor-pointer ${
                sort === mode ? "border-accent/60 text-accent bg-accent/10" : "border-edge text-mut hover:border-edge-2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Read linkage banner: makes the per-scenario change explicit */}
      {flaggedCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-accent/30 bg-accent/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-2.5 text-[12px]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-mut">
              <span className="num text-accent">{flaggedCount}</span> of 18 flagged
              {readLabel && <span className="text-ink"> · {readLabel}</span>}
              {projected && <span className="text-faint"> · showing projected levels</span>}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setProjected((v) => !v)}
              className={`text-[11px] px-2.5 py-1 border cursor-pointer ${
                projected ? "border-accent/60 text-accent bg-accent/10" : "border-edge text-mut hover:border-edge-2"
              }`}
            >
              {projected ? "✓ projected" : "projected"}
            </button>
            <button
              onClick={() => setFlaggedFirst((v) => !v)}
              className={`text-[11px] px-2.5 py-1 border cursor-pointer ${
                flaggedFirst ? "border-accent/60 text-accent bg-accent/10" : "border-edge text-mut hover:border-edge-2"
              }`}
            >
              {flaggedFirst ? "✓ flagged first" : "flagged first"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
        {sorted.map((ind) => (
          <Tile
            key={ind.id}
            ind={ind}
            affected={affectedMap.get(ind.id) ?? null}
            projected={projected}
            pulseToken={pulseToken}
            expanded={expandedId === ind.id}
            onToggle={() => setExpandedId(expandedId === ind.id ? null : ind.id)}
          />
        ))}
      </div>
    </section>
  );
}
