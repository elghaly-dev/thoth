/**
 * Locale parity for the Indian-language tables (i18n-locales.ts).
 * Fails when a locale:
 * - is missing any EN key (all 296, not only the first-screen set) or has a key EN lacks;
 * - uses a {placeholder} that EN does not have (dropping one is allowed);
 * - is in the wrong script (e.g. a Devanagari letter in Bengali text; the
 *   danda "।" / "॥" is shared punctuation and allowed);
 * - leaves the English text unchanged for a translated key.
 * Also checks every greeting and that <html lang> follows the UI language.
 * Prints per-locale coverage (keys still on the English fallback).
 * Run: npm run test:locales
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN_ALL, GREETINGS, tx, type StringKey } from '../src/i18n';
import { LOCALE_TABLES, LOCALE_CORE_KEYS } from '../src/i18n-locales';
import type { LanguageCode } from '../src/types';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks++;
  if (!ok) fails.push(msg);
};

// Script ranges (letters). Danda U+0964/U+0965 is shared punctuation.
const SCRIPTS: Record<string, RegExp> = {
  hi: /[ऀ-ॣ०-ॿ]/,
  mr: /[ऀ-ॣ०-ॿ]/,
  bn: /[ঀ-৿]/,
  pa: /[਀-੿]/,
  gu: /[઀-૿]/,
  ta: /[஀-௿]/,
  te: /[ఀ-౿]/,
};
const ALL_INDIC = /[ऀ-ॣ०-ൿ]/g;
const placeholders = (s: string) => (s.match(/\{[a-z]+\}/gi) || []).sort().join(',');

function wrongScript(code: string, text: string): string[] {
  const own = SCRIPTS[code];
  return (text.match(ALL_INDIC) || []).filter((ch) => !own.test(ch));
}

const enKeys = new Set(Object.keys(EN_ALL));
for (const [code, own] of Object.entries(SCRIPTS)) {
  const table = LOCALE_TABLES[code as LanguageCode] || {};
  for (const key of LOCALE_CORE_KEYS) {
    const v = table[key as StringKey];
    check(typeof v === 'string' && v.length > 0, `${code}: first-screen key ${key} is translated`);
  }
  for (const key of enKeys) {
    const v = table[key as StringKey];
    check(typeof v === 'string' && v.length > 0, `${code}: key ${key} is translated (no English fallback)`);
  }
  for (const [key, value] of Object.entries(table)) {
    check(enKeys.has(key), `${code}: key ${key} exists in EN`);
    const en = EN_ALL[key as StringKey];
    // A locale may drop a placeholder (Hindi says the language once, without
    // the doubled English name) but may never invent one.
    const enPh = new Set(placeholders(en).split(',').filter(Boolean));
    check(placeholders(value as string).split(',').filter(Boolean).every((p) => enPh.has(p)), `${code}.${key}: placeholders are a subset of EN (${placeholders(en)})`);
    const bad = wrongScript(code, value as string);
    check(bad.length === 0, `${code}.${key}: only ${code} script letters (found ${bad.join('')})`);
    check(own.test(value as string) || /^[A-Za-z ]+$/.test(en), `${code}.${key}: written in ${code} script`);
    check(value !== en || /^[A-Za-z ]+$/.test(en), `${code}.${key}: not left in English`);
  }
  const g = GREETINGS[code as LanguageCode];
  const badG = wrongScript(code, g);
  check(own.test(g) && badG.length === 0, `${code}: greeting in ${code} script only (found ${badG.join('')})`);

  // tx uses the table, and falls back to English for keys it lacks
  check(tx(code as LanguageCode, 'consent.title') === table['consent.title'], `${code}: tx reads the locale table`);
  const missing = [...enKeys].filter((k) => !(k in table));
  console.log(`  ${code}: ${Object.keys(table).length}/${enKeys.size} keys translated, ${missing.length} on English fallback [VERIFY]`);
}

// Bengali stray Devanagari (Instinct A6): the greeting and every bn string
check(!/[ऀ-ॣ०-ॿ]/.test(GREETINGS.bn), 'bn greeting has no Devanagari letter');

// <html lang> follows the UI language
const app = fs.readFileSync(path.join(APP, 'src', 'App.tsx'), 'utf8');
check(/document\.documentElement\.lang = lang === 'zh' \? 'zh-CN' : lang;/.test(app), 'App sets <html lang> on language switch');
const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
check(/<html lang="[a-z-]+"/.test(html), 'index.html has a default <html lang>');

if (fails.length) {
  console.log(`locale-parity: FAIL ${fails.length}/${checks}`);
  for (const f of fails.slice(0, 40)) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`locale-parity: PASS ${checks}/${checks}`);
