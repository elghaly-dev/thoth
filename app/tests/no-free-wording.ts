/**
 * Fails (exit 1) if "free" wording appears in any user-visible string, in any
 * interface language.
 *
 * Checked (values only; keys and code identifiers are never scanned):
 * - every StringKey through t(lang, key) for every SUPPORTED_LANGUAGES locale
 * - the per-language Voice tab greetings (GREETINGS)
 * - index.html <title> and every meta content="..." value
 * - metadata.json name and description
 * - the model system prompt (THOTH_SYSTEM_INSTRUCTION in server.ts), since its
 *   wording flows into replies
 *
 * Patterns: English "free" as a whole word, case-insensitive (so "freight" and
 * "freedom" do not match), plus the "free" words of the other UI languages:
 * 免费, निःशुल्क, मुफ़्त/मुफ्त, मोफत, મફત, இலவச, বিনামূল্যে, ఉచిత, ਮੁਫ਼ਤ/ਮੁਫਤ, مجاني/مجانًا/بلا مقابل.
 *
 * Run: npm run test:nofree   (tsx tests/no-free-wording.ts)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { t, EN_ALL, GREETINGS, type StringKey } from '../src/i18n';
import { SUPPORTED_LANGUAGES } from '../src/types/index';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'free', re: /\bfree\b/i },
  { name: '免费', re: /免费/ },
  { name: 'निःशुल्क', re: /निःशुल्क/ },
  { name: 'मुफ़्त', re: /मुफ़्त|मुफ्त/ },
  { name: 'मोफत', re: /मोफत/ },
  { name: 'મફત', re: /મફત/ },
  { name: 'இலவச', re: /இலவச/ },
  { name: 'বিনামূল্যে', re: /বিনামূল্যে/ },
  { name: 'ఉచిత', re: /ఉచిత/ },
  { name: 'ਮੁਫ਼ਤ', re: /ਮੁਫ਼ਤ|ਮੁਫਤ/ },
  { name: 'مجاني', re: /مجان|بلا مقابل|ببلاش/ },
];

const hits: string[] = [];
let checked = 0;
function check(where: string, text: string) {
  checked++;
  for (const p of PATTERNS) if (p.re.test(text)) hits.push(`${where} [${p.name}]: ${text}`);
}

// 1. UI string tables, every locale x every key.
const keys = Object.keys(EN_ALL) as StringKey[];
for (const l of SUPPORTED_LANGUAGES) for (const k of keys) check(`${l.code}:${k}`, t(l.code, k));

// 2. Greetings.
for (const [code, text] of Object.entries(GREETINGS)) check(`greeting:${code}`, text);

// 3. index.html visible metadata.
const html = readFileSync(join(root, 'index.html'), 'utf8');
const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
check('index.html:<title>', title);
for (const m of html.matchAll(/\bcontent="([^"]*)"/g)) check('index.html:meta content', m[1]);

// 4. metadata.json.
const meta = JSON.parse(readFileSync(join(root, 'metadata.json'), 'utf8')) as Record<string, unknown>;
for (const f of ['name', 'description']) if (typeof meta[f] === 'string') check(`metadata.json:${f}`, meta[f] as string);

// 5. Model system prompt.
const server = readFileSync(join(root, 'server.ts'), 'utf8');
const prompt = server.match(/const THOTH_SYSTEM_INSTRUCTION = `([\s\S]*?)`;/)?.[1];
if (!prompt) {
  console.error('no-free-wording: could not find THOTH_SYSTEM_INSTRUCTION in server.ts');
  process.exit(1);
}
prompt.split('\n').forEach((line, i) => line.trim() && check(`server.ts:prompt line ${i}`, line));

console.log(`no-free-wording: checked ${checked} strings (${SUPPORTED_LANGUAGES.length} locales x ${keys.length} keys, greetings, index.html, metadata.json, system prompt).`);
if (hits.length) {
  console.error(`no-free-wording: FAIL -- ${hits.length} hit(s):`);
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}
console.log('no-free-wording: PASS');
