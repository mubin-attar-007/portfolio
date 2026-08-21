import fs from 'node:fs';

const csvPath = 'docs/flagship-transformation/evidence/claims/claim-ledger.csv';
const jsonPath = 'docs/flagship-transformation/evidence/claims/claim-ledger.json';

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const columns = [
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
  'notes'
];

function asString(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join('; ');
  return String(value);
}

function csvEscape(value) {
  const raw = asString(value ?? '');
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

const rows = [
  columns.map((c) => csvEscape(c)).join(',')
];

for (const row of data) {
  const line = columns
    .map((col) => {
      const value = row[col];
      const s = normalizeNewlines(asString(value));
      return csvEscape(s);
    })
    .join(',');
  rows.push(line);
}

fs.writeFileSync(csvPath, rows.join('\n') + '\n', 'utf8');

const totals = {
  totalClaims: data.length,
  verification_status: {},
  risk_level: {},
  owner_status: {},
  source_state: {},
  future_phase: {},
  unsupported: 0,
  contradicted: 0,
  pendingOperational: 0,
  pendingOwner: 0,
  contradictionClusters: new Set(),
  duplicationClusters: new Set(),
};

for (const row of data) {
  const key = row.verification_status;
  totals.verification_status[key] = (totals.verification_status[key] || 0) + 1;
  totals.risk_level[row.risk_level] = (totals.risk_level[row.risk_level] || 0) + 1;
  totals.owner_status[row.owner_approval_status] = (totals.owner_status[row.owner_approval_status] || 0) + 1;
  totals.source_state[row.source_state] = (totals.source_state[row.source_state] || 0) + 1;
  totals.future_phase[row.future_phase] = (totals.future_phase[row.future_phase] || 0) + 1;

  if (row.verification_status === 'UNSUPPORTED') totals.unsupported += 1;
  if (row.verification_status === 'CONTRADICTED') totals.contradicted += 1;
  if (row.verification_status === 'PENDING_OPERATIONAL_VERIFICATION') totals.pendingOperational += 1;
  if (row.verification_status === 'PENDING_OWNER_CONFIRMATION') totals.pendingOwner += 1;
  if (row.duplication_cluster) totals.duplicationClusters.add(row.duplication_cluster);
}

for (const row of data) {
  if (Array.isArray(row.contradicts_claim_id) && row.contradicts_claim_id.length > 0) {
    totals.contradictionClusters.add(row.contradicts_claim_id.join('|') || row.claim_id);
  }
}

console.log(JSON.stringify({
  generated: {
    path: csvPath,
    rowCount: data.length,
    columnCount: columns.length,
    totals,
  }
}, null, 2));
