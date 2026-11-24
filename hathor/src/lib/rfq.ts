// Structured request for quotation (RFQ) and supplier quotes.
// Buyers post an RFQ; suppliers answer with a quote; the buyer compares them
// side by side. There is no escrow and no payment here: payment terms are
// plain text agreed between the two companies. Every typed text field is
// passed through contact masking before it is stored.
//
// Storage: kept in localStorage until an RFQ server exists.
import { maskContacts } from './mask';
import type { KV } from './reports';

export const BUYER_INCOTERMS = ['FOB', 'CIF', 'DDP'] as const;
export type BuyerIncoterm = (typeof BUYER_INCOTERMS)[number];
export const BUYER_CURRENCIES = ['INR', 'USD'] as const;
export const QUOTE_CURRENCIES = ['USD', 'AED', 'SAR'] as const;
export type QuoteCurrency = (typeof QUOTE_CURRENCIES)[number];
export const CERTS = ['ISO', 'BIS', 'FSSAI'] as const;
export type Cert = (typeof CERTS)[number];

// India destinations: sea ports and inland cities.
export const DESTINATIONS = [
  { id: 'nhava-sheva', ar: 'نافا شيفا (ميناء)', en: 'Nhava Sheva (port)' },
  { id: 'mundra', ar: 'موندرا (ميناء)', en: 'Mundra (port)' },
  { id: 'chennai', ar: 'تشيناي (ميناء)', en: 'Chennai (port)' },
  { id: 'kochi', ar: 'كوتشي (ميناء)', en: 'Kochi (port)' },
  { id: 'kolkata', ar: 'كولكاتا (ميناء)', en: 'Kolkata (port)' },
  { id: 'mumbai', ar: 'مومباي', en: 'Mumbai' },
  { id: 'delhi', ar: 'دلهي', en: 'Delhi' },
  { id: 'bengaluru', ar: 'بنغالورو', en: 'Bengaluru' },
  { id: 'hyderabad', ar: 'حيدر آباد', en: 'Hyderabad' },
  { id: 'ahmedabad', ar: 'أحمد آباد', en: 'Ahmedabad' },
] as const;
export type DestinationId = (typeof DESTINATIONS)[number]['id'];

export const ORIGIN_PORTS = [
  { id: 'jebel-ali', ar: 'جبل علي', en: 'Jebel Ali' },
  { id: 'khalifa', ar: 'ميناء خليفة', en: 'Khalifa Port' },
  { id: 'dammam', ar: 'الدمام', en: 'Dammam' },
  { id: 'jeddah', ar: 'جدة', en: 'Jeddah' },
  { id: 'sohar', ar: 'صحار', en: 'Sohar' },
] as const;
export type OriginPortId = (typeof ORIGIN_PORTS)[number]['id'];

export type Spec = { k: string; v: string };

export type RfqInput = {
  title: string;
  category: string;
  specs: Spec[];
  attachments: string[]; // file names
  quantity: string;
  unit: string;
  destination: string;
  incoterm: string;
  deliverBy: string; // YYYY-MM-DD
  quoteDeadline: string; // YYYY-MM-DD, RFQ closes at the end of this day (UTC)
  targetPrice?: string;
  targetCurrency?: string;
  sampleNeeded?: boolean;
  certs?: string[];
};

export type StoredRfq = {
  id: string;
  title: string;
  category: string;
  specs: Spec[];
  attachments: string[];
  quantity: number;
  unit: string;
  destination: DestinationId;
  incoterm: BuyerIncoterm;
  deliverBy: string;
  quoteDeadline: string;
  target: { price: number; currency: string } | null;
  sampleNeeded: boolean;
  certs: Cert[];
  createdAt: string;
};

export type QuoteInput = {
  rfqId: string;
  supplierId: string;
  unitPrice: string;
  currency: string;
  moq: string;
  leadDays: string;
  incoterm: string;
  originPort: string;
  paymentTerms: string;
  validUntil: string;
  freight?: string;
  sampleAvailable?: boolean;
  datasheet?: string; // PDF file name
};

export type StoredQuote = {
  id: string;
  rfqId: string;
  supplierId: string;
  unitPrice: number;
  total: number;
  currency: QuoteCurrency;
  moq: number;
  leadDays: number;
  incoterm: BuyerIncoterm;
  originPort: OriginPortId;
  paymentTerms: string;
  validUntil: string;
  freight: number | null;
  sampleAvailable: boolean;
  datasheet: string | null;
  createdAt: string;
};

export type FieldError = { field: string; code: 'required' | 'number' | 'date' | 'choice' | 'order' | 'closed' | 'pdf' };

export const RFQ_KEY = 'hathor.rfqs';
export const QUOTE_KEY = 'hathor.quotes';
const TEXT_MAX = 500;

const mask = (s: string) => maskContacts(s.trim()).text.slice(0, TEXT_MAX);
const num = (s: string | undefined) => {
  if (s === undefined || !s.trim()) return NaN;
  const n = Number(s.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
};
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const has = <T extends string>(list: readonly T[], v: string): v is T => (list as readonly string[]).includes(v);
const newId = (p: string, now: Date, rand: () => number) => `${p}-${now.getTime().toString(36)}${Math.floor(rand() * 1e6).toString(36)}`.toUpperCase();

// The RFQ stops taking quotes after the end of its deadline day (UTC).
export function isClosed(rfq: Pick<StoredRfq, 'quoteDeadline'>, now = new Date()): boolean {
  return now.getTime() > Date.parse(`${rfq.quoteDeadline}T23:59:59Z`);
}

export function buildRfq(i: RfqInput, now = new Date(), rand = Math.random): { ok: true; rfq: StoredRfq } | { ok: false; errors: FieldError[] } {
  const e: FieldError[] = [];
  const req = (field: string, v: string | undefined) => { if (!v || !v.trim()) e.push({ field, code: 'required' }); };
  req('title', i.title); req('category', i.category); req('unit', i.unit);
  const specs = i.specs.filter((s) => s.k.trim() || s.v.trim()).map((s) => ({ k: mask(s.k), v: mask(s.v) }));
  if (!specs.length) e.push({ field: 'specs', code: 'required' });
  const qty = num(i.quantity);
  if (!(qty > 0)) e.push({ field: 'quantity', code: i.quantity?.trim() ? 'number' : 'required' });
  if (!has(DESTINATIONS.map((d) => d.id), i.destination)) e.push({ field: 'destination', code: 'choice' });
  if (!has(BUYER_INCOTERMS, i.incoterm)) e.push({ field: 'incoterm', code: 'choice' });
  if (!isDate(i.deliverBy)) e.push({ field: 'deliverBy', code: i.deliverBy ? 'date' : 'required' });
  if (!isDate(i.quoteDeadline)) e.push({ field: 'quoteDeadline', code: i.quoteDeadline ? 'date' : 'required' });
  else if (isClosed({ quoteDeadline: i.quoteDeadline }, now)) e.push({ field: 'quoteDeadline', code: 'closed' });
  if (isDate(i.deliverBy) && isDate(i.quoteDeadline) && i.quoteDeadline > i.deliverBy) e.push({ field: 'quoteDeadline', code: 'order' });
  let target: StoredRfq['target'] = null;
  if (i.targetPrice && i.targetPrice.trim()) {
    const p = num(i.targetPrice);
    if (!(p > 0)) e.push({ field: 'targetPrice', code: 'number' });
    else if (!has(BUYER_CURRENCIES, i.targetCurrency ?? '')) e.push({ field: 'targetCurrency', code: 'choice' });
    else target = { price: p, currency: i.targetCurrency! };
  }
  const certs = (i.certs ?? []).filter((c): c is Cert => has(CERTS, c));
  if (e.length) return { ok: false, errors: e };
  return {
    ok: true,
    rfq: {
      id: newId('R', now, rand), title: mask(i.title), category: i.category, specs,
      attachments: i.attachments.map((a) => a.trim()).filter(Boolean).slice(0, 10),
      quantity: qty, unit: mask(i.unit), destination: i.destination as DestinationId, incoterm: i.incoterm as BuyerIncoterm,
      deliverBy: i.deliverBy, quoteDeadline: i.quoteDeadline, target, sampleNeeded: !!i.sampleNeeded, certs,
      createdAt: now.toISOString(),
    },
  };
}

export function buildQuote(i: QuoteInput, rfq: StoredRfq, now = new Date(), rand = Math.random): { ok: true; quote: StoredQuote } | { ok: false; errors: FieldError[] } {
  const e: FieldError[] = [];
  if (isClosed(rfq, now)) return { ok: false, errors: [{ field: 'rfq', code: 'closed' }] };
  const price = num(i.unitPrice);
  if (!(price > 0)) e.push({ field: 'unitPrice', code: i.unitPrice?.trim() ? 'number' : 'required' });
  if (!has(QUOTE_CURRENCIES, i.currency)) e.push({ field: 'currency', code: 'choice' });
  const moq = num(i.moq);
  if (!(moq > 0)) e.push({ field: 'moq', code: i.moq?.trim() ? 'number' : 'required' });
  const lead = num(i.leadDays);
  if (!(lead > 0) || !Number.isInteger(lead)) e.push({ field: 'leadDays', code: i.leadDays?.trim() ? 'number' : 'required' });
  if (!has(BUYER_INCOTERMS, i.incoterm)) e.push({ field: 'incoterm', code: 'choice' });
  if (!has(ORIGIN_PORTS.map((p) => p.id), i.originPort)) e.push({ field: 'originPort', code: 'choice' });
  if (!i.paymentTerms.trim()) e.push({ field: 'paymentTerms', code: 'required' });
  if (!isDate(i.validUntil)) e.push({ field: 'validUntil', code: i.validUntil ? 'date' : 'required' });
  let freight: number | null = null;
  if (i.freight && i.freight.trim()) { freight = num(i.freight); if (!(freight >= 0)) e.push({ field: 'freight', code: 'number' }); }
  const sheet = i.datasheet?.trim() || null;
  if (sheet && !/\.pdf$/i.test(sheet)) e.push({ field: 'datasheet', code: 'pdf' });
  if (e.length) return { ok: false, errors: e };
  return {
    ok: true,
    quote: {
      id: newId('Q', now, rand), rfqId: rfq.id, supplierId: i.supplierId, unitPrice: price,
      total: Math.round(price * rfq.quantity * 100) / 100, currency: i.currency as QuoteCurrency, moq, leadDays: lead,
      incoterm: i.incoterm as BuyerIncoterm, originPort: i.originPort as OriginPortId, paymentTerms: mask(i.paymentTerms),
      validUntil: i.validUntil, freight, sampleAvailable: !!i.sampleAvailable, datasheet: sheet, createdAt: now.toISOString(),
    },
  };
}

function load<T>(kv: KV | null, key: string): T[] {
  if (!kv) return [];
  try { const v = JSON.parse(kv.getItem(key) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function save(kv: KV | null, key: string, v: unknown[]) {
  if (!kv) return;
  try { kv.setItem(key, JSON.stringify(v)); } catch { /* storage may be blocked */ }
}

export const loadRfqs = (kv: KV | null) => load<StoredRfq>(kv, RFQ_KEY);
export const loadQuotes = (kv: KV | null, rfqId?: string) => load<StoredQuote>(kv, QUOTE_KEY).filter((q) => !rfqId || q.rfqId === rfqId);
export function saveRfq(kv: KV | null, r: StoredRfq) { save(kv, RFQ_KEY, [r, ...loadRfqs(kv).filter((x) => x.id !== r.id)]); }
export function saveQuote(kv: KV | null, q: StoredQuote) { save(kv, QUOTE_KEY, [...loadQuotes(kv).filter((x) => x.id !== q.id), q]); }

// Compare helpers: lowest unit price and shortest lead time among quotes in one currency.
export function bestOf(quotes: StoredQuote[]): { price: string[]; lead: string[] } {
  if (!quotes.length) return { price: [], lead: [] };
  const minLead = Math.min(...quotes.map((q) => q.leadDays));
  const cur = quotes[0].currency;
  const same = quotes.every((q) => q.currency === cur);
  const minPrice = Math.min(...quotes.map((q) => q.unitPrice));
  return {
    price: same ? quotes.filter((q) => q.unitPrice === minPrice).map((q) => q.id) : [],
    lead: quotes.filter((q) => q.leadDays === minLead).map((q) => q.id),
  };
}
