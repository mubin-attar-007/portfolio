import fs from 'node:fs';

const csvPath = 'docs/flagship-transformation/evidence/claims/claim-ledger.csv';
const text = fs.readFileSync(csvPath, 'utf8');

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i <= input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (i === input.length || ch === '\n') {
      row.push(field);
      field = '';
      if (row.length !== 1 || row[0] !== '') rows.push(row);
      row = [];
      continue;
    }

    if (ch === '\r') continue;

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    field += ch;
  }
  return rows;
}

const rows = parseCsv(text);
const headers = rows[0].map((v) => v.trim());
const claims = rows.slice(1).filter((r) => r.some((v) => String(v).trim() !== ''));
const mapSourceState = (v) => {
  const key = String(v || '').trim().toLowerCase();
  if (['source-present', 'source present', 'local_public_source'].includes(key)) return 'LOCAL_PUBLIC_SOURCE';
  if (['source-missing', 'source missing', 'source_missing', 'source absent'].includes(key)) return 'SOURCE_MISSING';
  if (['source+historical', 'source historical', 'historical', 'source+history'].includes(key)) return 'HISTORICAL_DOCUMENT';
  if (['source-internal', 'local-internal-source', 'internal'].includes(key)) return 'LOCAL_INTERNAL_SOURCE';
  if (['test-only', 'test'].includes(key)) return 'TEST_ONLY';
  if (['untracked-document', 'untracked'].includes(key)) return 'UNTRACKED_DOCUMENT';
  if (['live-previously-verified', 'live'].includes(key)) return 'LIVE_PREVIOUSLY_VERIFIED';
  if (['pending-live-verification'].includes(key)) return 'PENDING_LIVE_VERIFICATION';
  return v ? String(v).trim() : '';
};

function normalizeEnum(v, valid, fallback='') {
  const trimmed = String(v || '').trim();
  if (!trimmed) return fallback;
  if (valid.includes(trimmed)) return trimmed;
  const up = trimmed.toUpperCase();
  const upSpace = up.replace(/\s+/g, '_');
  if (valid.includes(upSpace)) return upSpace;
  return trimmed;
}

const validSourceState = ['LOCAL_PUBLIC_SOURCE','LOCAL_INTERNAL_SOURCE','HISTORICAL_DOCUMENT','TEST_ONLY','UNTRACKED_DOCUMENT','SOURCE_MISSING','LIVE_PREVIOUSLY_VERIFIED','PENDING_LIVE_VERIFICATION'];
const validFactPos = ['FACTUAL','POSITIONING','POLICY','HISTORICAL_PROPOSAL','UNRESOLVED'];
const validVerification = ['OWNER_APPROVED_POSITIONING','REPOSITORY_VERIFIED_FACT','EXTERNALLY_VERIFIED_FACT','PARTIALLY_VERIFIED','PENDING_OWNER_CONFIRMATION','PENDING_OPERATIONAL_VERIFICATION','CONTRADICTED','UNSUPPORTED','STALE','CONFIDENTIAL_NOT_PUBLIC','REMOVE_OR_REWRITE_CANDIDATE'];
const validOwnerStatus = ['APPROVED','PENDING','NOT_REQUIRED','REJECTED','CONFIDENTIAL_REVIEW'];
const validSafe = ['KEEP','QUALIFY','REWRITE','REMOVE','VERIFY','KEEP_INTERNAL','CONFIDENTIAL_REVIEW'];
const validRisk = ['LOW','MEDIUM','HIGH','CRITICAL'];

function normalizeArray(v) {
  return String(v || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => x !== '-')
    .join('; ');
}

function normalizeId(v) {
  const trimmed = String(v || '').trim();
  const match = trimmed.match(/^(c\d{3})$/i);
  return match ? match[1].toLowerCase() : trimmed;
}

const parsed = claims.map((r) => {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = String(r[i] ?? '').trim();
  });

  return {
    claim_id: normalizeId(obj.claim_id),
    exact_current_wording: String(obj.exact_current_wording || '').replace(/\s+/g, ' ').trim(),
    normalized_claim: String(obj.normalized_claim || '').replace(/\s+/g, ' ').trim(),
    claim_category: normalizeArray(obj.claim_category).split('; ').filter(Boolean),
    source_file: obj.source_file,
    source_anchor: obj.source_anchor,
    route_or_component: normalizeArray(obj.route_or_component).split('; ').filter(Boolean),
    source_state: normalizeEnum(mapSourceState(obj.source_state), validSourceState, 'LOCAL_PUBLIC_SOURCE'),
    factual_or_positioning: normalizeEnum(obj.factual_or_positioning.toUpperCase(), validFactPos, 'UNRESOLVED'),
    verification_status: normalizeEnum(obj.verification_status.toUpperCase(), validVerification, 'PARTIALLY_VERIFIED'),
    evidence: obj.evidence || 'requires review',
    scope: obj.scope || 'public',
    limitations: obj.limitations || 'scope pending review',
    contradicts_claim_id: normalizeArray(obj.contradicts_claim_id).split('; ').filter((x) => x).map((id) => normalizeId(id)).filter(Boolean),
    duplication_cluster: obj.duplication_cluster || 'cluster-uncategorized',
    risk_level: normalizeEnum(obj.risk_level.toUpperCase(), validRisk, 'MEDIUM'),
    safe_direction: normalizeEnum(obj.safe_direction.toUpperCase(), validSafe, 'VERIFY'),
    owner_approval_status: normalizeEnum(obj.owner_approval_status.toUpperCase().replace(/\?/g, ''), validOwnerStatus, 'PENDING'),
    date_validated: obj.date_validated || '2026-08-14',
    revalidation_trigger: obj.revalidation_trigger || 'P0-R4',
    future_phase: obj.future_phase || 'P1',
    notes: obj.notes || ''
  };
});

const data = parsed;
fs.writeFileSync('docs/flagship-transformation/evidence/claims/claim-ledger-normalized.json', JSON.stringify(data, null, 2));
console.log('written', parsed.length);

const ids = parsed.map((c) => c.claim_id);
const dup = ids.filter((id, idx, a) => a.indexOf(id) !== idx);
if (dup.length) {
  console.log('duplicate ids', [...new Set(dup)]);
}

const known = new Set(parsed.map((c) => c.claim_id));
let invalid = 0;
for (const c of parsed) {
  const bad = c.contradicts_claim_id.filter((id) => !known.has(id) && id !== '');
  if (bad.length) {
    invalid++;
    console.log('invalid contradiction', c.claim_id, bad);
  }
}
console.log('invalid contradictions', invalid);
