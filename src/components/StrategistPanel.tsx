import { useState } from "react";
import { useReveal } from "../hooks/useReveal";
import type { DashboardData, FocusInstrument, Scenario } from "../types";
import { fmtDate } from "../lib/format";

interface Props {
  data: DashboardData;
  scenarios: Scenario[];
  activeScenarioId: string | null;
  focus: FocusInstrument | null;
  focusInput: string;
  running: boolean;
  error: string | null;
  anthropicKey: string;
  marketKey: string;
  onFocusInput: (v: string) => void;
  onPickPresetInstrument: (ticker: string) => void;
  onClearFocus: () => void;
  onResolveLiveTicker: () => void;
  onAnthropicKey: (v: string) => void;
  onMarketKey: (v: string) => void;
  onScenario: (s: Scenario) => void;
  onRun: (eventText: string) => void;
  eventText: string;
  onEventText: (v: string) => void;
}

export default function StrategistPanel(props: Props) {
  const {
    data, scenarios, activeScenarioId, focus, focusInput, running, error,
    anthropicKey, marketKey, onFocusInput, onPickPresetInstrument, onClearFocus,
    onResolveLiveTicker, onAnthropicKey, onMarketKey, onScenario, onRun,
    eventText, onEventText,
  } = props;
  const [keysOpen, setKeysOpen] = useState(false);
  const ref = useReveal<HTMLElement>();

  const presetTickers = data.instruments.map((i) => i.ticker);
  const focusIsUnresolved =
    focusInput.trim() !== "" && (!focus || focus.ticker !== focusInput.trim().toUpperCase());

  return (
    <section ref={ref} id="strategist" className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-edge scroll-mt-14">
      <div className="section-label mb-6">
        <span className="idx">01</span>
        <span>strategist</span>
      </div>
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">Run an event through the desk</h2>
        <p className="text-mut text-sm mt-1">
          Pick a preset scenario (no key needed — output is precomputed), or paste any macro event and run it live
          with your own Anthropic key. The dashboard numbers are never touched by the model.
        </p>
      </div>

      <div className="mt-7 max-w-3xl flex flex-col gap-4">
        {/* 1 — Focus instrument (sits ABOVE the scenario box) */}
        <div>
          <label htmlFor="focus" className="text-[11px] uppercase tracking-[0.16em] text-faint">
            1 · Focus instrument <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="focus"
              value={focusInput}
              onChange={(e) => onFocusInput(e.target.value)}
              placeholder="Ticker, e.g. SPY — or leave empty"
              className="num flex-1 min-w-0 bg-surface border border-edge focus:border-accent/60 outline-none px-3 py-2.5 text-sm placeholder:text-faint"
              spellCheck={false}
            />
            {focusIsUnresolved && (
              <button
                onClick={onResolveLiveTicker}
                className="shrink-0 px-3 py-2 text-xs border border-edge text-mut hover:border-accent/60 hover:text-accent cursor-pointer"
              >
                fetch live
              </button>
            )}
            {focus && (
              <button
                onClick={onClearFocus}
                className="shrink-0 px-3 py-2 text-xs border border-edge text-faint hover:text-down hover:border-down/50 cursor-pointer"
              >
                clear
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-faint mr-1">presets (no market key):</span>
            {presetTickers.map((t) => (
              <button
                key={t}
                onClick={() => onPickPresetInstrument(t)}
                className={`num text-[11px] px-2 py-1 border cursor-pointer ${
                  focus?.ticker === t && !focus.live
                    ? "border-accent/60 text-accent bg-accent/10"
                    : "border-edge text-mut hover:border-edge-2"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {focus && (
            <p className="mt-2 text-[11px] text-mut num">
              {focus.ticker} · {focus.price !== null ? `$${focus.price.toFixed(2)}` : "price n/a"} as of {fmtDate(focus.asOf)} · β
              {focus.beta90d ?? "n/a"} · {focus.sector}
              <span className="text-faint"> — {focus.live ? "live via Finnhub" : "committed snapshot"}</span>
            </p>
          )}
          {focusIsUnresolved && !marketKey && (
            <p className="mt-2 text-[11px] text-warn/90">
              Arbitrary live tickers need a market-data key (Finnhub, free tier) — add one under “keys” below, pick a
              preset chip instead, or just run without a focus instrument.
            </p>
          )}
        </div>

        {/* 2 — Scenario / news event */}
        <div>
          <label htmlFor="event" className="text-[11px] uppercase tracking-[0.16em] text-faint">
            2 · Scenario / news event
          </label>
          <textarea
            id="event"
            value={eventText}
            onChange={(e) => onEventText(e.target.value)}
            rows={4}
            placeholder={'Type or paste a macro event, e.g. "CPI printed 3.4% y/y vs 3.2% expected; core 3.6%."'}
            className="mt-1.5 w-full bg-surface border border-edge focus:border-accent/60 outline-none px-3 py-2.5 text-sm leading-relaxed placeholder:text-faint resize-y"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-faint mr-1">preset scenarios (zero API calls):</span>
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => onScenario(s)}
                className={`text-[11px] px-2 py-1 border cursor-pointer ${
                  activeScenarioId === s.id
                    ? "border-accent/60 text-accent bg-accent/10"
                    : "border-edge text-mut hover:border-edge-2"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 — Run */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onRun(eventText)}
            disabled={running || !eventText.trim() || !anthropicKey.trim()}
            className="px-5 py-2.5 text-sm font-medium bg-accent text-bg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 cursor-pointer"
          >
            {running ? "Running the desk…" : "Run live analysis"}
          </button>
          <button
            onClick={() => setKeysOpen(!keysOpen)}
            className="text-xs text-mut hover:text-accent underline underline-offset-4 decoration-edge-2 cursor-pointer"
          >
            keys {anthropicKey ? "·· set" : keysOpen ? "▴" : "▾"}
          </button>
          {!anthropicKey.trim() && (
            <span className="text-[11px] text-faint">
              Live runs need your Anthropic API key. Preset scenarios work with no key at all.
            </span>
          )}
        </div>

        {keysOpen && (
          <div className="border border-edge bg-surface p-4 flex flex-col gap-3 rise-in">
            <div>
              <label htmlFor="akey" className="text-[11px] text-mut">Anthropic API key (required for live analysis)</label>
              <input
                id="akey"
                type="password"
                value={anthropicKey}
                onChange={(e) => onAnthropicKey(e.target.value)}
                placeholder="sk-ant-…"
                autoComplete="off"
                className="num mt-1 w-full bg-surface-2 border border-edge focus:border-accent/60 outline-none px-3 py-2 text-sm placeholder:text-faint"
              />
            </div>
            <div>
              <label htmlFor="mkey" className="text-[11px] text-mut">Market-data key (optional, Finnhub free tier — only for arbitrary live tickers)</label>
              <input
                id="mkey"
                type="password"
                value={marketKey}
                onChange={(e) => onMarketKey(e.target.value)}
                placeholder="finnhub token"
                autoComplete="off"
                className="num mt-1 w-full bg-surface-2 border border-edge focus:border-accent/60 outline-none px-3 py-2 text-sm placeholder:text-faint"
              />
            </div>
            <p className="text-[11px] text-faint leading-relaxed">
              Keys live in React state only — never written to localStorage, cookies, or any backend. The Anthropic key
              is sent exclusively to api.anthropic.com; the market key exclusively to finnhub.io. Refreshing the page
              forgets both.
            </p>
          </div>
        )}

        {error && (
          <div className="border border-down/40 bg-down/10 px-4 py-3 text-sm text-down rise-in">{error}</div>
        )}
      </div>
    </section>
  );
}
