export function fmtValue(v: number | null, decimals: number): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Delta string. Percentage-point series (unit "%") are shown in basis points. */
export function fmtDelta(delta: number | null, unit: string, decimals: number): string {
  if (delta === null || !Number.isFinite(delta)) return "—";
  if (unit === "%") {
    const bps = delta * 100;
    return `${bps >= 0 ? "+" : ""}${bps.toFixed(1)} bp`;
  }
  return `${delta >= 0 ? "+" : ""}${fmtValue(delta, decimals)}`;
}

export function fmtZ(z: number | null): string {
  if (z === null || !Number.isFinite(z)) return "—";
  return `${z >= 0 ? "+" : ""}${z.toFixed(2)}σ`;
}

export function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
