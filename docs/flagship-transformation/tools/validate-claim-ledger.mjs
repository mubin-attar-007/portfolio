import fs from 'node:fs';

const jsonPath = 'docs/flagship-transformation/evidence/claims/claim-ledger.json';
const csvPath = 'docs/flagship-transformation/evidence/claims/claim-ledger.csv';

const claims = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const enums = {
  source_state: new Set([
    'LOCAL_PUBLIC_SOURCE',
    'LOCAL_INTERNAL_SOURCE',
    'HISTORICAL_DOCUMENT',
    'TEST_ONLY',
    'UNTRACKED_DOCUMENT',
    'SOURCE_MISSING',
    'LIVE_PREVIOUSLY_VERIFIED',
    'PENDING_LIVE_VERIFICATION',
  ]),
  factual_or_positioning: new Set(['FACTUAL','POSITIONING','POLICY','HISTORICAL_PROPOSAL','UNRESOLVED']),
  verification_status: new Set([
    'OWNER_APPROVED_POSITIONING',
    'REPOSITORY_VERIFIED_FACT',
    'EXTERNALLY_VERIFIED_FACT',
    'PARTIALLY_VERIFIED',
    'PENDING_OWNER_CONFIRMATION',
    'PENDING_OPERATIONAL_VERIFICATION',
    'CONTRADICTED',
    'UNSUPPORTED',
    'STALE',
    'CONFIDENTIAL_NOT_PUBLIC',
    'REMOVE_OR_REWRITE_CANDIDATE'
  ]),
  owner_approval_status: new Set(['APPROVED','PENDING','NOT_REQUIRED','REJECTED','CONFIDENTIAL_REVIEW']),
  safe_direction: new Set(['KEEP','QUALIFY','REWRITE','REMOVE','VERIFY','KEEP_INTERNAL','CONFIDENTIAL_REVIEW']),
  risk_level: new Set(['LOW','MEDIUM','HIGH','CRITICAL']),
};
const validFuturePhases = new Set(['P0-R1','P0-R2','P0-R2A','P0-R4','P1','P2','P3','P4','P5']);
const allowedColumns = [
  'claim_id',
  'exact_current_wording',
  'normalized_claim',
  'claim_category',
  'source_file',
  'source_anchor',
  'route_or_component',
  'source_state',
  'factual_or_positioning',
  'verification_status',
  'evidence',
  'scope',
  'limitations',
  'contradicts_claim_id',
  'duplication_cluster',
  'risk_level',
  'safe_direction',
  'owner_approval_status',
  'date_validated',
  'revalidation_trigger',
  'future_phase',
  'notes',
];

const placeholders = [
  /home\.facts\[\?\]/i,
  /5\.2k\/10k\?/i,
  /\bif any\b/i,
  /\bor equivalent\b/i,
  /\bexample\b/i,
  /\bsource:\s*\w+\b/i,
];

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
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
      fields.push(field);
      field = '';
      continue;
    }
    field += ch;
  }
  fields.push(field);
  return fields;
}

function parseCsv(csvText) {
  const lines = csvText.replace(/\r\n/g, '\n').split('\n').filter((l) => l !== '');
  return lines.map(parseCsvLine);
}

function normalizeMultiValue(raw, isId = false) {
  return String(raw || '')
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => (isId ? v.toLowerCase() : v));
}

function hasUnresolvedPlaceholder(text) {
  return placeholders.some((rx) => rx.test(text));
}

const rawCsv = fs.readFileSync(csvPath, 'utf8');
const parsed = parseCsv(rawCsv);
const header = parsed.shift();

const errors = [];
const warnings = [];

if (!header || header.length !== allowedColumns.length) {
  errors.push(`Invalid CSV header column count: ${header ? header.length : 0}`);
}

for (const col of allowedColumns) {
  if (!(header || []).includes(col)) {
    errors.push(`Missing required CSV header field: ${col}`);
  }
}

if (parsed.length !== claims.length) {
  errors.push(`CSV row count ${parsed.length} does not match JSON claim count ${claims.length}`);
}

const seenIds = new Set();
const idSet = new Set(claims.map((c) => c.claim_id));

for (let i = 0; i < parsed.length; i++) {
  const row = parsed[i];
  const lineNo = i + 2;
  if (row.length !== allowedColumns.length) {
    errors.push(`Row ${lineNo}: has ${row.length} columns, expected ${allowedColumns.length}`);
    continue;
  }

  const obj = {};
  for (let c = 0; c < allowedColumns.length; c++) obj[allowedColumns[c]] = row[c];

  for (const requiredField of allowedColumns) {
    if (!Object.prototype.hasOwnProperty.call(obj, requiredField)) {
      errors.push(`Row ${lineNo}: missing required field ${requiredField}`);
      continue;
    }
  }

  if (!/^c\d{3}$/.test(obj.claim_id)) {
    errors.push(`Row ${lineNo}: invalid claim id format: ${obj.claim_id}`);
  }
  if (seenIds.has(obj.claim_id)) {
    errors.push(`Row ${lineNo}: duplicate claim id ${obj.claim_id}`);
  }
  seenIds.add(obj.claim_id);

  if (!obj.source_file || String(obj.source_file).trim() === '') {
    errors.push(`Row ${lineNo}: missing source_file`);
  }
  if (!obj.source_anchor || String(obj.source_anchor).trim() === '') {
    errors.push(`Row ${lineNo}: missing source_anchor`);
  }
  if (String(obj.source_anchor).includes('?')) {
    errors.push(`Row ${lineNo}: source_anchor contains '?': ${obj.source_anchor}`);
  }

  if (hasUnresolvedPlaceholder(obj.exact_current_wording) || hasUnresolvedPlaceholder(obj.normalized_claim)) {
    errors.push(`Row ${lineNo}: unresolved placeholder in wording`);
  }

  for (const field of ['source_state', 'factual_or_positioning', 'verification_status', 'owner_approval_status', 'safe_direction', 'risk_level']) {
    if (!enums[field].has(obj[field])) {
      errors.push(`Row ${lineNo}: invalid enum value for ${field}: ${obj[field]}`);
    }
  }

  if (!validFuturePhases.has(obj.future_phase)) {
    errors.push(`Row ${lineNo}: invalid future_phase: ${obj.future_phase}`);
  }

  const contradictionIds = normalizeMultiValue(obj.contradicts_claim_id, true);
  for (const cid of contradictionIds) {
    if (!/^c\d{3}$/.test(cid) || !idSet.has(cid)) {
      errors.push(`Row ${lineNo}: contradiction reference not resolvable: ${cid}`);
    }
  }

  const categoryCell = String(obj.claim_category);
  const routeCell = String(obj.route_or_component);
  if ((categoryCell.includes(',') && !categoryCell.includes(';')) || (routeCell.includes(',') && !routeCell.includes(';'))) {
    warnings.push(`Row ${lineNo}: ambiguous multi-value field delimiter (comma used instead of semicolon)`);
  }

  const category = normalizeMultiValue(obj.claim_category);
  const routes = normalizeMultiValue(obj.route_or_component);
  if (category.length === 0) {
    warnings.push(`Row ${lineNo}: empty claim_category`);
  }
  if (routes.length === 0) {
    warnings.push(`Row ${lineNo}: empty route_or_component`);
  }
}

for (const id of seenIds) {
  if (!idSet.has(id)) {
    warnings.push(`CSV includes claim id not present in JSON: ${id}`);
  }
}
for (const id of idSet) {
  if (!seenIds.has(id)) {
    errors.push(`JSON claim id missing from CSV: ${id}`);
  }
}

const jsonRouteIds = new Set(claims.map((c) => c.claim_id));
for (const cid of claims.flatMap((c) => normalizeMultiValue(c.contradicts_claim_id, true))) {
  if (cid && !jsonRouteIds.has(cid)) {
    errors.push(`JSON contradiction invalid reference: ${cid}`);
  }
}

if (errors.length) {
  for (const e of errors) {
    console.error(e);
  }
}
if (warnings.length) {
  for (const w of warnings) {
    console.warn(w);
  }
}

console.log(`summary: rows=${parsed.length}, claims=${claims.length}, warnings=${warnings.length}, errors=${errors.length}`);

if (errors.length) {
  process.exitCode = 1;
}
