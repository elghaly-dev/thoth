// Structured RFQ and supplier quotes: required fields, auto-close, masking, compare.
import { buildQuote, buildRfq, bestOf, isClosed, loadQuotes, loadRfqs, saveQuote, saveRfq, type QuoteInput, type RfqInput, type StoredQuote } from '../src/lib/rfq';
import { MASK_TOKEN } from '../src/lib/mask';
import { check, done } from './harness';

const now = new Date('2026-11-24T10:00:00Z');
const memKV = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const base: RfqInput = {
  title: 'Printed cartons', category: 'packaging', specs: [{ k: 'Size', v: '40x30x20 cm' }], attachments: ['drawing.pdf'],
  quantity: '20000', unit: 'pc', destination: 'mumbai', incoterm: 'CIF', deliverBy: '2027-01-20', quoteDeadline: '2026-12-10',
};

const ok = buildRfq(base, now, () => 0.5);
check('valid RFQ builds', ok.ok);
const rfq = ok.ok ? ok.rfq : null!;
check('optional fields default', rfq.target === null && rfq.sampleNeeded === false && rfq.certs.length === 0);

for (const [field, patch] of [
  ['title', { title: ' ' }], ['specs', { specs: [{ k: '', v: '' }] }], ['quantity', { quantity: '' }], ['quantity', { quantity: '-3' }],
  ['destination', { destination: 'karachi' }], ['incoterm', { incoterm: 'EXW' }], ['deliverBy', { deliverBy: '' }], ['quoteDeadline', { quoteDeadline: '' }],
  ['quoteDeadline', { quoteDeadline: '2027-02-01' }], ['quoteDeadline', { quoteDeadline: '2026-11-01' }], ['targetCurrency', { targetPrice: '5', targetCurrency: 'AED' }],
] as [string, Partial<RfqInput>][]) {
  const r = buildRfq({ ...base, ...patch }, now);
  check(`rejects bad ${field} ${JSON.stringify(patch)}`, !r.ok && r.errors.some((e) => e.field === field), JSON.stringify(r));
}
const opt = buildRfq({ ...base, targetPrice: '12.5', targetCurrency: 'INR', sampleNeeded: true, certs: ['BIS', 'FSSAI', 'XYZ'] }, now);
check('optional fields kept, unknown cert dropped', opt.ok && opt.rfq.target?.currency === 'INR' && opt.rfq.sampleNeeded && opt.rfq.certs.join() === 'BIS,FSSAI');
const masked = buildRfq({ ...base, specs: [{ k: 'Contact', v: 'call nine eight four five one two' }] }, now);
check('contact details in specs are masked', masked.ok && masked.rfq.specs[0].v.includes(MASK_TOKEN));

check('open before deadline ends', !isClosed(rfq, new Date('2026-12-10T23:00:00Z')));
check('closes after deadline day (UTC)', isClosed(rfq, new Date('2026-12-11T00:00:01Z')));

const q: QuoteInput = { rfqId: rfq.id, supplierId: 'nakheel-alwaha', unitPrice: '0.42', currency: 'USD', moq: '10000', leadDays: '14', incoterm: 'CIF', originPort: 'jebel-ali', paymentTerms: 'LC at sight', validUntil: '2026-12-31' };
const qa = buildQuote(q, rfq, now, () => 0.1);
check('valid quote builds with total', qa.ok && qa.quote.total === 8400, JSON.stringify(qa));
for (const [field, patch] of [
  ['unitPrice', { unitPrice: '' }], ['currency', { currency: 'INR' }], ['moq', { moq: '0' }], ['leadDays', { leadDays: '2.5' }],
  ['originPort', { originPort: 'mumbai' }], ['paymentTerms', { paymentTerms: ' ' }], ['validUntil', { validUntil: 'soon' }], ['datasheet', { datasheet: 'sheet.docx' }],
] as [string, Partial<QuoteInput>][]) {
  const r = buildQuote({ ...q, ...patch }, rfq, now);
  check(`quote rejects bad ${field}`, !r.ok && r.errors.some((e) => e.field === field), JSON.stringify(r));
}
const late = buildQuote(q, rfq, new Date('2026-12-12T00:00:00Z'));
check('no quotes after auto-close', !late.ok && late.errors[0].code === 'closed');
const pm = buildQuote({ ...q, paymentTerms: '30/70, pay to name@okbank' }, rfq, now);
check('payment terms are masked', pm.ok && pm.quote.paymentTerms.includes(MASK_TOKEN) && pm.quote.paymentTerms.startsWith('30/70'));

const kv = memKV();
saveRfq(kv, rfq);
const q1 = (qa.ok ? qa.quote : null!) as StoredQuote;
const q2 = { ...q1, id: 'Q-2', unitPrice: 0.4, leadDays: 20 };
saveQuote(kv, q1); saveQuote(kv, q2);
check('RFQ stored and loaded', loadRfqs(kv).length === 1);
check('quotes stored per RFQ', loadQuotes(kv, rfq.id).length === 2 && loadQuotes(kv, 'other').length === 0);
const b = bestOf(loadQuotes(kv, rfq.id));
check('best price and lead picked', b.price.join() === 'Q-2' && b.lead.join() === q1.id);
check('no best price across currencies', bestOf([q1, { ...q2, currency: 'AED' }]).price.length === 0);

// Muse LOW 14, 15, 21: real calendar days, plain decimals, masked file names.
check('an impossible date is refused (2027-02-30)', (() => { const r = buildRfq({ ...base, deliverBy: '2027-02-30' }, now); return !r.ok && r.errors.some((e) => e.field === 'deliverBy'); })());
check('a quote valid-until of 2026-11-31 is refused', (() => { const r = buildQuote({ ...q, validUntil: '2026-11-31' }, rfq, now); return !r.ok && r.errors.some((e) => e.field === 'validUntil'); })());
check('a real leap day is accepted (2028-02-29)', buildQuote({ ...q, validUntil: '2028-02-29' }, rfq, now).ok);
for (const bad of ['1e3', '0x10', 'Infinity', '1.2.3', '+5']) {
  const r = buildQuote({ ...q, unitPrice: bad }, rfq, now);
  check(`price ${bad} is refused`, !r.ok && r.errors.some((e) => e.field === 'unitPrice'), JSON.stringify(r));
}
check('quantity 1e3 is refused', (() => { const r = buildRfq({ ...base, quantity: '1e3' }, now); return !r.ok && r.errors.some((e) => e.field === 'quantity'); })());
check('a price with thousands separators is read', (() => { const r = buildQuote({ ...q, unitPrice: '1,250.50' }, rfq, now); return r.ok && r.quote.unitPrice === 1250.5; })());
const named = buildRfq({ ...base, attachments: ['call me 971501234567.pdf'] }, now);
check('an attachment name with a phone number is masked', named.ok && !named.rfq.attachments[0].includes('971501234567') && named.rfq.attachments[0].includes(MASK_TOKEN), JSON.stringify(named));
const sheetQ = buildQuote({ ...q, datasheet: 'telegram 971501234567.pdf' }, rfq, now);
check('a datasheet name with a phone number is masked', sheetQ.ok && !!sheetQ.quote.datasheet && !sheetQ.quote.datasheet.includes('971501234567'), JSON.stringify(sheetQ));

done('rfq');
