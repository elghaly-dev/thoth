// Landed-cost estimate for goods shipped into India. This is an estimate
// for planning. Every rate below is a placeholder marked TO CONFIRM: the
// real rate depends on the 8-digit ITC-HS code and must be checked with a
// customs broker. No rate here is an official number.
//
// Origin decides the duty basis:
//   UAE: India–UAE CEPA preferential rate (needs a CEPA certificate of origin).
//   Saudi Arabia: standard MFN rate (India has no FTA with Saudi Arabia).
//   Any other origin: standard MFN rate here; check any other trade deal with the broker.
// BCD (basic customs duty) and IGST are shown separately. IGST is charged on
// assessable value plus BCD plus the social welfare surcharge on BCD.
import type { BuyerIncoterm } from './rfq';

export type Origin = 'AE' | 'SA' | 'OTHER';
export type RateRow = {
  id: string;
  label: { ar: string; en: string };
  bcdMfn: number | null; // basic customs duty, MFN, in parts per 100
  bcdCepa: number | null; // basic customs duty under CEPA, in parts per 100
  igst: number | null; // IGST in parts per 100
  sws: number | null; // social welfare surcharge, in parts per 100 of BCD
  toConfirm: true;
};

// Placeholders. null = not filled in yet. The user edits them on screen.
export const DEFAULT_RATES: RateRow[] = [
  { id: 'packaging', label: { ar: 'التعبئة والتغليف', en: 'Packaging' }, bcdMfn: null, bcdCepa: null, igst: null, sws: null, toConfirm: true },
  { id: 'food-agri', label: { ar: 'الأغذية والزراعة', en: 'Food and agri' }, bcdMfn: null, bcdCepa: null, igst: null, sws: null, toConfirm: true },
  { id: 'other', label: { ar: 'فئة أخرى', en: 'Other category' }, bcdMfn: null, bcdCepa: null, igst: null, sws: null, toConfirm: true },
];

export type LandedInput = {
  goodsValue: number; // in the trade currency
  incoterm: BuyerIncoterm;
  freight?: number; // needed for FOB
  insurance?: number; // needed for FOB
  origin: Origin;
  rate: RateRow;
};

export type LandedResult = {
  assessable: number;
  bcdRate: number | null;
  bcd: number | null;
  sws: number | null;
  igst: number | null;
  total: number | null;
  missing: string[];
  note: 'ddp' | null;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function estimate(i: LandedInput): LandedResult {
  // DDP: the seller pays import duty and IGST, so the buyer adds nothing here.
  if (i.incoterm === 'DDP') return { assessable: r2(i.goodsValue), bcdRate: 0, bcd: 0, sws: 0, igst: 0, total: r2(i.goodsValue), missing: [], note: 'ddp' };
  const missing: string[] = [];
  let assessable = i.goodsValue;
  if (i.incoterm === 'FOB') {
    if (i.freight === undefined) missing.push('freight');
    if (i.insurance === undefined) missing.push('insurance');
    assessable += (i.freight ?? 0) + (i.insurance ?? 0);
  }
  const bcdRate = i.origin === 'AE' ? i.rate.bcdCepa : i.rate.bcdMfn;
  if (bcdRate === null) missing.push(i.origin === 'AE' ? 'bcdCepa' : 'bcdMfn');
  if (i.rate.sws === null) missing.push('sws');
  if (i.rate.igst === null) missing.push('igst');
  const bcd = bcdRate === null ? null : r2((assessable * bcdRate) / 100);
  const sws = bcd === null || i.rate.sws === null ? null : r2((bcd * i.rate.sws) / 100);
  const igst = bcd === null || sws === null || i.rate.igst === null ? null : r2(((assessable + bcd + sws) * i.rate.igst) / 100);
  const total = igst === null || bcd === null || sws === null ? null : r2(assessable + bcd + sws + igst);
  return { assessable: r2(assessable), bcdRate, bcd, sws, igst, total, missing, note: null };
}
