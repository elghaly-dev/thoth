// Contact-detail masking. The server is the gate; this client copy warns the
// sender before a message leaves the device. Matches are replaced with a token
// the UI renders as a «contact details hidden» chip.
export const MASK_TOKEN = '\u2063[hidden]\u2063';

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const DEVANAGARI = '०१२३४५६७८९';

export function toWesternDigits(s: string): string {
  return s.replace(/[٠-٩۰-۹०-९]/g, (d) => {
    for (const set of [ARABIC_INDIC, PERSIAN, DEVANAGARI]) {
      const i = set.indexOf(d);
      if (i >= 0) return String(i);
    }
    return d;
  });
}

const DIGIT_WORDS = '(?:zero|one|two|three|four|five|six|seven|eight|nine|oh|صفر|واحد|اثنين|اثنان|ثلاثة|أربعة|خمسة|ستة|سبعة|ثمانية|تسعة)';

export type MaskKind = 'email' | 'phone' | 'handle' | 'link' | 'payment';

const RULES: { kind: MaskKind; re: RegExp }[] = [
  { kind: 'payment', re: /\bIBAN\b[\s:]*[A-Z]{2}\d{2}(?:[\s-]?[A-Z0-9]{2,4}){3,8}/gi },
  { kind: 'email', re: /[\p{L}\p{N}._+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu },
  { kind: 'email', re: /[\p{L}\p{N}._+-]+\s*(?:\[at\]|\(at\))\s*[\p{L}\p{N}-]+(?:\s*(?:\.|\[dot\]|\(dot\))\s*[\p{L}]{2,})+/giu },
  { kind: 'email', re: /[\p{L}\p{N}._+-]+\s+at\s+[\p{L}\p{N}-]+\s+dot\s+[\p{L}]{2,}/giu },
  { kind: 'payment', re: /\b[\w.-]{2,}@(?:ok)?[a-z]{2,}bank\b|\b[\w.-]{2,}@(?:upi|ybl|okaxis|oksbi|okicici|okhdfcbank|paytm|apl)\b/gi },
  { kind: 'link', re: /\b(?:https?:\/\/|www\.)\S+|\b(?:wa\.me|t\.me|instagram\.com|facebook\.com|fb\.me)\/\S*/gi },
  { kind: 'handle', re: /\b(?:whats\s?app|telegram|signal|viber|wechat)\b|واتساب|واتس|تيليجرام|تلجرام|(?:^|\s)@[A-Za-z0-9_.]{3,}/giu },
  { kind: 'phone', re: new RegExp(`(?<!\\p{L})(?:${DIGIT_WORDS}[\\s,-]+){3,}${DIGIT_WORDS}`, 'giu') },
  { kind: 'phone', re: /(?:\+|00)?\(?\d[\d\s().-]{6,}\d/g },
];

// Values that look numeric but are trade data: money, quantities, HS codes, dates, B/L numbers.
const KEEP = [
  /^(?:AED|SAR|OMR|QAR|KWD|BHD|EGP|USD|INR)\s?[\d.,]+$/i,
  /^\d{4}\.\d{2}(?:\.\d{2})?$/,
  /^\d{4}-\d{2}-\d{2}$/,
];

function isTradeNumber(match: string, before: string): boolean {
  const m = match.trim();
  if (KEEP.some((r) => r.test(m))) return true;
  if (/(?:AED|SAR|OMR|QAR|KWD|BHD|EGP|USD|INR|₹|\$)\s*$/i.test(before)) return true;
  if (/(?:B\/L|BL|bill of lading|بوليصة)[\s#:no.]*$/i.test(before)) return true;
  const digits = m.replace(/\D/g, '');
  // Fewer than 7 digits is never a phone number. Grouped thousands (12,500) are amounts.
  if (digits.length < 7) return true;
  if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(m)) return true;
  return false;
}

export function maskContacts(input: string): { text: string; found: MaskKind[] } {
  let text = toWesternDigits(input);
  const found = new Set<MaskKind>();
  for (const rule of RULES) {
    text = text.replace(rule.re, (match: string, ...args: unknown[]) => {
      const offset = args.find((a) => typeof a === 'number') as number;
      const before = text.slice(Math.max(0, offset - 16), offset);
      if (rule.kind === 'phone' && /\d/.test(match) && isTradeNumber(match, before)) return match;
      found.add(rule.kind);
      const lead = /^\s/.test(match) ? ' ' : '';
      return lead + MASK_TOKEN;
    });
  }
  return { text, found: [...found] };
}

export function hasContacts(input: string): boolean {
  return maskContacts(input).found.length > 0;
}
