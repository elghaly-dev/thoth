/**
 * Smoke test: banned words in locale strings (Thoth PR #5).
 *
 * Loads every UI string through the app's own loader, t(lang, key), for
 * every locale in SUPPORTED_LANGUAGES and every StringKey, and fails
 * (non-zero exit) if any loaded string contains a banned word.
 *
 * Banned words (case-insensitive, checked against every loaded string):
 * - "live" as a whole word (so "delivery" does not false-positive)
 * - "guaranteed" as a whole word
 * - "profit"/"profits" as a whole word
 * - "compliance audit" as the two-word phrase
 * - "as they happen" as a phrase
 * - ZH: 实时, 保证 (but not 保证金, the legitimate customs-bond term),
 *   利润, 合规审核
 *
 * Run: npm run test:smoke   (tsx tests/smoke-locales.ts)
 *
 * Key list: derived from EN_ALL (exported from src/i18n.ts) with
 * Object.keys(EN_ALL), so a key added to the tables later is covered
 * automatically. Each key is asserted to resolve to a non-empty string,
 * so a removed or renamed key fails loudly. The ZH table is
 * Record<StringKey, string>, which the compiler forces to carry exactly
 * the StringKey set.
 *
 * NOT covered here: the per-locale greetings in
 * src/components/VoiceAssistantTab.tsx -- that record is function-local
 * (inside a useEffect) and cannot be imported. To cover it, move it to
 * module scope and export it, then import it here.
 */
import { t, EN_ALL, type StringKey } from '../src/i18n';
import { SUPPORTED_LANGUAGES } from '../src/types/index';

const STRING_KEYS: StringKey[] = Object.keys(EN_ALL) as StringKey[];

const BANNED: { name: string; pattern: RegExp }[] = [
  { name: 'live', pattern: /\blive\b/i },
  { name: 'guaranteed', pattern: /\bguaranteed\b/i },
  { name: 'profit', pattern: /\bprofits?\b/i },
  { name: 'compliance audit', pattern: /compliance\s+audit/i },
  { name: 'as they happen', pattern: /as\s+they\s+happen/i },
  // ZH patterns. 保证 uses a negative lookahead so 保证金 (customs bond,
  // a legitimate string) does not false-positive.
  { name: '实时', pattern: /实时/ },
  { name: '保证', pattern: /保证(?!金)/ },
  { name: '利润', pattern: /利润/ },
  { name: '合规审核', pattern: /合规审核/ },
];

let checked = 0;
const failures: string[] = [];

for (const { code } of SUPPORTED_LANGUAGES) {
  for (const key of STRING_KEYS) {
    const value = t(code, key);
    if (typeof value !== 'string' || value.length === 0) {
      failures.push(`${code} ${key}: missing/empty string`);
      continue;
    }
    checked += 1;
    for (const banned of BANNED) {
      if (banned.pattern.test(value)) {
        failures.push(`${code} ${key} [${banned.name}]: ${JSON.stringify(value)}`);
      }
    }
  }
}

console.log(
  `smoke-locales: checked ${checked} strings across ${SUPPORTED_LANGUAGES.length} locales (${SUPPORTED_LANGUAGES.map((l) => l.code).join(', ')}) -- tables: EN + ZH only; other locales fall back to EN.`,
);
if (failures.length > 0) {
  console.error(`smoke-locales: FAIL -- ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('smoke-locales: PASS -- no banned words in any loaded string.');
