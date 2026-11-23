/**
 * Request for quotation (RFQ), the buyer's side of Deal in a Minute. It reuses the fact
 * model and cleaning from deal.ts (numbers stay as typed, Incoterm and currency come from
 * the fixed lists) and fills fixed templates in English, Arabic, Hindi and Chinese. No model
 * writes an RFQ; nothing is added to what the buyer typed.
 * [VERIFY: native review of the Arabic, Hindi and Chinese wording]
 */
import { cleanFacts, type DealFacts } from './deal';

export type RfqLang = 'en' | 'ar' | 'hi' | 'zh';
export const RFQ_LANGS: RfqLang[] = ['en', 'ar', 'hi', 'zh'];
/** The facts an RFQ uses (a subset of DealFacts). */
export const RFQ_KEYS: (keyof DealFacts)[] = [
  'product', 'quantity', 'unit', 'port', 'incoterm', 'currency', 'price', 'leadTimeDays', 'payment', 'validityDays',
];

type Line = (f: DealFacts) => string | null;
const has = (...v: string[]) => v.every((x) => x.trim() !== '');
const join = (...parts: string[]) => parts.filter((p) => p.trim() !== '').join(' ');

const T: Record<RfqLang, { title: string; lines: Line[]; footer: string }> = {
  en: {
    title: 'Request for quotation',
    lines: [
      (f) => (has(f.product) ? `Product: ${f.product}` : null),
      (f) => (has(f.quantity) ? `Quantity: ${join(f.quantity, f.unit)}` : null),
      (f) => (has(f.incoterm) ? `Delivery term: ${join(f.incoterm, f.port)}` : has(f.port) ? `Destination port: ${f.port}` : null),
      (f) => (has(f.price) ? `Target price: ${join(f.price, f.currency)}` : null),
      (f) => (has(f.leadTimeDays) ? `Needed within: ${f.leadTimeDays} days` : null),
      (f) => (has(f.payment) ? `Payment terms: ${f.payment}` : null),
      (f) => (has(f.validityDays) ? `Please answer within: ${f.validityDays} days` : null),
    ],
    footer: 'Please send your quotation with the price, minimum order and lead time.',
  },
  ar: {
    title: 'طلب عرض سعر',
    lines: [
      (f) => (has(f.product) ? `المنتج: ${f.product}` : null),
      (f) => (has(f.quantity) ? `الكمية: ${join(f.quantity, f.unit)}` : null),
      (f) => (has(f.incoterm) ? `شرط التسليم: ${join(f.incoterm, f.port)}` : has(f.port) ? `ميناء الوصول: ${f.port}` : null),
      (f) => (has(f.price) ? `السعر المستهدف: ${join(f.price, f.currency)}` : null),
      (f) => (has(f.leadTimeDays) ? `مطلوب خلال: ${f.leadTimeDays} يومًا` : null),
      (f) => (has(f.payment) ? `شروط الدفع: ${f.payment}` : null),
      (f) => (has(f.validityDays) ? `نرجو الرد خلال: ${f.validityDays} يومًا` : null),
    ],
    footer: 'نرجو إرسال عرض السعر مع السعر والحد الأدنى للطلب ومدة التجهيز.',
  },
  hi: {
    title: 'कोटेशन का अनुरोध',
    lines: [
      (f) => (has(f.product) ? `उत्पाद: ${f.product}` : null),
      (f) => (has(f.quantity) ? `मात्रा: ${join(f.quantity, f.unit)}` : null),
      (f) => (has(f.incoterm) ? `डिलीवरी शर्त: ${join(f.incoterm, f.port)}` : has(f.port) ? `गंतव्य बंदरगाह: ${f.port}` : null),
      (f) => (has(f.price) ? `लक्षित कीमत: ${join(f.price, f.currency)}` : null),
      (f) => (has(f.leadTimeDays) ? `ज़रूरत: ${f.leadTimeDays} दिन के भीतर` : null),
      (f) => (has(f.payment) ? `भुगतान की शर्तें: ${f.payment}` : null),
      (f) => (has(f.validityDays) ? `कृपया ${f.validityDays} दिन के भीतर उत्तर दें` : null),
    ],
    footer: 'कृपया कीमत, न्यूनतम ऑर्डर और तैयारी के समय के साथ कोटेशन भेजें।',
  },
  zh: {
    title: '询价单',
    lines: [
      (f) => (has(f.product) ? `产品：${f.product}` : null),
      (f) => (has(f.quantity) ? `数量：${join(f.quantity, f.unit)}` : null),
      (f) => (has(f.incoterm) ? `交货条款：${join(f.incoterm, f.port)}` : has(f.port) ? `目的港：${f.port}` : null),
      (f) => (has(f.price) ? `目标价格：${join(f.price, f.currency)}` : null),
      (f) => (has(f.leadTimeDays) ? `需求时间：${f.leadTimeDays} 天内` : null),
      (f) => (has(f.payment) ? `付款条件：${f.payment}` : null),
      (f) => (has(f.validityDays) ? `请在 ${f.validityDays} 天内回复` : null),
    ],
    footer: '请报价，并注明价格、最小起订量和备货期。',
  },
};

/** One RFQ in one language, from the buyer's facts. Empty facts give an empty RFQ. */
export function renderRfq(facts: DealFacts, lang: RfqLang): string {
  const f = cleanFacts(facts);
  const t = T[lang];
  const lines = t.lines.map((l) => l(f)).filter((x): x is string => !!x);
  if (!lines.length) return '';
  return [t.title, ...lines, t.footer].join('\n');
}

export const renderRfqAll = (facts: DealFacts) =>
  Object.fromEntries(RFQ_LANGS.map((l) => [l, renderRfq(facts, l)])) as Record<RfqLang, string>;
