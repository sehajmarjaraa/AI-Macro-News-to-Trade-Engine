# macro-desk

A global macro strategist tool, built as a static personal-project site. It does two things:

1. **A real 18-indicator macro dashboard** built from free public data (FRED + a free market provider), with daily deltas and 90-day z-scores computed deterministically in TypeScript — in the ingest script and again in your browser. No key, no network, no LLM involved in any number.
2. **A strategist layer**: paste a macro news event (optionally with a focus instrument) and one LLM call — on the *visitor's own* Anthropic key — returns a structured cross-asset read: news parsing, directly affected indicators (highlighted live on the dashboard), cross-asset implications, 3–5 illustrative trade expressions, second-order effects, and a focus-instrument read.

> **Disclaimer (also pinned on every page of the site):** this is an educational global-macro demonstration using public data as of the stated dates. All trade ideas are illustrative strategist hypotheses — not investment advice, not recommendations.

## Quick start

```bash
npm install
npm run dev        # fully usable immediately — no API key needed
```

First load shows the real committed dashboard (every value dated and sourced) and a preset scenario's full strategist output — zero API calls, zero keys. Live analysis of your own scenario requires pasting your Anthropic API key into the UI.

```bash
npm run ingest     # refresh /public/macro/dashboard.json from FRED + market provider
npm run build      # static production build to dist/
```

## The hard boundary: who computes what

| Layer | Computes | Runs |
|---|---|---|
| `scripts/ingest.ts` | Pulls raw history; computes latest / delta / z-score / beta | Node, at snapshot time |
| `src/lib/engine.ts` | **Recomputes** delta + z-score from the committed history | Browser, deterministic, no key |
| `src/lib/anthropic.ts` | Nothing numeric. News parsing, directional calls, trade hypotheses — judgment only | One Claude call on the visitor's key |

The LLM receives the dashboard JSON as ground truth with an explicit instruction never to recompute or alter a value, and its trade levels must anchor to levels present in the snapshot (or be expressed in relative terms). Every macro and market figure on the page traces to FRED or the committed snapshot.

## Data and provenance

**18 indicators.** 16 from FRED official series (DGS2, DGS10, DGS30, T10Y2Y, SOFR, T10YIE, DTWEXBGS, DEXUSEU, DEXJPUS, VIXCLS, SP500, NASDAQCOM, BAMLH0A0HYM2, BAMLC0A0CM, BAMLEMCBPIOAS, DCOILWTICO). FRED has **no daily copper or agricultural series** (its copper/ags series are monthly), so the remaining 2 — Copper (COMEX HG front month) and Corn (CBOT ZC front month) — come from the configurable free market provider and are labeled with that source on their tiles and in the methodology table.

**Ingest key handling.** `FRED_API_KEY` is read from the environment **at ingest only** (see `.env.example`) and uses the official FRED API. With no key, ingest falls back to FRED's public `fredgraph.csv` endpoint — same official series data, no key required. The browser app never touches FRED.

**Market provider.** Default is Yahoo Finance's public chart API (free, no key); `MARKET_PROVIDER=stooq` switches to Stooq CSV. Used for the two commodity series and the instrument presets.

**Instrument presets** (SPY, TLT, GLD, HYG, AAPL, NVDA): price snapshotted and dated; **beta is computed in the ingest code** as the OLS slope of trailing 90 aligned daily returns vs SPY (real prices, deterministic math); sector/asset-class are static facts. These work in the UI with no market-data key.

**Math.** Daily delta = latest − prior observation. Z-score = (latest − mean) / sample standard deviation over the trailing 90 observations (including the latest). Stated on the site's methodology panel.

**Integrity rule.** No number is ever fabricated. If a source is unreachable at ingest time the pipeline still commits: the indicator ships with `history: []`, null stats, and the error string; the UI renders "unavailable" with the failure note. The exact ingest commands and the JSON schema live in `scripts/ingest.ts`.

## Preset scenarios

Five **real, dated historical events**, stated as plain facts (no copyrighted article text), each *replayed against the current snapshot*: the May-2024 CPI miss (3.3% vs 3.4% consensus), the September 2024 50bp FOMC cut, the August 5 2024 yen-carry unwind, the April 2 2025 reciprocal tariff announcement, and the March 2023 SVB failure. Each ships with a precomputed strategist output whose entry/target/stop levels are anchored to the actual committed snapshot values, so presets render with **zero API calls**. The UI labels them "precomputed preset · real event replayed against the current snapshot."

## The strategist call

- `@anthropic-ai/sdk` in the browser (`dangerouslyAllowBrowser: true`), model `claude-opus-4-8` (current default Claude model), one call per run.
- Output is constrained server-side by a strict JSON schema (`output_config.format`) and validated client-side with Zod; one retry on validation failure, then a clear error.
- **Key handling (stated in the UI):** the Anthropic key lives in React state only — never localStorage, never cookies, never any backend — and is sent exclusively to `api.anthropic.com`. Refreshing the page forgets it.
- Arbitrary live focus tickers use a configurable market-data key (Finnhub free tier, CORS-enabled); without one, the UI prompts you to pick a preset instrument or run without a focus name. The no-key experience is never blocked.

## Assumptions made (single-pass delivery)

1. **"Temperature 0"** — the original spec asked for temperature 0; sampling parameters are removed on current Claude models (the API rejects them), so determinism of *structure* is enforced via strict structured outputs and a tightly specified prompt instead. Documented in `src/lib/anthropic.ts`.
2. **Copper/ags** — interpreted "daily copper and ags" as two of the 18 indicators (copper + corn) sourced from the market-provider fallback, since FRED has no daily series for either.
3. **"DFF or SOFR"** — chose SOFR (the active policy-adjacent overnight rate); the two extra "sensible macro series" beyond the spec's examples are SOFR's slot plus Corn/Copper completing commodities coverage across rates/inflation/FX/vol/equities/credit/commodities.
4. **Live ticker provider** — Finnhub chosen because its free tier allows browser CORS requests and exposes quote + sector + beta in one place. Yahoo can't be called from a browser (no CORS), which is why it's used at ingest time only.
5. **Preset scenario outputs** — authored as strategist judgment against the June 10, 2026 snapshot. If you re-run `npm run ingest` much later, preset *analysis levels* will reference the snapshot date stated in each card while dashboard tiles update — re-author `src/data/scenarios.ts` if drift bothers you (the scenario header states the replay framing either way).
6. **Builder credit** — the site credits Sehaj Marjara with LinkedIn (`linkedin.com/in/sehajmarjara`), GitHub (`github.com/sehajmarjara` — correct this in `Hero.tsx`, `About.tsx`, and `Footer.tsx` if your handle differs), and email. Before sharing on LinkedIn, also set the absolute `og:url` / `og:image` URLs in `index.html` to your deployed domain — a real 1200×630 screenshot already ships at `public/og.png`, so link previews work as soon as the domain is filled in.
7. **EM sovereign** — FRED's free daily EM spread series is the ICE BofA EM **corporate** plus index (BAMLEMCBPIOAS); the strategist layer treats it as the EM spread proxy and the cross-asset grid labels EM sovereign calls accordingly.

## Deploying (all free)

The build is fully static (`dist/`), uses relative asset paths (`base: "./"`), and needs no server, no env vars, and no rewrites.

- **Vercel** — import the repo; framework preset Vite; build `npm run build`, output `dist`.
- **Cloudflare Pages** — build `npm run build`, output directory `dist`.
- **GitHub Pages** — `npm run build`, publish `dist/` (e.g. `actions/deploy-pages` or push `dist` to `gh-pages`). Relative base means project-subpath URLs work unchanged.
- **Hugging Face Spaces (static)** — create a Space with the `static` SDK and upload the contents of `dist/` (or CI-copy them) to the Space root.

Refreshing data is just `npm run ingest && npm run build` — the snapshot is a committed artifact, so deploys are reproducible and the site works even if every upstream API is down.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4 (static build) · Node + TypeScript ingest (`tsx`) · `@anthropic-ai/sdk` + Zod for the strategist layer · Inter Tight for UI, JetBrains Mono for every number. No backend, no paid services, no tracking.
