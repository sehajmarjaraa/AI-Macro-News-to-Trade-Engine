/**
 * Scenario projection (illustrative).
 *
 * Turns a strategist call — {direction, expected_magnitude} — into a projected
 * post-event level for an indicator, so the dashboard visibly responds when you
 * switch scenarios. The MATH here is deterministic code; the magnitude INPUT is
 * the LLM's judgment, so the result is explicitly illustrative, never presented
 * as real data. The real snapshot value is always shown alongside it.
 *
 * Magnitude strings come in shapes like "12–18bp", "+0.8–1.2%", "~50bp",
 * "+20–40 vol points from 19.87", "−3–6% from $6.17/lb". We read the numbers
 * that appear BEFORE the first unit token (bp / point / %) so a trailing
 * "from $X" reference price is ignored, average a range to its midpoint, and
 * apply the direction's sign.
 */
import type { Indicator } from "../types";

export interface Projection {
  value: number; // projected level, in the indicator's own units
  delta: number; // projected − latest, same units
  deltaLabel: string; // human delta, e.g. "+15 bp", "−1.0%", "+30 pt"
}

type Dir = "UP" | "DOWN" | "UNCHANGED";

export function projectAffected(ind: Indicator, dir: Dir, magnitude: string): Projection | null {
  if (ind.latest === null) return null;
  if (dir === "UNCHANGED") return { value: ind.latest, delta: 0, deltaLabel: "unch" };

  const sign = dir === "UP" ? 1 : -1;
  const lower = magnitude.toLowerCase();

  // Locate the first unit token; numbers before it are the magnitude.
  const tokens: [string, "bp" | "pt" | "pct"][] = [
    ["bp", "bp"],
    ["vol point", "pt"],
    ["point", "pt"],
    ["%", "pct"],
  ];
  let kind: "bp" | "pt" | "pct" | null = null;
  let at = Infinity;
  for (const [tok, k] of tokens) {
    const i = lower.indexOf(tok);
    if (i >= 0 && i < at) {
      at = i;
      kind = k;
    }
  }
  if (kind === null) return null;

  const nums = (lower.slice(0, at).match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (!nums.length) return null;
  const mid = (nums.reduce((a, b) => a + b, 0) / nums.length) * sign;

  let delta: number;
  let deltaLabel: string;
  if (kind === "bp") {
    // basis points → 1bp = 0.01 in a percent-quoted value (yields, spreads)
    delta = mid * 0.01;
    deltaLabel = `${mid >= 0 ? "+" : "−"}${Math.abs(Math.round(mid))} bp`;
  } else if (kind === "pt") {
    delta = mid; // index points added directly (e.g. VIX vol points)
    deltaLabel = `${mid >= 0 ? "+" : "−"}${Math.abs(mid).toFixed(Number.isInteger(mid) ? 0 : 1)} pt`;
  } else if (ind.unit === "%") {
    delta = mid; // percentage-point move on a rate/spread quoted in %
    deltaLabel = `${mid >= 0 ? "+" : "−"}${Math.abs(mid).toFixed(2)} pp`;
  } else {
    delta = ind.latest * (mid / 100); // multiplicative for prices / indices
    deltaLabel = `${mid >= 0 ? "+" : "−"}${Math.abs(mid).toFixed(1)}%`;
  }

  return { value: ind.latest + delta, delta, deltaLabel };
}
