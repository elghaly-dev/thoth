// Landed-cost estimate: placeholders stay unfilled, BCD and IGST apart, CEPA vs MFN by origin.
import { DEFAULT_RATES, estimate, type RateRow } from '../src/lib/landed';
import { check, done } from './harness';

check('every default rate is a blank placeholder marked to confirm', DEFAULT_RATES.every((r) => r.toConfirm && r.bcdMfn === null && r.bcdCepa === null && r.igst === null && r.sws === null));
const blank = estimate({ goodsValue: 1000, incoterm: 'CIF', origin: 'AE', rate: DEFAULT_RATES[0] });
check('blank rates give no duty figures', blank.bcd === null && blank.igst === null && blank.total === null && blank.missing.includes('bcdCepa'));

// Made-up rates for the arithmetic check; they are not tariff numbers.
const rate: RateRow = { id: 'x', label: { ar: 'x', en: 'x' }, bcdMfn: 10, bcdCepa: 2, igst: 10, sws: 10, toConfirm: true };
const ae = estimate({ goodsValue: 1000, incoterm: 'CIF', origin: 'AE', rate });
check('UAE uses the CEPA BCD rate', ae.bcdRate === 2 && ae.bcd === 20);
check('SWS on BCD, IGST on value + BCD + SWS', ae.sws === 2 && ae.igst === 102.2 && ae.total === 1124.2, JSON.stringify(ae));
const sa = estimate({ goodsValue: 1000, incoterm: 'CIF', origin: 'SA', rate });
check('Saudi Arabia uses the MFN BCD rate', sa.bcdRate === 10 && sa.bcd === 100);
const fob = estimate({ goodsValue: 1000, incoterm: 'FOB', origin: 'AE', rate });
check('FOB asks for freight and insurance', fob.missing.includes('freight') && fob.missing.includes('insurance'));
const fob2 = estimate({ goodsValue: 1000, incoterm: 'FOB', freight: 80, insurance: 20, origin: 'AE', rate });
check('FOB adds freight and insurance to the assessable value', fob2.assessable === 1100);
const ddp = estimate({ goodsValue: 1000, incoterm: 'DDP', origin: 'SA', rate });
check('DDP: seller pays, nothing added', ddp.note === 'ddp' && ddp.total === 1000);
done('landed');
