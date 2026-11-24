// Fee rules: no fees in the first 3 months, then a commission amount from config.
import { addMonths, feeForDeal, ratePer100, type FeeConfig } from '../src/lib/fees';
import { check, done } from './harness';

const base: FeeConfig = { noFeeMonths: 3, commissionBasisPoints: null, premiumPriceMonthly: null };

const young = feeForDeal('2026-10-01', new Date('2026-11-24'), 55200, base);
check('young account has no fees', young.kind === 'noFees');
check('no-fee window ends 3 months later', young.kind === 'noFees' && young.until === '2027-01-01', JSON.stringify(young));

const oldUnset = feeForDeal('2026-01-01', new Date('2026-11-24'), 55200, base);
check('older account with no rate set shows plans coming', oldUnset.kind === 'unset');

const withRate = { ...base, commissionBasisPoints: 150 };
const oldSet = feeForDeal('2026-01-01', new Date('2026-11-24'), 55200, withRate);
check('commission is an amount', oldSet.kind === 'commission' && oldSet.amount === 828, JSON.stringify(oldSet));
check('rate reads as n in every 100', ratePer100(withRate) === 1.5);
check('rate unset is null', ratePer100(base) === null);

check('month end clamps (Nov 30 + 3 months)', addMonths('2026-11-30', 3).toISOString().slice(0, 10) === '2027-02-28');
check('boundary day is no longer free of fees', feeForDeal('2026-08-24', new Date('2026-11-24T00:00:00Z'), 100, withRate).kind === 'commission');

done('fees');
