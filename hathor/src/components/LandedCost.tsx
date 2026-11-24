// India import cost estimate with an editable rates table. Every rate starts
// blank and is marked TO CONFIRM; the user types the rate a customs broker
// gives for the 8-digit ITC-HS code.
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useI18n } from '../i18n';
import { DEFAULT_RATES, estimate, type Origin, type RateRow } from '../lib/landed';
import { BUYER_INCOTERMS, type BuyerIncoterm } from '../lib/rfq';
import { fmtMoney } from '../lib/format';
import { Glass, Num } from './ui';

type RateField = 'bcdMfn' | 'bcdCepa' | 'sws' | 'igst';

export function LandedCost({ value: initValue = 0, currency, origin: initOrigin = 'AE', incoterm: initInc = 'CIF', rateId = 'other' }: {
  value?: number; currency: string; origin?: Origin; incoterm?: BuyerIncoterm; rateId?: string;
}) {
  const { t, lang } = useI18n();
  const [value, setValue] = useState(String(initValue || ''));
  const [origin, setOrigin] = useState<Origin>(initOrigin);
  const [inc, setInc] = useState<BuyerIncoterm>(initInc);
  const [freight, setFreight] = useState('');
  const [insurance, setInsurance] = useState('');
  const [rates, setRates] = useState<RateRow[]>(DEFAULT_RATES);
  const [rid, setRid] = useState(DEFAULT_RATES.some((r) => r.id === rateId) ? rateId : 'other');
  const rate = rates.find((r) => r.id === rid)!;
  const n = (s: string) => (s.trim() === '' || !Number.isFinite(Number(s)) ? undefined : Number(s));
  const res = estimate({ goodsValue: n(value) ?? 0, incoterm: inc, freight: n(freight), insurance: n(insurance), origin, rate });
  const money = (v: number | null) => (v === null ? <span className="text-warning">{t('lc.toConfirm')}</span> : <Num>{fmtMoney(v, currency, lang)}</Num>);
  const setRate = (id: string, f: RateField, v: string) => setRates((rs) => rs.map((r) => (r.id === id ? { ...r, [f]: n(v) ?? null } : r)));
  const label = 'mb-1 block text-xs text-ink-3';
  const fields: RateField[] = ['bcdMfn', 'bcdCepa', 'sws', 'igst'];

  return (
    <Glass className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl">{t('lc.title')}</h2>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />{t('lc.label')}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className={label}>{t('lc.value')} ({currency})</span><input inputMode="decimal" dir="ltr" className="field num" value={value} onChange={(e) => setValue(e.target.value)} /></label>
        <label className="text-sm"><span className={label}>{t('lc.hs')}</span><select className="field" value={rid} onChange={(e) => setRid(e.target.value)}>{rates.map((r) => <option key={r.id} value={r.id}>{r.label[lang]}</option>)}</select></label>
        <label className="text-sm"><span className={label}>{t('lc.origin')}</span><select className="field" value={origin} onChange={(e) => setOrigin(e.target.value as Origin)}><option value="AE">{t('lc.origin.AE')}</option><option value="SA">{t('lc.origin.SA')}</option><option value="OTHER">{t('lc.origin.OTHER')}</option></select></label>
        <label className="text-sm"><span className={label}>{t('lc.incoterm')}</span><select className="field" value={inc} onChange={(e) => setInc(e.target.value as BuyerIncoterm)}>{BUYER_INCOTERMS.map((i) => <option key={i}>{i}</option>)}</select></label>
        {inc === 'FOB' && <>
          <label className="text-sm"><span className={label}>{t('lc.freight')}</span><input inputMode="decimal" dir="ltr" className="field num" value={freight} onChange={(e) => setFreight(e.target.value)} /></label>
          <label className="text-sm"><span className={label}>{t('lc.insurance')}</span><input inputMode="decimal" dir="ltr" className="field num" value={insurance} onChange={(e) => setInsurance(e.target.value)} /></label>
        </>}
      </div>
      {res.note === 'ddp' ? <p className="mt-4 text-sm text-ink-2">{t('lc.ddp')}</p> : (
        <dl className="mt-5 divide-y divide-lilac-400/10 text-sm">
          <div className="flex justify-between py-2.5"><dt>{t('lc.assessable')}</dt><dd>{money(res.assessable)}</dd></div>
          <div className="flex justify-between py-2.5"><dt>{t('lc.bcd')} · {origin === 'AE' ? 'CEPA' : 'MFN'}</dt><dd>{money(res.bcd)}</dd></div>
          <div className="flex justify-between py-2.5"><dt>{t('lc.sws')}</dt><dd>{money(res.sws)}</dd></div>
          <div className="flex justify-between py-2.5"><dt>{t('lc.igst')}</dt><dd>{money(res.igst)}</dd></div>
          <div className="flex justify-between py-3 font-semibold"><dt>{t('lc.total')}</dt><dd className="text-lilac-200">{money(res.total)}</dd></div>
        </dl>
      )}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-lilac-400">{t('lc.rates')} · <span className="text-warning">{t('lc.toConfirm')}</span></summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-xs">
            <thead><tr><th className="p-2 text-start text-ink-3">{t('lc.hs')}</th>{fields.map((f) => <th key={f} className="p-2 text-start text-ink-3">{t(f === 'bcdMfn' ? 'lc.bcdMfn' : f === 'bcdCepa' ? 'lc.bcdCepa' : f === 'sws' ? 'lc.sws' : 'lc.igst')}</th>)}</tr></thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id}>
                  <td className="p-2">{r.label[lang]}</td>
                  {fields.map((f) => (
                    <td key={f} className="p-1"><input aria-label={`${r.label[lang]} ${f}`} inputMode="decimal" dir="ltr" placeholder={t('lc.toConfirm')} className="field num !h-9 !text-xs" value={r[f] ?? ''} onChange={(e) => setRate(r.id, f, e.target.value)} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="mt-3 text-xs text-ink-3">{t('lc.hsNote')}</p>
      {origin === 'AE' && <p className="mt-1 text-xs text-ink-3">{t('lc.cepaNote')}</p>}
      <p className="mt-1 text-xs text-warning">{t('estimate.broker')}</p>
      <p className="mt-2 text-xs text-ink-2">{t('lc.whoPays')}</p>
    </Glass>
  );
}
