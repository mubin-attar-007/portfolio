// -----------------------------------------------------------------------------
// The assistant's evaluation over the golden set (test/fixtures/assistant-golden.ts).
//
//   npm run eval:assistant -- [--mode live|fallback|offline] [--rpm 10] [--only id,id] [--label name]
//
//   live      the real Gemini client, in-process through `handleChat`. Needs
//             GEMINI_API_KEY (the npm script loads .env.local with Node's own
//             --env-file loader; this script never prints the environment).
//   fallback  no model: every answer comes from site search.
//   offline   a fake model: the same checks as the CI gate, with a report.
//
// Sequential, paced to --rpm model calls a minute, with a fresh synthetic
// client per request so the per-client limiter never decides a result. Each
// item is scored on its outcome, the pages it cites, the facts it states, the
// strings it must never contain (including the private disclosure denylist,
// loaded at run time and reported by line number only), its actions, whether
// every number it states is in its context, and TTFT, latency and tokens.
//
// Writes .local/evals/assistant-<timestamp>[-label].{json,md}. Never in CI, and
// nothing here is published on the site.
// -----------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import type { HandlerOptions } from "../lib/ai/chat-handler.ts";
import { streamGemini } from "../lib/ai/gemini.ts";
import { SYSTEM_PROMPT_VERSION } from "../lib/ai/system-prompt.ts";
import { GEMINI_MODEL } from "../lib/env.ts";
import { GOLDEN, type GoldenItem } from "../test/fixtures/assistant-golden.ts";
import {
  fakeOptions,
  loadDenylist,
  runItem,
  scoreItem,
  type Capture,
  type HarnessMode,
  type ItemScore,
  type TurnRun,
} from "../test/fixtures/golden-harness.ts";

const { values } = parseArgs({
  options: {
    mode: { type: "string", default: "live" },
    rpm: { type: "string", default: "10" },
    only: { type: "string" },
    label: { type: "string" },
    out: { type: "string", default: path.join(".local", "evals") },
  },
});

const MODES = { live: "live", fallback: "fallback", offline: "fake" } as const satisfies Record<string, HarnessMode>;
const modeName = values.mode as keyof typeof MODES;
const mode: HarnessMode | undefined = MODES[modeName];
if (!mode) {
  console.error(`Unknown --mode ${values.mode}: use live, fallback or offline.`);
  process.exit(2);
}
if (mode === "live" && !process.env.GEMINI_API_KEY) {
  console.error("--mode live needs GEMINI_API_KEY (in .env.local, or the environment). Use --mode fallback or offline.");
  process.exit(2);
}
if (mode !== "live") delete process.env.GEMINI_API_KEY;

const rpm = Math.max(1, Number(values.rpm) || 10);
const only = values.only ? new Set(values.only.split(",").map((id) => id.trim())) : null;
const items: GoldenItem[] = GOLDEN.filter((item) => !only || only.has(item.id));
const denylist = loadDenylist();

/** Handler options for one turn: the mode's model, writing what it sees into the capture. */
function optionsFor(capture: Capture): HandlerOptions {
  if (mode === "fake") return fakeOptions(capture);
  const base: HandlerOptions = { log: (entry) => capture.logs.push(entry) };
  if (mode === "fallback") return base;
  return {
    ...base,
    stream: (args) => {
      capture.context = args.systemInstruction;
      return streamGemini(args);
    },
  };
}

// ---- Pacing: at most --rpm model calls a minute -------------------------------

const interval = 60_000 / rpm;
let lastStart = 0;
let lastCalls = 0;

/** Model calls a turn made, from its log line: the answer, a hedged second call, a routing call. */
function modelCalls(run: TurnRun | undefined): number {
  const log = run?.log;
  if (!log) return 0;
  return (log.model ? 1 : 0) + (log.hedged ? 1 : 0) + (log.router && log.router !== "over-budget" ? 1 : 0);
}

async function pace(): Promise<void> {
  if (mode !== "live" || lastCalls === 0) return;
  const wait = lastStart + interval * lastCalls - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

// ---- Run -------------------------------------------------------------------------

const started = new Date();
const scores: ItemScore[] = [];
for (const [index, item] of items.entries()) {
  await pace();
  lastStart = Date.now();
  const runs = await runItem(item, optionsFor, async () => {
    lastCalls = 1;
    await pace();
    lastStart = Date.now();
  });
  lastCalls = modelCalls(runs.at(-1));
  const score = scoreItem(item, runs, mode, denylist);
  scores.push(score);
  const mark = score.pass ? "pass" : "FAIL";
  console.log(`${String(index + 1).padStart(2)}/${items.length} ${mark} ${item.id} → ${score.outcome}`);
}

// ---- Report ----------------------------------------------------------------------

const median = (xs: number[]): number | null => {
  if (xs.length === 0) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)]!;
};
const percentile = (xs: number[], p: number): number | null => {
  if (xs.length === 0) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)]!;
};

const logs = scores.map((s) => s.last.log).filter((log) => log !== null);
const ttft = logs.map((l) => l.firstTokenMs).filter((v): v is number => typeof v === "number");
const latency = logs.map((l) => l.latencyMs);
const tokensIn = logs.reduce((sum, l) => sum + (l.promptTokens ?? 0), 0);
const tokensOut = logs.reduce((sum, l) => sum + (l.outputTokens ?? 0), 0);

const areas = [...new Set(scores.map((s) => s.area))];
const byArea = Object.fromEntries(
  areas.map((area) => {
    const inArea = scores.filter((s) => s.area === area);
    return [area, { pass: inArea.filter((s) => s.pass).length, total: inArea.length }];
  }),
);
const outcomes = scores.reduce<Record<string, number>>((acc, s) => {
  acc[s.outcome] = (acc[s.outcome] ?? 0) + 1;
  return acc;
}, {});
const passed = scores.filter((s) => s.pass).length;

const summary = {
  mode: modeName,
  label: values.label ?? null,
  started: started.toISOString(),
  model: mode === "live" ? GEMINI_MODEL : null,
  promptVersion: SYSTEM_PROMPT_VERSION,
  items: scores.length,
  passed,
  byArea,
  outcomes,
  denylistTerms: denylist.length,
  ttftMs: { median: median(ttft), p90: percentile(ttft, 0.9), p95: percentile(ttft, 0.95) },
  /** Answers that started a hedged second call, and those the second call wrote. */
  hedged: logs.filter((l) => l.hedged).length,
  hedgeWon: logs.filter((l) => l.hedgeWon).length,
  /** Turns whose routing call ran. */
  routed: logs.filter((l) => l.router && l.router !== "over-budget").length,
  latencyMs: { median: median(latency), p90: percentile(latency, 0.9) },
  tokens: { prompt: tokensIn, output: tokensOut },
  /** Live answers with wording a human should read (never a failure): a compound or a sentence the content does not have. */
  wordingFlagged: scores.filter((s) => (s.checks.wording?.length ?? 0) > 0).length,
};

/** What failed, in words, for the report. */
function failures(score: ItemScore): string[] {
  const c = score.checks;
  const out: string[] = [];
  if (!c.outcome) out.push(`outcome ${score.outcome}, expected ${score.expected}`);
  if (c.paths === false) out.push(`cited ${score.cited.join(", ") || "nothing"}`);
  for (const f of c.facts ?? []) if (!f.ok) out.push(`missing ${f.fact}`);
  for (const f of c.forbidden) out.push(`forbidden ${f}`);
  for (const a of c.actions ?? []) if (!a.ok) out.push(`no ${a.kind} action`);
  if (c.ungroundedNumbers?.length) out.push(`ungrounded numbers ${c.ungroundedNumbers.join(", ")}`);
  if (c.citationsGrounded === false) out.push("a citation outside the retrieved passages");
  if (!c.labels) out.push("a citation without a readable label and a link");
  return out;
}

const stamp = started.toISOString().replace(/\.\d+Z$/, "").replace(/:/g, "-");
const base = `assistant-${stamp}${values.label ? `-${values.label}` : ""}`;
mkdirSync(values.out, { recursive: true });

writeFileSync(
  path.join(values.out, `${base}.json`),
  JSON.stringify(
    {
      summary,
      items: scores.map((s) => ({
        id: s.id,
        area: s.area,
        pass: s.pass,
        expected: s.expected,
        outcome: s.outcome,
        failures: failures(s),
        wording: s.checks.wording ?? [],
        cited: s.cited,
        actions: s.last.actions,
        followups: s.last.followups,
        answer: s.last.text,
        log: s.last.log,
      })),
    },
    null,
    2,
  ),
);

const md: string[] = [
  `# Assistant eval — ${modeName}${values.label ? ` (${values.label})` : ""}`,
  "",
  `${started.toISOString()} · ${summary.model ?? "no model"} · prompt ${SYSTEM_PROMPT_VERSION} · denylist ${denylist.length ? `${denylist.length} terms` : "absent"}`,
  "",
  `**${passed}/${scores.length} passed.** Outcomes: ${Object.entries(outcomes).map(([k, v]) => `${k} ${v}`).join(", ")}.`,
  "",
  "| Area | Passed |",
  "|---|---|",
  ...areas.map((area) => `| ${area} | ${byArea[area]!.pass}/${byArea[area]!.total} |`),
  "",
  `TTFT median ${summary.ttftMs.median ?? "—"} ms, p90 ${summary.ttftMs.p90 ?? "—"} ms, p95 ${summary.ttftMs.p95 ?? "—"} ms · latency median ${summary.latencyMs.median ?? "—"} ms, p90 ${summary.latencyMs.p90 ?? "—"} ms · tokens ${tokensIn} in, ${tokensOut} out · hedged ${summary.hedged} (won ${summary.hedgeWon}) · routed ${summary.routed}`,
  "",
  "| Item | Outcome | Result |",
  "|---|---|---|",
  ...scores.map((s) => `| ${s.id} | ${s.outcome} (expected ${s.expected}) | ${s.pass ? "pass" : failures(s).join("; ")} |`),
  "",
  "## Wording to read",
  "",
  "Reported, never failing: a hyphenated compound the answer's context never uses (\"full-themed\" for \"full-time\"), or seven or more words copied from the rules rather than the content.",
  "",
  ...(summary.wordingFlagged === 0
    ? ["Nothing flagged."]
    : scores
        .filter((s) => (s.checks.wording?.length ?? 0) > 0)
        .map((s) => `- **${s.id}**: ${s.checks.wording!.join("; ")}`)),
  "",
  "## Answers that failed",
  "",
  ...scores
    .filter((s) => !s.pass)
    .flatMap((s) => [
      `### ${s.id}`,
      "",
      `> ${s.last.question}`,
      "",
      s.last.text.trim() ? s.last.text.trim().slice(0, 900) : "(no text)",
      "",
      `Cited: ${s.cited.join(", ") || "nothing"}`,
      "",
    ]),
];
writeFileSync(path.join(values.out, `${base}.md`), md.join("\n"));

console.log(`\n${passed}/${scores.length} passed · ${JSON.stringify(byArea)}`);
console.log(`Report: ${path.join(values.out, `${base}.md`)}`);
