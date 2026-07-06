import type { DiagramSpec } from "../types";

/** CrownWager — decoupled Django + FastAPI ML service. */
export const crownwagerDiagram: DiagramSpec = {
  nodes: [
    { id: "web", label: "Next.js 15", sublabel: "React 19", description: "The frontend; talks to Django over REST + JWT.", col: 0, row: 1 },
    { id: "django", label: "Django + DRF", sublabel: "service + repo layers", description: "The backend: odds, EV/Kelly, best bets, graded record, and CrownBot — heavy ML never runs in-process.", col: 1, row: 1 },
    {
      id: "ev",
      label: "EV / Kelly",
      sublabel: "Decimal",
      description: "Implied prob, edge, expected value, and half-Kelly staking — all in Decimal, no float drift.",
      col: 1,
      row: 0,
      decision: {
        rejected: "Float arithmetic (the legacy approach)",
        why: "Odds/EV/Kelly/arbitrage math accumulates float error — 1/1.91 + 1/1.95 doesn't land on exactly 1.00, so a narrow arbitrage can be missed. Every money calculation uses Decimal(str(value)) and quantizes to the cent. Staking is half-Kelly (0.5) — professional practice, ~50% less variance than full Kelly.",
        tradeoff: "Decimal is 2–3× slower than float — imperceptible on a single prediction, and worth it for money math.",
      },
    },
    {
      id: "record",
      label: "Graded record",
      sublabel: "settles on finals",
      description: "Every pick grades against the real final score; per edge tier; flagged insufficient below 20 settled picks.",
      col: 1,
      row: 2,
      decision: {
        rejected: "Backfilling or interpolating outcomes that can't be mapped",
        why: "A pick graded wrong inflates or deflates the model's record. Unmappable picks are voided, not guessed. Results settle against real final scores, are broken out per edge tier (0–2%, 2–5%, 5–10%, 10%+) to expose lucky buckets, and the record is flagged 'insufficient' until 20 picks settle.",
        tradeoff: "Voiding shrinks the sample, so the record builds slowly — but it's honest.",
      },
    },
    { id: "bot", label: "CrownBot", sublabel: "grounded", description: "Claude, grounded strictly in the current best bets; forbidden from pushing wagers or promising profit.", col: 1, row: 3 },
    {
      id: "ml",
      label: "FastAPI ML",
      sublabel: "own container",
      description: "Inference over HTTP /predict; Django never imports XGBoost.",
      col: 2,
      row: 1,
      decision: {
        rejected: "Importing the ~500 MB ML stack into the Django web process",
        why: "Embedding XGBoost/TensorFlow in the web process makes every request thread carry the weight, and a slow model starves web workers. The model runs as a separate FastAPI service; Django calls it over HTTP (15s timeout) behind a circuit breaker — after 3 consecutive failures it fails fast for 30s and serves a labeled baseline instead of hanging.",
        tradeoff: "Two services to deploy and a network hop — bought decoupling, independent scaling, and zero downtime on model updates.",
      },
    },
    {
      id: "registry",
      label: "Model registry",
      sublabel: "SHA-256",
      description: "Validates checksums; serves only a model flagged validated:true, else a labeled baseline.",
      col: 2,
      row: 2,
      decision: {
        rejected: "Serving whatever model binary is on disk",
        why: "The model is promoted only if it clears a threshold on held-out data and its SHA-256 checksum matches the manifest. If no validated model is present, the service returns a transparent, documented baseline (home-court + rating + rest logits) — never vaporware.",
        tradeoff: "A gate between training and serving — deliberate friction that keeps unproven models out of production.",
      },
    },
    {
      id: "xgb",
      label: "XGBoost",
      sublabel: "65.2% 5-fold CV",
      description: "Shallow model (max_depth 3) predicting NBA moneyline; accuracy from 5-fold stratified CV.",
      col: 2,
      row: 0,
      decision: {
        rejected: "A neural net, and the legacy 'best of 300 random splits' 68% claim",
        why: "The inherited claim was cherry-picked after the fact, never validated. XGBoost was chosen for reproducibility (one fixed split + 5-fold stratified CV → 65.2% ± 0.8% on 15,115 games vs a 57.5% base rate), interpretability (depth capped at 3, real feature importances), and fast JSON serving. Honesty over a marginal, unverifiable accuracy gain.",
        tradeoff: "65% isn't state-of-the-art — but it's a number that holds up.",
      },
    },
    { id: "pg", label: "PostgreSQL", sublabel: "Celery + Redis", description: "Odds, bets, and graded results; Celery + Redis for async jobs and cache.", col: 3, row: 1 },
  ],
  edges: [
    { from: "web", to: "django", label: "REST + JWT" },
    { from: "django", to: "ev" },
    { from: "django", to: "record" },
    { from: "django", to: "bot" },
    { from: "django", to: "ml", label: "HTTP /predict" },
    { from: "ml", to: "registry", label: "checksum" },
    { from: "registry", to: "xgb", label: "serve if valid" },
    { from: "ml", to: "django", label: "circuit breaker", dashed: true },
    { from: "django", to: "pg", label: "persist" },
  ],
};
