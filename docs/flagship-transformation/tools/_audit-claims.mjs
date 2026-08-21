import fs from 'node:fs';
const claims = JSON.parse(fs.readFileSync('docs/flagship-transformation/evidence/claims/claim-ledger-normalized.json','utf8'));
const placeholders = [ '?', 'example', 'if any', 'home.facts[?]', '5.2k/10k?', 'maybe', 'or equivalent', 'TODO', 'candidte' ];
const invalidRows=[];
for (const c of claims){
  const issues=[];
  if(!c.claim_id || !/^c\d{3}$/.test(c.claim_id)) issues.push('bad_id');
  if(!c.source_file) issues.push('missing source_file');
  if(!c.source_anchor) issues.push('missing source_anchor');
  if(c.source_anchor.includes('?')) issues.push('source_anchor_has_q');
  if(c.source_anchor === 'AGENT docs') issues.push('invalid_anchor');
  for (const p of placeholders){
    if (typeof c.exact_current_wording==='string' && c.exact_current_wording.toLowerCase().includes(p)) issues.push('placeholder_wording');
    if (typeof c.normalized_claim==='string' && c.normalized_claim.toLowerCase().includes(p)) issues.push('placeholder_normalized');
    if (typeof c.source_anchor==='string' && c.source_anchor.toLowerCase().includes(p)) issues.push('placeholder_anchor');
  }
  if (issues.length) invalidRows.push({id:c.claim_id, issues});
}
console.log('invalidRows', invalidRows.length);
console.log(invalidRows.slice(0,80));

const enums = {
  source_state:['LOCAL_PUBLIC_SOURCE','LOCAL_INTERNAL_SOURCE','HISTORICAL_DOCUMENT','TEST_ONLY','UNTRACKED_DOCUMENT','SOURCE_MISSING','LIVE_PREVIOUSLY_VERIFIED','PENDING_LIVE_VERIFICATION'],
  factual_or_positioning:['FACTUAL','POSITIONING','POLICY','HISTORICAL_PROPOSAL','UNRESOLVED'],
  verification_status:['OWNER_APPROVED_POSITIONING','REPOSITORY_VERIFIED_FACT','EXTERNALLY_VERIFIED_FACT','PARTIALLY_VERIFIED','PENDING_OWNER_CONFIRMATION','PENDING_OPERATIONAL_VERIFICATION','CONTRADICTED','UNSUPPORTED','STALE','CONFIDENTIAL_NOT_PUBLIC','REMOVE_OR_REWRITE_CANDIDATE'],
  owner_approval_status:['APPROVED','PENDING','NOT_REQUIRED','REJECTED','CONFIDENTIAL_REVIEW'],
  safe_direction:['KEEP','QUALIFY','REWRITE','REMOVE','VERIFY','KEEP_INTERNAL','CONFIDENTIAL_REVIEW'],
  risk_level:['LOW','MEDIUM','HIGH','CRITICAL']
};
const invalidEnum={};
for (const c of claims){
  Object.entries(enums).forEach(([k,vals])=>{ if(!vals.includes(c[k])) invalidEnum[k] = invalidEnum[k] || []; if(!vals.includes(c[k])) invalidEnum[k].push(c.claim_id);});
}
for (const [k,v] of Object.entries(invalidEnum)) if(v.length) console.log(k,[...new Set(v)]);

const known = new Set(claims.map(c=>c.claim_id));
let badContradictions=0;
const badRows=[];
for (const c of claims){
  for (const id of c.contradicts_claim_id){ if(id && !known.has(id)){ badRows.push({id:c.claim_id, bad:id}); badContradictions++; }}
}
console.log('badContradictions',badContradictions,'rows',badRows.slice(0,50));

console.log('sample', claims.slice(0,5));
