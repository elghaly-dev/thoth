import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const REPO = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');

// Patterns that would mean a real key was committed or bundled.
const FORBIDDEN: { name: string; pattern: RegExp }[] = [
  { name: 'google-api-key', pattern: /\bAIza[0-9A-Za-z\-_]{20,}\b/ },
  { name: 'pem-block', pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { name: 'generic-secret-assignment', pattern: /\bGEMINI_API_KEY\s*=\s*['"][^'"]+['"]/ },
];

const SKIP_DIR = new Set([
  'node_modules',
  '.git',
  'coverage',
]);

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
}

const files: string[] = [];
walk(ROOT, files);
// Also scan the published Pages folder and the landing root, when present.
for (const extra of [join(REPO, 'use'), join(REPO, 'index.html'), join(REPO, 'README.md')]) {
  try {
    const st = statSync(extra);
    if (st.isDirectory()) walk(extra, files);
    else files.push(extra);
  } catch {
    // Optional paths (use/ exists only after build:pages).
  }
}

const failures: string[] = [];
let scanned = 0;
for (const file of files) {
  if (file.endsWith('.map')) continue;
  if (file.endsWith('.png') || file.endsWith('.ico') || file.endsWith('.woff2')) continue;
  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  scanned += 1;
  for (const banned of FORBIDDEN) {
    if (banned.pattern.test(text)) {
      failures.push(`${relative(REPO, file)} [${banned.name}]`);
    }
  }
}

if (failures.length > 0) {
  console.error(`no-secrets: FAIL -- ${failures.length} hit(s) in ${scanned} files:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`no-secrets: PASS -- scanned ${scanned} text files, no committed or bundled keys.`);
