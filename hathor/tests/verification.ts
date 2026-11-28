// Verified-business badge: business documents per country, manual review, never automatic.
import { buildRequest, loadRequests, reviewRequest, statusFor, submitRequest, type DocUpload } from '../src/lib/verification';
import { check, done } from './harness';

const memKV = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const india: DocUpload[] = [
  { type: 'gst', number: '27AAPFU0939F1ZV', fileName: 'gst.pdf' },
  { type: 'iec', number: 'AAPFU0939F', fileName: 'iec.pdf' },
];
const r = buildRequest('india-buyer', 'Mumbai Fine Foods', false, india);
check('India buyer with GST + IEC builds', r.ok, JSON.stringify(r));
check('a new request is pending, never verified', r.ok && r.request.status === 'pending');
check('IEC is required', !buildRequest('india-buyer', 'X', false, [india[0]]).ok);
check('GST format is checked', !buildRequest('india-buyer', 'X', false, [{ ...india[0], number: '1234' }, india[1]]).ok);
check('personal or bank documents are refused', !buildRequest('india-buyer', 'X', false, [...india, { type: 'passport' as never, number: 'P1', fileName: 'p.pdf' }]).ok);
check('file type is checked', !buildRequest('india-buyer', 'X', false, [{ ...india[0], fileName: 'gst.exe' }, india[1]]).ok);

const uae: DocUpload[] = [{ type: 'trade-license', number: 'DED-123456', fileName: 'tl.pdf' }];
check('UAE supplier: trade licence alone is enough when not VAT registered', buildRequest('uae-supplier', 'Gulf Co', false, uae).ok);
check('UAE supplier: VAT TRN needed when registered', !buildRequest('uae-supplier', 'Gulf Co', true, uae).ok);
check('UAE TRN is 15 digits', buildRequest('uae-supplier', 'Gulf Co', true, [...uae, { type: 'uae-vat-trn', number: '100123456700003', fileName: 'trn.pdf' }]).ok);
const sa: DocUpload[] = [{ type: 'saudi-cr', number: '1010123456', fileName: 'cr.pdf' }];
check('Saudi supplier: CR builds', buildRequest('saudi-supplier', 'Riyadh Co', false, sa).ok);
check('Saudi ZATCA VAT format', !buildRequest('saudi-supplier', 'Riyadh Co', true, [...sa, { type: 'zatca-vat', number: '123', fileName: 'v.pdf' }]).ok
  && buildRequest('saudi-supplier', 'Riyadh Co', true, [...sa, { type: 'zatca-vat', number: '300000000000003', fileName: 'v.pdf' }]).ok);
check('Saudi CR is not accepted for an India buyer', !buildRequest('india-buyer', 'X', false, [...india, sa[0]]).ok);

const kv = memKV();
check('no request = none', statusFor(loadRequests(kv), 'india-buyer') === 'none');
if (r.ok) {
  // Even a request crafted as verified is stored as pending.
  submitRequest(kv, { ...r.request, status: 'verified' });
  check('submitting cannot claim verified', statusFor(loadRequests(kv), 'india-buyer') === 'pending');
  reviewRequest(kv, r.request.id, 'verified', 'format checked');
  check('the dev review screen sets verified (dev builds read it)', statusFor(loadRequests(kv), 'india-buyer', { localVerified: true }) === 'verified');
  check('a verified entry on the device shows as in review in public builds', statusFor(loadRequests(kv), 'india-buyer') === 'pending');
  reviewRequest(kv, r.request.id, 'rejected');
  check('rejected shows as none', statusFor(loadRequests(kv), 'india-buyer') === 'none');
}

// The device never keeps a full document number.
if (r.ok) {
  check('the request keeps the last 4 characters', r.request.docs[0].last4 === 'F1ZV' && r.request.docs[1].last4 === '939F', JSON.stringify(r.request.docs));
  check('the request holds no full number', !JSON.stringify(r.request).includes('27AAPFU0939F1ZV') && !JSON.stringify(r.request).includes('AAPFU0939F'));
  const kv2 = memKV();
  submitRequest(kv2, r.request);
  const raw = kv2.getItem('hathor.verifications') ?? '';
  check('storage holds no full number', !raw.includes('27AAPFU0939F1ZV') && !raw.includes('AAPFU0939F') && !raw.includes('"number"'), raw);
}
const tricky = buildRequest('india-buyer', 'X', false, [{ ...india[0], fileName: 'call me 971501234567.pdf' }, india[1]]);
check('a file name with a phone number is stored masked', tricky.ok && !tricky.request.docs[0].fileName.includes('971501234567'), JSON.stringify(tricky));

// An entry from an earlier build, with a full number, is reduced and written back.
const kv3 = memKV();
kv3.setItem('hathor.verifications', JSON.stringify([
  { id: 'V-OLD', party: 'india-buyer', company: 'Old Co', vatRegistered: false, status: 'pending', createdAt: '2026-11-20T10:00:00.000Z',
    docs: [{ type: 'gst', number: '27AAPFU0939F1ZV', fileName: 'gst.pdf' }] },
  { id: 'V-BAD', party: 'india-buyer', company: 'Bad', vatRegistered: false, status: 'hacked', createdAt: '2026-11-20T10:00:00.000Z', docs: [] },
  { id: 'V-BAD2', party: 'mars-buyer', company: 'Bad', vatRegistered: false, status: 'pending', createdAt: '2026-11-20T10:00:00.000Z', docs: [] },
]));
const migrated = loadRequests(kv3);
check('an old entry is kept with its last 4 characters', migrated.length === 1 && migrated[0].docs[0].last4 === 'F1ZV', JSON.stringify(migrated));
check('the old full number is gone from storage', !(kv3.getItem('hathor.verifications') ?? '').includes('27AAPFU0939F1ZV'));
check('entries with an unknown status or party are dropped', !migrated.some((x) => x.id === 'V-BAD' || x.id === 'V-BAD2'));
done('verification');
