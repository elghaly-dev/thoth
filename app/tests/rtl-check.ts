/**
 * RTL / Arabic check (Arabic work order 2026-11-20).
 *
 * Fails (exit 1) unless all of these hold:
 * - 'ar' is a supported language, native name العربية, speech code ar-EG;
 * - RTL_LANGS marks exactly 'ar' as right-to-left;
 * - the app keeps Hindi as the default language (SUPPORTED_LANGUAGES[0]);
 * - App.tsx sets document.documentElement.dir from RTL_LANGS on every
 *   language switch, so Arabic renders RTL and switching back to Hindi or
 *   any other language restores LTR;
 * - the Arabic table covers every EN key with matching {placeholders}
 *   (the ar/hi key-parity requirement);
 * - no banned wording in Arabic strings after tashkeel/tatweel/digit
 *   normalization: free / مجاني / ببلاش / بالمجان, standalone "AI",
 *   Al Jazeera (normalization is for DETECTING banned variants written
 *   with diacritics or Arabic-Indic digits; those digits are NOT banned
 *   in normal Arabic UI);
 * - lists the Arabic strings that mix Latin names or amounts (INR/EGP,
 *   brand terms, counts) so the runtime pass can verify their bidi
 *   ordering and isolation on the rendered page - that visual check is
 *   NOT covered here and stays pending execution approval.
 *
 * Run: npm run test:rtl   (tsx tests/rtl-check.ts)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN_ALL, RTL_LANGS, tx, type StringKey } from '../src/i18n';
import { LOCALE_TABLES } from '../src/i18n-locales';
import { SUPPORTED_LANGUAGES } from '../src/types';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks++;
  if (!ok) fails.push(msg);
};

// Language registration and default.
const ar = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
check(!!ar, "ar is in SUPPORTED_LANGUAGES");
check(ar?.nativeName === 'العربية', "ar native name is العربية");
check(ar?.speechCode === 'ar-EG', "ar speech code is ar-EG");
check(SUPPORTED_LANGUAGES[0].code === 'hi', 'Hindi stays the default language');
check(RTL_LANGS.has('ar') && RTL_LANGS.size === 1, "RTL_LANGS marks exactly 'ar'");

// dir switching in App.tsx (covers hi -> ar and ar -> hi).
const app = fs.readFileSync(path.join(APP, 'src', 'App.tsx'), 'utf8');
check(
  /document\.documentElement\.dir = RTL_LANGS\.has\(lang\) \? 'rtl' : 'ltr';/.test(app),
  'App.tsx sets <html dir> from RTL_LANGS on language switch',
);

// Static pages (landing, 404, agent): Hindi is the default document
// language and each carries an hi/ar/en switch whose Arabic choice sets
// dir="rtl"; the hi <-> ar round-trip restores lang and dir.
const ROOT = path.dirname(APP);
for (const rel of ['index.html', '404.html', 'agent/index.html']) {
  const page = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  check(/<html lang="hi">/.test(page), `${rel}: default <html lang="hi">`);
  check(
    /document\.documentElement\.dir = \(code === 'ar'\) \? 'rtl' : 'ltr';/.test(page),
    `${rel}: language switch sets dir rtl for ar and ltr otherwise`,
  );
  check(/document\.documentElement\.lang = code;/.test(page), `${rel}: language switch sets <html lang>`);
  check(page.includes('data-lang="ar"'), `${rel}: offers the Arabic option`);
  check(page.includes('apply(stored || \'hi\')'), `${rel}: falls back to Hindi, not Arabic or English`);
}

// Normalization for banned-word and digit checks.
const normalizeArabic = (s: string) => s
  .replace(/[ً-ْٰـ]/g, '')
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
  .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
const BANNED: { name: string; re: RegExp }[] = [
  { name: 'free', re: /\bfree\b/i },
  { name: 'مجاني', re: /مجاني/ },
  { name: 'ببلاش', re: /ببلاش/ },
  { name: 'بالمجان', re: /بالمجان/ },
  { name: 'मुफ़्त', re: /मुफ़्त/ },
  { name: 'AI', re: /\bAI\b/ },
  { name: 'Al Jazeera', re: /al\s*jazeera|الجزيرة/i },
];

// Rule 4 is every-language with NO exemptions: scan every locale table's
// values, the static pages, and the agent runtime's user-visible strings.
const scanBanned = (label: string, text: string) => {
  const nv = normalizeArabic(text);
  for (const b of BANNED) check(!b.re.test(nv), `${label}: banned wording [${b.name}]`);
};

const placeholders = (s: string) => (s.match(/\{[a-z]+\}/gi) || []).sort().join(',');
const table = LOCALE_TABLES.ar || {};
const enKeys = Object.keys(EN_ALL) as StringKey[];
check(Object.keys(table).length === enKeys.length, `ar covers every EN key (${Object.keys(table).length}/${enKeys.length})`);

for (const key of enKeys) {
  const v = table[key];
  check(typeof v === 'string' && v.length > 0, `ar.${key}: translated`);
  if (typeof v !== 'string') continue;
  const en = EN_ALL[key];
  check(placeholders(v) === placeholders(en), `ar.${key}: placeholders match EN (${placeholders(en)})`);
}

// Banned wording, every language, no exemptions.
for (const key of enKeys) scanBanned(`en.${key}`, EN_ALL[key]);
for (const [lang, t] of Object.entries(LOCALE_TABLES)) {
  for (const key of enKeys) {
    const v = (t as Record<string, string>)[key];
    if (typeof v === 'string') scanBanned(`${lang}.${key}`, v);
  }
}
for (const rel of ['index.html', '404.html', 'agent/index.html', 'agent/thoth-page.js', 'agent/site.js', 'agent/runtime/ui.js', 'agent/runtime/llm.js', 'agent/runtime/engine.js', 'agent/runtime/index.js']) {
  scanBanned(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

// Bidi follow-up list: Arabic strings mixing Latin names or amounts need a
// rendered-page check (ordering/isolation of INR/EGP, counts, brand terms).
// Listed here, verified visually at runtime - not asserted by this test.
const mixed = enKeys.filter((key) => {
  const v = table[key];
  return typeof v === 'string' && /[\u0600-\u06FF]/.test(v) && /[A-Za-z0-9]/.test(v);
});
console.log(`rtl-check: ${mixed.length} ar strings mix Arabic with Latin/digits - verify bidi rendering at runtime:`);
for (const k of mixed.slice(0, 20)) console.log('  bidi-review | ' + k);

// tx() actually resolves Arabic (no silent English fallback on a known key).
check(tx('ar', 'app.tabGuide') === table['app.tabGuide'], 'tx reads the ar table');

if (fails.length) {
  console.log(`rtl-check: FAIL ${fails.length}/${checks}`);
  for (const f of fails.slice(0, 40)) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`rtl-check: PASS ${checks}/${checks}`);
