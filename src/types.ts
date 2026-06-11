export interface Obs {
  d: string;
  v: number;
}

export interface Indicator {
  id: string;
  name: string;
  short: string;
  unit: string;
  decimals: number;
  category: "rates" | "inflation" | "fx" | "vol" | "equities" | "credit" | "commodities";
  provider: "fred" | "market";
  providerSymbol: string;
  sourceLabel: string;
  sourceUrl: string;
  history: Obs[];
  latest: number | null;
  asOf: string | null;
  delta: number | null;
  zscore: number | null;
  error: string | null;
}

export interface Instrument {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  sensitivities: string;
  price: number | null;
  asOf: string | null;
  beta90d: number | null;
  source: string;
  error?: string | null;
}

export interface DashboardData {
  schema: string;
  generatedAt: string;
  zWindow: number;
  methodology: {
    delta: string;
    zscore: string;
    beta: string;
    integrity: string;
  };
  indicators: Indicator[];
  instruments: Instrument[];
}

// ---- Strategist output (LLM judgment layer) --------------------------------

export interface NewsParsing {
  core_fact: string;
  directional_surprise_vs_consensus: string;
  source_credibility_score: number;
}

export interface AffectedIndicator {
  indicator: string; // dashboard indicator id, e.g. "DGS2"
  expected_direction: "UP" | "DOWN" | "UNCHANGED";
  expected_magnitude_bps_or_pct: string;
  time_horizon: "intraday" | "days" | "weeks";
}

export interface CrossAssetCall {
  asset: string;
  call: string; // directional call
  rationale: string; // one line
}

export interface CrossAssetImplications {
  rates: CrossAssetCall[];
  fx: CrossAssetCall[];
  equities: CrossAssetCall[];
  commodities: CrossAssetCall[];
  credit: CrossAssetCall[];
}

export interface TradeIdea {
  instrument: string;
  direction: "LONG" | "SHORT";
  entry_level: string;
  target_level: string;
  stop_loss: string;
  expected_holding_period: string;
  sizing_as_pct_risk_budget: string;
  conviction_score: number;
  thesis: string;
  what_would_invalidate: string;
}

export interface StrategistOutput {
  news_parsing: NewsParsing;
  directly_affected_indicators: AffectedIndicator[];
  cross_asset_implications: CrossAssetImplications;
  trade_ideas: TradeIdea[];
  second_order_effects: string;
  focus_instrument_read: string | null;
}

export interface Scenario {
  id: string;
  label: string;
  eventText: string;
  eventDate: string;
  focusTicker: string | null;
  note: string;
  output: StrategistOutput;
}

export interface FocusInstrument {
  ticker: string;
  name: string;
  price: number | null;
  asOf: string | null;
  beta90d: number | null;
  sector: string;
  assetClass: string;
  sensitivities: string;
  source: string;
  live: boolean;
}
