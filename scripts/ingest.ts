/**
 * macro-desk ingest pipeline.
 *
 * Pulls ~90 trading days of history for 18 macro indicators and a small set of
 * preset focus instruments, computes latest value / daily delta / 90-day
 * z-score for each, and writes public/macro/dashboard.json.
 *
 * Sources:
 *  - FRED (Federal Reserve Bank of St. Louis). If FRED_API_KEY is set, the
 *    official JSON API is used; otherwise the public fredgraph.csv endpoint
 *    (no key required). Both return identical official series data.
 *  - Yahoo Finance public chart API (configurable via MARKET_PROVIDER) for
 *    daily copper and corn futures and for instrument snapshots — FRED has no
 *    daily copper/ags series.
 *
 * INTEGRITY RULE: numbers are never fabricated. If a source is unreachable,
 * the indicator is written with history: [] and null stats plus an `error`
 * note, and the run still completes so the schema + provenance are committed.
 *
 * Run: npm run ingest
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "public", "macro", "dashboard.json");

const Z_WINDOW = 90; // trailing observations for mean / std dev
const HISTORY_KEEP = 100; // observations kept for sparklines
const FRED_API_KEY = process.env.FRED_API_KEY || "";
const MARKET_PROVIDER = (process.env.MARKET_PROVIDER || "yahoo").toLowerCase();

type Obs = { d: string; v: number };

interface IndicatorSpec {
  id: string;
  name: string;
  short: string;
  unit: string;
  decimals: number;
  category: "rates" | "inflation" | "fx" | "vol" | "equities" | "credit" | "commodities";
  provider: "fred" | "market";
  providerSymbol: string; // FRED series id or market ticker
  sourceLabel: string;
  sourceUrl: string;
}

const INDICATORS: IndicatorSpec[] = [
  { id: "DGS2", name: "US 2-Year Treasury Yield", short: "UST 2Y", unit: "%", decimals: 2, category: "rates", provider: "fred", providerSymbol: "DGS2", sourceLabel: "FRED · DGS2 (Board of Governors H.15)", sourceUrl: "https://fred.stlouisfed.org/series/DGS2" },
  { id: "DGS10", name: "US 10-Year Treasury Yield", short: "UST 10Y", unit: "%", decimals: 2, category: "rates", provider: "fred", providerSymbol: "DGS10", sourceLabel: "FRED · DGS10 (Board of Governors H.15)", sourceUrl: "https://fred.stlouisfed.org/series/DGS10" },
  { id: "DGS30", name: "US 30-Year Treasury Yield", short: "UST 30Y", unit: "%", decimals: 2, category: "rates", provider: "fred", providerSymbol: "DGS30", sourceLabel: "FRED · DGS30 (Board of Governors H.15)", sourceUrl: "https://fred.stlouisfed.org/series/DGS30" },
  { id: "T10Y2Y", name: "2s10s Treasury Curve (10Y minus 2Y)", short: "2s10s", unit: "%", decimals: 2, category: "rates", provider: "fred", providerSymbol: "T10Y2Y", sourceLabel: "FRED · T10Y2Y", sourceUrl: "https://fred.stlouisfed.org/series/T10Y2Y" },
  { id: "SOFR", name: "Secured Overnight Financing Rate", short: "SOFR", unit: "%", decimals: 2, category: "rates", provider: "fred", providerSymbol: "SOFR", sourceLabel: "FRED · SOFR (New York Fed)", sourceUrl: "https://fred.stlouisfed.org/series/SOFR" },
  { id: "T10YIE", name: "10-Year Breakeven Inflation Rate", short: "10Y B/E", unit: "%", decimals: 2, category: "inflation", provider: "fred", providerSymbol: "T10YIE", sourceLabel: "FRED · T10YIE", sourceUrl: "https://fred.stlouisfed.org/series/T10YIE" },
  { id: "DTWEXBGS", name: "Nominal Broad US Dollar Index", short: "Broad USD", unit: "idx", decimals: 2, category: "fx", provider: "fred", providerSymbol: "DTWEXBGS", sourceLabel: "FRED · DTWEXBGS (Board of Governors)", sourceUrl: "https://fred.stlouisfed.org/series/DTWEXBGS" },
  { id: "DEXUSEU", name: "EUR / USD Spot Exchange Rate", short: "EURUSD", unit: "$/€", decimals: 4, category: "fx", provider: "fred", providerSymbol: "DEXUSEU", sourceLabel: "FRED · DEXUSEU (H.10)", sourceUrl: "https://fred.stlouisfed.org/series/DEXUSEU" },
  { id: "DEXJPUS", name: "USD / JPY Spot Exchange Rate", short: "USDJPY", unit: "¥/$", decimals: 2, category: "fx", provider: "fred", providerSymbol: "DEXJPUS", sourceLabel: "FRED · DEXJPUS (H.10)", sourceUrl: "https://fred.stlouisfed.org/series/DEXJPUS" },
  { id: "VIXCLS", name: "CBOE Volatility Index (VIX)", short: "VIX", unit: "idx", decimals: 2, category: "vol", provider: "fred", providerSymbol: "VIXCLS", sourceLabel: "FRED · VIXCLS (CBOE)", sourceUrl: "https://fred.stlouisfed.org/series/VIXCLS" },
  { id: "SP500", name: "S&P 500 Index", short: "S&P 500", unit: "idx", decimals: 2, category: "equities", provider: "fred", providerSymbol: "SP500", sourceLabel: "FRED · SP500 (S&P Dow Jones)", sourceUrl: "https://fred.stlouisfed.org/series/SP500" },
  { id: "NASDAQCOM", name: "NASDAQ Composite Index", short: "NASDAQ", unit: "idx", decimals: 2, category: "equities", provider: "fred", providerSymbol: "NASDAQCOM", sourceLabel: "FRED · NASDAQCOM (NASDAQ OMX)", sourceUrl: "https://fred.stlouisfed.org/series/NASDAQCOM" },
  { id: "BAMLH0A0HYM2", name: "US High Yield Option-Adjusted Spread", short: "HY OAS", unit: "%", decimals: 2, category: "credit", provider: "fred", providerSymbol: "BAMLH0A0HYM2", sourceLabel: "FRED · BAMLH0A0HYM2 (ICE BofA)", sourceUrl: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2" },
  { id: "BAMLC0A0CM", name: "US Investment Grade Option-Adjusted Spread", short: "IG OAS", unit: "%", decimals: 2, category: "credit", provider: "fred", providerSymbol: "BAMLC0A0CM", sourceLabel: "FRED · BAMLC0A0CM (ICE BofA)", sourceUrl: "https://fred.stlouisfed.org/series/BAMLC0A0CM" },
  { id: "BAMLEMCBPIOAS", name: "EM Corporate Plus Option-Adjusted Spread", short: "EM OAS", unit: "%", decimals: 2, category: "credit", provider: "fred", providerSymbol: "BAMLEMCBPIOAS", sourceLabel: "FRED · BAMLEMCBPIOAS (ICE BofA)", sourceUrl: "https://fred.stlouisfed.org/series/BAMLEMCBPIOAS" },
  { id: "DCOILWTICO", name: "WTI Crude Oil Spot Price", short: "WTI", unit: "$/bbl", decimals: 2, category: "commodities", provider: "fred", providerSymbol: "DCOILWTICO", sourceLabel: "FRED · DCOILWTICO (EIA)", sourceUrl: "https://fred.stlouisfed.org/series/DCOILWTICO" },
  // FRED has no daily copper or ags series (PCOPPUSDM etc. are monthly), so
  // these two come from the configurable market provider and are labeled as such.
  { id: "COPPER", name: "Copper Front-Month Future (COMEX HG)", short: "Copper", unit: "$/lb", decimals: 3, category: "commodities", provider: "market", providerSymbol: "HG=F", sourceLabel: "Yahoo Finance chart API · HG=F (COMEX)", sourceUrl: "https://finance.yahoo.com/quote/HG%3DF" },
  { id: "CORN", name: "Corn Front-Month Future (CBOT ZC)", short: "Corn", unit: "¢/bu", decimals: 2, category: "commodities", provider: "market", providerSymbol: "ZC=F", sourceLabel: "Yahoo Finance chart API · ZC=F (CBOT)", sourceUrl: "https://finance.yahoo.com/quote/ZC%3DF" },
];

interface InstrumentSpec {
  ticker: string;
  yahoo: string;
  name: string;
  assetClass: string;
  sector: string;
  sensitivities: string;
}

const INSTRUMENTS: InstrumentSpec[] = [
  { ticker: "SPY", yahoo: "SPY", name: "SPDR S&P 500 ETF Trust", assetClass: "US large-cap equity ETF", sector: "Broad market", sensitivities: "US growth, real yields, equity risk premium" },
  { ticker: "TLT", yahoo: "TLT", name: "iShares 20+ Year Treasury Bond ETF", assetClass: "Long-duration Treasury ETF", sector: "Rates / duration", sensitivities: "Long-end yields (duration ~16y), inflation expectations, flight-to-quality" },
  { ticker: "GLD", yahoo: "GLD", name: "SPDR Gold Shares", assetClass: "Gold bullion ETF", sector: "Precious metals", sensitivities: "Real yields (inverse), USD (inverse), tail-risk hedging flows" },
  { ticker: "HYG", yahoo: "HYG", name: "iShares iBoxx $ High Yield Corporate Bond ETF", assetClass: "High-yield credit ETF", sector: "Credit", sensitivities: "HY OAS, default cycle, equity vol, oil (energy issuer weight)" },
  { ticker: "AAPL", yahoo: "AAPL", name: "Apple Inc.", assetClass: "Single stock", sector: "Information Technology", sensitivities: "Consumer demand, China exposure, USD strength, long-duration cash flows vs. rates" },
  { ticker: "NVDA", yahoo: "NVDA", name: "NVIDIA Corporation", assetClass: "Single stock", sector: "Information Technology (Semiconductors)", sensitivities: "AI capex cycle, export controls, rates via long-duration growth multiple" },
];

// ---------------------------------------------------------------------------

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString().slice(0, 10);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (macro-desk ingest; personal project)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchJson(url: string): Promise<any> {
  return JSON.parse(await fetchText(url));
}

/** FRED via official API (key) or public fredgraph.csv (no key). */
async function fetchFredSeries(seriesId: string): Promise<Obs[]> {
  const start = isoDaysAgo(220); // enough calendar days for >100 trading obs
  if (FRED_API_KEY) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${start}`;
    const json = await fetchJson(url);
    return (json.observations as any[])
      .filter((o) => o.value !== ".")
      .map((o) => ({ d: o.date as string, v: Number(o.value) }))
      .filter((o) => Number.isFinite(o.v));
  }
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=${start}`;
  const csv = await fetchText(url);
  const lines = csv.trim().split("\n");
  const out: Obs[] = [];
  for (const line of lines.slice(1)) {
    const [d, raw] = line.split(",");
    if (!d || raw === undefined || raw.trim() === ".") continue;
    const v = Number(raw);
    if (Number.isFinite(v)) out.push({ d: d.trim(), v });
  }
  return out;
}

/** Daily closes from the market provider (Yahoo chart API or Stooq CSV). */
async function fetchMarketSeries(symbol: string): Promise<Obs[]> {
  if (MARKET_PROVIDER === "stooq") {
    const s = symbol.replace("=F", ".f").toLowerCase();
    const csv = await fetchText(`https://stooq.com/q/d/l/?s=${s}&i=d`);
    return csv
      .trim()
      .split("\n")
      .slice(1)
      .map((line) => {
        const [d, , , , close] = line.split(",");
        return { d, v: Number(close) };
      })
      .filter((o) => o.d && Number.isFinite(o.v));
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=8mo&interval=1d`;
  const json = await fetchJson(url);
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No chart result for ${symbol}`);
  const ts: number[] = result.timestamp ?? [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const out: Obs[] = [];
  for (let i = 0; i < ts.length; i++) {
    const v = closes[i];
    if (v === null || v === undefined || !Number.isFinite(v)) continue;
    out.push({ d: new Date(ts[i] * 1000).toISOString().slice(0, 10), v });
  }
  // Dedupe by date (intraday last bar can share the latest date)
  const byDate = new Map<string, number>();
  for (const o of out) byDate.set(o.d, o.v);
  return [...byDate.entries()].map(([d, v]) => ({ d, v })).sort((a, b) => (a.d < b.d ? -1 : 1));
}

/** Latest value, 1-day delta, z-score vs trailing Z_WINDOW obs (sample std). */
function computeStats(history: Obs[]) {
  if (history.length < 2) return { latest: null, asOf: null, delta: null, zscore: null };
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const window = history.slice(-Z_WINDOW).map((o) => o.v);
  const mean = window.reduce((a, b) => a + b, 0) / window.length;
  const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / (window.length - 1);
  const std = Math.sqrt(variance);
  return {
    latest: latest.v,
    asOf: latest.d,
    delta: latest.v - prev.v,
    zscore: std > 0 ? (latest.v - mean) / std : 0,
  };
}

/** Beta of `series` vs `benchmark` over the trailing 90 aligned daily returns. */
function computeBeta(series: Obs[], benchmark: Obs[]): number | null {
  const bench = new Map(benchmark.map((o) => [o.d, o.v]));
  const pairs: [number, number][] = [];
  let prevS: Obs | null = null;
  let prevB: number | null = null;
  for (const o of series) {
    const b = bench.get(o.d);
    if (b === undefined) continue;
    if (prevS && prevB !== null) {
      pairs.push([o.v / prevS.v - 1, b / prevB - 1]);
    }
    prevS = o;
    prevB = b;
  }
  const win = pairs.slice(-90);
  if (win.length < 30) return null;
  const mS = win.reduce((a, p) => a + p[0], 0) / win.length;
  const mB = win.reduce((a, p) => a + p[1], 0) / win.length;
  let cov = 0;
  let varB = 0;
  for (const [s, b] of win) {
    cov += (s - mS) * (b - mB);
    varB += (b - mB) ** 2;
  }
  return varB > 0 ? cov / varB : null;
}

// ---------------------------------------------------------------------------

async function main() {
  console.log(`macro-desk ingest — FRED via ${FRED_API_KEY ? "official API (key)" : "public fredgraph.csv (no key)"}, market provider: ${MARKET_PROVIDER}`);

  const indicators: any[] = [];
  for (const spec of INDICATORS) {
    try {
      const raw = spec.provider === "fred"
        ? await fetchFredSeries(spec.providerSymbol)
        : await fetchMarketSeries(spec.providerSymbol);
      const history = raw.slice(-HISTORY_KEEP);
      const stats = computeStats(history);
      indicators.push({ ...spec, history, ...stats, error: null });
      console.log(`  ✓ ${spec.id.padEnd(14)} ${String(history.length).padStart(3)} obs  latest=${stats.latest}  as of ${stats.asOf}  z=${stats.zscore?.toFixed(2)}`);
    } catch (err: any) {
      indicators.push({ ...spec, history: [], latest: null, asOf: null, delta: null, zscore: null, error: String(err?.message ?? err) });
      console.error(`  ✗ ${spec.id}: ${err?.message ?? err} — committed as null per integrity rule`);
    }
    await new Promise((r) => setTimeout(r, 250)); // be polite to free endpoints
  }

  // Instruments: snapshot price + deterministic 90d beta vs SPY.
  let spyHistory: Obs[] = [];
  const instruments: any[] = [];
  try {
    spyHistory = await fetchMarketSeries("SPY");
  } catch (err: any) {
    console.error(`  ✗ SPY benchmark history: ${err?.message ?? err}`);
  }
  for (const spec of INSTRUMENTS) {
    try {
      const hist = spec.yahoo === "SPY" && spyHistory.length ? spyHistory : await fetchMarketSeries(spec.yahoo);
      const last = hist[hist.length - 1];
      const beta = spec.yahoo === "SPY" ? 1.0 : computeBeta(hist, spyHistory);
      instruments.push({
        ticker: spec.ticker,
        name: spec.name,
        assetClass: spec.assetClass,
        sector: spec.sector,
        sensitivities: spec.sensitivities,
        price: last?.v ?? null,
        asOf: last?.d ?? null,
        beta90d: beta === null ? null : Number(beta.toFixed(2)),
        source: "Yahoo Finance chart API (daily close); beta computed from trailing 90 aligned daily returns vs SPY",
        error: null,
      });
      console.log(`  ✓ ${spec.ticker.padEnd(5)} price=${last?.v?.toFixed(2)} as of ${last?.d}  beta90d=${beta === null ? "n/a" : beta.toFixed(2)}`);
    } catch (err: any) {
      instruments.push({ ticker: spec.ticker, name: spec.name, assetClass: spec.assetClass, sector: spec.sector, sensitivities: spec.sensitivities, price: null, asOf: null, beta90d: null, source: "Yahoo Finance chart API", error: String(err?.message ?? err) });
      console.error(`  ✗ ${spec.ticker}: ${err?.message ?? err} — committed as null per integrity rule`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const payload = {
    schema: "macro-desk/dashboard/v1",
    generatedAt: new Date().toISOString(),
    zWindow: Z_WINDOW,
    methodology: {
      delta: "latest value minus prior observation",
      zscore: `(latest − mean) / sample std dev over the trailing ${Z_WINDOW} observations (including latest)`,
      beta: "OLS slope of instrument daily returns vs SPY daily returns, trailing 90 aligned sessions",
      integrity: "No value in this file is fabricated. Unreachable sources are committed as null with an error note.",
    },
    indicators,
    instruments,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 1));
  const ok = indicators.filter((i) => i.latest !== null).length;
  console.log(`\nWrote ${OUT_PATH}`);
  console.log(`${ok}/${indicators.length} indicators populated, ${instruments.filter((i) => i.price !== null).length}/${instruments.length} instruments populated.`);
  if (ok < indicators.length) process.exitCode = 0; // still a valid commit per integrity rule
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
