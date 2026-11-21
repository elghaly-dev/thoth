/**
 * test:keys — the three audience languages: Hindi (default), Arabic, Chinese.
 * Fails when a table:
 * - misses an EN key, has a key EN lacks, has an empty value, or invents a
 *   {placeholder} EN does not have;
 * - is in the wrong script (a string with letters must contain its own script);
 * - describes the key as kept in a tab or browser storage (it lives in page
 *   memory only and is forgotten on reload), or names "Google Studio" /
 *   "Google AI Studio" (say "Google");
 * - contains "free" wording or a standalone "AI".
 * Also: switcher order हिन्दी · العربية · 中文, Hindi default, Arabic is RTL.
 * Run: npm run test:keys
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN_ALL, tx, GREETINGS, type StringKey } from '../src/i18n';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../src/types';
import { LOCALE_TABLES } from '../src/i18n-locales';
import { ZH_STRINGS } from '../src/i18n';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };

const tables: Record<string, Record<string, string>> = {
  hi: LOCALE_TABLES.hi as Record<string, string>,
  ar: LOCALE_TABLES.ar as Record<string, string>,
  zh: ZH_STRINGS as Record<string, string>,
};
const SCRIPT: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, ar: /[؀-ۿ]/, zh: /[一-鿿]/ };
const TAB = /this tab|browser tab|टैब|علامة التبويب|التبويب|标签页|浏览器存储中|长期浏览器存储/i;
const STUDIO = /Google (AI )?Studio|استوديو Google|Google 工作室/i;
const FREE = /\bfree\b|मुफ़्त|मुफ्त|निःशुल्क|مجان|ببلاش|免费/i;
const AI = /\bAI\b|ذكاء اصطناعي|人工智能/;
const MEMORY: Record<string, RegExp> = { hi: /मेमोरी/, ar: /ذاكرة/, zh: /内存/ };
const ph = (s: string) => (s.match(/\{[a-z]+\}/gi) || []);
const enKeys = Object.keys(EN_ALL);

for (const [code, t] of Object.entries(tables)) {
  check(!!t, `${code}: table exists`);
  if (!t) continue;
  for (const k of enKeys) {
    const v = t[k];
    check(typeof v === 'string' && v.trim().length > 0, `${code}.${k}: present and non-empty`);
    if (typeof v !== 'string') continue;
    const enPh = new Set(ph((EN_ALL as Record<string, string>)[k]));
    check(ph(v).every((p) => enPh.has(p)), `${code}.${k}: placeholders subset of EN`);
    const letters = v.replace(/\{[a-z]+\}/gi, '').replace(/\b(Thoth|Gemini|Google|API|FOB|CIF|DDP|EXW|MOQ|HS|HTS|USD|INR|Zoom|WhatsApp|LinkedIn|Faithful Servant|Incoterms?|L\/C|B\/L|FDA|FSSAI|ISO|CE|USDA|Organic|SGS|Intertek|ISPM|TXT|Chrome|Edge|PAN|GSTIN|MSME|x\d+)\b/g, '');
    if (/\p{L}/u.test(letters)) check(SCRIPT[code].test(v), `${code}.${k}: written in ${code} script`);
    check(!TAB.test(v), `${code}.${k}: no tab/browser-storage wording for the key`);
    check(!STUDIO.test(v), `${code}.${k}: says "Google", not "Google Studio"`);
    check(!FREE.test(v), `${code}.${k}: no free wording`);
    check(!AI.test(v), `${code}.${k}: no "AI"`);
  }
  for (const k of Object.keys(t)) check(k in EN_ALL, `${code}: key ${k} exists in EN`);
  check(MEMORY[code].test(t['key.body'] || '') && MEMORY[code].test(t['key.saved'] || ''), `${code}: key text says page memory`);
  check(SCRIPT[code].test(GREETINGS[code as LanguageCode]), `${code}: greeting in ${code} script`);
  check(tx(code as LanguageCode, 'key.body') === t['key.body'], `${code}: tx reads the table`);
}
// English source follows the same key wording.
for (const k of ['key.body', 'key.saved', 'key.save', 'key.staysInTab', 'key.whereToGet'] as StringKey[]) {
  const v = (EN_ALL as Record<string, string>)[k];
  check(!TAB.test(v) && !STUDIO.test(v), `en.${k}: no tab / Studio wording`);
}

check(SUPPORTED_LANGUAGES.slice(0, 3).map((l) => l.nativeName).join(' · ') === 'हिन्दी · العربية · 中文', 'switcher order: हिन्दी · العربية · 中文');
check(SUPPORTED_LANGUAGES[0].code === 'hi', 'Hindi is the default');
const app = fs.readFileSync(path.join(APP, 'src', 'App.tsx'), 'utf8');
check(/document\.documentElement\.dir = lang === 'ar' \? 'rtl' : 'ltr';/.test(app), 'Arabic switches the page to RTL');
const loc = fs.readFileSync(path.join(APP, 'src', 'i18n-locales.ts'), 'utf8');
const arBlock = loc.slice(loc.indexOf('const AR: LocaleTable = {'), loc.indexOf('\n};', loc.indexOf('const AR: LocaleTable = {')));
check(arBlock.split('\n').filter((l) => /^\s+"/.test(l)).every((l) => l.includes('/* [VERIFY] */')), 'every Arabic line is marked [VERIFY]');

// ---- Static pages: landing, 404, agent (?lang=ar / ?lang=zh; Hindi default) ----
const ROOT = path.dirname(APP);
const sw = fs.readFileSync(path.join(ROOT, 'lang-switch.js'), 'utf8');
const swT = new Function('return ' + sw.slice(sw.indexOf('var T = ') + 8, sw.indexOf(';\n  var LANGS')))() as Record<string, Record<string, string>>;
const allKeys = new Set<string>();
for (const rel of ['index.html', '404.html', 'agent/index.html']) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  check(/<html lang="hi"/.test(html), `${rel}: Hindi default`);
  check(html.includes('<script src="/lang-switch.js"></script>'), `${rel}: language switch script`);
  const nav = (/<nav class="langs"[\s\S]*?<\/nav>/.exec(html) || [''])[0];
  check(nav.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() === 'हिन्दी · العربية · 中文', `${rel}: switcher reads हिन्दी · العربية · 中文`);
  for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) allKeys.add(m[1]);
  const t = (/data-i18n-title="([^"]+)"/.exec(html) || [])[1];
  if (t) allKeys.add(t);
}
for (const code of ['ar', 'zh']) {
  for (const k of allKeys) check(typeof swT[code]?.[k] === 'string' && swT[code][k].length > 0, `lang-switch ${code}.${k} present`);
  for (const [k, v] of Object.entries(swT[code] || {})) {
    if (!/^[.。]$/.test(v) && k !== 'name') check(SCRIPT[code].test(v), `lang-switch ${code}.${k}: ${code} script`);
    check(!FREE.test(v) && !AI.test(v) && !TAB.test(v) && !STUDIO.test(v), `lang-switch ${code}.${k}: wording`);
  }
}
check(!/Elghaly|Wyndham/.test(JSON.stringify(swT)), 'lang-switch never translates the credits');
const page = await import(path.join(ROOT, 'agent', 'thoth-page.js'));
for (const code of ['ar', 'zh']) {
  const d = page.DISPLAY[code];
  check(d.tools.length === page.App.GUIDE.tools.length && d.charter.length === page.App.GUIDE.charter.length && d.cannot.length === page.App.GUIDE.cannot.length && d.languages.length === page.App.GUIDE.languages.length, `agent ${code}: same facts as Hindi`);
  for (const v of [...d.tools.flatMap((x: { name: string; does: string }) => [x.name, x.does]), ...d.charter, ...d.cannot, ...d.languages]) {
    check(SCRIPT[code].test(v) && !FREE.test(v) && !AI.test(v), `agent ${code}: ${String(v).slice(0, 30)}`);
  }
}
const siteSrc = fs.readFileSync(path.join(ROOT, 'agent', 'site.js'), 'utf8');
const siteText = new Function('return ' + siteSrc.slice(siteSrc.indexOf('static TEXT = ') + 14, siteSrc.indexOf('};\n\n  /** The page text') + 1))() as Record<string, Record<string, string>>;
for (const code of ['hi', 'ar', 'zh']) {
  for (const [k, v] of Object.entries(siteText[code])) check(SCRIPT[code].test(v) && !FREE.test(v) && !AI.test(v), `agent site.js ${code}.${k}`);
}

if (fails.length) {
  console.log(`keys-guard: FAIL ${fails.length}/${checks}`);
  for (const f of fails.slice(0, 40)) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`keys-guard: PASS ${checks}/${checks}`);
