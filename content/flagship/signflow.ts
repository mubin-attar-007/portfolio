import { AWS, USAGE } from "./shared";
import type { Flagship, Screenshot } from "./types";

/**
 * SignFlow — Sevina Technologies' in-house e-signature platform: envelopes,
 * single-use signing links, and signed copies sealed with a PKI
 * certificate and timestamped. Published with the company's permission
 * (owner, 18 Nov 2026). Sources: the code and notes of the private repository,
 * read on 18 Nov 2026, and a local run of it on dummy data
 * (.local/showcase/media/signflow/capture-manifest.md), which is where every
 * capture and every "verified" below comes from.
 *
 * Claims discipline: only what the product does as it runs. The local run
 * showed some of the code's own aims not holding yet (the signature is a
 * certification signature, not PAdES; the audit-chain and integrity checks
 * report false failures; the wizard cannot set a signing order), so none of
 * those is claimed. No compliance certification; the backend has no automated
 * tests yet and the page says so; no incident is told, because none is on
 * record.
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
    alt: "Step 3 of the wizard: two dummy signers and one copy recipient added, each with a role.",
    title: "Signers and copies",
    proves: "Recipients added with a role each: people who sign, and people who only receive a copy.",
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
    alt: "A completed dummy envelope: its ID, the original document with its SHA-256, the recipients, and the audit trail of events.",
    title: "Completed, with its record",
    proves: "A completed envelope: the original's SHA-256, every recipient, and each event of the envelope with its time.",
    frame: "browser",
  },
  auditTrail: {
    src: `${DIR}/audit-trail.webp`,
    width: 1600,
    height: 1000,
    alt: "The signed copies of a dummy envelope with their hashes and download links, beside the audit trail of every event with its time and IP address.",
    title: "Signed copies and the trail",
    proves: "Each signed copy ready to download, beside every event in order (opened, signed, completed) with its time and IP address.",
    frame: "browser",
  },
  signedDocument: {
    src: `${DIR}/signed-document.webp`,
    width: 1600,
    height: 1000,
    alt: "A downloaded signed copy: the dummy consent with its drawn signature, and an appended Audit Trail Certificate page with the envelope ID, signer, times, IP address and the original's SHA-256.",
    title: "The signed PDF",
    proves: "A signed copy as downloaded: signed with the PKI certificate, locked against later edits and timestamped, with an audit-trail certificate page appended.",
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
    "An in-house e-signature platform: documents sent through single-use links and returned as PDFs signed with a PKI certificate and timestamped.",
  definition: "Envelopes, single-use signing links, and PKI-signed, timestamped PDFs.",
  domain: "E-signatures for healthcare and business paperwork",
  updated: "2026-11-18",
  credit: {
    role: "I lead Sevina's AI team and led SignFlow's design and build.",
  },
  figures: [
    { value: USAGE.signflow.figure, label: USAGE.signflow.label, source: "approved-usage" },
    { value: "All 4", label: "signed copies validated with pyHanko", source: "verification" },
    { value: "51", label: "frontend tests in 9 files", source: "verification" },
  ],
  problem: {
    body: [
      "Consent forms, agreements and policy acknowledgements need signatures from several people, and some of them carry patient details. A hosted signing service would hold those documents outside the company's own storage and records.",
      "SignFlow keeps them in: a sender builds an envelope, each signer gets a link that works once, and every signed copy is a PDF signed with the platform's certificate, which any PDF reader can check, with a record of who signed and when appended to it.",
    ],
    users: [
      "Staff who send documents for signature and track them",
      "Signers, inside or outside the company, who sign from an emailed link without an account",
      "Administrators who look after accounts, sign-in and the record of each envelope",
    ],
  },
  constraints: [
    {
      constraint: "A signature must be checkable without SignFlow",
      forced: "Each signed copy is signed with the platform's PKI certificate, locked against later edits, and stamped by an RFC 3161 timestamp authority where one is set up.",
      checked: "The certificate is validated before signing, and a failed signature fails the request: no copy is marked signed without one.",
    },
    {
      constraint: "The record must travel with the document",
      forced: "Each signed copy gets an audit-trail certificate page: the envelope ID, the signer, the times, the IP address and the original's SHA-256.",
      checked: "Present on every signed copy of the local run.",
    },
    {
      constraint: "Patient details must be unreadable at rest",
      forced: "Subjects, messages and recipient names and emails are encrypted with AES-256-GCM in the data layer; each document under its own data key.",
      checked: "The encrypted column types sit in the models, so no query path writes plaintext.",
    },
    {
      constraint: "A signing link must not be reusable",
      forced: "Every link carries a single-use token, recorded by its ID, with an expiry.",
      checked: "A used, revoked or expired token is refused; reopening a used link on the local run returned 401.",
    },
    {
      constraint: "An account needs more than a password",
      forced: "Argon2 password hashes, an emailed code at sign-up, TOTP two-step sign-in with backup codes, and refresh tokens stored only as hashes.",
      checked: "A copy of the database holds no usable password, code or session.",
    },
    {
      constraint: "Abuse must be limited at the door",
      forced: "Rate limits on signature submits (20 a minute), document downloads (60 a minute) and sending (10 an hour).",
      checked: "Enforced by the API on each of those routes.",
    },
  ],
  constraintsNote: "No compliance certification is claimed.",
  built: [
    {
      title: "API",
      icon: "api",
      items: [
        "FastAPI with async SQLAlchemy 2 on PostgreSQL and Alembic migrations: envelopes, documents, recipients, fields, sending, signing, templates and tasks, in 52 operations across 12 route modules.",
        "PDF signing with pyHanko: the completed fields rendered into the PDF with PyMuPDF, then a PKI signature that locks it against later edits, with an RFC 3161 timestamp where a timestamp authority is configured.",
        "An audit log of every step, with the signer's IP address and approximate location, and an audit-trail certificate page appended to every signed copy.",
        "Field-level AES-256-GCM encryption through SQLAlchemy types, searchable by exact match for names and emails; documents encrypted under per-document data keys.",
        "Argon2 passwords, RS256 JWT sessions with revocable refresh tokens, emailed one-time codes at sign-up, TOTP two-step sign-in, and rate limits on signing, downloads and sending.",
        "Email templates for every notice, and a user-data deletion script.",
      ],
    },
    {
      title: "Web app",
      icon: "portal",
      items: [
        "React, TypeScript and Vite: an envelope wizard for documents, recipients and fields dragged onto the page.",
        "The signer's page, opened from the emailed link, with fields to complete and a drawn signature.",
        "Envelope detail with the original's SHA-256, the signed copies and the audit trail.",
        "Tasks, and security settings for two-step sign-in.",
      ],
    },
  ],
  sketch: {
    title: "An envelope through SignFlow",
    zones: [
      { label: "Sender", nodes: ["Envelope wizard: documents, recipients, fields", "Envelope detail: signed copies, audit trail"] },
      {
        label: "SignFlow API",
        nodes: [
          "Envelopes, recipients and fields",
          "Single-use signer tokens",
          "PDF signing · pyHanko, certificate and timestamp",
          "Audit log · time, IP address, location",
          "PostgreSQL · encrypted fields; documents encrypted, Amazon S3 in production",
        ],
      },
      { label: "Signer", nodes: ["Emailed link", "Signing page"] },
    ],
    crossings: [
      { label: "HTTPS · JWT session, rate limits", direction: "forward" },
      { label: "Email · one single-use link per signer", direction: "forward" },
    ],
    notes: ["The timestamp comes from an RFC 3161 timestamp authority where one is configured."],
  },
  moreSketches: [],
  // One envelope, step by step over the sketch above.
  trace: [
    {
      title: "The sender builds an envelope",
      body: "PDFs are uploaded, each hashed with SHA-256 and stored encrypted. The sender adds signers and copy recipients and places signature, date and text fields on the pages.",
      focus: { zone: 0, node: 0 },
    },
    {
      title: "Sending creates one link per signer",
      body: "Each signer gets a single-use token with an expiry, emailed as a link; copy recipients are notified.",
      focus: { zone: 1, node: 1, crossing: 1 },
    },
    {
      title: "The signer opens the link and signs",
      body: "The token is checked first: a used, revoked or expired link is refused. The signer completes the fields and draws a signature, without an account.",
      focus: { zone: 2, node: 1 },
    },
    {
      title: "The PDF is signed",
      body: "The completed fields are rendered into the document, which is then signed with the platform's PKI certificate, locked against later edits, and timestamped. If signing fails, the request fails with it.",
      focus: { zone: 1, node: 2 },
    },
    {
      title: "Every step is recorded",
      body: "Each event is logged with its time and the signer's IP address and location, and the signed copy gets an audit-trail certificate page.",
      focus: { zone: 1, node: 3 },
    },
    {
      title: "The envelope completes",
      body: "When every signer has signed, the envelope completes, and the sender downloads the signed copies.",
      focus: { zone: 0, node: 1 },
    },
  ],
  boundary: [
    { data: "Uploaded PDFs", direction: "enters", path: "Sender → API", rule: "Hashed with SHA-256, then encrypted under their own data key." },
    { data: "Signing links", direction: "leaves", path: "API → signer's email", rule: "One per signer, single use, with an expiry." },
    { data: "Recipient names and emails", direction: "stays", path: "Database only", rule: "Encrypted at rest; matched by exact value." },
    { data: "Signed PDFs", direction: "leaves", path: "API → sender and signers", rule: "PKI-signed and timestamped; downloads rate-limited." },
    { data: "Audit entries", direction: "stays", path: "Database only", rule: "Kept with time, IP address and location; summarised on each signed copy." },
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
      choice: "A PKI signature that locks the PDF",
      instead: "An image of a signature on the page",
      reason: "A PDF reader can then check that the document is intact and who signed it.",
      tradeoff: "A certificate to buy, protect and renew, and a timestamp call that adds seconds to every signature.",
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
      choice: "Fail the request when signing fails",
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
        value: "All 4",
        label: "signed copies validated with pyHanko",
        method: "A local run on dummy data, 18 Nov 2026: each copy intact and locked against edits, with a valid RFC 3161 timestamp; signed with a self-signed demo certificate, so trusted only with that certificate as the anchor.",
      },
      {
        value: "51",
        label: "frontend tests in 9 Vitest files",
        method: "Counted from the source on 18 Nov 2026: unit tests for the layout, sign-in pieces, envelope wizard and field state.",
      },
    ],
    checks: [
      "A reused signing link is refused (401 on the local run)",
      "The certificate validated before every signature, and a failed signature failing the request",
      "An audit-trail certificate page on every signed copy",
      "Rate limits on signature submits, document downloads and sending",
      "Security headers and a content security policy in front of the app",
    ],
    notMeasured: [
      "Backend automated tests: none yet",
      "Load, latency or uptime",
      "A compliance audit or certification",
    ],
  },
  outcome: {
    proves: [
      `An e-signature platform built in-house and used by ${USAGE.signflow.sentence} at Sevina.`,
      "Signed copies sealed with a PKI certificate and timestamped, validated on a local run.",
      "Patient details encrypted at rest without losing search by exact value.",
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
      body: "Each signed copy is signed with the platform's PKI certificate, locked against later edits and timestamped by an RFC 3161 authority where one is set up. A failed signature fails the request.",
      art: { kind: "terminal", running: "signing the PDF…", done: "signature intact · timestamp valid" },
      wide: true,
    },
    {
      id: "single-use-links",
      title: "Links that work once",
      body: "Each signer's link holds a token recorded by its ID. Used, revoked or expired, it is refused.",
      art: { kind: "badge", title: "Signer link", lines: ["single use", "expires", "revocable"] },
    },
    {
      id: "document-keys",
      title: "Each document, its own key",
      body: "Every file is encrypted with AES-256-GCM under its own data key, which a master key wraps.",
      art: { kind: "flow", nodes: ["Data key", "AES-256-GCM", "Master key"], hot: 1 },
    },
    {
      id: "fail-closed",
      title: "No signature, no completion",
      body: "If the certificate cannot be loaded or validated, the signature fails with an error the signer sees, and nothing is marked signed.",
      art: { kind: "checks", items: ["Certificate", "Chain", "Signature"] },
    },
    {
      id: "audit-certificate",
      title: "The record travels with the PDF",
      body: "Every signed copy carries an audit-trail certificate page: the envelope ID, the signer, the times, the IP address and the original's SHA-256.",
      art: { kind: "badge", title: "Audit trail certificate", lines: ["envelope ID", "signed and viewed at", "SHA-256 of the original"] },
    },
    {
      id: "searchable-encryption",
      title: "Encrypted, and still searchable",
      body: "Names and emails are encrypted with AES-256-GCM using a nonce derived from the value itself, so an exact-match lookup still finds them.",
      art: { kind: "terminal", running: "WHERE email = encrypt_searchable(…)", done: "one match · ciphertext at rest" },
      wide: true,
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
      title: "Sign the PDF with the platform's certificate",
      story:
        "A drawn signature on a page proves nothing on its own, so each completed copy is signed with the platform's PKI certificate once the certificate checks out. The signature locks the document, so a later edit shows, and takes an RFC 3161 timestamp when an authority is configured.",
      file: "backend/services/pki.py",
      lang: "python",
      code: `def apply_pki_signature(input_pdf_path: str, output_pdf_path: str) -> str:
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

        # Timestamper: use TSA if configured, otherwise no timestamp
        timestamper = None
        if settings.PKI_TSA_URL:
            try:
                get_tsa_timestamp(b"tsa-preflight")
                timestamper = ts_module.HTTPTimeStamper(settings.PKI_TSA_URL)
            except Exception as e:
                if settings.PKI_TSA_REQUIRED:
                    raise ValueError(f"Failed to configure required TSA timestamper: {e}") from e
        elif settings.PKI_TSA_REQUIRED:
            raise ValueError("TSA URL not configured while PKI_TSA_REQUIRED=true")

        meta = PdfSignatureMetadata(
            field_name="DocSignature",
            certify=True,
            validation_context=ValidationContext(allow_fetching=True),
            embed_validation_info=True,
        )
        with open(output_pdf_path, "wb") as outf:
            signers.sign_pdf(w, signature_meta=meta, signer=signer, timestamper=timestamper, output=outf)

    return output_pdf_path`,
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
      shots: [SHOTS.dashboard, SHOTS.wizardUpload, SHOTS.wizardRecipients, SHOTS.fieldPlacement, SHOTS.completed, SHOTS.auditTrail],
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
      title: "An envelope, sent and signed, on dummy data",
      src: `${DIR}/signflow-demo.webm`,
      poster: `${DIR}/signflow-demo.webp`,
      captions: `${DIR}/signflow-demo.vtt`,
      width: 1440,
      height: 900,
      duration: 58.12,
      frame: "browser",
      alt: "Screen recording of SignFlow on dummy data: an envelope created, sent, signed by two signers from their emailed links, and completed.",
      summary: "Create an envelope, place fields for two signers, send it, sign from each emailed link, and see the completed envelope with its signed copies and audit trail.",
      scenes: [
        { start: 0, end: 3.59, text: "Sign in to the local SignFlow test stack as Jordan Sample, the sender. Every person and document in this video is invented." },
        { start: 3.59, end: 10.02, text: "The dashboard shows envelopes in draft, sent and completed states. A new envelope gets a subject, then the admission consent PDF is uploaded." },
        { start: 10.02, end: 15.4, text: "Add the two signers: Riley Placeholder and Casey Example." },
        { start: 15.4, end: 22.15, text: "Place fields for each signer: signature and date for Riley, signature and printed name for Casey. Then save." },
        { start: 22.15, end: 27.3, text: "Review, preview the emails and send. Each signer gets a single-use signing link by email." },
        { start: 27.3, end: 32.52, text: "Riley opens the emailed link, draws a signature and adds the date." },
        { start: 32.52, end: 39.24, text: "On submit, the server renders the signed PDF and signs it with a demo certificate and an RFC 3161 timestamp." },
        { start: 39.24, end: 50.57, text: "Casey signs from a separate link and adds a printed name. With both signatures in, the envelope is complete." },
        { start: 50.57, end: 58.12, text: "Back as the sender: status Completed, the original's SHA-256, the signed copies, and an audit trail of every event with its time and, for signer actions, the IP." },
      ],
    },
  ],
  stack: {
    groups: [
      {
        label: "API",
        items: ["Python 3.13", "FastAPI", "SQLAlchemy 2 (async)", "PostgreSQL", "Alembic", "Pydantic 2", "pyHanko", "PyMuPDF", "Argon2", "PyOTP", "SlowAPI"],
      },
      {
        label: "Web app",
        items: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "TanStack Query", "react-pdf", "Vitest"],
      },
      { label: "Delivery", items: ["Jenkins", "IIS"] },
    ],
    aws: [AWS.s3],
  },
  card: {
    body: "Sends documents out through single-use signing links and returns PDFs signed with a PKI certificate and timestamped.",
    tech: "FastAPI · PostgreSQL · pyHanko · React · AWS: S3",
  },
};
