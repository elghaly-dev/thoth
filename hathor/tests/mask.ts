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
