import { z } from "zod";

const newsParsing = z.object({
  core_fact: z.string().min(1),
  directional_surprise_vs_consensus: z.string().min(1),
  source_credibility_score: z.number().min(1).max(10),
});

const affectedIndicator = z.object({
  indicator: z.string().min(1),
  expected_direction: z.enum(["UP", "DOWN", "UNCHANGED"]),
  expected_magnitude_bps_or_pct: z.string().min(1),
  time_horizon: z.enum(["intraday", "days", "weeks"]),
});

const crossAssetCall = z.object({
  asset: z.string().min(1),
  call: z.string().min(1),
  rationale: z.string().min(1),
});

const tradeIdea = z.object({
  instrument: z.string().min(1),
  direction: z.enum(["LONG", "SHORT"]),
  entry_level: z.string().min(1),
  target_level: z.string().min(1),
  stop_loss: z.string().min(1),
  expected_holding_period: z.string().min(1),
  sizing_as_pct_risk_budget: z.string().min(1),
  conviction_score: z.number().min(1).max(10),
  thesis: z.string().min(1),
  what_would_invalidate: z.string().min(1),
});

export const strategistOutputSchema = z.object({
  news_parsing: newsParsing,
  directly_affected_indicators: z.array(affectedIndicator).min(1),
  cross_asset_implications: z.object({
    rates: z.array(crossAssetCall).min(1),
    fx: z.array(crossAssetCall).min(1),
    equities: z.array(crossAssetCall).min(1),
    commodities: z.array(crossAssetCall).min(1),
    credit: z.array(crossAssetCall).min(1),
  }),
  trade_ideas: z.array(tradeIdea).min(3).max(5),
  second_order_effects: z.string().min(1),
  focus_instrument_read: z.string().nullable(),
});

/**
 * Hand-written JSON Schema sent to the API as output_config.format.
 * Kept free of constraints the API doesn't support (min/max etc.);
 * those are enforced client-side by the Zod schema above.
 */
export const strategistJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "news_parsing",
    "directly_affected_indicators",
    "cross_asset_implications",
    "trade_ideas",
    "second_order_effects",
    "focus_instrument_read",
  ],
  properties: {
    news_parsing: {
      type: "object",
      additionalProperties: false,
      required: ["core_fact", "directional_surprise_vs_consensus", "source_credibility_score"],
      properties: {
        core_fact: { type: "string" },
        directional_surprise_vs_consensus: {
          type: "string",
          description: "Cite the consensus number where applicable",
        },
        source_credibility_score: { type: "integer", description: "1-10" },
      },
    },
    directly_affected_indicators: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["indicator", "expected_direction", "expected_magnitude_bps_or_pct", "time_horizon"],
        properties: {
          indicator: { type: "string", description: "Must be a dashboard indicator id from the provided list" },
          expected_direction: { type: "string", enum: ["UP", "DOWN", "UNCHANGED"] },
          expected_magnitude_bps_or_pct: { type: "string" },
          time_horizon: { type: "string", enum: ["intraday", "days", "weeks"] },
        },
      },
    },
    cross_asset_implications: {
      type: "object",
      additionalProperties: false,
      required: ["rates", "fx", "equities", "commodities", "credit"],
      properties: Object.fromEntries(
        ["rates", "fx", "equities", "commodities", "credit"].map((k) => [
          k,
          {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["asset", "call", "rationale"],
              properties: {
                asset: { type: "string" },
                call: { type: "string" },
                rationale: { type: "string", description: "One line" },
              },
            },
          },
        ]),
      ),
    },
    trade_ideas: {
      type: "array",
      description: "3 to 5 illustrative expressions",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "instrument",
          "direction",
          "entry_level",
          "target_level",
          "stop_loss",
          "expected_holding_period",
          "sizing_as_pct_risk_budget",
          "conviction_score",
          "thesis",
          "what_would_invalidate",
        ],
        properties: {
          instrument: { type: "string" },
          direction: { type: "string", enum: ["LONG", "SHORT"] },
          entry_level: { type: "string" },
          target_level: { type: "string" },
          stop_loss: { type: "string" },
          expected_holding_period: { type: "string" },
          sizing_as_pct_risk_budget: { type: "string" },
          conviction_score: { type: "integer" },
          thesis: { type: "string", description: "One paragraph" },
          what_would_invalidate: { type: "string", description: "The single data point that kills it" },
        },
      },
    },
    second_order_effects: { type: "string", description: "One paragraph on where consensus is likely wrong" },
    focus_instrument_read: { type: ["string", "null"] },
  },
} as const;
