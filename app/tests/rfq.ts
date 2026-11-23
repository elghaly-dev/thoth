/**
 * RFQ: the request contains only the buyer's facts, in four languages.
 * Run: npm run test:rfq
 */
import { renderRfq, renderRfqAll, RFQ_LANGS } from '../src/deal/rfq';
import { emptyFacts } from '../src/deal/deal';
import { RFQ_TABLES } from '../src/deal/rfq-strings';

let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };

check(RFQ_LANGS.every((l) => renderRfq(emptyFacts(), l) === ''), 'empty facts give an empty RFQ in every language');
const f = { ...emptyFacts(), product: 'Brass lamps', quantity: '500', unit: 'pieces', incoterm: 'FOB', port: 'Mumbai', currency: 'USD', price: '12.50', leadTimeDays: '30' };
const all = renderRfqAll(f);
for (const l of RFQ_LANGS) {
  const out = all[l];
  check(out.includes('Brass lamps') && out.includes('500') && out.includes('FOB') && out.includes('Mumbai'), `${l}: facts copied`);
  check(out.includes('12.50') && out.includes('USD') && out.includes('30'), `${l}: price, currency and days exact`);
  check(!out.includes('undefined'), `${l}: no undefined`);
  const digits = (out.match(/\d+(?:\.\d+)?/g) || []).sort().join(',');
  check(digits === ['12.50', '30', '500'].sort().join(','), `${l}: no number besides the facts (${digits})`);
}
check(!renderRfq({ ...f, incoterm: 'XYZ' }, 'en').includes('XYZ'), 'unknown delivery term dropped');
check(!renderRfq({ ...f, currency: 'BTC' }, 'en').includes('BTC'), 'unknown currency dropped');
const keys = Object.keys(RFQ_TABLES.en).sort().join();
for (const [c, t] of Object.entries(RFQ_TABLES)) check(Object.keys(t).sort().join() === keys, `${c}: same keys as English`);
check(/الغالي/.test(RFQ_TABLES.ar.intro) && /Elghaly/.test(RFQ_TABLES.en.intro), 'assistant name in intro');

console.log(`rfq: ${checks} checks`);
if (fails.length) { console.error('rfq: FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('rfq: PASS');
