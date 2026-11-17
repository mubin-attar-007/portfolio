import { AWS, USAGE } from "./shared";
import type { Flagship, Screenshot } from "./types";

/**
 * Bench Discovery — Sevina Technologies' document triage and review product:
 * a Windows desktop app and a cloud web platform. Sources: the discovery
 * dossier (§1–§8, Appendix A claims discipline), the facts verified by running
 * the apps on 17 Nov 2026, and the capture manifest. Nothing from the
 * dossier's owner-only appendix is used, and no security incident is told.
 *
 * Claims discipline: the desktop app's only network use is the licence check
 * (never "fully offline"); confidence ranks, it is not a probability; answers
 * about a whole Matter cite their source (not every answer is cited); no
 * historical accuracy figure; no certification.
 */

const DIR = "/showcase/bench-discovery";

const DESKTOP = {
  runComplete: {
    src: `${DIR}/desk-run-complete.webp`,
    width: 1440,
    height: 900,
    alt: "Bench Discovery's Classify by Content screen after a run: 37 of 37 documents processed in 6 seconds, under the notice that documents stay on this computer.",
    title: "A run, on the PC",
    proves: "37 dummy documents classified on the PC in 6 seconds. The banner states the rule: every file is read here, none is uploaded, and only the licence check goes over the network.",
    frame: "window",
  },
  results: {
    src: `${DIR}/desk-results.webp`,
    width: 1440,
    height: 900,
    alt: "The results grid: each dummy file with its category (Error, Other or Needs Review), confidence, pages read and keyword findings.",
    title: "Every flag explained",
    proves: "Each file lands in Needs Review, Other or Error with its confidence, the pages read and the keyword findings behind it. Confidence ranks the documents; it is not a probability.",
    frame: "window",
  },
  verifiedRedaction: {
    src: `${DIR}/desk-verified-redaction.webp`,
    width: 1440,
    height: 900,
    alt: "File Redaction results for three dummy forms: two Redacted and Verified, one Redacted with fields to check, each with its findings and the verification result Checked and passed.",
    title: "Redaction, then verification",
    proves: "Three dummy forms redacted and then checked: two Redacted and Verified, one with fields to check, every copy checked and passed. Anything uncertain is held for review.",
    frame: "window",
  },
  redactedCopy: {
    src: `${DIR}/desk-redacted-copy.webp`,
    width: 953,
    height: 1348,
    alt: "A redacted copy of a dummy discharge summary from a fictional hospital: identifier, date-of-birth, diagnosis and procedure fields covered by black boxes marked REDACTED.",
    title: "A redacted copy",
    proves: "The labelled fields blacked out on a dummy discharge summary, the rest of the page intact. The copy is rebuilt from pixels, so no text survives under the boxes.",
    frame: "page",
  },
  fileSearch: {
    src: `${DIR}/desk-file-search.webp`,
    width: 1440,
    height: 900,
    alt: "File Search: a folder of 24 dummy files indexed by name and path, and the matches for the query 'invoice'.",
    title: "Names, never contents",
    proves: "A local index of file names and paths only: 24 dummy files indexed and 3 matches for 'invoice'. No file is opened to search it.",
    frame: "window",
  },
  classifySetup: {
    src: `${DIR}/desk-classify-setup.webp`,
    width: 1600,
    height: 1135,
    alt: "Classify by Content before a run: a drop zone for a folder, the classification rules, and the notice that documents stay on this computer.",
    title: "Documents stay on this computer",
    proves: "The setup screen states the privacy design before any run: every document is read on this computer, and the only thing sent over the network is the licence check.",
    frame: "window",
  },
} satisfies Record<string, Screenshot>;

const WEB = {
  documents: {
    src: `${DIR}/web-documents.webp`,
    width: 1600,
    height: 1000,
    alt: "A dummy Matter's Documents page: upload by file or folder, counters reading Ready 9, Processing 0 and Needs attention 1, and the list of documents.",
    title: "What was read, and what was not",
    proves: "A Matter's documents with honest readiness: 9 ready for Ask Bench and 1 that could not be read, with the reason. Originals are never modified.",
    frame: "browser",
  },
  review: {
    src: `${DIR}/web-review.webp`,
    width: 1600,
    height: 1000,
    alt: "The review queue: a list of dummy documents, an incident report open in the viewer, and the decision panel with Relevant selected and a note.",
    title: "The reviewer's workbench",
    proves: "The original beside the decision panel: relevant, not relevant or needs review, with a note and tags. Four of ten dummy documents decided.",
    frame: "browser",
  },
  search: {
    src: `${DIR}/web-search.webp`,
    width: 1600,
    height: 1000,
    alt: "Search: the exact phrase 'sensor mat' found in five dummy documents, a care plan open at the highlighted match, and a note about material that was not fully read.",
    title: "Search with a coverage note",
    proves: "An exact-phrase search opens the original at the match, and says plainly that material it could not read may still contain the words.",
    frame: "browser",
  },
  askCitations: {
    src: `${DIR}/web-ask-citations.webp`,
    width: 1600,
    height: 1000,
    alt: "Ask Bench: a question about a dummy incident report, an answer citing one source, the banner 'Simulated answer, no live model called', and the cited page highlighted in the preview.",
    title: "Answers that cite the page",
    proves: "The answer cites page 2 of the source, and the citation opens it highlighted. This test stack labels the answer as simulated: no live model was called.",
    frame: "browser",
  },
  aiSpend: {
    src: `${DIR}/web-ai-spend.webp`,
    width: 1600,
    height: 1000,
    alt: "Settings, AI record: cards for spent, still held, total and allowance, a notice that no AI allowance is set, and the list of questions asked.",
    title: "AI spend, capped and recorded",
    proves: "Spend per organisation: settled, still held for running requests, the allowance, and every question asked. With no allowance set, Ask Bench makes no paid requests.",
    frame: "browser",
  },
  people: {
    src: `${DIR}/web-people.webp`,
    width: 1600,
    height: 1000,
    alt: "Settings, People: counters for people, administrators, two-step sign-in and disabled accounts, the dummy organisation's name and a table of fictional users, one of them not signed in yet with the date their temporary password expires. No password is shown.",
    title: "People, roles and two-step sign-in",
    proves: "An organisation's people with their roles, AI access and two-step sign-in. An administrator issues each account, and a new user's temporary password stops working on a set date; there is no public sign-up.",
    frame: "browser",
  },
} satisfies Record<string, Screenshot>;

export const benchDiscovery: Flagship = {
  slug: "bench-discovery",
  name: "Bench Discovery",
  headline: "Document review that shows its work",
  summary:
    "A Windows app that triages and redacts document sets on the PC, and a web platform on AWS where legal teams review them with cited answers.",
  definition: "Document triage, verified redaction and cited answers, on the PC and in the cloud.",
  domain: "Legal and compliance document review",
  updated: "2026-11-17",
  credit: {
    role: "I designed, built and maintain both the desktop app and the web platform.",
  },
  figures: [
    { value: USAGE["bench-discovery"].figure, label: USAGE["bench-discovery"].label, source: "approved-usage" },
    { value: "3,316", label: "desktop tests passed, 0 failed", source: "verification" },
    { value: "5,118", label: "web tests passed in the last full run", source: "verification" },
  ],
  problem: {
    body: [
      "Litigation and regulatory work arrives as large, messy document sets: healthcare records mixed with business paperwork, scans and faxes, spreadsheets, email and recordings. A team has to find every document that matters, put only those in front of a person, and release redacted copies that really hide what they cover.",
      "Originals must never change, document content must stay where the customer allows it, and every run has to leave a record of what was read and what was not. The desktop app does the work on the user's own PC. The web platform takes the same job into team review, with answers that cite the exact page, row or paragraph.",
    ],
    users: [
      "Legal and compliance staff working through document sets on their own Windows PCs",
      "Review teams working in shared Matters on the web platform",
      "Administrators who manage people, roles and AI spend",
    ],
  },
  constraints: [
    {
      constraint: "Document content must not leave the PC",
      forced: "Only the licensing assembly holds network code, and its request carries nine identifier fields.",
      checked: "Tests read the compiled binaries and fail on any networking type, URL or second address.",
    },
    {
      constraint: "Originals must never change",
      forced: "Sources are opened read-only and hashed; every output is a copy.",
      checked: "The source hash is checked again before a copy is placed.",
    },
    {
      constraint: "A redaction has to remove the value",
      forced: "Copies are rebuilt from pixels, then checked as an attacker would.",
      checked: "A failed check places no file and gives no status.",
    },
    {
      constraint: "Logs must not hold document data",
      forced: "The logger accepts only hashed tokens, never names or paths.",
      checked: "Privacy sweeps prove no document text, file name or path reaches a log.",
    },
    {
      constraint: "Staff PCs are locked down",
      forced: "A per-user installer that needs no admin rights, plus a portable folder.",
      checked: "Acceptance scripts run against the installed build.",
    },
    {
      constraint: "Tenants must stay isolated",
      forced: "Each transaction carries the tenant from the verified session, behind row-level security.",
      checked: "Row-level security tests across every tenant table; no context means no rows.",
    },
    {
      constraint: "Model spend must stay under a cap",
      forced: "Every model call is admitted against a capped allocation before it is sent.",
      checked: "Allowance and spend-guard tests; test mode refuses to start while a provider credential is visible.",
    },
  ],
  constraintsNote: "No compliance certification is claimed.",
  built: [
    {
      title: "Desktop app",
      icon: "desktop",
      items: [
        "A self-contained .NET 10 and WPF app with seven modules: classify by content and by extension, verified redaction, file search, safe transfer, document analysis and local speech to text.",
        "Local OCR behind a per-page text-quality gate, so a page nobody could read is reported, not treated as blank.",
        "Runs that resume after a cancel or a crash, with the output folder claimed for the whole run.",
        "Signed licences verified offline, against a clock that rewinding cannot fool.",
        "A run manifest and an audit index for every module: hashes and counts, never names.",
        "A release gate that runs the full suite, checks the build can be licensed and writes a receipt only when everything passed.",
      ],
    },
    {
      title: "Web platform",
      icon: "cloud",
      items: [
        "Matters with documents in every common format, a reading status that says what was not read, search and a review queue.",
        "Ask Bench: retrieval over the Matter, answers that cite the page, row or paragraph, and every quotation checked against its excerpt.",
        "Prepared actions: the model proposes a redaction or a mask, and a person confirms it on a card naming every document.",
        "Sessions, tenancy enforced in PostgreSQL row-level security, and AI spend admitted against a cap before each call.",
        "The licensing authority the desktop app trusts, signing through AWS KMS.",
        "Hosting on AWS: Amazon ECS on AWS Fargate, Amazon RDS for PostgreSQL and Amazon S3.",
      ],
    },
  ],
  sketch: {
    title: "The desktop app, on the PC",
    zones: [
      {
        label: "Windows PC · documents stay here",
        nodes: [
          "Folder walk · safe archive expansion",
          "Text layer or local OCR",
          "Evidence and keyword match",
          "Needs review · Other · Error",
          "Copies, verified redactions, audit index",
        ],
      },
      { label: "Web platform on AWS", nodes: ["Licensing API", "Licences signed with AWS KMS"] },
    ],
    crossings: [{ label: "One HTTPS call · the licence check, nine identifier fields", direction: "forward" }],
  },
  moreSketches: [
    {
      title: "The web platform on AWS",
      zones: [
        { label: "Browser", nodes: ["Matters, review and Ask Bench"] },
        {
          label: "AWS",
          nodes: [
            "Application Load Balancer",
            "Next.js web and FastAPI API on Amazon ECS (Fargate)",
            "Workers · extraction, indexing, redaction",
            "Amazon RDS for PostgreSQL · job queue, row-level security",
            "Amazon S3 · versioned, encrypted with AWS KMS",
          ],
        },
        { label: "Model provider", nodes: ["Claude, behind a spend cap"] },
      ],
      crossings: [
        { label: "HTTPS · session, CSRF and origin checks", direction: "forward" },
        { label: "Only on an explicit question · spend admitted first", direction: "forward" },
      ],
      notes: ["A customer's own S3 bucket is read through a scoped role, assumed with AWS STS."],
    },
  ],
  trace: [
    {
      title: "Staff choose a folder and a keyword list",
      body: "The app walks the folder on the PC and expands archives safely. Sources are opened read-only and hashed.",
      focus: { zone: 0, node: 0 },
    },
    {
      title: "Each page is read from its text layer or by local OCR",
      body: "A text-quality gate decides page by page. OCR runs locally, and a page nobody could read flags its document for review.",
      focus: { zone: 0, node: 1 },
    },
    {
      title: "The evidence decides the pile",
      body: "Every document lands in Needs review, Other or Error, with its reason and the pages read. Confidence ranks; it is not a probability.",
      focus: { zone: 0, node: 3 },
    },
    {
      title: "The run writes copies, never originals",
      body: "Copies, verified redactions, a results spreadsheet and a run manifest land in the output folder. The source is left exactly as it was.",
      focus: { zone: 0, node: 4 },
    },
    {
      title: "Only the licence check leaves the PC",
      body: "One HTTPS call with nine identifier fields. The signed licence is then verified offline, and tests over the shipped binaries prove no other address exists.",
      focus: { zone: 1, crossing: 0 },
    },
  ],
  boundary: [
    { data: "Document text, page images, file names", direction: "stays", path: "PC only", rule: "Never leave the PC." },
    { data: "Licence request", direction: "leaves", path: "PC → licensing API", rule: "Nine identifier fields; no document, folder or keyword." },
    { data: "Log lines", direction: "stays", path: "PC only", rule: "Names and paths replaced by hashed tokens." },
    { data: "Matter evidence for an answer", direction: "leaves", path: "Platform → model provider", rule: "Only when a person asks; spend admitted first." },
    { data: "A customer's S3 documents", direction: "enters", path: "Customer bucket → platform", rule: "Through a read-only role assumed per connection." },
  ],
  deployment: [
    {
      title: "Desktop: a per-user installer",
      body: "Installs without admin rights, or runs from a portable folder. Every installer ever shipped is archived with its SHA-256, so any version upgrades or downgrades in place.",
    },
    {
      title: "Web: hosted on AWS",
      body: "Containers on Amazon ECS with AWS Fargate behind an Application Load Balancer. Amazon RDS for PostgreSQL 17 with point-in-time recovery and a backup copy in a second region. Versioned Amazon S3 encrypted with an AWS KMS customer-managed key, secrets from Parameter Store, and AWS CloudTrail with Amazon CloudWatch alarms.",
    },
    {
      title: "How a release ships",
      body: "Desktop: provenance check, locked restore, the full suite, the licensing gate, then a receipt. Web: images built from a clean export and pinned by digest in Amazon ECR, a canary verified live, and one-command rollback.",
    },
  ],
  incidents: [
    {
      id: "lost-source",
      title: "The source of a shipping release was lost",
      broke: "The source code of the installed 5.11 release was lost, and its history could not be recovered.",
      cause: "The original repository was gone, with nothing left to rebuild from but the installed app.",
      change:
        "I rebuilt the source by replaying every recorded edit from the original AI coding-agent session, then proved it against the installed binaries: every first-party assembly decompiled identically, and a parity harness drove both builds through 188 actions with 0 differences.",
      guard: "Every installer is now archived with its checksum. Shipping resumed with 5.12.",
    },
    {
      id: "silent-losses",
      title: "Silent losses in reading",
      broke:
        "Phrases split across a wrapped line were never matched, a multi-page fax was half read, Word line breaks welded words together, and a cut-off recording was signed off as complete.",
      cause: "Each path assumed clean input and reported success without checking it had read everything.",
      change: "The 5.13 accuracy release corrected 14 defects with fail-first tests, made partial reads fail loudly and asked users to re-run.",
      guard: "A regression test per defect, proved red before the change.",
    },
    {
      id: "stuck-answers",
      title: "Abandoned answers kept their money reserved",
      broke: "When an API process died in the middle of an answer, the turn stayed “running” for good, with its AI spend still reserved.",
      cause: "The function that reaps abandoned turns existed, but nothing called it.",
      change: "Every API process now runs the reaper, taking only rows no other process holds.",
      guard: "The reaper never sends a turn again, and spend it cannot account for stays reserved.",
    },
    {
      id: "licences-refused",
      title: "Licences from the new authority were refused",
      broke: "When licensing moved to the web platform, every shipped desktop build refused its licences.",
      cause: "The issuer name was off by one hyphen, then the subject and version claims disagreed; each side's suite validated only its own tokens.",
      change: "Corrected on the issuer, because the validator's constants were already compiled into installed builds.",
      guard: "A cross-repository contract test feeds real issuer output to the real desktop validator.",
    },
    {
      id: "scans-unsearchable",
      title: "Scanned pages were invisible to search",
      broke: "Scanned pages could not be found by search, or used by Ask Bench.",
      cause: "The OCR branch was gated on a flag that nothing ever set.",
      change: "OCR became an explicit operator setting, with its CPU cost measured.",
      guard: "Each document's reading status names the pages that were not read.",
    },
    {
      id: "wrong-receipt",
      title: "A release receipt named the wrong commit",
      broke: "A build receipt named a commit that did not contain the release.",
      cause: "The receipt was built from the wrong source.",
      change: "Receipts state their true source, and a release build from a modified tree is refused.",
      guard: "Build-provenance tests with positive controls.",
    },
  ],
  decisions: [
    {
      choice: "Prove the network boundary with tests over the compiled binaries",
      instead: "A privacy statement",
      reason: "“Documents stay on this computer” needs evidence that a search through the source cannot fake.",
      tradeoff: "Test upkeep, and licensing had to live in its own assembly.",
    },
    {
      choice: "Narrow the claim, never loosen the test",
      instead: "Weakening the test when licensing added network code",
      reason: "“Runs offline” stopped being true; “Documents stay on this computer” still is.",
      tradeoff: "A less sweeping line on the box.",
    },
    {
      choice: "Permissive licences only",
      instead: "Copyleft PDF libraries, a revenue-capped imaging library, commercial OCR SDKs",
      reason: "The app ships to customers' PCs.",
      tradeoff: "More work on rendering and OCR.",
    },
    {
      choice: "Ship the evidence score uncalibrated, and say so",
      instead: "A confidence score that only looks calibrated",
      reason: "The synthetic corpus was too small to calibrate honestly.",
      tradeoff: "Confidence ranks documents; it is not a probability.",
    },
    {
      choice: "The model proposes, a person confirms",
      instead: "Letting the assistant run actions",
      reason: "A redaction changes evidence, so the server re-reads its own record of the proposal before anything runs.",
      tradeoff: "One more click for each action.",
    },
    {
      choice: "Embeddings from a private CPU encoder beside the API",
      instead: "A hosted embedding API",
      reason: "Document text stays inside the platform.",
      tradeoff: "More CPU and memory in the cluster.",
    },
  ],
  verification: {
    suites: [
      {
        value: "3,316",
        label: "desktop tests: 3,316 passed, 0 failed, 0 skipped",
        method: "The full suite in Release on an unmodified export, run on 17 Nov 2026: 250 test classes in 15 min 21 s.",
      },
      {
        value: "5,118",
        label: "web tests passed, 0 failed, 0 errors",
        method: "The last recorded full run, on 19 Oct 2026: the whole suite inside the built images, against an isolated database.",
      },
      {
        value: "848",
        label: "browser tests in 115 Playwright specs",
        method: "Counted from the source on 17 Nov 2026, run on Chromium and Firefox.",
      },
    ],
    checks: [
      "Tests over the compiled binaries: no networking type in processing, exactly one HTTPS address in licensing, and a positive control so a broken reader cannot pass",
      "Privacy sweeps: no document text, OCR output, file name or path reaches a log",
      "A desktop release gate: provenance, a locked restore, the full suite, the licensing gate, a package check and a receipt of SHA-256 hashes",
      "Web tiers: diff-selected tests on every change, tests inside the built images before a deploy, a canary verified live, and a full run from source at each milestone",
      "Every regression test proved red before the change it guards",
    ],
    notMeasured: [
      "Accuracy on real customer data",
      "Time saved for a review team",
      "Documents processed in use",
      "Earlier accuracy figures, withdrawn as not reproducible",
    ],
  },
  outcome: {
    proves: [
      "A line of per-user Windows installers shipped through 2026, from 5.12 to 5.20, each released only after the full gate passed.",
      "A lost release rebuilt and proved byte for byte, after which shipping resumed.",
      `A web platform on AWS with tenant isolation in the database and model spend capped before any call, used with the desktop app by ${USAGE["bench-discovery"].sentence}.`,
    ],
    notShown: [
      "Accuracy on real data, or time saved",
      "Client names or document volumes",
      "A calibrated confidence score: it ranks, it is not a probability",
    ],
  },
  highlights: [
    {
      id: "offline-proof",
      title: "Proof, not a promise",
      body: "Tests read the shipped binaries: the processing assemblies may reference no networking type, and the licensing assembly holds exactly one HTTPS address. Zero counts as a failure too.",
      art: { kind: "terminal", running: "reading the compiled assemblies…", done: "no network types in processing" },
      wide: true,
    },
    {
      id: "verified-redaction",
      title: "Redaction that is attacked first",
      body: "Every copy is rebuilt from pixels, then checked five ways: the extracted text, the byte scan, the metadata, the form fields and OCR. A failed check places no file.",
      art: { kind: "checks", items: ["Text", "Bytes", "Metadata", "Form fields", "OCR"] },
    },
    {
      id: "trusted-clock",
      title: "A clock rewinding cannot fool",
      body: "The licence clock answers the later of wall time and the last trusted time plus real uptime. Rewinding buys nothing.",
      art: { kind: "badge", title: "Licence clock", lines: ["max(wall clock, floor + uptime)", "rewinding buys nothing"] },
    },
    {
      id: "lost-source",
      title: "A lost release, rebuilt byte for byte",
      body: "Rebuilt from the AI coding session's recorded edits, then proved against the installed binaries.",
      art: { kind: "timeline", items: ["Source lost", "Rebuilt from the session", "188 actions · 0 differences"] },
    },
    {
      id: "reading-honestly",
      title: "An unread page is never blank",
      body: "A text-quality gate chooses between the text layer and local OCR for each page, and a page nobody could read flags its document.",
      art: { kind: "flow", nodes: ["Page", "Quality gate", "Text or OCR"], hot: 1 },
    },
    {
      id: "cited-answers",
      title: "Answers that cite the page",
      body: "Ask Bench answers from the Matter's evidence and cites the page, row or paragraph. Each quotation is checked against the excerpt it cites, with one bounded repair, and when nothing supports an answer it says so.",
      art: {
        kind: "reply",
        question: "Who was told about the fall?",
        answer: "The resident's daughter, at 03:20.",
        cite: "Incident report · page 2",
      },
      wide: true,
    },
    {
      id: "confirmed-actions",
      title: "The model proposes, a person decides",
      body: "A prepared action records an intention only. A person confirms it, and the server re-reads its own record before a worker runs it.",
      art: { kind: "flow", nodes: ["Proposal", "Person confirms", "Worker"], hot: 1 },
    },
    {
      id: "tenancy",
      title: "Tenancy in the database",
      body: "Every transaction carries the tenant from the verified session, and row-level security fails closed: no context, no rows.",
      art: { kind: "terminal", running: "SET LOCAL app.organization_id…", done: "no tenant context, no rows" },
    },
    {
      id: "spend-cap",
      title: "AI spend that cannot overrun",
      body: "Each model call is admitted against a capped allocation under a row lock. Reserved and unknown spend count as spent.",
      art: {
        kind: "bars",
        items: [
          { label: "Settled", value: 52 },
          { label: "Reserved", value: 26 },
          { label: "Unknown", value: 12 },
        ],
        note: "admitted only under the cap",
      },
    },
    {
      id: "provenance",
      title: "No module ships unaudited",
      body: "A sweep of the compiled code finds every writer of a user-facing file, and fails until each one records its runs. Stale entries fail too.",
      art: { kind: "checks", items: ["Results CSV", "Run manifest", "Transfer log"] },
    },
  ],
  excerpts: [
    {
      id: "network-boundary",
      title: "Exactly one address, not at most one",
      story:
        "The desktop app promises that document content never leaves the PC, so its tests read the shipped binaries instead of trusting the source, and only the licensing assembly may hold an address. This version exists because the earlier “at most one” assertion was caught passing with nothing to check, so zero is now the more dangerous failure.",
      file: "desktop/tests/OfflineGuaranteeTests.cs",
      lang: "csharp",
      code: `[Fact]
public void TheLicensingAssemblyTalksToOneAddressAndItIsTheProductionOne()
{
    const string name = "BenchDiscovery.Licensing.dll";
    var urls = ExtractUrls(File.ReadAllBytes(Path.Combine(AppContext.BaseDirectory, name)))
        .Where(u => !AllowedUrlHosts.Contains(HostOf(u), StringComparer.OrdinalIgnoreCase))
        .OrderBy(u => u, StringComparer.Ordinal)
        .ToList();

    foreach (var url in urls)
    {
        Assert.True(url.StartsWith("https://", StringComparison.OrdinalIgnoreCase),
            $"{name} carries a non-HTTPS address: {url}.");
        foreach (var marker in new[] { "localhost", "127.0.0.1", "staging", "//dev.", "//test." })
            Assert.False(url.Contains(marker, StringComparison.OrdinalIgnoreCase),
                $"{name} carries what looks like a {marker} address: {url}.");
    }

    // EXACTLY ONE, NOT "AT MOST ONE". This was \`urls.Count <= 1\`: zero satisfied it, the loop
    // above ran over an empty list, and the test passed while asserting nothing.
    Assert.True(urls.Count == 1,
        $"{name} carries {urls.Count} addresses. It is permitted exactly one; zero means this " +
        "test has stopped being able to see them, which is the more dangerous failure.");

    // AND IT IS THE PRODUCTION ONE, compared by host.
    var expected = HostOf(BenchDiscovery.Licensing.LicenseEndpoint.ProductionBaseAddress);
    Assert.True(string.Equals(expected, HostOf(urls[0]), StringComparison.OrdinalIgnoreCase),
        $"{name} points at {HostOf(urls[0])}; the production licensing service is {expected}.");
}`,
    },
    {
      id: "verify-redaction",
      title: "Verify a redaction the way an attacker would",
      story:
        "A black box over text is not a redaction, so every copy is rebuilt from pixels and then attacked: its text extracted, its bytes scanned in three encodings, its metadata and form fields checked, and finally read by OCR with the whole rule set run over what a person would see. A failed check means no status and no file, so the only verdict that ships is one the output earned.",
      file: "desktop/Redaction/Verify/RedactionVerifier.cs",
      lang: "csharp",
      code: `public static VerificationReport VerifyPdf(string outputPath, FileRedactionPlan plan,
    PageRenderer renderer, OcrEnginePool? ocr, CompiledRedactionRules rules,
    DateOnly todayUtc, CancellationToken ct)
{
    var report = new VerificationReport();
    var removed = RemovedValues(plan);   // held in memory only: never logged, never written
    try
    {
        var bytes = File.ReadAllBytes(outputPath);
        // SHAPE. A file that will not open is not a redacted document, it is a lost one.
        using (var document = PdfDocument.Open(bytes, new ParsingOptions { UseLenientParsing = true }))
        {
            report.SectionsChecked = document.NumberOfPages;
            if (document.NumberOfPages == 0) return Fail(report, "The redacted copy has no pages.");
            CheckDocumentText(document, removed, report);   // what copy, paste and Ctrl-F would find
            CheckMetadata(document, removed, report);
            CheckAnnotationsAndForms(document, report);
        }
        CheckRawBytes(bytes, removed, report);   // ASCII, UTF-16LE and UTF-16BE
        CheckNotACopy(bytes, plan, report);      // SHA-256 must differ from the source's
        if (report.Problems.Count > 0) return Fail(report, null);
        // PICTURE: render the output, OCR it, and run the WHOLE rule set over what a person sees.
        SweepWithOcr(bytes, plan, renderer, ocr, rules, todayUtc, report, ct);
    }
    catch (OperationCanceledException) { throw; }
    catch (Exception ex)   // the message may name the file, so it is described, not repeated
    { return Fail(report, $"The redacted copy could not be checked ({ex.GetType().Name})."); }

    if (report.Problems.Count > 0) return Fail(report, null);
    report.Outcome = VerificationOutcome.Passed; return report;
}`,
    },
    {
      id: "trusted-clock",
      title: "A licence clock that rewinding cannot fool",
      story:
        "A licence is checked offline for days at a time, so the PC's own clock cannot be trusted, and the gate in front of each new file asks this clock instead. It answers the later of wall time and the last trusted time plus monotonic uptime, so winding the clock back buys nothing and a week of uptime raises the floor by a week.",
      file: "desktop/Licensing/TrustedClock.cs",
      lang: "csharp",
      code: `// The later of the machine clock and the floor plus however long this process has really been
// running since the floor was set. Rewinding the clock buys nothing; uptime raises the floor.
public DateTime UtcNow()
{
    var wall = _wallClock();
    lock (_gate)
    {
        if (_floorUtc == DateTime.MinValue) return wall;      // never seeded: plain UtcNow

        var elapsed = Stopwatch.GetElapsedTime(_floorStamp, _monotonicTicks());
        if (elapsed < TimeSpan.Zero) elapsed = TimeSpan.Zero; // nothing here may subtract time

        // Saturating, not throwing: a licence check must never be where an OverflowException
        // comes from on a machine whose clock is already absurd.
        var headroom = DateTime.MaxValue - _floorUtc;
        var earned = elapsed < headroom ? _floorUtc + elapsed : DateTime.MaxValue;
        var answer = wall > earned ? wall : earned;

        _floorUtc = answer;              // reading banks the monotonic gain,
        _floorStamp = _monotonicTicks(); // so asking twice cannot walk the floor back
        return answer;
    }
}

// Raised from the persisted high-water mark or a signed licence's issue time. Only ever upwards.
public void RaiseFloorTo(DateTime utc)
{
    lock (_gate) { if (utc <= _floorUtc) return; _floorUtc = utc; _floorStamp = _monotonicTicks(); }
}`,
    },
    {
      id: "spend-admission",
      title: "Reserve before you spend, under a row lock",
      story:
        "Reservations were being recorded and never compared with anything: harmless while the AI was scripted, and a surprise bill the day a real provider was wired in. Now every model call is admitted against a capped allocation under a row lock, counts in-flight and unknown spend as spent, and is refused with a reason instead of being silently downgraded.",
      file: "api/work/allowance.py",
      lang: "python",
      code: `@dataclass(frozen=True)
class Position:
    scope: str
    cap_micro_usd: int
    settled_micro_usd: int
    unknown_micro_usd: int
    reserved_micro_usd: int

    @property
    def committed_micro_usd(self) -> int:
        """Everything that is spent or might already be. Reserved money is not free just because
        the turn has not finished - the provider may well have been reached."""
        return self.settled_micro_usd + self.unknown_micro_usd + self.reserved_micro_usd


def admit(db: DbSession, *, wanted_micro_usd: int, turn_id: uuid.UUID | None = None) -> Position:
    """Refuse or permit one reservation. Raises rather than returning a boolean: a boolean invites
    a caller that forgets to check it, and forgetting here spends someone's money.

    ATOMIC ACROSS PROCESSES. The allocation row is locked FOR UPDATE before the total is read, so
    two API processes cannot each read the same balance, each conclude there is room, and each
    dispatch. The lock is held only for the admission, never across a provider stream.
    """
    allocation_id = ...  # resolved from the PERSISTED turn's organisation, never from the request
    current = position(db, lock=True, allocation_id=allocation_id)
    if current.committed_micro_usd + wanted_micro_usd > current.cap_micro_usd:
        raise AllowanceExceeded(wanted=wanted_micro_usd, spent=current.committed_micro_usd,
                                cap=current.cap_micro_usd, scope=current.scope)
    return current`,
    },
    {
      id: "row-level-security",
      title: "Row-level security that fails closed",
      story:
        "Every route already authorises its caller; row-level security answers a different question: what happens when some other code path, such as a future endpoint or a report job, asks for the wrong rows. The policies are generated from one module, fail closed when no tenant context is set, and were rolled out in stages with tests proving every table is covered.",
      file: "api/security/rls.py",
      lang: "python",
      code: `# Fail closed by three-valued logic: current_setting(name, true) is NULL for a setting never
# published, nullif() turns the empty string (a user with no organisation) into NULL, and
# \`column = NULL\` is not TRUE - so a caller with no tenant context sees nothing and writes nothing.
USER = "nullif(current_setting('app.user_id', true), '')::uuid"
ORG = "nullif(current_setting('app.organization_id', true), '')::uuid"


@dataclass(frozen=True)
class TablePolicy:
    """One table's policy. \`\`using\`\` filters what a statement reads; \`\`check\`\` validates writes."""
    table: str
    using: str
    check: str

    def create(self) -> list[str]:
        # BOTH clauses, always: USING alone lets a caller INSERT a row for another tenant that it
        # then cannot see - a write-only cross-tenant channel that looks like a policy.
        name = f"rls_{self.table}"
        return [
            f"ALTER TABLE public.{self.table} ENABLE ROW LEVEL SECURITY;",
            f"DROP POLICY IF EXISTS {name} ON public.{self.table};",
            f"CREATE POLICY {name} ON public.{self.table} AS PERMISSIVE FOR ALL TO PUBLIC"
            f" USING ({self.using}) WITH CHECK ({self.check});",
        ]


def _org(table: str) -> TablePolicy:
    p = f"organization_id = {ORG}"
    return TablePolicy(table, p, p)`,
    },
  ],
  hero: {
    primary: WEB.review,
    secondary: DESKTOP.runComplete,
    caption: "The web platform's review queue and the desktop app after a run, both on dummy data.",
  },
  gallery: [
    {
      id: "desktop",
      label: "Desktop",
      shots: [
        DESKTOP.runComplete,
        DESKTOP.results,
        DESKTOP.verifiedRedaction,
        DESKTOP.redactedCopy,
        DESKTOP.fileSearch,
        DESKTOP.classifySetup,
      ],
    },
    {
      id: "web",
      label: "Web",
      shots: [WEB.documents, WEB.review, WEB.search, WEB.askCitations, WEB.aiSpend, WEB.people],
    },
  ],
  recordings: [
    {
      id: "desktop-demo",
      label: "Desktop app",
      title: "The desktop app, on a dummy document set",
      src: `${DIR}/desktop-demo.webm`,
      poster: `${DIR}/desktop-demo.webp`,
      captions: `${DIR}/desktop-demo.vtt`,
      width: 1440,
      height: 900,
      duration: 57.72,
      frame: "window",
      alt: "Screen recording of the Bench Discovery desktop app classifying, redacting and searching a dummy document set.",
      summary: "Classify a folder of dummy documents on the PC, redact and verify three dummy forms, then search file names.",
      scenes: [
        { start: 0, end: 7, text: "Classify by Content, on the PC: a folder of 37 dummy documents and a demo keyword list. Nothing is uploaded." },
        { start: 7, end: 19, text: "Start Processing: scans and a fax are read with local OCR. All 37 documents are done in about 4 seconds." },
        { start: 19, end: 28, text: "The counters: 37 processed, 8 need review and 4 are errors, each with its reason." },
        { start: 28, end: 33, text: "The results grid: category, confidence, pages read and keyword findings for every file." },
        { start: 33, end: 39, text: "File Redaction: the active rule set lists five field types. The folder scanned is never changed." },
        { start: 39, end: 45, text: "Three dummy forms: each copy is checked after it is written. Two are Redacted and Verified; one has fields to check." },
        { start: 45, end: 57.72, text: "File Search indexes names and paths only, never contents: 'invoice' finds 3 files." },
      ],
    },
    {
      id: "web-demo",
      label: "Web platform",
      title: "The web platform, on a dummy Matter",
      src: `${DIR}/web-demo.webm`,
      poster: `${DIR}/web-demo.webp`,
      captions: `${DIR}/web-demo.vtt`,
      width: 1440,
      height: 900,
      duration: 47.08,
      frame: "browser",
      alt: "Screen recording of the Bench Discovery web platform on a dummy Matter: documents, review, search, a cited answer and the AI spend record.",
      summary: "Open a dummy Matter, review a document, search an exact phrase, ask a question answered with a citation, and check the AI spend record.",
      scenes: [
        { start: 0, end: 4, text: "Sign in to the local test stack with an administrator account." },
        { start: 4, end: 9, text: "Home: the Matters in this workspace. Every record here is invented." },
        { start: 9, end: 15, text: "A Matter's documents: 9 ready for Ask Bench and 1 that could not be read, with the reason." },
        { start: 15, end: 21, text: "Review: the original document beside the decision panel." },
        { start: 21, end: 27, text: "Search: an exact phrase across the Matter, with a note on material that was not fully read." },
        { start: 27, end: 40, text: "Ask Bench: the answer cites page 2 of the incident report. The test stack labels it a simulated answer; no live model is called." },
        { start: 40, end: 43, text: "The citation opens the source at the quoted passage." },
        { start: 43, end: 47.08, text: "Settings, AI record: spend, money held for running requests, and every question asked." },
      ],
    },
  ],
  stack: {
    groups: [
      {
        label: "Desktop app",
        items: ["C# on .NET 10", "WPF", "PdfPig and PDFium", "Tesseract 5 OCR", "Whisper.net", "SQLite", "xUnit", "Inno Setup"],
      },
      {
        label: "Web platform",
        items: [
          "Next.js 16",
          "React 19",
          "TypeScript",
          "Tailwind CSS 4",
          "Python 3.12",
          "FastAPI",
          "SQLAlchemy 2",
          "PostgreSQL 17 with pgvector",
          "Claude models",
          "Playwright",
          "pytest",
        ],
      },
    ],
    aws: [AWS.ecs, AWS.fargate, AWS.ecr, AWS.alb, AWS.rds, AWS.s3, AWS.kms, AWS.parameters, AWS.cloudtrail, AWS.cloudwatch, AWS.iam, AWS.sts],
  },
  card: {
    body: "Triages, redacts and searches document sets on the PC, and lets a team review them on the web with answers that cite the page.",
    tech: "C# and .NET 10 · Next.js · FastAPI · PostgreSQL · AWS: ECS on Fargate, RDS, S3, KMS",
  },
};
