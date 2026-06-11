/**
 * Deterministic dashboard math. Runs entirely in the browser from the
 * committed FRED/market history — the LLM never computes any of these values.
 * Mirrors scripts/ingest.ts so stats can be recomputed from raw history.
 */
import type { Indicator, Obs } from "../types";

export const Z_WINDOW = 90;

export interface Stats {
  latest: number | null;
  asOf: string | null;
  delta: number | null;
  zscore: number | null;
  mean: number | null;
  std: number | null;
}

export function computeStats(history: Obs[], window = Z_WINDOW): Stats {
  if (history.length < 2) {
    return { latest: null, asOf: null, delta: null, zscore: null, mean: null, std: null };
  }
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const win = history.slice(-window).map((o) => o.v);
  const mean = win.reduce((a, b) => a + b, 0) / win.length;
  const variance = win.reduce((a, b) => a + (b - mean) ** 2, 0) / (win.length - 1);
  const std = Math.sqrt(variance);
  return {
    latest: latest.v,
    asOf: latest.d,
    delta: latest.v - prev.v,
    zscore: std > 0 ? (latest.v - mean) / std : 0,
    mean,
    std,
  };
}

/** Recompute stats from committed history (authoritative in the browser). */
export function enrich(ind: Indicator, window: number): Indicator {
  if (!ind.history.length) return ind;
  const s = computeStats(ind.history, window);
  return { ...ind, latest: s.latest, asOf: s.asOf, delta: s.delta, zscore: s.zscore };
}

export function sortByAbsZ(indicators: Indicator[]): Indicator[] {
  return [...indicators].sort(
    (a, b) => Math.abs(b.zscore ?? -Infinity) - Math.abs(a.zscore ?? -Infinity),
  );
}

export function mostStretched(indicators: Indicator[], n: number): Indicator[] {
  return sortByAbsZ(indicators.filter((i) => i.zscore !== null)).slice(0, n);
}
