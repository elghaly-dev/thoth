import type { Lang } from '../i18n/strings';

// Western digits in every language so a price reads the same in Arabic and English.
export function fmtNumber(n: number, lang: Lang, opts: Intl.NumberFormatOptions = {}): string {
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2, ...opts }).format(n);
}

export function fmtMoney(n: number, currency: string, lang: Lang): string {
  n = Math.round(n * 100) / 100;
  const v = fmtNumber(n, lang, { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
  return `${currency} ${v}`;
}

export function fmtDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(locale, opts).format(new Date(iso));
}

// Retail price for one unit, or null when the supplier does not sell retail.
export function retailLabel(price: number | undefined, currency: string, lang: Lang): string | null {
  return typeof price === 'number' && price > 0 ? fmtMoney(price, currency, lang) : null;
}
