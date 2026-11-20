/**
 * Key-parity check for Simplified Chinese (zh-CN).
 *
 * Every English UI key (EN_ALL) must have a non-empty ZH value with the same
 * {placeholders}; ZH must carry no extra keys; ZH must not use free / safe
 * wording (免费, 安全). Exits 1 on any problem.
 *
 * Run: npm run test:zh   (tsx tests/zh-parity.ts)
 */
import { EN_ALL, ZH_STRINGS } from '../src/i18n';

const EN = EN_ALL as Record<string, string>;
const ZH = ZH_STRINGS as Record<string, string>;
const en = Object.keys(EN);
const zh = Object.keys(ZH);
const zhSet = new Set(zh);
const enSet = new Set(en);

const missing = en.filter((k) => !zhSet.has(k));
const extra = zh.filter((k) => !enSet.has(k));
const empty = zh.filter((k) => !String(ZH[k] ?? '').trim());
const ph = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join(',');
const placeholderMismatch = en.filter((k) => zhSet.has(k) && ph(EN[k]) !== ph(ZH[k]));
const banned = zh.filter((k) => /免费|安全|\bfree\b|\bsafe\b/i.test(ZH[k]));
const noCjk = zh.filter((k) => !/[\u4e00-\u9fff]/.test(ZH[k]));

const list = (a: string[]) => (a.length ? ` -> ${a.join(', ')}` : '');
console.log(`EN keys: ${en.length}`);
console.log(`ZH keys: ${zh.length}`);
console.log(`missing in ZH: ${missing.length}${list(missing)}`);
console.log(`extra in ZH: ${extra.length}${list(extra)}`);
console.log(`empty ZH values: ${empty.length}${list(empty)}`);
console.log(`placeholder mismatches: ${placeholderMismatch.length}${list(placeholderMismatch)}`);
console.log(`free/safe wording in ZH: ${banned.length}${list(banned)}`);
console.log(`ZH values with no Chinese characters (info): ${noCjk.length}${list(noCjk)}`);

if (missing.length || extra.length || empty.length || placeholderMismatch.length || banned.length) {
  process.exit(1);
}
console.log('OK: zh/en key parity');
