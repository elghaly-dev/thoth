// Verified-business badge (preview). A company enters its business documents;
// review by the Hathor team needs the Hathor server, which does not exist yet.
// Until then:
// - the full document number is format-checked in memory and never stored:
//   the device keeps the last 4 characters and a masked file name;
// - the review screen is in dev builds alone (App.tsx), and a "verified" entry
//   on the device is shown as "in review", because anyone can write one there;
// - nothing here sets "verified" on its own: submitting always gives "pending".
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

// What the page passes in: the typed number, held in memory for the format check.
export type DocUpload = { type: DocType; number: string; fileName: string };
// What the device keeps: never the full number.
export type StoredDoc = { type: DocType; last4: string; fileName: string };

const DOC_TYPES = new Set<string>(Object.values(DOCS).flat().map((d) => d.type));
const STATUSES = new Set(['pending', 'verified', 'rejected']);
const FILE_NAME_MAX = 120;

/** The last 4 characters of a document number, the one part the device keeps. */
export function lastFour(number: string): string {
  return number.replace(/\s+/g, '').toUpperCase().slice(-4);
}
const cleanFileName = (name: string) => maskContacts(name.trim()).text.slice(0, FILE_NAME_MAX);

export type VerifyRequest = {
  id: string;
  party: Party;
  company: string;
  vatRegistered: boolean;
  docs: StoredDoc[];
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
  const clean: StoredDoc[] = [];
  for (const a of allowed) {
    const d = docs.find((x) => x.type === a.type);
    const needed = a.need === 'required' || (a.need === 'ifRegistered' && vatRegistered);
    if (!d || (!d.fileName.trim() && !d.number.trim())) { if (needed) e.push({ field: a.type, code: 'required' }); continue; }
    if (!d.fileName.trim()) { e.push({ field: a.type, code: 'required' }); continue; }
    if (!FILE_OK.test(d.fileName)) { e.push({ field: a.type, code: 'fileType' }); continue; }
    if (!numberLooksRight(a.type, d.number)) { e.push({ field: a.type, code: 'format' }); continue; }
    clean.push({ type: a.type, last4: lastFour(d.number), fileName: cleanFileName(d.fileName) });
  }
  if (e.length) return { ok: false, errors: e };
  const id = `V-${now.getTime().toString(36)}${Math.floor(rand() * 1e6).toString(36)}`.toUpperCase();
  return { ok: true, request: { id, party, company: maskContacts(company.trim()).text.slice(0, 200), vatRegistered, docs: clean, status: 'pending', createdAt: now.toISOString() } };
}

// Reads the device's requests. Entries that are not well formed are dropped. An
// entry from an earlier build that kept a full document number is reduced to
// its last 4 characters and written back, so the full number leaves the device.
export function loadRequests(kv: KV | null): VerifyRequest[] {
  if (!kv) return [];
  let raw: unknown;
  try { raw = JSON.parse(kv.getItem(VERIFY_KEY) ?? '[]'); } catch { return []; }
  if (!Array.isArray(raw)) return [];
  let changed = false;
  const out: VerifyRequest[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    if (!r || typeof r.id !== 'string' || !PARTIES.includes(r.party as Party) || !STATUSES.has(r.status as string)
      || typeof r.createdAt !== 'string' || Number.isNaN(Date.parse(r.createdAt)) || !Array.isArray(r.docs)) { changed = true; continue; }
    const docs: StoredDoc[] = [];
    for (const d of r.docs as Record<string, unknown>[]) {
      if (!d || !DOC_TYPES.has(d.type as string)) { changed = true; continue; }
      const keep = typeof d.last4 === 'string' ? d.last4.slice(-4) : typeof d.number === 'string' ? lastFour(d.number) : '';
      const fileName = typeof d.fileName === 'string' ? cleanFileName(d.fileName) : '';
      if ('number' in d || keep !== d.last4 || fileName !== d.fileName) changed = true;
      docs.push({ type: d.type as DocType, last4: keep, fileName });
    }
    out.push({ ...(r as unknown as VerifyRequest), company: maskContacts(String(r.company ?? '')).text.slice(0, 200), docs });
  }
  if (changed) saveRequests(kv, out);
  return out;
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

// Status shown for this party: the newest request decides. A "verified" entry
// on the device is shown as "in review" unless localVerified is set (dev builds,
// where the review screen runs): anyone can write that entry into storage.
export function statusFor(list: VerifyRequest[], party: Party, opts: { localVerified?: boolean } = {}): VerifyStatus {
  const r = list.find((x) => x.party === party);
  if (!r || r.status === 'rejected') return 'none';
  if (r.status === 'verified' && !opts.localVerified) return 'pending';
  return r.status;
}
