// Fee rules. Rates are owner settings; when unset, the UI shows «Plans coming».
export type FeeConfig = {
  noFeeMonths: number;
  commissionBasisPoints: number | null;
  premiumPriceMonthly: { amount: number; currency: string } | null;
};

export const FEE_CONFIG: FeeConfig = {
  noFeeMonths: 3,
  commissionBasisPoints: null,
  premiumPriceMonthly: null,
};

export function addMonths(iso: string, months: number): Date {
  const d = new Date(iso);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  if (d.getUTCDate() < day) d.setUTCDate(0);
  return d;
}

export type FeeStatus =
  | { kind: 'noFees'; until: string }
  | { kind: 'commission'; amount: number }
  | { kind: 'unset' };

export function feeForDeal(accountCreated: string, now: Date, dealValue: number, cfg: FeeConfig = FEE_CONFIG): FeeStatus {
  const until = addMonths(accountCreated, cfg.noFeeMonths);
  if (now < until) return { kind: 'noFees', until: until.toISOString().slice(0, 10) };
  if (cfg.commissionBasisPoints == null) return { kind: 'unset' };
  return { kind: 'commission', amount: Math.round((dealValue * cfg.commissionBasisPoints) / 100) / 100 };
}

// Rate as «n in every 100», never as a percent sign.
export function ratePer100(cfg: FeeConfig = FEE_CONFIG): number | null {
  return cfg.commissionBasisPoints == null ? null : cfg.commissionBasisPoints / 100;
}
