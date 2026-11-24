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
  reviewRequest(kv, r.request.id, 'verified', 'matched GST portal');
  check('manual review sets verified', statusFor(loadRequests(kv), 'india-buyer') === 'verified');
  reviewRequest(kv, r.request.id, 'rejected');
  check('rejected shows as none', statusFor(loadRequests(kv), 'india-buyer') === 'none');
}
done('verification');
