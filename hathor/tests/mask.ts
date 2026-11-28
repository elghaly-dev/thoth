// Contact masking: every case from the spec is masked; trade numbers are not.
import { maskContacts, MASK_TOKEN } from '../src/lib/mask';
import { check, done } from './harness';

const MUST_MASK = [
  '+971 50 123 4567',
  '٠٥٠١٢٣٤٥٦٧',
  '९८७६५४३२१०',
  '98765 43210',
  'call me on nine eight seven six',
  'sales[at]example[dot]com',
  'sales at example dot com',
  'write to buyer@example.com today',
  'wa.me/971501234567',
  't.me/somebody',
  'my insta @trader_x',
  'pay to name@okbank',
  'IBAN AE07 0331 2345 6789 0123 456',
  'message me on WhatsApp',
  'كلمني واتساب',
  'see https://example.org/page',
  // Spelled-out phone numbers: English, Arabic, Egyptian spellings, mixed with digits.
  'my number is nine eight four five zero one two three',
  'nine 8 four 5 zero 1',
  'double five six seven eight',
  'رقمي صفر خمسة صفر واحد اثنين ثلاثة',
  'كلمني على زيرو واحد تلاتة تمانية',
  'خمسة وستة وسبعة وثمانية',
  // Emails and links written around the filters.
  'sales at the rate gmail dot com',
  'reach me: ravi{at}tradeco',
  'my gmail dot com is the same name',
  'ابعت على جيميل دوت كوم',
  'ahmed ات hathor دوت كوم',
  'visit tradeco.in for prices',
  'catalogue on example dot com',
  'go to www dot example dot com',
  'hxxp is not a link but https : // example.org is',
];

const KEEP = [
  'AED 12,500',
  '25 MT',
  'HS 0804.10',
  'ship by 2026-12-01',
  'B/L 1234567890',
  'USD 55,200 total',
  'Look at this. Nice offer for 6,000 kg',
  'someone ordered two pallets, then one more',
  'we load 20 containers',
  'Look at this. In stock now',
  'one or two samples, then three more cartons',
  'MOQ 5000 kg, lead time 12 days, valid 30 days',
  'Shipping at noon. Dot the forms please',
  'خمسة أطنان من التمر',
];

for (const s of MUST_MASK) {
  const r = maskContacts(s);
  check(`masks: ${s}`, r.found.length > 0 && r.text.includes(MASK_TOKEN), JSON.stringify(r));
}
for (const s of KEEP) {
  const r = maskContacts(s);
  check(`keeps: ${s}`, r.found.length === 0 && r.text === s, JSON.stringify(r));
}
// The original contact text is not kept in the masked output.
const r = maskContacts('call +971 50 123 4567 now');
check('original digits removed', !/4567/.test(r.text), r.text);

done('mask');
