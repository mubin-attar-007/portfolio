import { CS } from "./section";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { MetricsTable } from "@/components/ui/metric";
import { Callout } from "@/components/ui/callout";
import { tradepulseDiagram } from "@/components/diagrams/data/tradepulse";

/** TradePulse — case study authored from the real system. No invented numbers. */
export function TradePulseBody() {
  return (
    <div>
      <CS id="context" title="Context">
        <p>
          A backtest&apos;s only job is to tell you the truth about a strategy, and most retail
          backtesters lie in subtle ways: they let a strategy act on the same bar&apos;s close it used
          to decide, ignore trading costs, drift on float money, and let an AI narrate figures it
          invented. TradePulse&apos;s entire thesis is <strong>honesty over flattering numbers</strong>
          — those lies are engineered to be structurally impossible, not merely discouraged.
        </p>
      </CS>

      <CS id="constraints" title="Constraints">
        <p>
          Free market data and a $0 stack, so no paid real-time feed. And a hard product constraint:
          a strategy you can&apos;t actually trade must be un-authorable — no acting on the signal
          bar, no zero-cost fills, no entry-only strategies with no exit or risk control.
        </p>
      </CS>

      <CS id="architecture" title="System architecture">
        <p>
          A modular monolith: a FastAPI API and an ARQ worker, TimescaleDB for bars, Redis for
          queues, and a Next.js builder. The keystone is the <strong>StrategySpec DSL</strong> — one
          canonical, declarative, non-Turing-complete spec shared by the builder, engine, paper
          trading, and the AI. Operands read only closed bars, so look-ahead is unrepresentable; exit,
          sizing, and risk limits are mandatory fields.
        </p>
        <SystemDiagram
          spec={tradepulseDiagram}
          caption="TradePulse — one StrategySpec feeds the backtest engine, the paper engine, and the AI."
        />
      </CS>

      <CS id="data-flow" title="Data flow">
        <p>
          A spec is validated (Pydantic v2), then replayed bar by bar: the engine decides on a closed
          bar <em>i</em>, applies risk limits, and fills at bar <em>i+1</em>&apos;s open with commission
          and slippage. The result carries its metrics, trades, risk events, and a reproducibility
          triple. The paper engine replays the <em>same</em> engine live with a single flag.
        </p>
      </CS>

      <CS id="key-decisions" title="Key decisions">
        <Callout variant="note">
          The engine contract, verbatim: decisions are made on a closed bar i; market orders fill on
          the next bar&apos;s open — no peeking at the signal bar&apos;s close.
        </Callout>
        <DecisionLog
          decisions={[
            {
              choice: "Look-ahead-free by construction, not convention",
              alternatives: ["fill at the signal bar's close", "warn against look-ahead in docs"],
              reason:
                "Indicators read only closed bars and warm up with min_periods (MACD even double-warms its signal EMA), so a strategy can't peek even if the author wants to.",
              tradeoff: "A bar of latency between signal and fill, and no 'just fill at close' mode outside tests.",
            },
            {
              choice: "Decimal money and costs-on by default",
              alternatives: ["float accounting", "frictionless unless enabled"],
              reason:
                "All accounting is Decimal; every fill pays commission (2 bps/side) and slippage (1 bps, adverse), and returns are shown net. A cash-conservation test asserts initial + Σ P&L equals final equity.",
              tradeoff: "More arithmetic discipline; frictionless mode exists only for tests.",
            },
            {
              choice: "Risk limits enforced at entry, not reported after",
              alternatives: ["compute risk stats post-hoc", "no built-in limits"],
              reason:
                "A position clamp, a daily-loss kill-switch, and a consecutive-loss halt fire before a position is taken and are recorded as risk events.",
              tradeoff: "Strategies can be halted mid-run and 'look worse' — which is the point.",
            },
            {
              choice: "Reproducibility as a first-class output",
              alternatives: ["store only the metrics"],
              reason:
                "Every result carries a spec hash (canonical JSON), the engine version, and a data fingerprint, so any run can be audited and re-derived.",
              tradeoff: "A little bookkeeping per run.",
            },
            {
              choice: "A grounded AI copilot over a chatty one",
              alternatives: ["an LLM that narrates results freely"],
              reason:
                "NL→strategy uses a validate-and-repair loop and returns a validated spec it never auto-executes; narration is instructed to use only the numbers present and never extrapolate.",
              tradeoff: "The copilot sometimes refuses rather than guesses — exactly what a financial tool should do.",
            },
          ]}
        />
      </CS>

      <CS id="what-failed" title="What failed">
        <p>
          The first indicators emitted finite values from bar zero — a subtle look-ahead, because an
          indicator that needs N bars shouldn&apos;t report a number before it has them. The fix was to
          warm them up with <strong>min_periods</strong> so they emit honest null gaps; MACD warms
          twice, because its signal line sits on the already-gapped MACD line.
        </p>
        <FailureLog
          entries={[
            { version: "v1", metric: "indicator warm-up", value: "leaky", cause: "indicators emitted finite values from bar 0 — a quiet look-ahead" },
            { version: "v2", metric: "indicator warm-up", value: "honest", fix: "warm up with min_periods (null gaps); MACD double-warms its signal EMA" },
          ]}
        />
      </CS>

      <CS id="performance-cost" title="Performance & cost">
        <MetricsTable
          rows={[
            { label: "correctness suite", value: "canary + parity", method: "test_lookahead_canary perturbs future bars 3× and proves equity through the cut bar is byte-identical; a parity test proves the paper engine reuses the backtest engine." },
            { label: "Sharpe risk-free rate", value: "0 (stated)", method: "Annualized from per-bar returns; shown wherever Sharpe/Sortino appear. Max drawdown always shown." },
            { label: "default costs", value: "2 / 1 bps", method: "2 bps/side commission + 1 bps adverse slippage on every fill; frictionless mode exists only in tests." },
            { label: "data provenance", value: "DELAYED", method: "Prices polled ~30s and labeled DELAYED; every result carries a hypothetical-performance notice." },
          ]}
        />
      </CS>

      <CS id="operations" title="Operations">
        <p>
          Live ingestion and paper trading run on an ARQ worker; the paper engine is the backtest
          engine with <strong>close_at_end=False</strong>, guaranteed to agree by a parity test. The
          AI copilot runs on Gemini (free tier) or local Ollama behind one provider contract, with
          per-user (200K/day) and global (5M/day) token budgets.
        </p>
      </CS>

      <CS id="what-id-do-differently" title="What I'd do differently">
        <p>
          Several things are deliberately <em>not</em> claimed yet, and stating that is part of the
          honesty contract: a real-time consolidated feed, point-in-time survivorship-free
          fundamentals, an automatic in-sample/out-of-sample split, a Deflated-Sharpe / multiple-testing
          correction, and a buy-and-hold benchmark overlay. Those are the next things I&apos;d build.
        </p>
      </CS>

      <CS id="evidence" title="Evidence">
        <p>The app is live and the engine, DSL, and test suite are in the repository linked above.</p>
      </CS>
    </div>
  );
}
