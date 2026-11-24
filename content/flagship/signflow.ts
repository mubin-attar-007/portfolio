import { AWS, USAGE } from "./shared";
import type { Flagship, Screenshot } from "./types";

/**
 * SignFlow — Sevina Technologies' in-house e-signature platform: envelopes,
 * single-use signing links released in signing order, and one final PDF
 * sealed with a PAdES signature and timestamped. Published with the company's
 * permission (owner, 18 Nov 2026). Sources: the code of the private repository
 * and two local runs of it on dummy data, 18 Nov 2026
 * (.local/showcase/media/signflow/capture-manifest.md and verification/),
 * which is where every capture and every "verified" below comes from.
 *
 * Claims discipline: only what the product does as it runs. Every claim was
 * verified after the repository's fixes of 18 Nov 2026, each written
 * test-first (the live product carries the same fixes; owner, 18 Nov 2026).
 * Not claimed: long-term validation (PAdES B-LT), certificates held by
 * signers, or any compliance certification; the frameworks the app's
 * compliance page names are covered in its captures, and the recording ends
 * before that page. No incident is told, because none is on record.
 */

const DIR = "/showcase/signflow";

const SHOTS = {
  dashboard: {
    src: `${DIR}/dashboard.webp`,
    width: 1600,
    height: 1000,
    alt: "SignFlow's dashboard with five dummy envelopes in draft, sent and completed states, and filters by status.",
    title: "Every envelope and where it stands",
    proves: "The sender's dashboard: each envelope with its status, its ID, its documents and its recipients.",
    frame: "browser",
  },
  wizardUpload: {
    src: `${DIR}/wizard-upload.webp`,
    width: 1600,
    height: 1000,
    alt: "Step 2 of the new-envelope wizard: a dummy admission consent PDF uploaded.",
    title: "Documents in",
    proves: "The wizard's upload step. Each PDF is hashed with SHA-256 and stored encrypted under its own key.",
    frame: "browser",
  },
  wizardRecipients: {
    src: `${DIR}/wizard-recipients.webp`,
    width: 1600,
    height: 1000,
    alt: "Step 3 of the wizard: Riley Placeholder and Casey Example added as signers in signing order 1 and 2, and Morgan Sample as a copy recipient, each with a role.",
    title: "Signers, in order",
    proves: "Recipients added with a role and a signing order: a signer's link is emailed only once the signers before them have signed.",
    frame: "browser",
  },
  fieldPlacement: {
    src: `${DIR}/field-placement.webp`,
    width: 1600,
    height: 1000,
    alt: "Step 4 of the wizard: signature, date, initials and text fields placed on a dummy consent form, coloured by signer.",
    title: "Fields on the page",
    proves: "Fields dragged onto the PDF and sized for each signer: signature, date, initials, text or checkbox.",
    frame: "browser",
  },
  signing: {
    src: `${DIR}/signing.webp`,
    width: 1600,
    height: 1000,
    alt: "The signer's page, opened from an emailed link: the dummy consent with a drawn signature, the date and initials filled in.",
    title: "The signer's page",
    proves: "Opened from a single-use emailed link: the signer draws a signature and completes the fields, without an account.",
    frame: "browser",
  },
  completed: {
    src: `${DIR}/envelope-completed.webp`,
    width: 1600,
    height: 1000,
    alt: "A completed dummy envelope: its document type and auto-purge date, the original with its SHA-256 and document ID, the three recipients in signing order, the sealed final document above the signer copies, and the audit trail of events.",
    title: "Completed, with its record",
    proves: "A completed envelope: retention set by its document type, the original's SHA-256, the sealed final document, and each event with its time.",
    frame: "browser",
  },
  auditTrail: {
    src: `${DIR}/audit-trail.webp`,
    width: 1600,
    height: 1000,
    alt: "The signed documents of a dummy envelope, the sealed final document first, beside the audit trail of every event in order, from the invitations to Final Document Sealed, each with its time and IP address.",
    title: "Signed documents and the trail",
    proves: "The final document, holding every signature and the audit certificate, beside every event in order with its time and IP address.",
    frame: "browser",
  },
  compliance: {
    src: `${DIR}/compliance.webp`,
    width: 1600,
    height: 1000,
    alt: "The compliance page on dummy data: five envelopes under a retention policy, each with its document type, purge date and days remaining, and every audit chain verified intact with its first and last event. A subtitle naming compliance frameworks is covered.",
    title: "Retention, and every chain verified",
    proves: "Each envelope's retention follows its document type, and its hash-chained audit log verifies intact, entry by entry.",
    frame: "browser",
  },
  integrityCheck: {
    src: `${DIR}/integrity-check.webp`,
    width: 1600,
    height: 1000,
    alt: "The integrity check of a stored dummy document: File Integrity Valid, the stored and current SHA-256 equal, decrypted with AES-256-GCM, encrypted at rest. A subtitle naming a compliance framework is covered.",
    title: "A stored file, checked",
    proves: "The stored file is decrypted and its SHA-256 compared with the hash recorded at upload: a changed or cut file reads as tampered.",
    frame: "browser",
  },
  signedDocument: {
    src: `${DIR}/signed-document.webp`,
    width: 1600,
    height: 1000,
    alt: "The final PDF as downloaded: the dummy consent with both signatures, each captioned with its signer, time and envelope, the date, initials and printed name; and an Audit Trail Certificate page with every recipient's viewed and signed times, IP address and user agent, the event log with entry hashes, and the chain head.",
    title: "The sealed final document",
    proves: "One PDF with every signature, sealed at completion with a PAdES signature and an RFC 3161 timestamp, with an audit-trail certificate page for every recipient.",
    frame: "page",
  },
  security: {
    src: `${DIR}/security-mfa.webp`,
    width: 1600,
    height: 1000,
    alt: "Security settings for a dummy user: setting up two-step sign-in with an authenticator app; the QR code and the key are covered.",
    title: "Two-step sign-in",
    proves: "TOTP two-step sign-in with backup codes, set up from the user's security settings.",
    frame: "browser",
  },
} satisfies Record<string, Screenshot>;

export const signflow: Flagship = {
  slug: "signflow",
  name: "SignFlow",
  headline: "E-signatures that carry their own proof",
  summary:
    "An in-house e-signature platform: documents go out through single-use links in signing order and come back as one PAdES-sealed, timestamped PDF.",
  definition: "Envelopes, single-use signing links in signing order, and PAdES-sealed, timestamped PDFs.",
  domain: "E-signatures for healthcare and business paperwork",
  updated: "2026-11-18",
  credit: {
    role: "I lead Sevina's AI team and led SignFlow's design and build.",
  },
  figures: [
    { value: USAGE.signflow.figure, label: USAGE.signflow.label, source: "approved-usage" },
    { value: "40", label: "backend tests on PostgreSQL", source: "verification" },
    { value: "51", label: "frontend tests in 9 files", source: "verification" },
  ],
  problem: {
    body: [
      "Consent forms, agreements and policy acknowledgements need signatures from several people, often in a set order, and some of them carry patient details. A hosted signing service would hold those documents outside the company's own storage and records.",
      "SignFlow keeps them in: a sender builds an envelope and sets the signing order, each signer gets a link that works once, and when the last one signs, one PDF holds every signature, sealed with the platform's certificate so any PDF reader can check it, with the record of who signed and when appended.",
    ],
    users: [
      "Staff who send documents for signature and track them",
      "Signers, inside or outside the company, who sign from an emailed link without an account",
      "Administrators who look after accounts, sign-in, retention and the record of each envelope",
    ],
  },
  constraints: [
    {
      constraint: "A signature must be checkable without SignFlow",
      forced: "Each sealed PDF carries a PAdES signature from the platform's PKI certificate, which locks it against later changes, and an RFC 3161 timestamp (PAdES B-T) where a timestamp authority is set up.",
      checked: "pyHanko validated every sealed PDF of two local runs as PAdES B-T: intact, with a valid timestamp.",
    },
    {
      constraint: "Signers must sign in the order set",
      forced: "Each recipient has a signing order. Only the lowest order still pending is emailed, the next is released when it signs, and signing out of turn is refused.",
      checked: "On both local runs the second signer's email arrived only after the first had signed; tests cover the order, parallel signers and the refusal.",
    },
    {
      constraint: "The record must travel with the document",
      forced: "When the last signer finishes, one final PDF holds every signature, and its audit-trail certificate page lists each recipient's times, IP address and user agent, the event log with entry hashes, and the chain head.",
      checked: "In the final document of both local runs; a test proves no final document exists before the last signature.",
    },
    {
      constraint: "The log must show any change",
      forced: "Each audit entry carries the SHA-256 of the entry before it. Writers to one envelope queue on a lock, and the chain is read in sequence order, never by timestamp.",
      checked: "Every chain of both runs verified intact; tests pinpoint an edited payload, an edited hash and a deleted entry.",
    },
    {
      constraint: "Patient details must be unreadable at rest",
      forced: "Subjects, messages and recipient names and emails are encrypted with AES-256-GCM in the data layer; each document under its own data key.",
      checked: "The encrypted column types sit in the models, so no query path writes plaintext; the integrity check decrypts a stored file and matches it to its upload hash.",
    },
    {
      constraint: "Documents must be kept as long as their type requires",
      forced: "An envelope's document type sets its retention: consent forms 6 years, financial records 7, general documents 3. The policy is applied on upload, at send and when the type changes.",
      checked: "Tests for each of those moments and for an unknown type; every envelope of the runs is listed with its purge date.",
    },
    {
      constraint: "A signing link must not be reusable",
      forced: "Every link carries a single-use token, recorded by its ID, with an expiry.",
      checked: "A used, revoked or expired token is refused; reopening a used link returned 401, and a test holds it.",
    },
    {
      constraint: "An account needs more than a password",
      forced: "Argon2 password hashes, an emailed code at sign-up, TOTP two-step sign-in with backup codes, and refresh tokens stored only as hashes.",
      checked: "A copy of the database holds no usable password, code or session.",
    },
  ],
  constraintsNote: "No compliance certification is claimed.",
  built: [
    {
      title: "API",
      icon: "api",
      items: [
        "FastAPI with async SQLAlchemy on PostgreSQL and Alembic migrations: envelopes, documents, recipients, fields, sending, signing, templates, tasks and compliance, in over 50 operations across 12 route modules.",
        "PDF sealing with pyHanko: the completed fields rendered into the PDF with PyMuPDF, then a PAdES signature (B-T with an RFC 3161 timestamp, B-B without) with the available validation data embedded. When the last signer finishes, one final document holds every signature.",
        "Signing order end to end: only the lowest pending order is emailed, the next is released on signing, and signing out of turn is refused.",
        "A hash-chained audit log of every step, written in strict order per envelope (a sequence number and a per-envelope lock), with the signer's IP address; the final document appends an audit-trail certificate page.",
        "Retention by document type, set on upload, at send and on a change of type, and an integrity check that decrypts a stored file and compares it with its upload hash.",
        "Field-level AES-256-GCM encryption through SQLAlchemy types, searchable by exact match for names and emails; documents encrypted under per-document data keys.",
        "Argon2 passwords, RS256 JWT sessions with revocable refresh tokens, emailed one-time codes at sign-up, TOTP two-step sign-in, and rate limits on signing, downloads and sending.",
        "A pytest suite on a real PostgreSQL test database: 40 tests.",
      ],
    },
    {
      title: "Web app",
      icon: "portal",
      items: [
        "React, TypeScript and Vite: an envelope wizard for documents, recipients in signing order, and fields dragged onto the page.",
        "The signer's page, opened from the emailed link, with fields to complete and a drawn signature.",
        "Envelope detail with the original's SHA-256 and document ID, the sealed final document, the signer copies and the audit trail.",
        "A compliance page with each envelope's retention and purge date, audit-chain verification and the integrity check; tasks, and security settings for two-step sign-in.",
      ],
    },
  ],
  sketch: {
    title: "An envelope through SignFlow",
    zones: [
      { label: "Sender", nodes: ["Envelope wizard: documents, signing order, fields", "Envelope detail: final document, audit trail"] },
      {
        label: "SignFlow API",
        nodes: [
          "Envelopes, recipients in signing order, fields",
          "Single-use signer tokens, released by order",
          "PDF sealing · pyHanko, PAdES and timestamp",
          "Audit log · hash-chained, with time and IP address",
          "PostgreSQL · encrypted fields; documents encrypted, Amazon S3 in production",
        ],
      },
      { label: "Signer", nodes: ["Emailed link", "Signing page"] },
    ],
    crossings: [
      { label: "HTTPS · JWT session, rate limits", direction: "forward" },
      { label: "Email · a single-use link per signer, in order", direction: "forward" },
    ],
    notes: ["The timestamp comes from an RFC 3161 timestamp authority where one is configured (PAdES B-T); without one the seal is PAdES B-B."],
  },
  moreSketches: [],
  // One envelope, step by step over the sketch above.
  trace: [
    {
      title: "The sender builds an envelope",
      body: "PDFs are uploaded, each hashed with SHA-256 and stored encrypted, and the document type sets the retention. The sender adds signers in signing order and copy recipients, and places fields on the pages.",
      focus: { zone: 0, node: 0 },
    },
    {
      title: "Sending releases the first signers",
      body: "Only the lowest signing order still pending gets a link: a single-use token with an expiry, sent by email. Copy recipients are notified.",
      focus: { zone: 1, node: 1, crossing: 1 },
    },
    {
      title: "The signer opens the link and signs",
      body: "The token is checked first: a used, revoked or expired link is refused, and so is a signer out of turn. The signer completes the fields and draws a signature, without an account.",
      focus: { zone: 2, node: 1 },
    },
    {
      title: "Every step joins the chain",
      body: "Each event is logged with its time and IP address and carries the SHA-256 of the entry before it; writers to one envelope queue on a lock, so the chain stays one line.",
      focus: { zone: 1, node: 3 },
    },
    {
      title: "The last signature seals the document",
      body: "Each signature releases the next signing order. When the last signer finishes, every signature and the audit certificate go into one PDF, sealed with a PAdES signature and timestamped; if sealing fails, the envelope does not complete.",
      focus: { zone: 1, node: 2 },
    },
    {
      title: "The envelope completes",
      body: "The sender downloads the sealed final document, and the compliance page shows its retention and an intact chain.",
      focus: { zone: 0, node: 1 },
    },
  ],
  boundary: [
    { data: "Uploaded PDFs", direction: "enters", path: "Sender → API", rule: "Hashed with SHA-256, then encrypted under their own data key." },
    { data: "Signing links", direction: "leaves", path: "API → signer's email", rule: "One per signer, single use, with an expiry, sent in signing order." },
    { data: "Recipient names and emails", direction: "stays", path: "Database only", rule: "Encrypted at rest; matched by exact value." },
    { data: "Sealed PDFs", direction: "leaves", path: "API → sender and signers", rule: "PAdES-signed and timestamped; downloads rate-limited." },
    { data: "Audit entries", direction: "stays", path: "Database only", rule: "Hash-chained, with time and IP address; summarised in the final document." },
  ],
  deployment: [
    {
      title: "Web app: built and deployed by Jenkins",
      body: "A Jenkins pipeline installs, builds and checks the bundle, then deploys it to IIS in one switch: the previous release is archived for rollback, and a smoke test runs after the switch.",
    },
    {
      title: "API behind IIS",
      body: "IIS serves the web app and forwards the API and health routes to the FastAPI service, which runs four workers in production, with security headers and a content security policy.",
    },
    {
      title: "Documents on AWS",
      body: "SignFlow runs on AWS, and in production its documents are kept in Amazon S3, encrypted before they are written.",
    },
  ],
  incidents: [],
  decisions: [
    {
      choice: "A PAdES signature that seals the PDF",
      instead: "An image of a signature on the page",
      reason: "Any PDF reader can then check that the document is intact and when it was signed.",
      tradeoff: "A certificate to buy, protect and renew, and timestamp and revocation calls that add seconds to sealing.",
    },
    {
      choice: "One final document, sealed when the last signer finishes",
      instead: "A separately signed copy for each signer, and nothing more",
      reason: "One file holds every signature and the whole record, so nobody has to collect copies.",
      tradeoff: "Sealing runs inside the last signer's request, so they wait a few seconds for it.",
    },
    {
      choice: "Read the audit chain by sequence, one writer per envelope",
      instead: "Ordering entries by their timestamps",
      reason: "Entries written in the same second keep their order, and two requests can never both extend the same entry.",
      tradeoff: "Writers to one envelope's log wait for each other.",
    },
    {
      choice: "Encrypt each document under its own data key",
      instead: "One key for every file",
      reason: "A leaked data key opens one document, and the master key never touches file contents.",
      tradeoff: "A key to unwrap on every read.",
    },
    {
      choice: "Deterministic encryption for recipient names and emails",
      instead: "Plaintext columns, or random encryption that cannot be searched",
      reason: "Finding a recipient by exact email still works while the stored value is ciphertext.",
      tradeoff: "Equal values encrypt alike, so the column shows which rows match each other.",
    },
    {
      choice: "Fail the request when sealing fails",
      instead: "Marking the copy signed and logging the error",
      reason: "A copy marked signed without its signature is worse than no signature.",
      tradeoff: "If the certificate cannot be loaded, nobody can sign until it is fixed.",
    },
    {
      choice: "Single-use links for signers",
      instead: "An account for every signer",
      reason: "People outside the company sign straight from the email.",
      tradeoff: "Whoever holds an unused link can sign until it expires.",
    },
  ],
  verification: {
    suites: [
      {
        value: "40",
        label: "backend tests on a real PostgreSQL database",
        method: "pytest, 18 Nov 2026, written test-first: the audit chain, the integrity check, signing order, retention, the timestamp pre-flight, PAdES levels, the final document and the single-use link.",
      },
      {
        value: "All 6",
        label: "sealed PDFs of two runs validated with pyHanko",
        method: "Two local runs on dummy data, 18 Nov 2026: each PAdES B-T, intact and locked against changes, with a valid RFC 3161 timestamp; signed with a self-signed demo certificate, so trusted only with that certificate as the anchor.",
      },
      {
        value: "51",
        label: "frontend tests in 9 Vitest files",
        method: "Run on 18 Nov 2026: unit tests for the layout, sign-in pieces, envelope wizard and field state.",
      },
    ],
    checks: [
      "A reused signing link is refused (401 on the local runs)",
      "A signer's email sent only after the signers before them have signed",
      "Every envelope's audit chain verified intact",
      "A stored file decrypted and matched to its upload hash",
      "No envelope completes when its seal fails",
      "Rate limits on signature submits, document downloads and sending",
    ],
    notMeasured: [
      "Load, latency or uptime",
      "Long-term validation (PAdES B-LT): the demo certificate has no revocation data",
      "The retention purge job, Amazon S3 and real email delivery: the runs were local",
      "A compliance audit or certification",
    ],
  },
  outcome: {
    proves: [
      `An e-signature platform built in-house and used by ${USAGE.signflow.sentence} at Sevina.`,
      "Signatures collected in order and sealed into one PAdES-signed, timestamped PDF, validated on local runs.",
      "Patient details encrypted at rest, and every event hash-chained and verifiable.",
    ],
    notShown: [
      "Production addresses or customer documents",
      "Volumes, uptime or time saved",
      "A legal or compliance certification",
    ],
  },
  highlights: [
    {
      id: "pki-signature",
      title: "A signature a PDF reader can check",
      body: "Each sealed PDF carries a PAdES signature from the platform's certificate and an RFC 3161 timestamp (PAdES B-T), validated with pyHanko on every sealed file of two runs.",
      art: { kind: "terminal", running: "sealing the final PDF…", done: "PAdES B-T · timestamp valid" },
      wide: true,
    },
    {
      id: "signing-order",
      title: "Signers, in order",
      body: "Only the lowest pending order is emailed. Each signature releases the next, and signing out of turn is refused.",
      art: { kind: "timeline", items: ["Signer 1 emailed", "Signer 1 signs", "Signer 2 emailed"] },
    },
    {
      id: "final-document",
      title: "One PDF with every signature",
      body: "When the last signer finishes, every signature and the audit certificate go into one file, sealed once.",
      art: { kind: "badge", title: "Final document", lines: ["every signature", "audit certificate page", "sealed at completion"] },
    },
    {
      id: "audit-chain",
      title: "A log that shows any change",
      body: "Each entry carries the SHA-256 of the one before. Writers queue per envelope, and verification points to the exact entry that changed.",
      art: { kind: "flow", nodes: ["Previous entry", "SHA-256", "New entry"], hot: 1 },
      wide: true,
    },
    {
      id: "single-use-links",
      title: "Links that work once",
      body: "Each signer's link holds a token recorded by its ID. Used, revoked or expired, it is refused.",
      art: { kind: "badge", title: "Signer link", lines: ["single use", "expires", "revocable"] },
    },
    {
      id: "integrity-check",
      title: "Stored files, checked",
      body: "A stored file is decrypted and its SHA-256 compared with the hash recorded at upload: a changed or cut file reads as tampered.",
      art: { kind: "terminal", running: "decrypting the stored file…", done: "SHA-256 matches the upload" },
    },
    {
      id: "document-keys",
      title: "Each document, its own key",
      body: "Every file is encrypted with AES-256-GCM under its own data key, which a master key wraps.",
      art: { kind: "flow", nodes: ["Data key", "AES-256-GCM", "Master key"], hot: 1 },
    },
    {
      id: "fail-closed",
      title: "No seal, no completion",
      body: "If the certificate cannot be loaded or validated, or the seal fails, the envelope does not complete, and nothing is marked signed.",
      art: { kind: "checks", items: ["Certificate", "Chain", "Seal"] },
    },
    {
      id: "searchable-encryption",
      title: "Encrypted, and still searchable",
      body: "Names and emails are encrypted with AES-256-GCM using a nonce derived from the value itself, so an exact-match lookup still finds them.",
      art: { kind: "terminal", running: "WHERE email = encrypt_searchable(…)", done: "one match · ciphertext at rest" },
      wide: true,
    },
    {
      id: "audit-certificate",
      title: "The record travels with the PDF",
      body: "The final document's audit-trail certificate page lists every recipient's times, IP address and user agent, the event log with entry hashes, and the chain head.",
      art: { kind: "badge", title: "Audit trail certificate", lines: ["every recipient", "event log, hashed", "chain head"] },
    },
    {
      id: "retention",
      title: "Kept as long as its type requires",
      body: "The document type sets each envelope's retention and purge date, applied on upload, at send and on any change of type.",
      art: {
        kind: "bars",
        items: [
          { label: "Financial", value: 100 },
          { label: "Consent", value: 86 },
          { label: "General", value: 43 },
        ],
        note: "Kept 7, 6 and 3 years",
      },
    },
    {
      id: "rate-limits",
      title: "Limits at the door",
      body: "Signature submits, downloads and sends are rate-limited, and staff accounts add TOTP two-step sign-in.",
      art: { kind: "badge", title: "Rate limits", lines: ["20 per minute to sign", "60 per minute to download", "10 per hour to send"] },
    },
  ],
  excerpts: [
    {
      id: "pki-signing",
      title: "Seal the PDF with a PAdES signature",
      story:
        "A drawn signature on a page proves nothing on its own, so each sealed copy carries a PAdES signature from the platform's certificate once the certificate checks out: B-T with an RFC 3161 timestamp, B-B without. The timestamp authority is used only after a pre-flight request succeeds, and where a timestamp is required, nothing is signed without one.",
      file: "backend/services/pki.py",
      lang: "python",
      code: `def apply_pki_signature(input_pdf_path: str, output_pdf_path: str, field_name: str = "DocSignature") -> str:
    """Apply a PAdES baseline signature to a PDF using pyhanko.

    SubFilter ETSI.CAdES.detached with CAdES signed attributes (ESS signing-certificate-v2, no
    CMS signing-time), i.e. PAdES B-B; with a TSA the signature timestamp makes it B-T. The
    validation data that exists (certificates, revocation info that can be fetched) is embedded in
    a DSS; a self-signed signer has no revocation data, so that alone does not make it B-LT.
    """
    # (logging omitted)
    if not settings.PKI_PFX_PATH or not settings.PKI_PFX_PASSWORD:
        raise ValueError("PKI is not configured (PKI_PFX_PATH or PKI_PFX_PASSWORD missing)")

    _validate_pki_http_config()
    validate_certificate_chain(settings.PKI_PFX_PATH, settings.PKI_PFX_PASSWORD)

    with open(input_pdf_path, "rb") as inf:
        w = IncrementalPdfFileWriter(inf)
        signer = signers.SimpleSigner.load_pkcs12(
            settings.PKI_PFX_PATH,
            passphrase=settings.PKI_PFX_PASSWORD.encode(),
        )

        # Timestamper: use the TSA only after a pre-flight request succeeded. When it fails,
        # get_tsa_timestamp raises if PKI_TSA_REQUIRED (signing fails closed); otherwise the
        # document is signed without a timestamp rather than failing in the middle of signing.
        timestamper = None
        if settings.PKI_TSA_URL:
            if get_tsa_timestamp(b"tsa-preflight") is not None:
                timestamper = ts_module.HTTPTimeStamper(settings.PKI_TSA_URL)
        elif settings.PKI_TSA_REQUIRED:
            raise ValueError("TSA URL not configured while PKI_TSA_REQUIRED=true")

        extra_roots = _load_extra_trust_roots()
        try:
            validation_context = ValidationContext(allow_fetching=True, extra_trust_roots=extra_roots)
        except Exception:
            validation_context = None

        meta = PdfSignatureMetadata(
            field_name=field_name,
            subfilter=SigSeedSubFilter.PADES,  # ETSI.CAdES.detached; pyHanko's default is adbe.pkcs7.detached
            certify=True,
            docmdp_permissions=MDPPerm.FILL_FORMS,
            validation_context=validation_context,
            embed_validation_info=True,  # DSS with the validation data that is available
        )
        with open(output_pdf_path, "wb") as outf:
            if timestamper:
                signers.sign_pdf(w, signature_meta=meta, signer=signer, timestamper=timestamper, output=outf)
            else:
                signers.sign_pdf(w, signature_meta=meta, signer=signer, output=outf)

    return output_pdf_path`,
    },
    {
      id: "audit-chain",
      title: "Append to the audit chain, one writer at a time",
      story:
        "Each event of an envelope carries the SHA-256 of the entry before it, so an edited or deleted entry breaks the chain at that point. The chain must stay one line: two requests may never both extend the same entry, and entries written in the same second must keep their order. So writers queue on a per-envelope advisory lock, and the chain is read by a sequence number, never by its timestamps.",
      file: "backend/services/audit.py",
      lang: "python",
      code: `async def write_audit(
    db: AsyncSession,
    envelope_id,
    event_type: str,
    payload: dict | None = None,
    auto_commit: bool = True,
    # (the recipient, IP address, user agent, actor, session and location are omitted)
) -> AuditLog:
    event_payload_str = json.dumps(payload, separators=(",", ":"), ensure_ascii=False) if payload else None

    # Serialize chain writers per envelope. The transaction-scoped advisory lock is held until the
    # caller commits or rolls back, so two requests can never read the same "last entry" and fork
    # the chain.
    await db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": _chain_lock_key(envelope_id)})

    # Fetch the last audit entry for this envelope (by seq, not created_at: timestamps are whole
    # seconds, so several entries can share one) to get prev_hash (hash chain)
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.envelope_id == envelope_id)
        .order_by(AuditLog.seq.desc())
        .limit(1)
    )
    last_entry = result.scalar_one_or_none()
    prev_hash = last_entry.entry_hash if last_entry and last_entry.entry_hash else "GENESIS"

    now_truncated = utc_now().replace(microsecond=0)
    entry_hash = _compute_entry_hash(
        prev_hash=prev_hash,
        event_type=event_type,
        event_payload=event_payload_str,
        created_at_iso=now_truncated.isoformat(),
        envelope_id=str(envelope_id),
    )

    row = AuditLog(
        envelope_id=envelope_id,
        event_type=event_type,
        event_payload=event_payload_str,
        created_at=now_truncated,
        prev_hash=prev_hash,
        entry_hash=entry_hash,
    )
    db.add(row)
    # (the commit, or a flush inside the caller's transaction, is omitted)
    return row`,
    },
    {
      id: "document-keys",
      title: "Each document under its own key",
      story:
        "A single key for every stored document would make one leak a leak of everything, so each file gets a fresh AES-256-GCM data key. Only the wrapped form of that key is kept, in front of the ciphertext, and the master key never touches file contents.",
      file: "backend/utils/encryption.py",
      lang: "python",
      code: `def encrypt_file(plaintext_path: str, encrypted_path: str) -> str:
    """Encrypt a file with AES-256-GCM using a Local Master Key managed data key.

    Returns:
        Base64-encoded encrypted data key blob (store in DB).
    """
    # (the development mode without a master key is omitted)
    from app.utils.kms import generate_data_key

    plaintext_key, encrypted_key_blob = generate_data_key()
    nonce = os.urandom(12)

    with open(plaintext_path, "rb") as f:
        plaintext_data = f.read()

    aesgcm = AESGCM(plaintext_key)
    ciphertext = aesgcm.encrypt(nonce, plaintext_data, None)

    key_blob_len = struct.pack(">I", len(encrypted_key_blob))
    with open(encrypted_path, "wb") as f:
        f.write(key_blob_len)
        f.write(encrypted_key_blob)
        f.write(nonce)
        f.write(ciphertext)

    return base64.b64encode(encrypted_key_blob).decode()`,
    },
    {
      id: "searchable-encryption",
      title: "Encrypt an email and still find it",
      story:
        "Recipient emails are patient-adjacent data, yet the platform must look a recipient up by email. A nonce derived from the value with HMAC makes the same email always encrypt the same way, so an exact-match query works on ciphertext.",
      file: "backend/utils/field_crypto.py",
      lang: "python",
      code: `def encrypt_searchable(value: str) -> str:
    """Deterministic encryption — same plaintext always yields same ciphertext.

    Uses HMAC-SHA256 of the value as a deterministic nonce (AES-SIV approximation).
    Appropriate for email addresses used in WHERE clauses.
    """
    if not value:
        return value
    key = _get_master_key()
    # Deterministic nonce: HMAC(key, value.lower().strip())[:12]
    normalized = (value or "").strip().lower()
    det_nonce = hmac.new(key, normalized.encode(), hashlib.sha256).digest()[:12]
    aesgcm = AESGCM(key)
    ct = aesgcm.encrypt(det_nonce, value.strip().lower().encode(), None)
    return base64.b64encode(det_nonce + ct).decode()


class SearchableEncryptedString(TypeDecorator):
    """Deterministic encrypted string — supports exact-match WHERE lookups."""
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return None if value is None else encrypt_searchable(str(value))

    def process_result_value(self, value, dialect):
        return None if value is None else decrypt_field(value)`,
    },
    {
      id: "single-use-link",
      title: "A signing link that works once",
      story:
        "Signers have no account, so the emailed link is their only credential and must not outlive its purpose. The token's ID is looked up on every request, and a used, revoked or expired token is refused before anything is shown.",
      file: "backend/services/sign.py",
      lang: "python",
      code: `async def verify_signer_token(db: AsyncSession, token: str) -> dict:
    try:
        payload = decode_signer_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    jti = payload.get("jti")
    envelope_id = payload.get("envelope_id")
    recipient_id = payload.get("recipient_id")
    if not jti or not envelope_id or not recipient_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    result = await db.execute(
        select(SignerToken).where(SignerToken.token_jti == str(jti), SignerToken.revoked.is_(False))
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked or not found")
    if row.used_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token already used")
    if row.expires_at <= _utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    return payload`,
    },
  ],
  hero: {
    primary: SHOTS.dashboard,
    secondary: SHOTS.signing,
    caption: "The sender's dashboard and the signer's page, both on dummy data.",
  },
  gallery: [
    {
      id: "sender",
      label: "Sender",
      shots: [
        SHOTS.dashboard,
        SHOTS.wizardUpload,
        SHOTS.wizardRecipients,
        SHOTS.fieldPlacement,
        SHOTS.completed,
        SHOTS.auditTrail,
        SHOTS.compliance,
        SHOTS.integrityCheck,
      ],
    },
    {
      id: "signer",
      label: "Signer and account",
      shots: [SHOTS.signing, SHOTS.signedDocument, SHOTS.security],
    },
  ],
  recordings: [
    {
      id: "signflow-demo",
      label: "Web app",
      title: "An envelope, signed in order and sealed, on dummy data",
      src: `${DIR}/signflow-demo.webm`,
      poster: `${DIR}/signflow-demo.webp`,
      captions: `${DIR}/signflow-demo.vtt`,
      width: 1440,
      height: 900,
      duration: 55.8,
      frame: "browser",
      alt: "Screen recording of SignFlow on dummy data: an envelope sent in signing order, signed by two signers from their emailed links, and completed with one sealed final document.",
      summary: "Create an envelope with a signing order, send it, see the second signer's email arrive only after the first has signed, and download the sealed final document.",
      scenes: [
        { start: 0, end: 4.41, text: "Signed in as the sender, on a local test stack with invented data." },
        { start: 4.41, end: 13.54, text: "New envelope: subject, document type Consent (it sets the retention policy), the PDF. Signing order: Riley first, Casey second; Morgan gets a copy (CC)." },
        { start: 13.54, end: 17.88, text: "Fields per signer: signature and date for Riley, signature for Casey." },
        { start: 17.88, end: 20.2, text: "Review, preview the emails, send." },
        { start: 20.2, end: 24.73, text: "The local test mailbox: Riley and Morgan have their emails, Casey none yet." },
        { start: 24.73, end: 28.41, text: "Riley opens the emailed link, signs and adds the date." },
        { start: 28.41, end: 33.83, text: "On submit the server renders Riley's copy and seals it: PAdES signature, RFC 3161 timestamp." },
        { start: 33.83, end: 38.74, text: "Casey's email arrives only now, after Riley's signature." },
        { start: 38.74, end: 42.21, text: "Casey signs from a separate link." },
        { start: 42.21, end: 48.85, text: "Last signature in: one final PDF with every signature and an audit certificate, sealed and timestamped." },
        { start: 48.85, end: 53.18, text: "Back as the sender: the envelope is Completed." },
        { start: 53.18, end: 55.8, text: "The sealed final document is ready to download." },
      ],
    },
  ],
  stack: {
    groups: [
      {
        label: "API",
        items: ["Python", "FastAPI", "SQLAlchemy (async)", "PostgreSQL", "Alembic", "Pydantic", "pyHanko", "PyMuPDF", "Argon2", "PyOTP", "SlowAPI", "pytest"],
      },
      {
        label: "Web app",
        items: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "TanStack Query", "react-pdf", "Vitest"],
      },
      { label: "Delivery", items: ["Jenkins", "IIS"] },
    ],
    aws: [AWS.s3],
  },
  card: {
    body: "Sends documents out through single-use signing links in signing order and returns one PDF, sealed with a PAdES signature and timestamped.",
    tech: "FastAPI · PostgreSQL · pyHanko · React · AWS: S3",
  },
};
