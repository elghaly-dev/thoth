// Supplier quote form for a posted RFQ. No escrow and no payment: payment
// terms are text the two companies agree on.
import { useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { SUPPLIERS, byId } from '../data/sample';
import { BUYER_INCOTERMS, ORIGIN_PORTS, QUOTE_CURRENCIES, buildQuote, isClosed, loadRfqs, saveQuote, type FieldError } from '../lib/rfq';
import { browserKV } from '../lib/reports';
import { fmtDate, fmtMoney } from '../lib/format';
import { Button, Glass, Num, PageHeader } from '../components/ui';
import { NotFound } from './NotFound';

// The preview signs the supplier in as the supplier dashboard company.
const PREVIEW_SUPPLIER = 'nakheel-alwaha';

export function QuoteNew({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { toast } = useStore();
  const rfq = loadRfqs(browserKV()).find((r) => r.id === id);
  const [f, setF] = useState({ unitPrice: '', currency: 'USD', moq: '', leadDays: '', incoterm: rfq?.incoterm ?? 'CIF', originPort: ORIGIN_PORTS[0].id as string, paymentTerms: '', validUntil: '', freight: '', sampleAvailable: false, datasheet: '' });
  const [errors, setErrors] = useState<FieldError[]>([]);
  if (!rfq) return <NotFound />;
  const me = byId(SUPPLIERS, PREVIEW_SUPPLIER)!;
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const err = (field: string) => { const e = errors.find((x) => x.field === field); return e ? <span role="alert" className="mt-1 block text-xs text-danger">{t(`rfq.err.${e.code}` as StringKey)}</span> : null; };
  const label = 'mb-1.5 block text-sm text-ink-2';
  const price = Number(f.unitPrice);
  const total = price > 0 ? price * rfq.quantity : null;

  if (isClosed(rfq)) return <Glass className="mx-auto mt-6 max-w-xl p-8 text-center">{t('rfq.isClosed', { date: fmtDate(rfq.quoteDeadline, lang) })}</Glass>;

  const submit = () => {
    const r = buildQuote({ rfqId: rfq.id, supplierId: me.id, ...f }, rfq);
    if (!r.ok) { setErrors(r.errors); toast(t('rfq.errors')); return; }
    saveQuote(browserKV(), r.quote); toast(t('quote.sent')); navigate(`/rfq/${rfq.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('quote.title')} sub={`⁨${rfq.id}⁩ · ${rfq.title}`} />
      <p className="mb-4 text-sm text-ink-3">{t('quote.as', { name: me.name[lang] })}</p>
      <Glass className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
        <label className="block"><span className={label}>{t('quote.unitPrice')}</span><input inputMode="decimal" dir="ltr" className="field num" value={f.unitPrice} onChange={(e) => set('unitPrice', e.target.value)} />{err('unitPrice')}</label>
        <label className="block"><span className={label}>{t('quote.currency')}</span><select className="field" value={f.currency} onChange={(e) => set('currency', e.target.value)}>{QUOTE_CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <div className="md:col-span-2 text-sm text-ink-2">{t('quote.total')}: <span className="font-semibold text-lilac-200">{total === null ? '—' : <Num>{fmtMoney(total, f.currency, lang)}</Num>}</span></div>
        <label className="block"><span className={label}>{t('quote.moq')} (<bdi>{rfq.unit}</bdi>)</span><input inputMode="decimal" dir="ltr" className="field num" value={f.moq} onChange={(e) => set('moq', e.target.value)} />{err('moq')}</label>
        <label className="block"><span className={label}>{t('quote.lead')}</span><input inputMode="numeric" dir="ltr" className="field num" value={f.leadDays} onChange={(e) => set('leadDays', e.target.value)} />{err('leadDays')}</label>
        <label className="block"><span className={label}>{t('quote.incoterm')}</span><select className="field" value={f.incoterm} onChange={(e) => set('incoterm', e.target.value as typeof f.incoterm)}>{BUYER_INCOTERMS.map((i) => <option key={i}>{i}</option>)}</select></label>
        <label className="block"><span className={label}>{t('quote.origin')}</span><select className="field" value={f.originPort} onChange={(e) => set('originPort', e.target.value)}>{ORIGIN_PORTS.map((p) => <option key={p.id} value={p.id}>{p[lang]}</option>)}</select></label>
        <label className="block md:col-span-2"><span className={label}>{t('quote.payment')}</span><input className="field" value={f.paymentTerms} placeholder={t('quote.payment.ph')} onChange={(e) => set('paymentTerms', e.target.value)} /><span className="mt-1 block text-xs text-ink-3">{t('quote.payment.note')}</span>{err('paymentTerms')}</label>
        <label className="block"><span className={label}>{t('quote.valid')}</span><input type="date" dir="ltr" className="field num" value={f.validUntil} onChange={(e) => set('validUntil', e.target.value)} />{err('validUntil')}</label>
        <label className="block"><span className={label}>{t('quote.freight')}</span><input inputMode="decimal" dir="ltr" className="field num" value={f.freight} onChange={(e) => set('freight', e.target.value)} />{err('freight')}</label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#c4a1ec]" checked={f.sampleAvailable} onChange={() => set('sampleAvailable', !f.sampleAvailable)} />{t('quote.sampleAvail')}</label>
        <label className="block"><span className={label}>{t('quote.datasheet')}</span><input type="file" accept=".pdf,application/pdf" className="field !h-auto py-2" onChange={(e) => set('datasheet', e.target.files?.[0]?.name ?? '')} />{err('datasheet')}</label>
        <div className="md:col-span-2 flex justify-end"><Button onClick={submit}>{t('quote.submit')}</Button></div>
      </Glass>
    </div>
  );
}
