import { CS } from "./section";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { MetricsTable } from "@/components/ui/metric";
import { crownwagerDiagram } from "@/components/diagrams/data/crownwager";

/** CrownWager — case study authored from the real system. No invented numbers. */
export function CrownWagerBody() {
  return (
    <div>
      <CS id="context" title="Context">
        <p>
          Sports-betting &quot;tip&quot; sites have a credibility problem, and it&apos;s almost always
          the same three failures: unvalidated models (accuracy quoted from one lucky split), naive
          edge math (comparing a model probability to raw book odds, ignoring the vig), and no
          accountability (picks published, then quietly forgotten). CrownWager was built to be
          defensible on all three — a cross-validated model, explicit Decimal money math, and a
          track record graded against reality.
        </p>
      </CS>

      <CS id="constraints" title="Constraints">
        <p>
          It&apos;s a ground-up rebuild of a legacy monolith that scored 2.3/10 on a twelve-dimension
          assessment, so hardening was a first-class requirement, not a follow-up. And it&apos;s a
          responsible-gambling product, which constrains the assistant on purpose.
        </p>
      </CS>

      <CS id="architecture" title="System architecture">
        <p>
          Three decoupled services so heavy ML never blocks web requests: a Django/DRF backend, a
          separate FastAPI ML service in its own container, and a Next.js frontend. Django never
          imports XGBoost — all inference happens over HTTP, and a model registry serves only a model
          whose checksum is validated, otherwise a clearly-labeled baseline.
        </p>
        <SystemDiagram
          spec={crownwagerDiagram}
          caption="CrownWager — the ML service is isolated behind HTTP with a circuit breaker."
        />
      </CS>

      <CS id="data-flow" title="Data flow">
        <p>
          A request hits Django, which calls the ML service&apos;s <strong>/predict</strong> for a
          home-win probability, turns it into fair-odds edge and expected value, sizes a stake with
          half-Kelly, and persists the pick. When the game is final, the pick is graded against the
          real score.
        </p>
      </CS>

      <CS id="key-decisions" title="Key decisions">
        <DecisionLog
          decisions={[
            {
              choice: "Cross-validated accuracy over a lucky split",
              alternatives: ["report a single train/test split", "quote accuracy without measuring it"],
              reason:
                "The XGBoost model is trained deterministically and reported from 5-fold stratified cross-validation, and kept intentionally shallow (max_depth 3) to resist overfitting — a real edge above the base home-win rate.",
              tradeoff: "A shallow model leaves some accuracy on the table versus an aggressively-tuned one — in exchange for a number you can trust.",
            },
            {
              choice: "Explicit, Decimal-precise edge and staking math",
              alternatives: ["float arithmetic", "full Kelly staking"],
              reason:
                "Implied prob is 1/odds, edge is model − implied, EV is explicit, and stakes use half-Kelly — all in Decimal so real-money arithmetic doesn't drift.",
              tradeoff: "Half-Kelly grows a bankroll slower than full Kelly, deliberately, to survive variance.",
            },
            {
              choice: "A verifiable, graded track record — not a wall of pending picks",
              alternatives: ["show pending picks and hope", "backfill an impressive history"],
              reason:
                "Every pick settles only once its game is FINAL with both scores; results aggregate per edge tier and are flagged 'insufficient' below 20 settled picks; unmappable picks are voided.",
              tradeoff: "The record starts empty and grows slowly — the price of it being real.",
            },
            {
              choice: "Graceful degradation everywhere",
              alternatives: ["let a slow dependency hang the request"],
              reason:
                "A circuit breaker on the ML client, plus fallbacks for the odds API and the assistant, keep the product running (in labeled demo mode) even if every external dependency is down.",
              tradeoff: "More fallback code to maintain, for a system that never hard-fails in front of a user.",
            },
            {
              choice: "A grounded assistant over a persuasive one",
              alternatives: ["a salesy chatbot that pushes wagers"],
              reason:
                "CrownBot is grounded strictly in the current best bets; its prompt forbids telling anyone to place a wager, forbids promising profit, and mandates responsible-gambling messaging.",
              tradeoff: "A less 'salesy' assistant — which is the entire point for this domain.",
            },
          ]}
        />
      </CS>

      <CS id="what-failed" title="What failed">
        <p>
          A slow or dead ML service used to block web requests while their calls timed out. The fix
          was a <strong>circuit breaker</strong>: after three consecutive failures it opens and
          fast-fails for thirty seconds, falling back to clearly-labeled demo predictions instead of
          hanging.
        </p>
        <FailureLog
          entries={[
            { version: "v1", metric: "ML dependency", value: "hangs", cause: "a slow or dead ML service blocked web requests on timeouts" },
            { version: "v2", metric: "ML dependency", value: "fast-fails", fix: "circuit breaker opens after 3 failures, fast-fails 30s, and drops to labeled demo predictions" },
          ]}
        />
      </CS>

      <CS id="performance-cost" title="Performance & cost">
        <MetricsTable
          rows={[
            { label: "accuracy (CV)", value: "65.2% ± 0.8%", method: "5-fold stratified cross-validation on 15,115 NBA games (2012–24), one fixed random split — no cherry-picking. The base home-win rate in the data is 57.5%, so this is a real ~8-point edge." },
            { label: "held-out test", value: "64.3%", method: "80/20 hold-out on 3,023 unseen games; ROC-AUC 0.685, log-loss 0.628 — the calibration signal that keeps Kelly staking from over-sizing." },
            { label: "model shape", value: "106 features · depth 3", method: "750 shallow trees (max_depth 3, learning rate 0.01) over 106 pre-game features; kept deliberately shallow to resist overfitting and stay interpretable." },
            { label: "track record", value: "graded vs finals", method: "Picks settle only on FINAL scores; aggregated per edge tier; unmappable picks voided; flagged insufficient below 20 settled picks." },
            { label: "money math", value: "Decimal", method: "Edge, EV, and half-Kelly (0.5) staking in Decimal; arbitrage flagged when Σ(1/odds) < 1, legs sized to equalize payout." },
            { label: "legacy → rebuild", value: "2.3/10 → hardened", method: "A twelve-dimension assessment drove a rebuild with per-IP rate limiting, admin 2FA, CSP, and blocking bandit + gitleaks in CI." },
          ]}
        />
      </CS>

      <CS id="operations" title="Operations">
        <p>
          Celery + Redis run the async jobs; the ML service runs in its own container behind the
          circuit breaker. Security is hardened by default: proxy-aware per-IP rate limiting,
          constant-time token comparison, optional TOTP 2FA, DSN-gated Sentry, and a tested
          backup/restore runbook.
        </p>
      </CS>

      <CS id="what-id-do-differently" title="What I'd do differently">
        <p>
          The model is deliberately simple; with more graded history I&apos;d add calibration
          reporting (are the 60% picks actually winning 60%?) and a closing-line-value check, which
          is a stronger signal of edge than raw win rate.
        </p>
      </CS>

      <CS id="evidence" title="Evidence">
        <p>The app is live and the backend, ML service, and grading logic are in the repository above.</p>
      </CS>
    </div>
  );
}
