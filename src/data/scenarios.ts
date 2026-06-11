/**
 * Preset scenarios: real, dated historical macro events stated as plain facts,
 * replayed against the CURRENT committed dashboard snapshot (June 2026).
 *
 * Each output is a precomputed strategist read so presets render with zero API
 * calls. All entry/target/stop levels are anchored to the real values in
 * public/macro/dashboard.json at authoring time (UST 2Y 4.13%, 10Y 4.53%,
 * 30Y 5.01%, 2s10s +42bp, VIX 19.87, S&P 7,386.65, HY OAS 278bp, IG OAS 75bp,
 * EM OAS 143bp, WTI $95.00, USDJPY 160.26, EURUSD 1.1533, SPY $725.43,
 * TLT $84.88, GLD $374.58, HYG $79.47, AAPL $291.58 β0.87, NVDA $200.42 β1.92).
 *
 * Every trade expression here is an ILLUSTRATIVE HYPOTHESIS for an educational
 * demo — not advice, not a recommendation.
 */
import type { Scenario } from "../types";

export const SCENARIOS: Scenario[] = [
  {
    id: "cpi-soft-jun2024",
    label: "CPI miss (Jun '24 print)",
    eventDate: "2024-06-12",
    focusTicker: "TLT",
    note: "real event (Jun 12, 2024) replayed against the current snapshot",
    eventText:
      "US May CPI printed 3.3% y/y versus 3.4% expected; core CPI 3.4% y/y versus 3.5% expected; headline m/m was 0.0% versus 0.1% consensus. (Real print, released June 12, 2024 — replayed against today's dashboard.)",
    output: {
      news_parsing: {
        core_fact:
          "Headline CPI rose 3.3% y/y with a flat 0.0% m/m reading — a clean downside miss on both headline (vs 3.4% consensus) and core (3.4% vs 3.5%).",
        directional_surprise_vs_consensus:
          "Dovish surprise: headline missed consensus of 3.4% y/y by a tenth and the 0.0% m/m print missed the 0.1% consensus — small in level, large in direction given how stretched front-end pricing is.",
        source_credibility_score: 10,
      },
      directly_affected_indicators: [
        { indicator: "DGS2", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "12–18bp", time_horizon: "intraday" },
        { indicator: "DGS10", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "8–12bp", time_horizon: "intraday" },
        { indicator: "T10YIE", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "3–5bp", time_horizon: "days" },
        { indicator: "T10Y2Y", expected_direction: "UP", expected_magnitude_bps_or_pct: "+4–8bp steeper (bull steepening)", time_horizon: "days" },
        { indicator: "SP500", expected_direction: "UP", expected_magnitude_bps_or_pct: "+0.8–1.2%", time_horizon: "intraday" },
        { indicator: "DTWEXBGS", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−0.3–0.5%", time_horizon: "days" },
      ],
      cross_asset_implications: {
        rates: [
          { asset: "Front-end (2Y @ 4.13%)", call: "Lower yields", rationale: "A soft m/m print pulls cut pricing forward; the front end leads the move." },
          { asset: "Belly (10Y @ 4.53%)", call: "Lower yields", rationale: "Belly follows the front end with a smaller beta as term premium stays sticky." },
          { asset: "Long-end (30Y @ 5.01%)", call: "Modestly lower", rationale: "Supply and term premium cap the rally; 30Y lags a front-end-led move." },
          { asset: "Breakevens (10Y B/E 2.34%)", call: "Slightly tighter", rationale: "Realized disinflation compresses the inflation-risk premium at the margin." },
        ],
        fx: [
          { asset: "DXY / Broad USD (120.08)", call: "Weaker", rationale: "Rate differentials are the dollar's whole story here; front-end repricing cuts them." },
          { asset: "EUR (1.1533)", call: "Stronger vs USD", rationale: "Pure dollar-leg move — EUR rallies on US yield compression, not euro news." },
          { asset: "JPY (160.26)", call: "Stronger vs USD", rationale: "USDJPY is the most rate-differential-sensitive major at these levels." },
          { asset: "EM FX", call: "Stronger", rationale: "Softer US front end eases the global funding constraint; carry comes back on." },
        ],
        equities: [
          { asset: "S&P 500 (7,386.65)", call: "Higher", rationale: "Disinflation with growth intact is the textbook goldilocks bid." },
          { asset: "NDX / NASDAQ (25,678.82)", call: "Higher, leads", rationale: "Long-duration growth gets the biggest discount-rate kicker." },
          { asset: "RTY (small caps)", call: "Higher, beta to cuts", rationale: "Floating-rate-debt-heavy small caps are the purest cut-timing trade." },
          { asset: "Sector tilt", call: "Homebuilders, REITs over banks", rationale: "Rate-sensitive duration plays win; net-interest-margin stories lag." },
        ],
        commodities: [
          { asset: "Gold (GLD $374.58)", call: "Higher", rationale: "Lower real yields plus a softer dollar is gold's best combination." },
          { asset: "Oil (WTI $95.00)", call: "Mildly higher", rationale: "Demand read-through is mildly positive; this is not oil's primary driver." },
          { asset: "Copper ($6.17/lb)", call: "Higher", rationale: "Weaker dollar plus soft-landing odds support the growth-metal bid." },
          { asset: "Ags (corn 419¢, −1.8σ)", call: "Unchanged", rationale: "CPI is not a driver; corn stays a supply story at a 90-day stretched low." },
        ],
        credit: [
          { asset: "IG (OAS 75bp, −1.1σ)", call: "Grind tighter", rationale: "Already rich, but lower yields pull in yield-buyer demand." },
          { asset: "HY (OAS 278bp, −0.9σ)", call: "Tighter", rationale: "Cut-timing relief supports the leveraged-borrower refinancing path." },
          { asset: "EM sovereign (proxy EM OAS 143bp)", call: "Tighter", rationale: "Softer US front end is the classic EM external-funding tailwind." },
        ],
      },
      trade_ideas: [
        {
          instrument: "TLT (20+yr Treasury ETF)",
          direction: "LONG",
          entry_level: "$84.88 (snapshot close)",
          target_level: "$89.00",
          stop_loss: "$82.60",
          expected_holding_period: "2–4 weeks",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 7,
          thesis:
            "Illustrative hypothesis: duration is the cleanest expression of a downside CPI surprise. With the 10Y at 4.53% and the 30Y at 5.01%, a single soft m/m print restarts the cut-repricing trade that a +0.7σ front end has spent three months fading. TLT at $84.88 with a 0.21 beta to SPY gives convex exposure to the move with limited equity correlation; the target corresponds to roughly 25–30bp of long-end rally.",
          what_would_invalidate: "The next monthly core CPI printing at or above 0.3% m/m kills the disinflation impulse and the trade.",
        },
        {
          instrument: "UST 2s10s steepener (vs +42bp spot)",
          direction: "LONG",
          entry_level: "+42bp (snapshot 2s10s)",
          target_level: "+75bp",
          stop_loss: "+25bp",
          expected_holding_period: "1–3 months",
          sizing_as_pct_risk_budget: "20%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: a dovish inflation surprise is a bull-steepening event — the 2Y at 4.13% has far more room to reprice toward cuts than the 10Y at 4.53% has to rally through sticky term premium and supply. The curve at +42bp sits −0.9σ below its 90-day mean, so the position also harvests mean-reversion; the steepener is the highest-conviction structure because it wins on cuts regardless of where the long end settles.",
          what_would_invalidate: "A hawkish dot-plot or sticky core-services print that forces cut pricing back out of the front end.",
        },
        {
          instrument: "GLD (gold ETF)",
          direction: "LONG",
          entry_level: "$374.58 (snapshot close)",
          target_level: "$394.00",
          stop_loss: "$365.00",
          expected_holding_period: "1–2 months",
          sizing_as_pct_risk_budget: "10%",
          conviction_score: 6,
          thesis:
            "Illustrative hypothesis: gold gets both transmission channels at once — real yields fall as nominals rally faster than the 2.34% breakeven compresses, and the 120.08 broad dollar softens on rate differentials. The ~5% target is consistent with a 15–20bp real-yield move at gold's recent sensitivity.",
          what_would_invalidate: "Real 10Y yields rising despite the print (nominals down less than breakevens) — that breaks the entire transmission.",
        },
        {
          instrument: "USDJPY (spot 160.26)",
          direction: "SHORT",
          entry_level: "160.26 (snapshot)",
          target_level: "155.00",
          stop_loss: "162.80",
          expected_holding_period: "2–6 weeks",
          sizing_as_pct_risk_budget: "10%",
          conviction_score: 6,
          thesis:
            "Illustrative hypothesis: at 160+ the yen is priced for permanent US front-end stickiness. A CPI miss compresses the 2Y differential that holds the pair up, and positioning is one-way enough that 2–3% comes out fast. Asymmetric: intervention risk and BoJ normalization both point the same direction as the trade.",
          what_would_invalidate: "US 2Y yields closing back above their pre-print level within a week — the differential story reasserts and the carry bid returns.",
        },
      ],
      second_order_effects:
        "Consensus will read one soft print as the all-clear and chase the index higher; the likelier divergence is WHERE the rally happens. With IG at 75bp (−1.1σ) and HY at 278bp (−0.9σ), credit has already spent the good news — spreads can barely tighten from a 90-day rich extreme, while the +42bp curve and 4.13% front end have not begun to price the cut path this print implies. Position for rotation, not levitation: rates and steepeners over incremental credit beta, and fade the reflex bid in the dollar-sensitive megacaps if the broad dollar fails to break below 119.",
      focus_instrument_read:
        "TLT ($84.88, β 0.21 vs SPY, duration ~16y): this event maps almost one-for-one onto the focus name. A downside CPI surprise moves TLT through the long-end rally channel — roughly +1.6% NAV per 10bp of 30Y yield decline — while its 0.21 beta means an equity celebration adds little; this is a pure rates expression, not a risk-on proxy. The snapshot tape (30Y 5.01%, +0.30σ vs 90d) leaves room for 25–30bp of mean-reverting rally before supply-driven term premium becomes the binding constraint again, putting $89 in reach. The asymmetry: sticky-core CPI re-acceleration is the one scenario where TLT loses on both legs (yields up, no flight-to-quality bid).",
    },
  },

  {
    id: "fomc-50bp-sep2024",
    label: "FOMC cuts 50bp (Sep '24)",
    eventDate: "2024-09-18",
    focusTicker: null,
    note: "real event (Sep 18, 2024) replayed against the current snapshot",
    eventText:
      "The FOMC cut the federal funds target range by 50 basis points to 4.75%–5.00%, its first cut of the cycle, with the dot plot showing 50bp of further cuts by year-end. Markets had been split roughly 50/50 between 25bp and 50bp, with most surveyed economists expecting 25bp. (Real event, September 18, 2024 — replayed against today's dashboard.)",
    output: {
      news_parsing: {
        core_fact:
          "The Fed front-loaded the easing cycle with a 50bp cut to 4.75–5.00% and guided to 50bp more by year-end — choosing to start big rather than late.",
        directional_surprise_vs_consensus:
          "Dovish vs the economist consensus of 25bp; roughly in line with market pricing that had drifted to ~60% odds of 50bp. The surprise is in the signal — a jumbo first cut without a crisis is a deliberate recalibration, not panic.",
        source_credibility_score: 10,
      },
      directly_affected_indicators: [
        { indicator: "SOFR", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "~50bp mechanically", time_horizon: "intraday" },
        { indicator: "DGS2", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "5–10bp then chop", time_horizon: "days" },
        { indicator: "DGS30", expected_direction: "UP", expected_magnitude_bps_or_pct: "+5–10bp", time_horizon: "days" },
        { indicator: "T10Y2Y", expected_direction: "UP", expected_magnitude_bps_or_pct: "+10–15bp steeper", time_horizon: "weeks" },
        { indicator: "T10YIE", expected_direction: "UP", expected_magnitude_bps_or_pct: "+4–8bp", time_horizon: "weeks" },
        { indicator: "SP500", expected_direction: "UP", expected_magnitude_bps_or_pct: "+1–2% over the week", time_horizon: "days" },
      ],
      cross_asset_implications: {
        rates: [
          { asset: "Front-end (2Y @ 4.13%)", call: "Anchored lower", rationale: "Policy path now leads the 2Y down; every data point gets read through a cutting lens." },
          { asset: "Belly (10Y @ 4.53%)", call: "Rangebound", rationale: "Caught between front-end gravity and reflation risk — the belly is the battleground." },
          { asset: "Long-end (30Y @ 5.01%)", call: "Higher yields", rationale: "Easing into a non-recession is term-premium-positive; the bond vigilante trade lives at 30y." },
          { asset: "Breakevens (2.34%)", call: "Wider", rationale: "Front-loaded cuts with growth intact raise the medium-term inflation floor." },
        ],
        fx: [
          { asset: "DXY / Broad USD (120.08)", call: "Weaker", rationale: "The Fed leading the global easing race is the cleanest dollar-negative setup." },
          { asset: "EUR (1.1533)", call: "Higher", rationale: "ECB-Fed differential narrows from the US side; 1.17+ becomes the magnet." },
          { asset: "JPY (160.26)", call: "Sharply higher", rationale: "Carry compression hits the most stretched funding pair hardest." },
          { asset: "EM FX", call: "Bid", rationale: "A cutting Fed plus no recession is the best EM carry regime there is." },
        ],
        equities: [
          { asset: "S&P 500 (7,386.65)", call: "Higher", rationale: "Insurance easing with positive earnings growth has historically been bought." },
          { asset: "NDX (25,678.82)", call: "Higher but lags RTY", rationale: "Mega-cap growth needs falling LONG rates; it gets a steeper curve instead." },
          { asset: "RTY (small caps)", call: "Outperforms", rationale: "Jumbo cut is a direct subsidy to floating-rate balance sheets." },
          { asset: "Sector tilt", call: "Banks, cyclicals over staples", rationale: "Steeper curve rebuilds NIM; recalibration-not-recession favors cyclicality." },
        ],
        commodities: [
          { asset: "Gold ($374.58)", call: "Higher", rationale: "Falling policy rates with rising breakevens crush real yields — gold's core driver." },
          { asset: "Oil (WTI $95.00)", call: "Higher", rationale: "Demand insurance at $95 tightens an already-tight tape toward triple digits." },
          { asset: "Copper ($6.17/lb)", call: "Higher", rationale: "Front-loaded easing into decent growth is the reflation bid for industrial metals." },
          { asset: "Ags (corn 419¢)", call: "Mildly higher", rationale: "Weaker dollar lifts export competitiveness off a −1.8σ base; macro is secondary." },
        ],
        credit: [
          { asset: "IG (OAS 75bp)", call: "Sideways-to-tighter", rationale: "All-in yields falling keeps the yield-buyer bid even at −1.1σ rich spreads." },
          { asset: "HY (OAS 278bp)", call: "Tighter", rationale: "The refi wall just got cheaper; default tail compresses with the front end." },
          { asset: "EM sovereign (143bp)", call: "Tighter", rationale: "Dollar down plus UST front end down is the EM hard-currency sweet spot." },
        ],
      },
      trade_ideas: [
        {
          instrument: "UST 2s10s steepener (vs +42bp spot)",
          direction: "LONG",
          entry_level: "+42bp (snapshot 2s10s)",
          target_level: "+90bp",
          stop_loss: "+22bp",
          expected_holding_period: "2–4 months",
          sizing_as_pct_risk_budget: "25%",
          conviction_score: 9,
          thesis:
            "Illustrative hypothesis: a jumbo first cut without recession is the single most reliable steepener catalyst in the playbook — the front end gets pinned to the policy path while the long end absorbs term premium and reflation risk. At +42bp (−0.9σ vs 90d) the entry is statistically cheap to its own recent history, and the trade carries positively as cuts roll in. This is the core position; everything else is satellite.",
          what_would_invalidate: "A hard-landing data run (payrolls negative) that turns this into a bull FLATTENER as the long end outruns the front.",
        },
        {
          instrument: "HYG (high-yield ETF)",
          direction: "LONG",
          entry_level: "$79.47 (snapshot close)",
          target_level: "$82.00",
          stop_loss: "$77.90",
          expected_holding_period: "1–2 months",
          sizing_as_pct_risk_budget: "10%",
          conviction_score: 6,
          thesis:
            "Illustrative hypothesis: HY at 278bp is rich, but a recalibration cut attacks the asset class's only real risk — refinancing cost — directly. HYG at $79.47 with a 0.27 beta earns carry plus modest spread compression in the regime where cuts land on a solvent corporate sector. Modest sizing because the spread cushion at −0.9σ is thin; this is a carry trade, not a convexity trade.",
          what_would_invalidate: "HY OAS widening through 330bp — that says markets read the 50bp as the Fed seeing something credit doesn't.",
        },
        {
          instrument: "USDJPY (spot 160.26)",
          direction: "SHORT",
          entry_level: "160.26 (snapshot)",
          target_level: "152.00",
          stop_loss: "163.50",
          expected_holding_period: "1–3 months",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 7,
          thesis:
            "Illustrative hypothesis: the pair at 160.26 embodies the maximum-carry regime the Fed just started dismantling. Fifty basis points off the funding differential, guidance for fifty more, and a crowd positioned the other way — the unwind tends to travel 5%+ once it starts, and the BoJ's normalization bias means policy risk is asymmetric in the trade's favor.",
          what_would_invalidate: "US front-end yields rising back through pre-FOMC levels (re-acceleration scare) — the carry differential rebuilds and the pair grinds to new highs.",
        },
        {
          instrument: "GLD (gold ETF)",
          direction: "LONG",
          entry_level: "$374.58 (snapshot close)",
          target_level: "$405.00",
          stop_loss: "$362.00",
          expected_holding_period: "3–6 months",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: cutting cycles that start without a recession are gold's best historical regime — real yields fall while the dollar weakens and the inflation floor (B/E 2.34%) drifts up. An ~8% target is the modest end of past first-cut-to-sixth-month moves, and the position hedges the equity book against the scenario where the Fed proves to have eased into sticky inflation.",
          what_would_invalidate: "Breakevens falling alongside nominal yields — disinflationary cuts lift real rates' floor and remove gold's bid.",
        },
      ],
      second_order_effects:
        "Consensus reads a jumbo cut as uniformly risk-on; the underpriced divergence is at the LONG end. Easing 50bp into 4%+ nominal growth with the 30Y already at 5.01% invites the term-premium trade — curve steepeners, not duration, are the asymmetric expression, and the 'buy TLT on cuts' reflex is the crowded mistake to fade. Second, with IG at −1.1σ and HY at −0.9σ, credit cannot tighten enough to pay for its convexity; equities and EM FX are where the easing premium actually accrues. Position: max steepener, long gold, fade long-duration rallies above entry.",
      focus_instrument_read: null,
    },
  },

  {
    id: "yen-unwind-aug2024",
    label: "Yen carry unwind (Aug '24)",
    eventDate: "2024-08-05",
    focusTicker: "NVDA",
    note: "real event (Aug 5, 2024) replayed against the current snapshot",
    eventText:
      "Global carry-trade unwind: the Nikkei 225 fell 12.4% in a single session — its worst day since 1987 — after the BoJ's July 31 rate hike and a weak US July payrolls print (114k vs ~175k expected; unemployment 4.3%). The VIX spiked above 60 intraday and S&P futures fell roughly 4%. (Real event, August 5, 2024 — replayed against today's dashboard.)",
    output: {
      news_parsing: {
        core_fact:
          "A leveraged yen-funded carry complex unwound violently: Nikkei −12.4% in one session, VIX above 60 intraday, and a global de-grossing wave triggered by a BoJ hike colliding with weak US payrolls.",
        directional_surprise_vs_consensus:
          "Massive risk-off surprise: payrolls at 114k missed the ~175k consensus and tripped the Sahm rule at 4.3% unemployment, while consensus had treated the BoJ hike as a non-event. The vol move (VIX from ~23 to 60+) was the tail few were paying for.",
        source_credibility_score: 10,
      },
      directly_affected_indicators: [
        { indicator: "VIXCLS", expected_direction: "UP", expected_magnitude_bps_or_pct: "+20–40 vol points from 19.87", time_horizon: "intraday" },
        { indicator: "DEXJPUS", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−3–6% (yen surge from 160.26)", time_horizon: "intraday" },
        { indicator: "SP500", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−3–5%", time_horizon: "intraday" },
        { indicator: "NASDAQCOM", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−4–6%", time_horizon: "intraday" },
        { indicator: "DGS2", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−15–25bp flight-to-quality", time_horizon: "intraday" },
        { indicator: "BAMLH0A0HYM2", expected_direction: "UP", expected_magnitude_bps_or_pct: "+40–80bp from 278bp", time_horizon: "days" },
        { indicator: "BAMLEMCBPIOAS", expected_direction: "UP", expected_magnitude_bps_or_pct: "+30–60bp from 143bp", time_horizon: "days" },
      ],
      cross_asset_implications: {
        rates: [
          { asset: "Front-end (2Y @ 4.13%)", call: "Sharply lower yields", rationale: "Panic brings emergency-cut pricing; the front end is the crisis hedge that pays." },
          { asset: "Belly (10Y @ 4.53%)", call: "Lower yields", rationale: "Flight-to-quality, but less than the front end — bull steepening through the panic." },
          { asset: "Long-end (30Y @ 5.01%)", call: "Lower but laggy", rationale: "Duration gets bought, then sold as deleveraging forces liquidation of what's liquid." },
          { asset: "Breakevens (2.34%)", call: "Tighter", rationale: "Growth scare compresses inflation compensation mechanically." },
        ],
        fx: [
          { asset: "DXY / Broad USD (120.08)", call: "Mixed — down vs JPY/CHF, up vs EM", rationale: "Funding currencies soar in an unwind; risk currencies bleed." },
          { asset: "EUR (1.1533)", call: "Mildly higher", rationale: "EUR is a bystander — gains on the dollar leg, loses on risk appetite." },
          { asset: "JPY (160.26)", call: "Violently stronger", rationale: "The epicenter: short-yen carry positions cover at any price." },
          { asset: "EM FX", call: "Sharply weaker", rationale: "Carry's long leg — MXN, BRL, high-yielders — takes the direct hit." },
        ],
        equities: [
          { asset: "S&P 500 (7,386.65)", call: "Down hard", rationale: "De-grossing sells the index first and asks questions later." },
          { asset: "NDX (25,678.82)", call: "Down harder", rationale: "Highest-beta, most crowded, most margin-financed — the unwind's natural prey." },
          { asset: "RTY", call: "Down with less crowding-beta", rationale: "Falls on growth fear but holds relatively — it was never the carry trade's long leg." },
          { asset: "Sector tilt", call: "Staples/utilities over semis and momentum", rationale: "Sell what's owned, hide in what isn't." },
        ],
        commodities: [
          { asset: "Gold ($374.58)", call: "Down first, up after", rationale: "Margin-call selling hits gold day one; the safe-haven bid wins the week." },
          { asset: "Oil (WTI $95.00)", call: "Lower", rationale: "From $95 a global growth scare takes 5–8% out fast — demand fear plus long liquidation." },
          { asset: "Copper ($6.17/lb)", call: "Lower", rationale: "Growth-proxy metal at +0.7σ has room to give back the reflation premium." },
          { asset: "Ags (corn 419¢)", call: "Resilient", rationale: "Already −1.8σ cheap and demand-inelastic — ags are the defensive commodity here." },
        ],
        credit: [
          { asset: "IG (OAS 75bp)", call: "Wider", rationale: "From −1.1σ rich there is no cushion; 75bp can be 95bp in two sessions." },
          { asset: "HY (OAS 278bp)", call: "Sharply wider", rationale: "HY is short vol by construction; a VIX-60 tape reprices the default tail violently." },
          { asset: "EM sovereign (143bp)", call: "Sharply wider", rationale: "EM external debt is the carry trade in bond form — it widens with the FX leg." },
        ],
      },
      trade_ideas: [
        {
          instrument: "NVDA",
          direction: "SHORT",
          entry_level: "$200.42 (snapshot close)",
          target_level: "$178.00",
          stop_loss: "$210.50",
          expected_holding_period: "3–10 days",
          sizing_as_pct_risk_budget: "10%",
          conviction_score: 7,
          thesis:
            "Illustrative hypothesis: in a forced de-grossing event you short the highest-beta, most-crowded name on the tape, and at β1.92 vs SPY that is NVDA. A 4–5% index drawdown maps to roughly −9% on the name mechanically, before any crowding penalty — momentum unwinds hit semis hardest because that's where the leverage lives. Tight stop because the snap-back in quality names is equally violent once funding stabilizes.",
          what_would_invalidate: "USDJPY stabilizing above 155 within 48 hours — the funding shock is over and the de-grossing bid evaporates.",
        },
        {
          instrument: "USDJPY (spot 160.26)",
          direction: "SHORT",
          entry_level: "160.26 (snapshot)",
          target_level: "150.00",
          stop_loss: "163.00",
          expected_holding_period: "1–3 weeks",
          sizing_as_pct_risk_budget: "20%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: this is the event's epicenter trade. A carry unwind is mechanically yen-positive — every levered yen-funded position covering is a USDJPY seller, and at 160.26 the pair sits at the maximum-stretch level where the 2024 episode began. The move is reflexive: yen strength forces more covering forces more yen strength. Sized large because it is also the best portfolio hedge for everything else risk-on.",
          what_would_invalidate: "Coordinated BoJ/MoF signaling AGAINST further yen strength plus US front-end yields backing up — the funding differential reasserts.",
        },
        {
          instrument: "TLT (20+yr Treasury ETF)",
          direction: "LONG",
          entry_level: "$84.88 (snapshot close)",
          target_level: "$90.50",
          stop_loss: "$82.90",
          expected_holding_period: "1–2 weeks",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 7,
          thesis:
            "Illustrative hypothesis: flight-to-quality duration is the classic crisis long, and with the 2Y at 4.13% there is enormous room for emergency-cut pricing to rally the whole curve. TLT's 0.21 equity beta makes it the cheapest convex hedge available in ETF form on this tape. Expect chop — deleveraging episodes sell Treasuries intraday to meet margin — so the stop is wide relative to the holding period.",
          what_would_invalidate: "VIX closing back under 25 within three sessions — the scare is over and the easing premium decays immediately.",
        },
        {
          instrument: "HYG (high-yield ETF)",
          direction: "SHORT",
          entry_level: "$79.47 (snapshot close)",
          target_level: "$76.50",
          stop_loss: "$80.80",
          expected_holding_period: "1–3 weeks",
          sizing_as_pct_risk_budget: "10%",
          conviction_score: 6,
          thesis:
            "Illustrative hypothesis: HY OAS at 278bp (−0.9σ, near the 90-day rich extreme) is priced for tranquility the day before a vol event. Spread risk is convex from rich levels — the first 60bp of widening happens almost without trading — and HYG's ETF wrapper gaps with equity vol while its NAV floor erodes more slowly, making the short cleaner than single-name CDS here.",
          what_would_invalidate: "HY OAS failing to widen beyond 310bp in the first week — the credit market is looking through the vol event and the carry costs you out.",
        },
      ],
      second_order_effects:
        "Consensus treats carry unwinds as 72-hour technical events and buys the dip on day three; the divergence worth positioning for is that the 2024 episode taught everyone that lesson too well. With VIX starting at 19.87 — not 12 — and credit at 90-day rich extremes, the cushion that made the fast recovery possible is absent: the second leg (forced redemption-driven, not margin-driven) arrives in week two if HY stays wider than ~330bp. The asymmetric trade is owning the second-leg tail via duration and yen length even after the equity tape stabilizes, because the consensus 'V' depends on credit spreads that no longer have room to absorb the shock.",
      focus_instrument_read:
        "NVDA ($200.42, β1.92 vs SPY, Information Technology — Semiconductors): the focus name is effectively a 2x-levered version of this event. The transmission is positioning, not fundamentals — AI capex doesn't change because Tokyo margin desks de-gross, but NVDA is the largest single concentration in global momentum books and the most common long leg funded (directly or synthetically) by cheap yen. A 4–5% S&P drawdown implies −8% to −10% on a 1.92 beta before crowding effects; the 2024 analog saw semis underperform the index by half again as much. The rate channel cuts the other way — flight-to-quality lowers the discount rate on long-duration growth — which is why the bounce, when funding stabilizes, tends to be led by exactly this name. Short-term short, but the invalidation discipline matters more than the entry.",
    },
  },

  {
    id: "tariffs-apr2025",
    label: "Reciprocal tariffs (Apr '25)",
    eventDate: "2025-04-02",
    focusTicker: "AAPL",
    note: "real event (Apr 2, 2025) replayed against the current snapshot",
    eventText:
      "The US announced sweeping reciprocal tariffs: a 10% baseline tariff on virtually all imports, with substantially higher country-specific rates on major trading partners including China. The S&P 500 fell roughly 4.8% the following session. (Real event, April 2, 2025 — replayed against today's dashboard.)",
    output: {
      news_parsing: {
        core_fact:
          "A 10% universal import tariff plus much higher country-specific reciprocal rates — a structural repricing of global goods trade, not a negotiating feint, with immediate effect on import-cost curves.",
        directional_surprise_vs_consensus:
          "Hawkish-on-trade surprise: consensus expected targeted, sector-specific measures; a universal 10% baseline with punitive country add-ons was outside the distribution most desks were pricing, as the ~5% next-day S&P drop showed.",
        source_credibility_score: 9,
      },
      directly_affected_indicators: [
        { indicator: "SP500", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−3–5%", time_horizon: "days" },
        { indicator: "NASDAQCOM", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−4–6% (supply-chain heavy)", time_horizon: "days" },
        { indicator: "T10YIE", expected_direction: "UP", expected_magnitude_bps_or_pct: "+5–10bp", time_horizon: "days" },
        { indicator: "DGS10", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−5–15bp (growth fear beats inflation fear)", time_horizon: "days" },
        { indicator: "DTWEXBGS", expected_direction: "UP", expected_magnitude_bps_or_pct: "+0.5–1% initially", time_horizon: "days" },
        { indicator: "COPPER", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−3–6% from $6.17/lb", time_horizon: "weeks" },
        { indicator: "BAMLEMCBPIOAS", expected_direction: "UP", expected_magnitude_bps_or_pct: "+25–50bp from 143bp", time_horizon: "weeks" },
      ],
      cross_asset_implications: {
        rates: [
          { asset: "Front-end (2Y @ 4.13%)", call: "Lower yields", rationale: "Markets price the growth hit and the Fed put before the inflation pass-through." },
          { asset: "Belly (10Y @ 4.53%)", call: "Lower yields, choppy", rationale: "Stagflation tug-of-war — growth fear wins the first move." },
          { asset: "Long-end (30Y @ 5.01%)", call: "Underperforms the rally", rationale: "Tariffs are an inflation tax; the long end carries the stagflation premium." },
          { asset: "Breakevens (2.34%)", call: "Wider", rationale: "A 10% import levy is a one-time price-level shock that markets partially extrapolate." },
        ],
        fx: [
          { asset: "DXY / Broad USD (120.08)", call: "Stronger initially, then eroding", rationale: "Tariffs are mechanically dollar-positive until retaliation taxes US growth." },
          { asset: "EUR (1.1533)", call: "Lower", rationale: "Export-dependent Europe is the collateral damage; ECB easing odds rise." },
          { asset: "JPY (160.26)", call: "Stronger", rationale: "Safe-haven and supply-chain-repatriation flows dominate carry erosion." },
          { asset: "EM FX", call: "Sharply weaker", rationale: "Tariff-targeted exporters take the direct hit; CNY-linked FX leads the bleed." },
        ],
        equities: [
          { asset: "S&P 500 (7,386.65)", call: "Lower", rationale: "Margin compression plus retaliation risk repriced across every multinational." },
          { asset: "NDX (25,678.82)", call: "Underperforms", rationale: "Hardware supply chains run through the tariffed corridor; NDX is the exposure index." },
          { asset: "RTY", call: "Relative winner (still down)", rationale: "Domestic-revenue small caps are the least tariff-exposed equity beta." },
          { asset: "Sector tilt", call: "Domestic services/utilities over hardware, autos, retail", rationale: "Sell imported-COGS, own domestic-revenue." },
        ],
        commodities: [
          { asset: "Gold ($374.58)", call: "Higher", rationale: "Stagflation hedge plus de-dollarization narrative — gold wins both tails here." },
          { asset: "Oil (WTI $95.00)", call: "Lower", rationale: "Trade-volume destruction from $95 outweighs any supply story near-term." },
          { asset: "Copper ($6.17/lb)", call: "Lower", rationale: "The purest global-trade proxy on the board gives back its +0.7σ premium." },
          { asset: "Ags (corn 419¢)", call: "Volatile, retaliation-dependent", rationale: "US ag exports are the historical first target of counter-tariffs." },
        ],
        credit: [
          { asset: "IG (OAS 75bp)", call: "Wider", rationale: "Multinational issuers at −1.1σ rich spreads have zero margin-shock cushion." },
          { asset: "HY (OAS 278bp)", call: "Wider", rationale: "Retail, autos, consumer-goods HY issuers eat the import tax directly." },
          { asset: "EM sovereign (143bp)", call: "Materially wider", rationale: "Export-led EM models are the macro target of the policy; spreads at −1.25σ are mispriced for it." },
        ],
      },
      trade_ideas: [
        {
          instrument: "AAPL",
          direction: "SHORT",
          entry_level: "$291.58 (snapshot close)",
          target_level: "$262.00",
          stop_loss: "$304.00",
          expected_holding_period: "2–6 weeks",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: AAPL is the single most tariff-exposed mega-cap — the hardware margin stack runs through China assembly, and a 10%+ levy gives three bad options: eat 200–300bp of gross margin, raise prices into elastic demand, or accelerate a multi-year supply-chain shift that costs capex now. The 0.87 beta understates event-specific downside because the index itself is falling on the same catalyst; the 2025 analog saw the name underperform the S&P by several hundred basis points in the first week. Target is ~10% below the $291.58 snapshot close.",
          what_would_invalidate: "An explicit exemption for consumer electronics (as partially happened in 2025) — the margin math reverts and the short becomes a crowded squeeze.",
        },
        {
          instrument: "GLD (gold ETF)",
          direction: "LONG",
          entry_level: "$374.58 (snapshot close)",
          target_level: "$399.00",
          stop_loss: "$364.50",
          expected_holding_period: "1–3 months",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: tariffs are stagflationary — they cut growth (Fed-cut pricing lifts gold) while raising the price level (breakevens at 2.34% drift up, compressing real yields). Gold also captures the slower-burning bid from reserve managers hedging trade-bloc fragmentation. It is the only asset on this board that wins whichever of the inflation or growth tail dominates, which is what an 8-conviction stagflation hedge looks like.",
          what_would_invalidate: "A rapid negotiated de-escalation that re-steepens growth expectations and lifts real yields — gold gives back the fear premium within days.",
        },
        {
          instrument: "EM sovereign credit (proxy: EM OAS at 143bp)",
          direction: "SHORT",
          entry_level: "143bp OAS (snapshot, −1.25σ)",
          target_level: "190bp OAS",
          stop_loss: "128bp OAS",
          expected_holding_period: "1–3 months",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 7,
          thesis:
            "Illustrative hypothesis: EM spreads at 143bp sit −1.25σ rich versus their own 90-day history while the policy shock lands hardest on export-led EM economies — that is a mispricing, not a coincidence to respect. Universal tariffs compress EM export revenue, pressure FX, and raise external-funding costs simultaneously; the spread widening trade is paid to wait via the asymmetry (15bp to the stop, ~47bp to the target).",
          what_would_invalidate: "Broad USD index turning DOWN despite the tariff news — a weak dollar absorbs most of the EM funding shock and the widener loses its engine.",
        },
        {
          instrument: "SPY",
          direction: "SHORT",
          entry_level: "$725.43 (snapshot close)",
          target_level: "$690.00",
          stop_loss: "$742.00",
          expected_holding_period: "1–4 weeks",
          sizing_as_pct_risk_budget: "10%",
          conviction_score: 6,
          thesis:
            "Illustrative hypothesis: the index at 7,386 (+0.46σ) is priced for margin expansion in the exact quarter a universal import tax compresses it. A ~5% index drawdown matches the realized 2025 analog move; the short is the hedge leg for the book rather than a high-conviction directional view, hence the modest size and conviction. Domestic-revenue RTY would be the long leg of a pair if the mandate allowed.",
          what_would_invalidate: "A 90-day tariff pause or major-partner carve-out announcement — the 2025 playbook showed those produce double-digit relief rallies in days.",
        },
      ],
      second_order_effects:
        "Consensus models tariffs as a one-time price-level shock and a modest growth drag, then prices a clean Fed-cut response; the divergence is in the SEQUENCING. The Fed cannot ease into a visible inflation impulse, so the put strikes lower than the market assumes — the first 5% of equity downside gets no policy response, and the curve initially bear-steepens on breakevens before bull-steepening on growth. The crowded mistake is buying long-duration Treasuries as the hedge: tariffs are the one risk-off catalyst where the 30Y at 5.01% is part of the problem. Position the divergence via gold over duration, domestic-revenue over multinational equity, and EM spread wideners over outright index shorts.",
      focus_instrument_read:
        "AAPL ($291.58, β0.87 vs SPY, Information Technology): the event maps to AAPL through three channels, all negative. Direct: the China-centered assembly chain puts the majority of hardware COGS inside the tariff perimeter — a 10%+ levy is a 200–300bp gross-margin question with no fast fix. Demand: price pass-through into a discretionary device cycle is elastic, and retaliation risk targets the ~17% of revenue from Greater China. Rates: the modest flight-to-quality rally in the 10Y (4.53%) is nowhere near enough discount-rate relief to offset an earnings revision. The 0.87 beta makes the name look defensive on index math; on THIS catalyst it trades like a 1.3-beta because the catalyst is aimed at its business model. Expect underperformance versus SPY until an exemption or de-escalation headline, which is also the explicit invalidation.",
    },
  },

  {
    id: "svb-mar2023",
    label: "Bank failure shock (SVB '23)",
    eventDate: "2023-03-10",
    focusTicker: "HYG",
    note: "real event (Mar 10, 2023) replayed against the current snapshot",
    eventText:
      "Silicon Valley Bank, with roughly $209 billion in assets, was closed by regulators after a failed capital raise and a deposit run — the largest US bank failure since 2008. Regional bank equities sold off sharply and the 2-year Treasury yield posted its largest 3-day decline since 1987. (Real event, March 10, 2023 — replayed against today's dashboard.)",
    output: {
      news_parsing: {
        core_fact:
          "A top-20 US bank failed in 48 hours via a classic duration-mismatch deposit run — uninsured depositors fled, the securities portfolio's mark-to-market loss became real, and regulators seized the bank before the weekend.",
        directional_surprise_vs_consensus:
          "Severe risk-off surprise: consensus saw bank capital as a solved post-2008 problem; a $209bn institution failing on RATE risk (not credit risk) was priced by no one — front-end yields collapsed ~60bp in days versus consensus expecting further hikes.",
        source_credibility_score: 10,
      },
      directly_affected_indicators: [
        { indicator: "DGS2", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−40–60bp over days", time_horizon: "days" },
        { indicator: "T10Y2Y", expected_direction: "UP", expected_magnitude_bps_or_pct: "+30–50bp bull steepening from +42bp", time_horizon: "days" },
        { indicator: "VIXCLS", expected_direction: "UP", expected_magnitude_bps_or_pct: "+8–15 points from 19.87", time_horizon: "intraday" },
        { indicator: "BAMLH0A0HYM2", expected_direction: "UP", expected_magnitude_bps_or_pct: "+60–100bp from 278bp", time_horizon: "days" },
        { indicator: "BAMLC0A0CM", expected_direction: "UP", expected_magnitude_bps_or_pct: "+15–30bp from 75bp (financials-led)", time_horizon: "days" },
        { indicator: "SP500", expected_direction: "DOWN", expected_magnitude_bps_or_pct: "−2–4% (financials-led)", time_horizon: "days" },
      ],
      cross_asset_implications: {
        rates: [
          { asset: "Front-end (2Y @ 4.13%)", call: "Collapse lower", rationale: "Banking stress converts hike pricing to cut pricing faster than any other catalyst." },
          { asset: "Belly (10Y @ 4.53%)", call: "Lower yields", rationale: "Follows the front end at roughly half the beta; the belly prices the slower growth path." },
          { asset: "Long-end (30Y @ 5.01%)", call: "Lower, least", rationale: "A credit-stress rally is a front-end event; 30Y moves least and last." },
          { asset: "Breakevens (2.34%)", call: "Tighter", rationale: "Credit contraction is disinflationary — banks pulling lending does the Fed's work." },
        ],
        fx: [
          { asset: "DXY / Broad USD (120.08)", call: "Lower", rationale: "US-specific stress plus collapsing front-end yields cut the dollar's two supports." },
          { asset: "EUR (1.1533)", call: "Higher", rationale: "The differential moves the euro's way as long as contagion stays US-centric." },
          { asset: "JPY (160.26)", call: "Sharply higher", rationale: "Falling US yields plus haven demand is the maximum yen tailwind from 160." },
          { asset: "EM FX", call: "Mixed-to-weaker", rationale: "Lower US rates help funding, but banking contagion fear dominates week one." },
        ],
        equities: [
          { asset: "S&P 500 (7,386.65)", call: "Lower, financials-led", rationale: "Bank book-value confidence is binary; the sector reprices the index." },
          { asset: "NDX (25,678.82)", call: "Outperforms (down less, then up)", rationale: "Collapsing yields are rocket fuel for duration equities once panic peaks — the 2023 analog." },
          { asset: "RTY", call: "Sharply lower", rationale: "Small caps are regional-bank-funded; their credit channel is the one impaired." },
          { asset: "Sector tilt", call: "Mega-cap tech over banks and small-cap cyclicals", rationale: "Own balance-sheet-independent cash flows; sell anything that borrows short." },
        ],
        commodities: [
          { asset: "Gold ($374.58)", call: "Sharply higher", rationale: "Bank failure is gold's signature event: haven bid plus collapsing real yields." },
          { asset: "Oil (WTI $95.00)", call: "Lower", rationale: "Credit-crunch growth fear takes the demand premium out of a $95 tape." },
          { asset: "Copper ($6.17/lb)", call: "Lower", rationale: "Construction and capex run on bank credit; copper prices the lending freeze." },
          { asset: "Ags (corn 419¢)", call: "Stable", rationale: "Food demand doesn't read bank balance sheets; −1.8σ corn has little fear premium to add." },
        ],
        credit: [
          { asset: "IG (OAS 75bp)", call: "Wider, financials-led", rationale: "Bank sub-debt and preferreds reprice the whole IG financials curve from −1.1σ rich." },
          { asset: "HY (OAS 278bp)", call: "Materially wider", rationale: "The lending channel to levered borrowers just seized; refinancing risk is repriced immediately." },
          { asset: "EM sovereign (143bp)", call: "Wider", rationale: "Global risk premium rises, though EM is a bystander to a US deposit run." },
        ],
      },
      trade_ideas: [
        {
          instrument: "UST 2Y (yield 4.13%)",
          direction: "LONG",
          entry_level: "4.13% yield (snapshot)",
          target_level: "3.55% yield",
          stop_loss: "4.35% yield",
          expected_holding_period: "2–6 weeks",
          sizing_as_pct_risk_budget: "25%",
          conviction_score: 9,
          thesis:
            "Illustrative hypothesis: the front end is THE trade in a banking-stress event — the 2023 analog repriced the 2Y by ~60bp in three sessions as hike odds became cut odds. From 4.13% with SOFR at 3.60%, the market still prices a patient Fed; deposit-run stress forces emergency-easing pricing regardless of what the Fed ultimately does. The asymmetry is wildly favorable: stress fades and you lose ~20bp, stress spreads and you make 60+.",
          what_would_invalidate: "Deposit-flow data stabilizing within the week and no second institution wobbling — the front end gives back the panic premium in two sessions.",
        },
        {
          instrument: "HYG (high-yield ETF)",
          direction: "SHORT",
          entry_level: "$79.47 (snapshot close)",
          target_level: "$75.50",
          stop_loss: "$81.20",
          expected_holding_period: "2–4 weeks",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 7,
          thesis:
            "Illustrative hypothesis: HY at 278bp OAS (−0.9σ) prices a fully open refinancing window the day the banking channel slams shut. Banking stress hits HY through the lending channel — regional banks are the marginal lender to exactly the leveraged middle-market borrowers HY indexes — and from rich extremes the first 80bp of widening is air pocket. The ETF wrapper adds a liquidity-discount kicker in stress weeks.",
          what_would_invalidate: "A blanket deposit guarantee or new Fed liquidity facility announced before spreads break 330bp — the 2023 BTFP analog ended the widening in 48 hours.",
        },
        {
          instrument: "GLD (gold ETF)",
          direction: "LONG",
          entry_level: "$374.58 (snapshot close)",
          target_level: "$402.00",
          stop_loss: "$366.00",
          expected_holding_period: "1–2 months",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: a bank failure fires every gold engine simultaneously — haven demand, collapsing real yields as the front end reprices, a weakening dollar, and a structural why-do-I-hold-deposits bid. The 2023 analog took gold up ~9% in three weeks; the target is calibrated to the same move off the $374.58 snapshot. This is also the cleanest expression that doesn't depend on WHICH way the Fed jumps.",
          what_would_invalidate: "Real yields rising as the panic fades without policy easing — gold gives back the entire fear premium and the trade is just short carry.",
        },
        {
          instrument: "UST 2s10s steepener (vs +42bp spot)",
          direction: "LONG",
          entry_level: "+42bp (snapshot 2s10s)",
          target_level: "+85bp",
          stop_loss: "+27bp",
          expected_holding_period: "1–2 months",
          sizing_as_pct_risk_budget: "15%",
          conviction_score: 8,
          thesis:
            "Illustrative hypothesis: banking stress is the canonical bull-steepener — the front end collapses on emergency-easing pricing while the long end is anchored by supply and the inflation that easing-into-stress implies. Entry at +42bp is −0.9σ versus the trailing 90 days, so the structure is cheap to its own history before the catalyst is priced at all. Pairs naturally with the outright 2Y long as a curve-and-level expression of the same view.",
          what_would_invalidate: "The stress proving systemic enough to price RECESSION (not just cuts) — then the long end outruns the front and the curve bull-flattens instead.",
        },
      ],
      second_order_effects:
        "Consensus prices bank stress as binary — contagion or contained — and trades the announcement; the divergence is the slow second-order channel either way. Even a contained failure tightens lending standards for quarters, which is disinflationary and small-cap-hostile long after the VIX normalizes: the 2023 lesson is that the Fed can stop the run (BTFP) but not the credit contraction. With today's snapshot showing credit at 90-day rich extremes (IG −1.1σ, HY −0.9σ, EM −1.25σ), the tape has even less stress premium than March 2023 did. Position for the slow channel: front-end longs and steepeners held PAST the rescue announcement, financials-funded small-cap shorts over index shorts, and gold as the structural deposit-distrust expression.",
      focus_instrument_read:
        "HYG ($79.47, β0.27 vs SPY, high-yield credit ETF): the event maps to HYG through the lending channel more than the default channel. HYG's issuers don't fail because SVB fails — they get repriced because the regional-bank lending window that refinances leveraged middle-market borrowers closes, and at 278bp OAS (−0.9σ, near the 90-day rich extreme) the index carries no premium for that channel at all. The 0.27 equity beta dramatically understates event risk here: in credit-stress episodes HYG's correlation to financials equity spikes toward 0.7 while its bid-ask gaps with the NAV basis. Expect −3% to −5% on the fund in the widening leg, with the recovery lagging equities by weeks because spread normalization needs the LENDING channel to reopen, not just the VIX to fall. The position is a short until a deposit backstop is announced — that headline is the hard exit.",
    },
  },
];
