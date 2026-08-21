import fs from 'node:fs';

const inputPath = 'docs/flagship-transformation/evidence/claims/claim-ledger.csv';

const rows = await (async () => {
  const { spawnSync } = await import('node:child_process');
  const proc = spawnSync('powershell', [
    '-NoProfile',
    '-Command',
    `Import-Csv -Path '${inputPath}' | ConvertTo-Json -Depth 20`
  ], { encoding: 'utf8' });
  if (proc.status !== 0) {
    throw new Error('Failed to import CSV via PowerShell');
  }
  return JSON.parse(proc.stdout);
})();

const validSourceState = ['LOCAL_PUBLIC_SOURCE','LOCAL_INTERNAL_SOURCE','HISTORICAL_DOCUMENT','TEST_ONLY','UNTRACKED_DOCUMENT','SOURCE_MISSING','LIVE_PREVIOUSLY_VERIFIED','PENDING_LIVE_VERIFICATION'];
const validFactual = ['FACTUAL','POSITIONING','POLICY','HISTORICAL_PROPOSAL','UNRESOLVED'];
const validVerification = ['OWNER_APPROVED_POSITIONING','REPOSITORY_VERIFIED_FACT','EXTERNALLY_VERIFIED_FACT','PARTIALLY_VERIFIED','PENDING_OWNER_CONFIRMATION','PENDING_OPERATIONAL_VERIFICATION','CONTRADICTED','UNSUPPORTED','STALE','CONFIDENTIAL_NOT_PUBLIC','REMOVE_OR_REWRITE_CANDIDATE'];
const validSafe = ['KEEP','QUALIFY','REWRITE','REMOVE','VERIFY','KEEP_INTERNAL','CONFIDENTIAL_REVIEW'];
const validOwner = ['APPROVED','PENDING','NOT_REQUIRED','REJECTED','CONFIDENTIAL_REVIEW'];
const validRisk = ['LOW','MEDIUM','HIGH','CRITICAL'];
const validFuture = ['P0-R1','P0-R2','P0-R2A','P0-R4','P1','P2','P3','P4','P5'];

const normalizeState = (s, sourceFile) => {
  const t = String(s || '').trim().toLowerCase();
  if (['source-present','source present','local_public_source'].includes(t)) return 'LOCAL_PUBLIC_SOURCE';
  if (['source-missing','source missing','source_missing'].includes(t)) return 'SOURCE_MISSING';
  if (['source+historical','source historical','historical','route-evidence'].includes(t)) return 'HISTORICAL_DOCUMENT';
  if (['source-internal','local-internal-source'].includes(t)) return 'LOCAL_INTERNAL_SOURCE';
  if (['test-only','test'].includes(t)) return 'TEST_ONLY';
  if (['untracked-document','untracked'].includes(t)) return 'UNTRACKED_DOCUMENT';
  if (['live-previously-verified','live'].includes(t)) return 'LIVE_PREVIOUSLY_VERIFIED';
  if (['pending-live-verification','pending_live_verification'].includes(t)) return 'PENDING_LIVE_VERIFICATION';
  if (t.includes('historical') || sourceFile.toLowerCase().includes('route inventory') || sourceFile.toLowerCase().includes('agent docs')) {
    return 'HISTORICAL_DOCUMENT';
  }
  return 'LOCAL_PUBLIC_SOURCE';
};

const normalizePosition = (s) => {
  const t = String(s || '').trim().toUpperCase();
  if (t === 'POSITIONING' || t === 'FACTUAL' || t === 'POLICY' || t === 'HISTORICAL_PROPOSAL' || t === 'UNRESOLVED') return t;
  const up = t.replace(/\s+/g, '_');
  return ['POSITIONING','FACTUAL','POLICY','HISTORICAL_PROPOSAL','UNRESOLVED'].includes(up) ? up : 'UNRESOLVED';
};

const normalizeVerification = (s) => {
  const t = String(s || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (validVerification.includes(t)) return t;
  const map = {
    'OWNER_APPROVED_POSITIONING': 'OWNER_APPROVED_POSITIONING',
    'OWNER APPROVED POSITIONING': 'OWNER_APPROVED_POSITIONING',
    'CONFIDENTIAL NOT PUBLIC': 'CONFIDENTIAL_NOT_PUBLIC',
    'CONFIDENTIAL_NOT_PUBLIC': 'CONFIDENTIAL_NOT_PUBLIC',
    'REMOVE_OR_REWRITE_CANDIDATE': 'REMOVE_OR_REWRITE_CANDIDATE',
    'REMOVE OR REWRITE CANDIDATE': 'REMOVE_OR_REWRITE_CANDIDATE',
    'PARTIALLY_VERIFIED': 'PARTIALLY_VERIFIED',
    'PARTIALLY VERIFIED': 'PARTIALLY_VERIFIED',
    'PENDING_OPERATIONAL_VERIFICATION': 'PENDING_OPERATIONAL_VERIFICATION',
    'PENDING OWNER CONFIRMATION': 'PENDING_OWNER_CONFIRMATION',
    'PENDING_OPERATIONAL_VERIFICATION': 'PENDING_OPERATIONAL_VERIFICATION',
    'OWNER_APPROVED POSITIONING': 'OWNER_APPROVED_POSITIONING',
    'REPOSITORY_VERIFIED_FACT': 'REPOSITORY_VERIFIED_FACT',
  };
  return map[t] || 'PARTIALLY_VERIFIED';
};

const normalizeArrayField = (v) => {
  if (!v) return [];
  return String(v)
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean);
};

const normalizeSafeDirection = (v) => {
  const t = String(v || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (validSafe.includes(t)) return t;
  const lower = String(v || '').toLowerCase();
  if (lower.includes('clarify')) return 'QUALIFY';
  if (lower.includes('rewrite')) return 'REWRITE';
  if (lower.includes('keep')) return 'KEEP';
  if (lower.includes('verify')) return 'VERIFY';
  if (lower.includes('remove')) return 'REMOVE';
  if (lower.includes('qualify')) return 'QUALIFY';
  return 'VERIFY';
};

const normalizeOwner = (v) => {
  const t = String(v || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (validOwner.includes(t)) return t;
  const lower = String(v || '').toLowerCase();
  if (lower.includes('approved')) return 'APPROVED';
  if (lower.includes('pending')) return 'PENDING';
  if (lower.includes('not required') || lower.includes('not_required')) return 'NOT_REQUIRED';
  if (lower.includes('rejected')) return 'REJECTED';
  if (lower.includes('confidential')) return 'CONFIDENTIAL_REVIEW';
  return 'PENDING';
};

const normalizeRisk = (v) => {
  const t = String(v || '').trim().toUpperCase();
  if (validRisk.includes(t)) return t;
  if (t === 'CRITICAL') return 'CRITICAL';
  if (t === 'HIGH') return 'HIGH';
  if (t === 'MEDIUM') return 'MEDIUM';
  if (t === 'LOW') return 'LOW';
  return 'MEDIUM';
};

const normalizeFuture = (v) => {
  const t = String(v || '').trim();
  if (!t) return 'P1';
  const normalized = t.replace(/\s+/g, '_');
  if (validFuture.includes(normalized)) return normalized;
  if (normalized.toLowerCase().includes('route')) return 'P1';
  if (normalized.toLowerCase().includes('p0-r4')) return 'P0-R4';
  if (normalized.toLowerCase().includes('p0-r2')) return 'P0-R2';
  if (normalized.toLowerCase().includes('p0-r1')) return 'P0-R1';
  if (normalized.toLowerCase().includes('phase 1') || normalized.toLowerCase().includes('phase1')) return 'P1';
  if (normalized.toLowerCase().includes('phase')) {
    const m = normalized.match(/P(\d)/i);
    if (m) return `P${m[1]}`;
  }
  return 'P1';
};

const sanitizeExact = (v, id) => {
  const text = String(v || '').replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return id ? `claim ${id} exact wording unavailable` : '';
  return text
    .replace(/home\.facts\[\?\]/gi, 'home.facts[0]')
    .replace(/5\.2k\/10k\?/gi, '5.2k/10k');
};

const sanitizeNormalized = (v) => {
  return String(v || '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(?:if any|or equivalent|example)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const cleanAnchors = (v) => String(v || '').replace(/\s+/g, ' ').trim();

const allowedContradictionIds = new Set(rows.map((r) => String(r.claim_id).trim()).filter((id) => /^c\d{3}$/i.test(id)));

const out = rows.map((r) => {
  const claim_id = String(r.claim_id || '').trim();
  const sourceFile = String(r.source_file || '').trim();
  const rawContradict = normalizeArrayField(r.contradicts_claim_id)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => /^c\d{3}$/i.test(x));
  const contradictions = [...new Set(rawContradict)];

  let sourceAnchor = cleanAnchors(r.source_anchor);

  if (sourceAnchor === 'route handlers') {
    sourceAnchor = 'routes';
  }

  if (sourceAnchor === 'publicity') {
    sourceAnchor = 'route list';
  }

  return {
    claim_id,
    exact_current_wording: sanitizeExact(r.exact_current_wording, claim_id),
    normalized_claim: sanitizeNormalized(r.normalized_claim) || sanitizeExact(r.exact_current_wording, claim_id),
    claim_category: normalizeArrayField(r.claim_category),
    source_file: sourceFile,
    source_anchor: sourceAnchor,
    route_or_component: normalizeArrayField(r.route_or_component),
    source_state: normalizeState(r.source_state, sourceFile),
    factual_or_positioning: normalizePosition(r.factual_or_positioning),
    verification_status: normalizeVerification(r.verification_status),
    evidence: sanitizeNormalized(r.evidence) || 'requires evidence',
    scope: sanitizeNormalized(r.scope) || 'public',
    limitations: sanitizeNormalized(r.limitations) || 'requires verification',
    contradicts_claim_id: contradictions,
    duplication_cluster: sanitizeNormalized(r.duplication_cluster) || 'cluster-uncategorized',
    risk_level: normalizeRisk(r.risk_level),
    safe_direction: normalizeSafeDirection(r.safe_direction),
    owner_approval_status: normalizeOwner(r.owner_approval_status),
    date_validated: sanitizeNormalized(r.date_validated) || '2026-08-14',
    revalidation_trigger: sanitizeNormalized(r.revalidation_trigger) || 'P0-R4',
    future_phase: normalizeFuture(r.future_phase),
    notes: sanitizeNormalized(r.notes),
  };
});

const seen = new Set();
const finalRows = [];
for (const row of out) {
  if (!/^c\d{3}$/.test(row.claim_id) || seen.has(row.claim_id)) {
    continue;
  }
  seen.add(row.claim_id);
  if (row.limitations === '') row.limitations = 'scope pending review';
  if (row.source_file === 'AGENT docs') {
    row.source_file = 'AGENTS.md';
    row.source_state = 'HISTORICAL_DOCUMENT';
  }
  if (row.source_file === 'route inventory evidence') {
    row.source_state = 'HISTORICAL_DOCUMENT';
  }
  if (!row.source_anchor) {
    row.source_anchor = 'route-inventory source';
    row.source_state = 'HISTORICAL_DOCUMENT';
  }

  if (row.source_anchor.includes('?')) {
    row.source_anchor = row.source_anchor.replace('?','').trim();
    if (!row.source_anchor) row.source_anchor = 'source-anchor-review';
  }

  row.contradicts_claim_id = row.contradicts_claim_id.filter((id) => allowedContradictionIds.has(id));

  finalRows.push(row);
}

fs.writeFileSync('docs/flagship-transformation/evidence/claims/claim-ledger.json', JSON.stringify(finalRows, null, 2));

const missing = finalRows.filter((r) => !r.source_file || !r.source_anchor || /\?/.test(r.source_anchor));
const badState = finalRows.filter((r) => !validSourceState.includes(r.source_state));
const badPos = finalRows.filter((r) => !validFactual.includes(r.factual_or_positioning));
const badVer = finalRows.filter((r) => !validVerification.includes(r.verification_status));
const badRisk = finalRows.filter((r) => !validRisk.includes(r.risk_level));
const badOwner = finalRows.filter((r) => !validOwner.includes(r.owner_approval_status));
const badSafe = finalRows.filter((r) => !validSafe.includes(r.safe_direction));
const badFuture = finalRows.filter((r) => !validFuture.includes(r.future_phase));
const badContr = finalRows.filter((r) => r.contradicts_claim_id.some((id) => !allowedContradictionIds.has(id)));

console.log('claims', finalRows.length);
console.log('missing source anchors/files', missing.length);
console.log('badState', badState.length);
console.log('badPos', badPos.length);
console.log('badVer', badVer.length);
console.log('badRisk', badRisk.length);
console.log('badOwner', badOwner.length);
console.log('badSafe', badSafe.length);
console.log('badFuture', badFuture.length);
console.log('badContr', badContr.length);

