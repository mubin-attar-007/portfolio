import type { DiagramSpec } from "../types";

/** CrownWager — decoupled Django + FastAPI ML service. */
export const crownwagerDiagram: DiagramSpec = {
  nodes: [
    { id: "web", label: "Next.js 15", sublabel: "React 19", description: "The frontend; talks to Django over REST + JWT.", col: 0, row: 1 },
    { id: "django", label: "Django + DRF", sublabel: "service + repo layers", description: "The backend: odds, EV/Kelly, best bets, graded record, and CrownBot — heavy ML never runs in-process.", col: 1, row: 1 },
    { id: "ev", label: "EV / Kelly", sublabel: "Decimal", description: "Implied prob, edge, expected value, and half-Kelly staking — all in Decimal, no float drift.", col: 1, row: 0 },
    { id: "record", label: "Graded record", sublabel: "settles on finals", description: "Every pick grades against the real final score; per edge tier; flagged insufficient below 20 settled picks.", col: 1, row: 2 },
    { id: "bot", label: "CrownBot", sublabel: "grounded", description: "Claude, grounded strictly in the current best bets; forbidden from pushing wagers or promising profit.", col: 1, row: 3 },
    { id: "ml", label: "FastAPI ML", sublabel: "own container", description: "Inference over HTTP /predict; Django never imports XGBoost.", col: 2, row: 1 },
    { id: "registry", label: "Model registry", sublabel: "SHA-256", description: "Validates checksums; serves only a model flagged validated:true, else a labeled baseline.", col: 2, row: 2 },
    { id: "xgb", label: "XGBoost", sublabel: "~65% 5-fold CV", description: "Shallow model (max_depth 3) predicting NBA moneyline; accuracy from 5-fold stratified CV.", col: 2, row: 0 },
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
