/**
 * Fails (exit 1) if banned wording appears in any user-visible string, in any
 * interface language: "free", "safe" (also safety/safely/unsafe), the word
 * "AI", "only", "%", "Lillah", «فقط», and their Arabic equivalents (مجاني, آمن/أمان, ذكاء اصطناعي). The
 * assistant is «الغالي» in every language; its old names fail the check (section 3c).
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
import { DEAL_TABLES } from '../src/deal/strings';
import { RFQ_TABLES } from '../src/deal/rfq-strings';
import { renderRfq, RFQ_LANGS } from '../src/deal/rfq';
import { renderQuote, QUOTE_LANGS } from '../src/deal/deal';

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
  { name: 'safe', re: /safe/i },
  { name: 'AI', re: /\bA\.?I\b\.?/ },
  { name: 'آمن', re: /آمن|(^|[^\p{L}])(?:ال|ب|و)?أمان(?![\p{L}])/u },
  { name: 'only', re: /\bonly\b/i },
  { name: 'فقط', re: /فقط/ },
  { name: 'Lillah', re: /\blillah\b|(^|[\s«"(])لله([\s»".,،:)]|$)/iu },
  { name: '%', re: /%|٪/ },
  { name: 'ذكاء اصطناعي', re: /ذكاء\s*(ال)?اصطناعي|人工智能/ },
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

// 2b. Deal in a Minute and RFQ strings, and the fixed quote / RFQ templates.
for (const [tag, tables] of [['deal', DEAL_TABLES], ['rfq', RFQ_TABLES]] as const) {
  for (const [code, tbl] of Object.entries(tables)) for (const [k, v] of Object.entries(tbl)) check(`${tag}:${code}:${k}`, v as string);
}
const sample = { product: 'Brass lamps', quantity: '500', unit: 'pieces', moq: '100', price: '12', currency: 'USD', priceUnit: 'per piece', incoterm: 'FOB', port: 'Mumbai', leadTimeDays: '30', payment: 'advance', validityDays: '15' };
for (const l of QUOTE_LANGS) check(`quote template:${l}`, renderQuote(sample as never, l));
for (const l of RFQ_LANGS) check(`rfq template:${l}`, renderRfq(sample as never, l));

// 3b. Static pages users see: visible text and attribute values that render
// (title, alt, aria-label, content, placeholder).
const repo = join(root, '..');
for (const rel of ['index.html', 'ar/index.html', '404.html', 'agent/index.html', 'privacy/index.html', 'ar/privacy/index.html']) {
  const page = readFileSync(join(repo, rel), 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  for (const m of page.matchAll(/\b(?:content|alt|aria-label|title|placeholder)="([^"]*)"/g)) check(`${rel}:attr`, m[1]);
  page.replace(/<[^>]+>/g, '\n').split('\n').map((x) => x.trim()).filter(Boolean).forEach((line) => check(`${rel}:text`, line));
}
for (const rel of ['manifest.webmanifest', 'app/public/site.webmanifest']) {
  const mf = JSON.parse(readFileSync(join(repo, rel), 'utf8')) as Record<string, unknown>;
  for (const f of ['name', 'short_name', 'description']) if (typeof mf[f] === 'string') check(`${rel}:${f}`, mf[f] as string);
}

// 3c. The assistant is «الغالي» in every language: never "Thoth", never a transliteration,
// never its old names (Elghaly, Faithful Servant, «الخادم الأمين», «वफ़ादार सेवक»).
const OLD_NAME = /Elghaly(?!\s+LLC)|Faithful Servant|الخادم الأمين|वफ़ादार सेवक|एल्घाली|એલ્ઘાલી|এলঘালি|எல்கலி|ఎల్ఘాలీ|ਐਲਘਾਲੀ/;
for (const k of ['app.tabAssistant', 'voice.title', 'orb.thinking', 'voice.thothServant', 'guide.askBtn'] as StringKey[]) {
  for (const lang of SUPPORTED_LANGUAGES) {
    const v = t(lang.code, k);
    checked++;
    if (/Thoth/.test(v) || !/الغالي/.test(v)) hits.push(`${lang.code}:${k} [assistant name must be «الغالي»]: ${v}`);
  }
}
for (const lang of SUPPORTED_LANGUAGES) for (const k of keys) { const v = t(lang.code, k); if (OLD_NAME.test(v)) hits.push(`${lang.code}:${k} [old assistant name]: ${v}`); }
for (const [code, text] of Object.entries(GREETINGS)) {
  if (OLD_NAME.test(text) || !text.includes('الغالي')) hits.push(`greeting:${code} [assistant name must be «الغالي»]: ${text}`);
}
for (const [code, text] of Object.entries(GREETINGS)) {
  if (/Thoth|Namaste/.test(text) && (code === 'en' || code === 'ar')) hits.push(`greeting:${code} [no Namaste/Thoth]: ${text}`);
}
if (!/^نهارك سعيد/.test(GREETINGS.ar)) hits.push('greeting:ar should open with «نهارك سعيد»');
if (!/^Good day/.test(GREETINGS.en)) hits.push('greeting:en should open with "Good day"');
// Trade app, no religion: no religious greetings in any locale or app string.
const RELIGIOUS = /السلام عليكم|ورحمة الله|بسم الله|Namaste|नमस्ते|नमस्कार|નમસ્તે|নমস্কার|నమస్కారం|வணக்கம்|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ|Assalam|As-salam|Salaam|Peace be upon|Shalom/i;
for (const [code, text] of Object.entries(GREETINGS)) if (RELIGIOUS.test(text)) hits.push(`greeting:${code} [religious greeting]: ${text}`);
for (const lang of SUPPORTED_LANGUAGES) for (const k of keys) { const v = t(lang.code, k); if (RELIGIOUS.test(v)) hits.push(`${lang.code}:${k} [religious greeting]: ${v}`); }

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
