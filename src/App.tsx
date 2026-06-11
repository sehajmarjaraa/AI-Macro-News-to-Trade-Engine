import { useEffect, useMemo, useRef, useState } from "react";
import type { DashboardData, FocusInstrument, Scenario, StrategistOutput } from "./types";
import { enrich } from "./lib/engine";
import { classifyError, runStrategist } from "./lib/anthropic";
import { fetchLiveInstrument } from "./lib/market";
import { SCENARIOS } from "./data/scenarios";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Tape from "./components/Tape";
import About from "./components/About";
import StrategistPanel from "./components/StrategistPanel";
import AnalysisView from "./components/AnalysisView";
import Dashboard from "./components/Dashboard";
import Methodology from "./components/Methodology";
import Footer from "./components/Footer";

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [eventText, setEventText] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [focus, setFocus] = useState<FocusInstrument | null>(null);
  const [anthropicKey, setAnthropicKey] = useState("");
  const [marketKey, setMarketKey] = useState("");

  const [output, setOutput] = useState<StrategistOutput | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Load the committed snapshot (same-origin static file — no key, no third-party
  // network) and recompute deltas/z-scores deterministically in the browser.
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}macro/dashboard.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((raw: DashboardData) => {
        raw.indicators = raw.indicators.map((i) => enrich(i, raw.zWindow));
        setData(raw);
      })
      .catch((e) => setLoadError(String(e?.message ?? e)));
  }, []);

  // First load shows a preset scenario's full output with no key and no network.
  useEffect(() => {
    if (data && !output && SCENARIOS.length) {
      applyScenario(SCENARIOS[0], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function findPreset(ticker: string): FocusInstrument | null {
    const p = data?.instruments.find((i) => i.ticker === ticker.toUpperCase());
    if (!p) return null;
    return {
      ticker: p.ticker,
      name: p.name,
      price: p.price,
      asOf: p.asOf,
      beta90d: p.beta90d,
      sector: p.sector,
      assetClass: p.assetClass,
      sensitivities: p.sensitivities,
      source: p.source,
      live: false,
    };
  }

  function applyScenario(s: Scenario, scroll = true) {
    setEventText(s.eventText);
    setActiveScenarioId(s.id);
    setOutput(s.output);
    setError(null);
    if (s.focusTicker) {
      setFocusInput(s.focusTicker);
      setFocus(findPreset(s.focusTicker));
    } else {
      setFocusInput("");
      setFocus(null);
    }
    if (scroll) analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickPresetInstrument(ticker: string) {
    const p = findPreset(ticker);
    if (p) {
      setFocus(p);
      setFocusInput(ticker);
    }
  }

  async function resolveLiveTicker() {
    const t = focusInput.trim().toUpperCase();
    if (!t) return;
    const preset = findPreset(t);
    if (preset) {
      setFocus(preset);
      return;
    }
    if (!marketKey.trim()) {
      setError(
        `"${t}" isn't a committed preset. Live tickers need a market-data key (Finnhub free tier) — add one under "keys", pick a preset instrument, or run without a focus name.`,
      );
      return;
    }
    setError(null);
    try {
      setFocus(await fetchLiveInstrument(t, marketKey.trim()));
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  }

  async function run(text: string) {
    if (!data || !text.trim() || !anthropicKey.trim()) return;
    setRunning(true);
    setError(null);
    setActiveScenarioId(null);
    // If a typed ticker matches a preset but wasn't explicitly resolved, use it.
    let f = focus;
    if (!f && focusInput.trim()) {
      f = findPreset(focusInput.trim());
      if (f) setFocus(f);
      else if (!marketKey.trim()) {
        setError(
          `"${focusInput.trim().toUpperCase()}" isn't a preset and no market-data key is set — running without a focus instrument. Add a Finnhub key or pick a preset chip to attach one.`,
        );
      }
    }
    try {
      const result = await runStrategist(anthropicKey.trim(), data, text, f);
      setOutput(result);
      requestAnimationFrame(() =>
        analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (e: any) {
      const c = classifyError(e);
      setError(c.message);
    } finally {
      setRunning(false);
    }
  }

  const affectedMap = useMemo(() => {
    const m = new Map<string, { dir: string; mag: string; horizon: string }>();
    if (output && data) {
      const ids = new Set(data.indicators.map((i) => i.id));
      for (const a of output.directly_affected_indicators) {
        if (ids.has(a.indicator)) {
          m.set(a.indicator, {
            dir: a.expected_direction,
            mag: a.expected_magnitude_bps_or_pct,
            horizon: a.time_horizon,
          });
        }
      }
    }
    return m;
  }, [output, data]);

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="border border-down/40 bg-down/10 p-6 max-w-lg text-sm text-mut">
          <p className="text-down font-medium mb-2">Could not load the committed snapshot.</p>
          <p>
            <span className="num">public/macro/dashboard.json</span> failed to load ({loadError}). Run{" "}
            <span className="num">npm run ingest</span> to generate it, then reload.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center">
        <span className="num text-faint text-sm">loading committed snapshot…</span>
      </div>
    );
  }

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) ?? null;

  return (
    <div id="top" className="min-h-screen">
      <Tape indicators={data.indicators} />
      <Nav />
      <Hero indicators={data.indicators} generatedAt={data.generatedAt} />

      <StrategistPanel
        data={data}
        scenarios={SCENARIOS}
        activeScenarioId={activeScenarioId}
        focus={focus}
        focusInput={focusInput}
        running={running}
        error={error}
        anthropicKey={anthropicKey}
        marketKey={marketKey}
        onFocusInput={setFocusInput}
        onPickPresetInstrument={pickPresetInstrument}
        onClearFocus={() => {
          setFocus(null);
          setFocusInput("");
        }}
        onResolveLiveTicker={resolveLiveTicker}
        onAnthropicKey={setAnthropicKey}
        onMarketKey={setMarketKey}
        onScenario={applyScenario}
        onRun={run}
        eventText={eventText}
        onEventText={setEventText}
      />

      <div ref={analysisRef} className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-6">
        {output && (
          <div className="py-10 sm:py-12 border-b border-edge">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">Strategist read</h2>
              {activeScenario ? (
                <span className="text-[11px] text-faint">
                  precomputed preset · {activeScenario.note}
                </span>
              ) : (
                <span className="text-[11px] text-faint">live output · Claude on your key</span>
              )}
            </div>
            <AnalysisView output={output} focusTicker={focus?.ticker ?? activeScenario?.focusTicker ?? null} />
          </div>
        )}
      </div>

      <Dashboard
        indicators={data.indicators}
        affectedMap={affectedMap}
        readLabel={output ? (activeScenario ? activeScenario.label : "your live event") : null}
      />
      <About />
      <Methodology data={data} />
      <Footer />
    </div>
  );
}
