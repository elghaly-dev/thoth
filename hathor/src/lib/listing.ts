// Search order: verified direct suppliers first (higher verification level
// first). Items from the Alibaba affiliate feed never mix into this list;
// they sit in a separate price-reference section.
// Rank for search: Hathor's own factory first, then verified suppliers by level.
export function sellerRank(p: { ownFactory?: boolean }, supplierLevel: number): number {
  return p.ownFactory ? 10 : supplierLevel;
}

// Origin used by the India duty estimate. It follows the product's true origin.
export function dutyOrigin(originEn: string): 'AE' | 'SA' | 'OTHER' {
  const o = originEn.trim().toLowerCase();
  if (o === 'uae' || o === 'united arab emirates') return 'AE';
  if (o === 'saudi arabia') return 'SA';
  return 'OTHER';
}

export function directFirst<T>(list: T[], level: (x: T) => number): T[] {
  return list.map((x, i) => ({ x, i, l: level(x) })).sort((a, b) => b.l - a.l || a.i - b.i).map((e) => e.x);
}

export type PriceReferenceItem = { id: string; title: string; price: number; currency: string; url: string; source: 'alibaba' };

// Filled by the Alibaba affiliate feed once it is connected. Empty until then.
export const PRICE_REFERENCE: PriceReferenceItem[] = [];
