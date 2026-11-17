import type { FieldReport } from "./types";
import { AGENT_DIRECTION, WALKTHROUGH } from "./shared";

/**
 * Records triage and review — FINAL-SPEC §8.1, the "published by default"
 * material only. Held back until the owner approves: every figure, month and
 * provider; the lost-source rebuild, the partner-system licensing work and the
 * cloud cutover; the limits; every security incident.
 */
export const recordsTriage: FieldReport = {
  slug: "records-triage",
  published: false,
  name: "Records triage and review",
  headline: "Records triage that never leaves the PC",
  domain: "Long-term care records",
  summary:
    "An offline Windows app that finds the records a case needs in years of mixed files, without the documents leaving the PC, plus a cloud platform where a team reviews them with cited answers.",
  pills: [
    { status: "in-use", label: "Desktop app in use" },
    { status: "pilot", label: "Cloud platform in pilot" },
  ],
  credit:
    "Primary engineer and release owner of the desktop app. I built and operate the cloud platform, now in pilot.",
  problem: {
    body: [
      "Long-term-care facilities keep years of mixed records: native and scanned PDFs, multi-page fax images, Office files, saved emails, archives and recordings. When a request arrives, staff must find every document that mentions specific names, terms or case numbers, and put only those in front of a person.",
      "Originals must not change, regulated data must not leave the machine, and every run must leave an audit trail. The cloud platform takes the same job into team review: search, compare and tag documents, ask questions answered with page- or row-level citations, and produce redacted copies after a person confirms.",
    ],
    users: [
      "Records and business-office staff on facility Windows PCs",
      "Review teams in a private pilot",
    ],
  },
  constraints: [
    {
      constraint: "Records must not leave the PC",
      forced: "Document handling contains no network code; the only call is a licence check.",
      checked: "Tests decode the compiled assemblies and fail on any networking type.",
    },
    {
      constraint: "Originals must never change",
      forced: "Sources are opened read-only and hashed before copying; every output is a copy.",
      checked: "Redaction output is verified before it is placed.",
    },
    {
      constraint: "Staff PCs are locked down",
      forced: "A per-user install that needs no admin rights, plus a portable copy.",
      checked: "Acceptance scripts run on the installed build.",
    },
    {
      constraint: "Logs must not hold patient data",
      forced: "The logger accepts only hashed tokens.",
      checked: "Tests prove no file name or path reaches a log.",
    },
    {
      constraint: "Licences must allow shipping to customer PCs",
      forced: "Permissive third-party licences only.",
      checked: "Reviewed at each dependency change.",
    },
    {
      constraint: "Cloud tenants must be isolated",
      forced: "Every query is scoped to the organisation and workspace; a miss returns not-found.",
      checked: "Authorization tests.",
    },
    {
      constraint: "Model use must be deliberate",
      forced: "AI use is a permission separate from role; content reaches a model only when a person asks; spend has hard caps.",
      checked: "A ledger with holds and caps.",
    },
  ],
  constraintsNote: "No compliance certification is claimed.",
  built: [
    {
      title: "Desktop",
      items: [
        "A self-contained .NET/WPF app with seven modules: classification by content and by extension, verified field redaction, file search, safe transfer, single-document analysis and local speech-to-text.",
        "A core library with no UI dependency underneath every module.",
        "Local OCR behind a per-page text-quality gate.",
        "Runs that resume after an interruption.",
        "CSV outputs that neutralise spreadsheet formulas.",
        "A provenance manifest and audit index for every module.",
      ],
    },
    {
      title: "Cloud",
      items: [
        "Workspace-based team review on a Linux stack: Next.js, FastAPI and PostgreSQL with pgvector.",
        "Answers that cite the exact page or row.",
        "Document actions that run only after a person confirms.",
        "The licensing service the desktop app calls.",
      ],
    },
  ],
  others: [],
  howBuilt: AGENT_DIRECTION,
  sketch: {
    title: "Desktop app",
    zones: [
      {
        label: "Facility PC · documents stay here",
        nodes: [
          "Folder walk · safe archive expansion",
          "Text layer or local OCR",
          "Indicator match",
          "Needs review · Other · Error",
          "Copies, verified redactions, CSV, audit log",
        ],
      },
      {
        label: "Cloud licensing",
        nodes: ["Signed licences", "Verified offline on the PC"],
      },
    ],
    crossings: [{ label: "One HTTPS call · licence check, a fixed set of fields", direction: "forward" }],
  },
  moreSketches: [
    {
      title: "Cloud platform",
      zones: [
        { label: "Browser", nodes: ["Review workspace"] },
        {
          label: "Cloud · one region",
          nodes: [
            "Load balancer",
            "Web app and API · local embedding model",
            "Workers · extraction, redaction, import, export",
            "Database · records, job queue, vector index",
            "Encrypted object storage",
          ],
        },
        { label: "Hosted model API", nodes: ["Answers with citations"] },
      ],
      crossings: [
        { label: "HTTPS · signed-in workspace", direction: "forward" },
        { label: "Only when a person asks · metered and capped", direction: "forward" },
      ],
      notes: ["A customer's own storage is read through a scoped cross-account role."],
    },
  ],
  trace: [
    {
      title: "Staff choose a folder and an indicator list",
      body: "The app walks the folder on the PC, expanding archives safely. Sources are opened read-only.",
      focus: { zone: 0, node: 0 },
    },
    {
      title: "Each file's text comes from its text layer or local OCR",
      body: "A per-page diagnostic records which path produced the text, so a weak page is visible, not silent.",
      focus: { zone: 0, node: 1 },
    },
    {
      title: "The indicators decide the pile",
      body: "Every document lands in Needs review, Other or Error. Nothing is dropped without a reason.",
      focus: { zone: 0, node: 3 },
    },
    {
      title: "The run writes copies, never originals",
      body: "Copies, verified redactions, CSVs and a provenance manifest land in the output folder. The originals are untouched.",
      focus: { zone: 0, node: 4 },
    },
    {
      title: "Only the licence check leaves the PC",
      body: "One HTTPS call with a fixed set of fields. The signed licence is then verified offline.",
      focus: { zone: 1, crossing: 0 },
    },
  ],
  boundary: [
    { data: "Document text, page images, file names", direction: "stays", path: "PC only", rule: "Never leave the PC." },
    { data: "Licence request", direction: "leaves", path: "PC → licensing", rule: "A fixed set of fields, on each check." },
    { data: "Log lines", direction: "stays", path: "PC only", rule: "Names and paths replaced by hashed tokens." },
    {
      data: "Cloud document content",
      direction: "leaves",
      path: "Platform → model API",
      rule: "Only when a person sends a question; metered and capped.",
    },
  ],
  deployment: [
    {
      title: "Runs on",
      body: "Facility Windows PCs, per user, with no admin rights. The cloud runs in containers behind a load balancer, with images pinned by digest.",
    },
    {
      title: "Desktop release",
      body: "Commit → full test gate → installer → record size and checksum → install in place → verify → tag. A release from a modified working tree is refused.",
    },
    {
      title: "Cloud release",
      body: "Tiered gates: diff-selected tests, tests inside the built images, static checks and a dependency audit, a canary deploy with smoke checks, a dynamic security scan. Rollback is one command.",
    },
  ],
  incidents: [
    {
      id: "silent-misses",
      title: "Silent misses in matching",
      broke:
        "Phrases split across a wrapped line never matched; a multi-page fax was half-read; soft line breaks in Word files joined words; a cut-off recording was marked complete; a partly read folder reported full success.",
      cause: "Each path assumed clean input and reported success without checking that it had read everything.",
      change: "Fixed each path, made partial reads fail loudly, and asked users to re-run.",
      guard: "A regression test per defect, plus acceptance runs on real documents kept outside the repository.",
    },
    {
      id: "licences-refused",
      title: "Licences refused by every installed build",
      broke: "Licences from the new cloud service were rejected by the desktop app.",
      cause: "Three token claims disagreed between the issuer and the validator.",
      change: "Fixed the issuer, because the validator's constants were already compiled into installed builds.",
      guard: "A cross-repository contract test feeds real issuer output to the real validator. It was committed failing first.",
    },
    {
      id: "wrong-commit",
      title: "A release receipt named the wrong commit",
      broke: "A build receipt recorded a commit the build did not come from.",
      cause: "It read the commit from a working tree with uncommitted changes.",
      change:
        "A provenance gate now refuses release builds from a modified tree. The fix shipped as a new version, not a second build under the same number.",
      guard: "Tests with positive controls.",
    },
  ],
  decisions: [
    {
      choice: "Prove the network boundary with tests over the compiled code",
      instead: "A policy statement",
      reason: "A claim like “documents stay on the PC” needs evidence.",
      tradeoff: "Test upkeep, and licensing had to sit in its own assembly.",
    },
    {
      choice: "Permissive licences only",
      instead: "Copyleft PDF libraries, a revenue-capped imaging library, commercial OCR SDKs",
      reason: "The app ships to customers' PCs.",
      tradeoff: "More work on rendering and OCR.",
    },
    {
      choice: "Ship the evidence scorer uncalibrated, and say so",
      instead: "A confidence score that only looks calibrated",
      reason: "The synthetic corpus was too small to calibrate honestly.",
      tradeoff: "The confidence column ranks documents; it is not a probability.",
    },
    {
      choice: "Fix the licence mismatch on the server",
      instead: "A client update",
      reason: "Installed builds had the validator's constants compiled in.",
      tradeoff: "Issuer compatibility rules to maintain.",
    },
    {
      choice: "Embeddings from a local model beside the API",
      instead: "An embedding API",
      reason: "Document text stays inside the platform.",
      tradeoff: "More CPU and memory in the API task.",
    },
  ],
  verification: {
    checks: [
      "A build gate that runs the full suite before any release",
      "Tests over the compiled code: no networking types, with positive controls",
      "A licence-request shape test and a provenance-coverage test",
      "No-patient-data-in-logs and formula-injection tests",
      "Acceptance scripts: processes racing for the output folder, several instances at once, UI automation, end-to-end redaction on real documents kept outside the repository",
      "A fingerprint-locked synthetic corpus with an evaluation tool: confidence intervals, Brier score, reliability table",
      "Cloud: tiered CI, regression tests proven red first, post-deploy checks",
    ],
    notMeasured: [
      "Accuracy on real customer data",
      "Time saved",
      "Usage",
      "Earlier accuracy figures were withdrawn as not reproducible.",
    ],
  },
  outcome: {
    proves: [
      "A shipped line of per-user Windows installers through 2026, each released only after the full gate passed.",
      "Licensing verified end to end against the production service: trial, expiry, activation, seat release and revocation.",
      "A cloud platform that replaced an older stack needing a Windows worker, and now hosts desktop licensing.",
    ],
    notShown: [
      "Customer counts, users or documents processed",
      "Time saved, or accuracy on real data",
      "A calibrated confidence score: it ranks, it is not a probability",
    ],
  },
  walkthrough: WALKTHROUGH,
};
