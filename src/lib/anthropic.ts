/**
 * The strategist layer. One LLM call on the visitor's own Anthropic key.
 *
 * Boundary: the LLM receives the real dashboard JSON (computed deterministically
 * by the engine) and produces judgment only — news parsing, cross-asset calls,
 * illustrative trade hypotheses. It never computes a dashboard value.
 *
 * The key lives in React state only, is sent only to api.anthropic.com, and is
 * never persisted (no localStorage, no cookies, no backend).
 *
 * Note on determinism: the spec called for temperature 0; sampling parameters
 * are removed on current Claude models (the API rejects them), so determinism
 * is approached instead via structured outputs (a strict JSON schema) and a
 * tightly specified prompt. Output structure is schema-enforced server-side
 * and Zod-validated client-side with one retry.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { DashboardData, FocusInstrument, StrategistOutput } from "../types";
import { strategistJsonSchema, strategistOutputSchema } from "./schema";

const MODEL = "claude-opus-4-8"; // current default Claude model

function buildPrompt(data: DashboardData, eventText: string, focus: FocusInstrument | null): string {
  const indicatorTable = data.indicators.map((i) => ({
    id: i.id,
    name: i.name,
    unit: i.unit,
    latest: i.latest,
    as_of: i.asOf,
    daily_delta: i.delta,
    zscore_90d: i.zscore === null ? null : Number(i.zscore.toFixed(2)),
    source: i.sourceLabel,
  }));

  const focusBlock = focus
    ? `\n## Focus instrument (real snapshot)\n${JSON.stringify(
        {
          ticker: focus.ticker,
          name: focus.name,
          price: focus.price,
          as_of: focus.asOf,
          beta_90d_vs_SPY: focus.beta90d,
          sector: focus.sector,
          asset_class: focus.assetClass,
          known_sensitivities: focus.sensitivities,
          source: focus.source,
        },
        null,
        2,
      )}\n`
    : "";

  return `You are a senior global macro strategist at a multi-asset fund. Below is the REAL current macro dashboard (values, daily deltas, and z-scores vs a trailing ${data.zWindow}-observation window, all computed deterministically from FRED and market data — do NOT recompute or alter any of them; treat them as ground truth) followed by a news event.

## Dashboard (snapshot generated ${data.generatedAt})
${JSON.stringify(indicatorTable, null, 2)}
${focusBlock}
## News event
"""
${eventText.trim()}
"""

Produce a structured cross-asset read as JSON matching the required schema exactly.

Rules:
- "directly_affected_indicators[].indicator" MUST be an id from the dashboard list above (e.g. "DGS2", "VIXCLS", "BAMLH0A0HYM2").
- In directional_surprise_vs_consensus, cite the consensus number where applicable.
- cross_asset_implications must cover: rates (front-end, belly, long-end, breakevens), fx (DXY, EUR, JPY, EM), equities (S&P, NDX, RTY, sector tilts), commodities (gold, oil, copper, ags), credit (IG, HY, EM sovereign) — one entry per asset, each with a directional call and a one-line rationale.
- trade_ideas: 3 to 5 expressions. Anchor every entry/target/stop to the REAL levels in the dashboard or focus snapshot above (never invent a level for something not provided — for instruments without a level above, express levels in relative terms like "+25bp from current"). These are ILLUSTRATIVE strategist hypotheses for an educational demo, not advice — write them as such.
- second_order_effects: one paragraph on where consensus is likely wrong and how to position for the divergence.
- focus_instrument_read: ${focus ? `map the event to ${focus.ticker} specifically, using its real beta (${focus.beta90d}), sector (${focus.sector}), and rate/FX/commodity sensitivities.` : "no focus instrument was provided — return null."}
- Voice: specific and confident; commit to a direction; no hedging filler.`;
}

export interface StrategistError {
  kind: "auth" | "rate_limit" | "network" | "validation" | "other";
  message: string;
}

export async function runStrategist(
  apiKey: string,
  data: DashboardData,
  eventText: string,
  focus: FocusInstrument | null,
): Promise<StrategistOutput> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const prompt = buildPrompt(data, eventText, focus);

  let lastIssue = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: Anthropic.MessageParam[] =
      attempt === 0
        ? [{ role: "user", content: prompt }]
        : [
            { role: "user", content: prompt },
            {
              role: "user",
              content: `Your previous output failed validation: ${lastIssue}. Return corrected JSON matching the schema exactly.`,
            },
          ];
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { format: { type: "json_schema", schema: strategistJsonSchema as any } },
      messages,
    });
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    try {
      const parsed = strategistOutputSchema.parse(JSON.parse(text));
      return parsed as StrategistOutput;
    } catch (err: any) {
      lastIssue = String(err?.message ?? err).slice(0, 600);
      if (attempt === 1) {
        throw { kind: "validation", message: `Output failed schema validation twice: ${lastIssue}` } satisfies StrategistError;
      }
    }
  }
  throw { kind: "other", message: "unreachable" } satisfies StrategistError;
}

export function classifyError(err: any): StrategistError {
  if (err?.kind) return err as StrategistError;
  if (err instanceof Anthropic.AuthenticationError) {
    return { kind: "auth", message: "Invalid Anthropic API key." };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { kind: "rate_limit", message: "Rate limited by the Anthropic API — wait a moment and retry." };
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return { kind: "network", message: "Could not reach api.anthropic.com — check your connection." };
  }
  if (err instanceof Anthropic.APIError) {
    return { kind: "other", message: `Anthropic API error ${err.status}: ${err.message}` };
  }
  return { kind: "other", message: String(err?.message ?? err) };
}
