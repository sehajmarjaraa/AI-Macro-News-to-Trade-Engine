/**
 * Optional live-ticker lookup for arbitrary focus instruments.
 *
 * Preset instruments work with NO market-data key (they ship in the committed
 * snapshot). An arbitrary live ticker needs a configurable free-tier provider
 * key — Finnhub by default, because its free tier allows browser (CORS)
 * requests and exposes quote, profile, and beta. The key lives in React state
 * only and is sent only to the provider.
 */
import type { FocusInstrument } from "../types";

export async function fetchLiveInstrument(ticker: string, finnhubKey: string): Promise<FocusInstrument> {
  const sym = ticker.trim().toUpperCase();
  const base = "https://finnhub.io/api/v1";
  const [quote, profile, metrics]: any[] = await Promise.all([
    fetch(`${base}/quote?symbol=${encodeURIComponent(sym)}&token=${finnhubKey}`).then((r) => {
      if (r.status === 401 || r.status === 403) throw new Error("Invalid Finnhub API key.");
      if (!r.ok) throw new Error(`Finnhub quote error ${r.status}`);
      return r.json();
    }),
    fetch(`${base}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${finnhubKey}`)
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({})),
    fetch(`${base}/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all&token=${finnhubKey}`)
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({})),
  ]);

  if (!quote || !quote.c) {
    throw new Error(`No quote for "${sym}" — check the ticker (US-listed symbols on the free tier).`);
  }

  const beta = metrics?.metric?.beta;
  return {
    ticker: sym,
    name: profile?.name || sym,
    price: typeof quote.c === "number" ? quote.c : null,
    asOf: quote.t ? new Date(quote.t * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    beta90d: typeof beta === "number" ? Number(beta.toFixed(2)) : null,
    sector: profile?.finnhubIndustry || "Unknown",
    assetClass: "Live ticker (Finnhub)",
    sensitivities: "Derived live — see sector and beta",
    source: "Finnhub free tier (live quote, profile, beta) — fetched in-browser with your key",
    live: true,
  };
}
