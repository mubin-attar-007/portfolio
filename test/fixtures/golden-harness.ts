// -----------------------------------------------------------------------------
// The golden-set harness: drives `handleChat` in-process, one conversation at a
// time, reads the answer's server-sent events as the panel reads them, and
// scores each item against test/fixtures/assistant-golden.ts.
//
// Shared by the offline gate (test/assistant-golden.test.mts, a fake model, no
// quota) and the live eval (scripts/eval-assistant.mts, the real Gemini
// client). It never prints a denylist term: a hit is reported by its line
// number in the private list.
// -----------------------------------------------------------------------------

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { handleChat, type HandlerOptions, type TurnLog } from "../../lib/ai/chat-handler.ts";
import { historyForRequest, type AnswerMode, type AnswerNote, type ChatTurn } from "../../lib/ai/chat-contract.ts";
import { allPassages } from "../../lib/ai/retrieval.ts";
import { SYSTEM_PROMPT } from "../../lib/ai/system-prompt.ts";
import { FORBIDDEN, type Fact, type GoldenItem, type Outcome } from "./assistant-golden.ts";

/** How the harness answers: the real model, no model at all, or a fake one. */
export type HarnessMode = "live" | "fallback" | "fake";

/** A cited page as a visitor sees it. */
export type SeenCitation = { label: string; href: string | null };
export type SeenAction = { kind: string | null; label: string; href: string };

/** What one turn produced, and how it was produced. */
export type TurnRun = {
  question: string;
  status: number;
  outcome: Outcome | "error";
  mode: AnswerMode | null;
  note: AnswerNote | null;
  text: string;
  citations: SeenCitation[];
  actions: SeenAction[];
  followups: string[];
  incomplete: boolean;
  /** The per-turn log line the handler wrote. */
  log: TurnLog | null;
  /** The system instruction the answering model saw (null when no model ran). */
  context: string | null;
  elapsedMs: number;
};

/** What a run collects for one turn; the caller's handler options write into it. */
export type Capture = { context: string | null; logs: TurnLog[] };

const ORIGIN = "http://localhost:3000";
let client = 0;

/** A fresh synthetic client address per request: the eval measures answers, not the per-client limiter. */
function nextAddress(): string {
  client += 1;
  return `10.${(client >> 16) & 255}.${(client >> 8) & 255}.${client & 255}`;
}

type Frame = { event: string; data: Record<string, unknown> };

function frames(body: string): Frame[] {
  return body
    .split("\n\n")
    .filter((raw) => raw.trim())
    .flatMap((raw) => {
      const event = raw.match(/^event: (.*)$/m)?.[1];
      const payload = raw.match(/^data: (.*)$/m)?.[1];
      if (!event || !payload) return [];
      try {
        return [{ event, data: JSON.parse(payload) as Record<string, unknown> }];
      } catch {
        return [];
      }
    });
}

const str = (value: unknown): string | null => (typeof value === "string" ? value : null);

/**
 * Citations as a visitor sees them, in either wire shape: a page
 * (`{ label, href }`), or the older source line with its links
 * (`{ source, links }`), whose source line the panel used to print.
 */
function seenCitations(value: unknown): SeenCitation[] {
  if (!Array.isArray(value)) return [];
  const seen: SeenCitation[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const href = str(record.href);
    const label = str(record.label);
    if (label !== null) {
      seen.push({ label, href });
      continue;
    }
    const source = str(record.source);
    const links = Array.isArray(record.links) ? record.links : [];
    if (source !== null) seen.push({ label: source, href: null });
    for (const link of links) {
      const l = link as Record<string, unknown>;
      if (str(l.label) !== null) seen.push({ label: str(l.label)!, href: str(l.href) });
    }
  }
  return seen;
}

function seenActions(value: unknown): SeenAction[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const record = item as Record<string, unknown>;
    const label = str(record.label);
    const href = str(record.href);
    return label !== null && href !== null ? [{ kind: str(record.kind), label, href }] : [];
  });
}

/** The visitor-facing outcome of a turn, from its meta event. */
function outcomeOf(mode: AnswerMode | null, note: AnswerNote | null): Outcome | "error" {
  if (mode === "refusal") return "declined";
  if (note === "not-covered") return "not-covered";
  if (mode === "live") return "live";
  if (mode === "fallback") return "fallback";
  return "error";
}

/**
 * Run one golden item's conversation. Each turn is sent with the history the
 * panel would send (`historyForRequest`), so a refused or failed turn is left
 * out of the next request exactly as it is in the browser.
 */
export async function runItem(
  item: GoldenItem,
  optionsFor: (capture: Capture) => HandlerOptions,
  between?: () => Promise<void>,
): Promise<TurnRun[]> {
  const transcript: ChatTurn[] = [];
  const runs: TurnRun[] = [];
  for (const [index, question] of item.turns.entries()) {
    if (index > 0 && between) await between();
    const capture: Capture = { context: null, logs: [] };
    const messages = historyForRequest(transcript, question);
    const request = new Request(`${ORIGIN}/api/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: ORIGIN,
        "sec-fetch-site": "same-origin",
        "x-real-ip": nextAddress(),
      },
      body: JSON.stringify({ messages, ...(item.page ? { page: item.page } : {}) }),
    });
    const started = Date.now();
    const res = await handleChat(request, optionsFor(capture));
    const body = await res.text();
    let mode: AnswerMode | null = null;
    let note: AnswerNote | null = null;
    let text = "";
    let citations: SeenCitation[] = [];
    let actions: SeenAction[] = [];
    let followups: string[] = [];
    let incomplete = false;
    if ((res.headers.get("content-type") ?? "").startsWith("text/event-stream")) {
      for (const { event, data } of frames(body)) {
        if (event === "meta") {
          mode = (str(data.mode) as AnswerMode | null) ?? null;
          note = (str(data.note) as AnswerNote | null) ?? null;
          text = "";
        } else if (event === "token") {
          text += str(data.text) ?? "";
        } else if (event === "sources") {
          citations = seenCitations(data.citations);
        } else if (event === "actions") {
          actions = seenActions(data.actions);
        } else if (event === "followups") {
          followups = Array.isArray(data.questions) ? data.questions.filter((q): q is string => typeof q === "string") : [];
        } else if (event === "done") {
          incomplete = data.incomplete === true;
        }
      }
    }
    runs.push({
      question,
      status: res.status,
      outcome: res.status === 200 ? outcomeOf(mode, note) : "error",
      mode,
      note,
      text,
      citations,
      actions,
      followups,
      incomplete,
      log: capture.logs.at(-1) ?? null,
      context: capture.context,
      elapsedMs: Date.now() - started,
    });
    transcript.push(
      { id: `u${index}`, role: "user", content: question },
      { id: `a${index}`, role: "assistant", content: text, mode: mode ?? undefined, note },
    );
  }
  return runs;
}

// ---- Scoring -------------------------------------------------------------------

/** The private disclosure denylist, one term per line, or [] when it is absent (CI). */
export function loadDenylist(root: string = process.cwd()): string[] {
  const file = path.join(root, ".local", "showcase", "denylist.txt");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
}

const dashes = (text: string): string => text.replace(/[–—]/g, "-");

function hasFact(text: string, fact: Fact): boolean {
  return typeof fact === "string" ? dashes(text).toLowerCase().includes(dashes(fact).toLowerCase()) : fact.test(text);
}

const describe = (fact: Fact): string => (typeof fact === "string" ? fact : String(fact));

/** Every number an answer states: "3.5+", "200+", "101/139", "65.2%", "2024". */
const NUMBER = /\d+(?:[.,/]\d+)*(?:\+|%)?/g;

/** A label that leaks the inside of a source: a file path or a code file. */
const INTERNAL_LABEL = /\b[\w-]+\.(?:py|ts|tsx|js|mjs|cs|md|mdx|json)\b|\b(?:app|lib|src|api)\/[\w-]/;

export type ItemScore = {
  id: string;
  area: string;
  pass: boolean;
  expected: Outcome;
  outcome: Outcome | "error";
  /** Each check that ran, and whether it held. A check that does not apply is absent. */
  checks: {
    outcome: boolean;
    paths?: boolean;
    facts?: { fact: string; ok: boolean }[];
    forbidden: string[];
    actions?: { kind: string; ok: boolean }[];
    /** Numbers in the answer that are not in its context (live only). */
    ungroundedNumbers?: string[];
    /** Every cited page belongs to a passage the turn retrieved (when the log names them). */
    citationsGrounded?: boolean;
    /** Every cited page has a readable label and a link. */
    labels: boolean;
    /** Wording a human should read (live answers only; reported, never failing): see `wordingFlags`. */
    wording?: string[];
  };
  cited: string[];
  last: TurnRun;
};

/** The system instruction minus the invariant rules: what the turn retrieved, and its background. */
function withoutRules(instruction: string): string {
  return instruction.startsWith(SYSTEM_PROMPT) ? instruction.slice(SYSTEM_PROMPT.length) : instruction;
}

/** Folded for comparison: lower case, hyphen look-alikes and en dashes as "-". */
const foldDashes = (text: string): string => text.toLowerCase().replace(/[‐‑–]/g, "-");

/** Words only, lower case, single spaces, padded: so a phrase matches whole words. */
const wordsOf = (text: string): string => ` ${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;

/** A hyphenated compound with at least one letter ("full-time", not "2012-24"). */
const COMPOUND = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu;

/** A run of this many words copied from the rules is an answer quoting its instructions. */
const COPIED_WORDS = 7;

/** The sentence rule 5 asks for word for word: copying it is the point. */
const MANDATED = wordsOf("That isn't on the site — ask Mubin directly");

/**
 * Wording a human should read in a live answer: the slips the fact checks
 * cannot see. Reported, never failing, because a compound the content never
 * uses can be fine English ("hands-on").
 *
 * - A hyphenated compound its context never uses: "full-themed" for the
 *   context's "full-time" (2026-11-17).
 * - Seven or more words copied from the rules but not from the content: one of
 *   the prompt's own example sentences pasted into an answer (rule 8's former
 *   example, about an incident, closing an answer that named none; 2026-11-17).
 */
export function wordingFlags(answer: string, context: string): string[] {
  const flags: string[] = [];
  const known = foldDashes(context);
  for (const word of new Set(answer.match(COMPOUND) ?? [])) {
    if (/\p{L}/u.test(word) && !known.includes(foldDashes(word))) flags.push(`"${word}" is not in its context`);
  }
  const words = wordsOf(answer).trim().split(" ").filter(Boolean);
  const rules = wordsOf(SYSTEM_PROMPT);
  const content = wordsOf(context);
  const copied = (i: number) => {
    const run = ` ${words.slice(i, i + COPIED_WORDS).join(" ")} `;
    return rules.includes(run) && !content.includes(run) && !MANDATED.includes(run);
  };
  for (let i = 0; i + COPIED_WORDS <= words.length; i++) {
    if (!copied(i)) continue;
    let end = i;
    while (end + 1 + COPIED_WORDS <= words.length && copied(end + 1)) end++;
    flags.push(`copied from the rules: "${words.slice(i, end + COPIED_WORDS).join(" ")}"`);
    i = end + COPIED_WORDS - 1;
  }
  return flags;
}

/** The links of each passage, by id, to check that a citation came from a retrieved passage. */
const PASSAGE_LINKS = new Map(allPassages().map((p) => [p.id, p.links.map((l) => l.href)]));

/**
 * Score an item's last turn.
 *
 * - `fake`: the offline gate. The model is a stub, so a fact is checked
 *   against the context the model received: retrieval must hand it what a
 *   correct answer needs.
 * - `live`: facts against the answer itself, plus number grounding.
 * - `fallback`: no model; an answerable item must come back from site search,
 *   and facts are reported but not required (one verbatim passage).
 */
export function scoreItem(item: GoldenItem, runs: readonly TurnRun[], mode: HarnessMode, denylist: readonly string[]): ItemScore {
  const last = runs.at(-1)!;
  const expected: Outcome = mode === "fallback" && item.expect === "live" ? "fallback" : item.expect;
  const cited = last.citations.map((c) => c.href).filter((href): href is string => href !== null);
  const citesPath = (wanted: string) => cited.some((href) => href === wanted || href.startsWith(`${wanted}#`));
  const answered = last.outcome === "live" || last.outcome === "fallback";

  const checks: ItemScore["checks"] = { outcome: last.outcome === expected, forbidden: [], labels: true };

  if (answered && (item.paths || item.allPaths)) {
    // The fallback serves one passage verbatim, so it can cite one of the
    // pages a comparison needs, not all of them.
    const all = item.allPaths ?? [];
    const every = mode === "fallback" ? all.length === 0 || all.some(citesPath) : all.every(citesPath);
    checks.paths = (item.paths ? item.paths.some(citesPath) : true) && every;
  }

  // The content the model was handed, without the rules in front of it: the
  // rules name the retired role wording in order to forbid it.
  const context = last.context === null ? null : withoutRules(last.context);

  if (item.facts) {
    // A gap answer (not covered) states its facts itself; a live answer in the
    // offline gate is checked against what the model was given.
    const against = mode === "fake" && last.outcome === "live" ? context ?? "" : last.text;
    checks.facts = item.facts.map((fact) => ({ fact: describe(fact), ok: hasFact(against, fact) }));
  }

  const shown = [last.text, ...last.citations.map((c) => c.label), ...last.actions.map((a) => a.label)].join("\n");
  for (const fact of [...FORBIDDEN, ...(item.forbid ?? [])]) {
    if (hasFact(shown, fact)) checks.forbidden.push(describe(fact));
  }
  // The context must be clean too: no passage may carry forbidden wording.
  if (context) {
    for (const fact of FORBIDDEN) if (hasFact(context, fact)) checks.forbidden.push(`context: ${describe(fact)}`);
  }
  const lower = `${shown}\n${context ?? ""}`.toLowerCase();
  denylist.forEach((term, line) => {
    if (lower.includes(term)) checks.forbidden.push(`denylist line ${line + 1}`);
  });

  if (item.actions) {
    const kinds = new Set(last.actions.map((a) => a.kind));
    checks.actions = item.actions.map((kind) => ({ kind, ok: kinds.has(kind) }));
  }

  if (mode === "live" && last.outcome === "live" && context) {
    const given = dashes(context);
    checks.ungroundedNumbers = [...new Set(dashes(last.text).match(NUMBER) ?? [])].filter((n) => !given.includes(n));
    checks.wording = wordingFlags(last.text, context);
  }

  const ids = (last.log as { passages?: unknown } | null)?.passages;
  if (Array.isArray(ids) && cited.length > 0) {
    const allowed = new Set(ids.flatMap((id) => PASSAGE_LINKS.get(String(id)) ?? []));
    checks.citationsGrounded = cited.every((href) => allowed.has(href));
  }

  checks.labels = last.citations.every((c) => c.href !== null && c.label.trim() !== "" && !INTERNAL_LABEL.test(c.label));

  // A fallback serves one verbatim passage: its facts are reported, not required,
  // except for a not-covered answer, whose wording the route writes itself.
  const factsHold = !checks.facts || (mode === "fallback" && last.outcome === "fallback") || checks.facts.every((f) => f.ok);
  const pass =
    checks.outcome &&
    checks.paths !== false &&
    factsHold &&
    checks.forbidden.length === 0 &&
    (!checks.actions || checks.actions.every((a) => a.ok)) &&
    (!checks.ungroundedNumbers || checks.ungroundedNumbers.length === 0) &&
    checks.citationsGrounded !== false &&
    checks.labels;

  return { id: item.id, area: item.area, pass, expected, outcome: last.outcome, checks, cited, last };
}

/**
 * A fake model for the offline gate: live answers are available, the router
 * chooses nothing (so every result is site search's own), and the model
 * records the context it was given and answers with a fixed sentence.
 */
export function fakeOptions(capture: Capture): HandlerOptions {
  return {
    live: true,
    route: async () => ({ ids: [] }),
    firstTokenMs: 2_000,
    totalMs: 5_000,
    log: (entry) => capture.logs.push(entry),
    stream: async function* ({ systemInstruction }) {
      capture.context = systemInstruction;
      yield "An answer from the offline gate's fake model.";
      return { finish: "stop" as const, promptTokens: 0, outputTokens: 0 };
    },
  };
}
