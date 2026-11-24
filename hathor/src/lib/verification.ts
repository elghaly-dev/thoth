// Verified-business badge. A company uploads business documents; the Hathor
// team reviews them by hand and sets the status. Nothing here sets
// "verified" on its own: submitting always gives "pending", and the review
// step is the one path to "verified".
//
// Business documents are accepted. Personal ID and bank documents are not
// part of any list below and are refused.
import { maskContacts } from './mask';
import type { KV } from './reports';

export type Party = 'india-buyer' | 'uae-supplier' | 'saudi-supplier';
export const PARTIES: Party[] = ['india-buyer', 'uae-supplier', 'saudi-supplier'];

export type DocType = 'gst' | 'iec' | 'incorporation' | 'udyam' | 'trade-license' | 'uae-vat-trn' | 'saudi-cr' | 'zatca-vat';

// required: must be uploaded. ifRegistered: needed when the company is VAT registered.
export const DOCS: Record<Party, { type: DocType; need: 'required' | 'optional' | 'ifRegistered' }[]> = {
  'india-buyer': [
    { type: 'gst', need: 'required' },
    { type: 'iec', need: 'required' },
    { type: 'incorporation', need: 'optional' },
    { type: 'udyam', need: 'optional' },
  ],
  'uae-supplier': [
    { type: 'trade-license', need: 'required' },
    { type: 'uae-vat-trn', need: 'ifRegistered' },
  ],
  'saudi-supplier': [
    { type: 'saudi-cr', need: 'required' },
    { type: 'zatca-vat', need: 'ifRegistered' },
  ],
};

// Format checks on the document number. These catch typos; they do not verify anything.
const FORMATS: Partial<Record<DocType, RegExp>> = {
  gst: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  iec: /^[A-Z0-9]{10}$/,
  udyam: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/,
  'uae-vat-trn': /^\d{15}$/,
  'saudi-cr': /^\d{10}$/,
  'zatca-vat': /^3\d{13}3$/,
};

export function numberLooksRight(type: DocType, value: string): boolean {
  const v = value.replace(/\s+/g, '').toUpperCase();
  if (!v) return false;
  const re = FORMATS[type];
  return re ? re.test(v) : v.length >= 3;
}

export type VerifyStatus = 'none' | 'pending' | 'verified';

export type DocUpload = { type: DocType; number: string; fileName: string };

export type VerifyRequest = {
  id: string;
  party: Party;
  company: string;
  vatRegistered: boolean;
  docs: DocUpload[];
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type VerifyError = { field: string; code: 'required' | 'format' | 'fileType' | 'notAllowed' };

export const VERIFY_KEY = 'hathor.verifications';
const FILE_OK = /\.(pdf|png|jpe?g)$/i;

export function buildRequest(
  party: Party, company: string, vatRegistered: boolean, docs: DocUpload[], now = new Date(), rand = Math.random,
): { ok: true; request: VerifyRequest } | { ok: false; errors: VerifyError[] } {
  const e: VerifyError[] = [];
  const allowed = DOCS[party];
  if (!company.trim()) e.push({ field: 'company', code: 'required' });
  for (const d of docs) if (!allowed.some((a) => a.type === d.type)) e.push({ field: d.type, code: 'notAllowed' });
  const clean: DocUpload[] = [];
  for (const a of allowed) {
    const d = docs.find((x) => x.type === a.type);
    const needed = a.need === 'required' || (a.need === 'ifRegistered' && vatRegistered);
    if (!d || (!d.fileName.trim() && !d.number.trim())) { if (needed) e.push({ field: a.type, code: 'required' }); continue; }
    if (!d.fileName.trim()) { e.push({ field: a.type, code: 'required' }); continue; }
    if (!FILE_OK.test(d.fileName)) { e.push({ field: a.type, code: 'fileType' }); continue; }
    if (!numberLooksRight(a.type, d.number)) { e.push({ field: a.type, code: 'format' }); continue; }
    clean.push({ type: a.type, number: d.number.replace(/\s+/g, '').toUpperCase(), fileName: d.fileName.trim() });
  }
  if (e.length) return { ok: false, errors: e };
  const id = `V-${now.getTime().toString(36)}${Math.floor(rand() * 1e6).toString(36)}`.toUpperCase();
  return { ok: true, request: { id, party, company: maskContacts(company.trim()).text.slice(0, 200), vatRegistered, docs: clean, status: 'pending', createdAt: now.toISOString() } };
}

export function loadRequests(kv: KV | null): VerifyRequest[] {
  if (!kv) return [];
  try { const v = JSON.parse(kv.getItem(VERIFY_KEY) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function saveRequests(kv: KV | null, list: VerifyRequest[]) {
  if (!kv) return;
  try { kv.setItem(VERIFY_KEY, JSON.stringify(list)); } catch { /* storage may be blocked */ }
}

export function submitRequest(kv: KV | null, r: VerifyRequest): VerifyRequest[] {
  const list = [{ ...r, status: 'pending' as const }, ...loadRequests(kv).filter((x) => x.id !== r.id)];
  saveRequests(kv, list);
  return list;
}

// Manual review by the Hathor team. The one place a request becomes verified.
export function reviewRequest(kv: KV | null, id: string, decision: 'verified' | 'rejected', note = '', now = new Date()): VerifyRequest[] {
  const list = loadRequests(kv).map((r) => (r.id === id ? { ...r, status: decision, reviewedAt: now.toISOString(), reviewNote: maskContacts(note).text.slice(0, 500) } : r));
  saveRequests(kv, list);
  return list;
}

// Status shown on the badge: the newest request for this party decides.
export function statusFor(list: VerifyRequest[], party: Party): VerifyStatus {
  const r = list.find((x) => x.party === party);
  if (!r || r.status === 'rejected') return 'none';
  return r.status;
}
