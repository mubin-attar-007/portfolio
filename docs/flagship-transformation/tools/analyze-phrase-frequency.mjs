import fs from 'node:fs';
import path from 'node:path';

const phrases = [
  'Applied AI',
  'AI/ML Engineer',
  'AI Software Engineer',
  'production AI',
  'reliable AI',
  'deterministic',
  'guardrail',
  'honest',
  'real',
  'fake',
  'solo',
  '$0',
  'free tier',
  'always',
  'never',
  'zero writes',
  'publicly testable',
  'live',
  'evaluation',
  'evidence',
  'end to end'
];

const INCLUDE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json', '.txt']);
const ROOT = process.cwd();

const INCLUDE_DIRS = ['app', 'components', 'content', 'public', 'docs/flagship-transformation', 'spec', '.'];

const EXCLUDE_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  '.open-next',
  'dist',
  'build',
  'coverage',
  'tmp',
  'temp',
  'docs/flagship-transformation/evidence/claims',
  'out',
]);

const EXCLUDE_FILES = new Set([
  'docs/flagship-transformation/03-claim-ledger.md',
  'docs/flagship-transformation/08-content-and-message-audit.md',
  'docs/flagship-transformation/tools/generate-claim-ledger.mjs',
  'docs/flagship-transformation/tools/validate-claim-ledger.mjs',
  'docs/flagship-transformation/tools/analyze-phrase-frequency.mjs',
  'temp_claims_dump.txt',
  'docs/flagship-transformation/notes/temp.md'
]);

function lowered(p) {
  return p.replace(/\\/g, '/').toLowerCase();
}

function isPublicFile(rel) {
  const p = lowered(rel);
  return p.startsWith('app/') || p.startsWith('components/') || p.startsWith('public/') || p.startsWith('content/');
}

function isInternalDoc(rel) {
  const p = lowered(rel);
  return p.startsWith('docs/flagship-transformation/') || p === 'readme.md' || p === 'agents.md' || p === 'claude.md';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRegex(phrase) {
  const base = phrase.toLowerCase();
  if (base === '$0') return /\$0/gi;

  const tokens = base
    .split(/\s+/)
    .map(escapeRegExp)
    .map((token) => token);

  const body = tokens.join('[\\s\-–—]+');
  return new RegExp(`(?<![a-z0-9_])${body}(?![a-z0-9_])`, 'gi');
}

function normalizeText(text) {
  return text
    .replace(/\u2011|\u2012|\u2013|\u2014|\u2015/g, '-')
    .replace(/[\r]+/g, '\n')
    .toLowerCase();
}

function collectFiles(baseDir) {
  const stack = [baseDir];
  const files = [];

  while (stack.length) {
    const current = stack.pop();
    const rel = lowered(path.relative(ROOT, current));
    const name = path.basename(current);
    if (EXCLUDE_DIRS.has(name) || EXCLUDE_DIRS.has(rel)) {
      continue;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const fullRel = lowered(path.relative(ROOT, full));

      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name) || EXCLUDE_DIRS.has(fullRel)) continue;
        stack.push(full);
        continue;
      }

      if (!entry.isFile()) continue;
      if (EXCLUDE_FILES.has(fullRel)) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!INCLUDE_EXT.has(ext)) continue;

      const allowed = INCLUDE_DIRS.some((d) => lowered(d) === '.' || fullRel === lowered(d) || fullRel.startsWith(`${lowered(d)}/`));
      if (!allowed) continue;

      files.push(full);
    }
  }

  return files;
}

const phraseRegexes = phrases.map((phrase) => ({ phrase, regex: buildRegex(phrase) }));
const phraseState = new Map(phrases.map((p) => [p, { exact_count: 0, files: new Map(), source_files: [], public_count: 0, internal_document_count: 0 }]));

const files = collectFiles(ROOT);
for (const file of files) {
  const rel = lowered(path.relative(ROOT, file));
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const normalized = normalizeText(text);
  for (const item of phraseRegexes) {
    const state = phraseState.get(item.phrase);
    const regex = new RegExp(item.regex.source, item.regex.flags);
    const hits = normalized.match(regex);
    if (!hits) continue;

    const count = hits.length;
    state.exact_count += count;
    state.files.set(rel, (state.files.get(rel) || 0) + count);
  }
}

const rows = [
  ['phrase', 'exact_count', 'file_count', 'source_files', 'public_count', 'internal_document_count', 'assessment']
];

for (const item of phraseRegexes) {
  const state = phraseState.get(item.phrase);
  const sourceFiles = [...state.files.keys()].sort();

  let publicCount = 0;
  let internalCount = 0;
  for (const file of sourceFiles) {
    if (isPublicFile(file)) publicCount += 1;
    if (isInternalDoc(file)) internalCount += 1;
  }
  state.public_count = publicCount;
  state.internal_document_count = internalCount;
  state.source_files = sourceFiles;

  let assessment = 'low repetition';
  if (state.exact_count >= 20) {
    assessment = 'high repetition';
  } else if (state.exact_count >= 8) {
    assessment = 'moderate repetition';
  } else if (state.exact_count >= 2) {
    assessment = 'repeated';
  }

  rows.push([
    item.phrase,
    String(state.exact_count),
    String(state.files.size),
    state.source_files.join('; '),
    String(publicCount),
    String(internalCount),
    assessment,
  ]);
}

function csvEscape(v) {
  const escaped = String(v).replace(/"/g, '""');
  return `"${escaped}"`;
}

fs.writeFileSync('docs/flagship-transformation/evidence/claims/phrase-frequency.csv', rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n', 'utf8');

console.log(JSON.stringify({
  analyzed: phrases.length,
  includedFiles: files.length,
  excludedDirPrefixes: [...EXCLUDE_DIRS],
  excludedFiles: [...EXCLUDE_FILES],
  source: 'docs/flagship-transformation/evidence/claims/phrase-frequency.csv'
}, null, 2));
