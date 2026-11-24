import { AnimatePresence, motion } from 'motion/react';
import { CircleDot, Clock, Boxes, MapPin, Package2, Star, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { ME, RFQS, SUPPLIERS, byId, type Quote } from '../data/sample';
import { fmtDate, fmtMoney, fmtNumber } from '../lib/format';
import { feeForDeal } from '../lib/fees';
import { AssistantGlyph } from '../components/Brand';
import { Button, Glass, Num, PageHeader, PremiumBadge, SampleBadge, VerifiedBadge } from '../components/ui';
import { NotFound } from './NotFound';

const LETTERS = ['A', 'B', 'C', 'D'];

export function ComparePage({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { openAssistant, setAssistantCtx, toast } = useStore();
  const rfq = byId(RFQS, id);
  const [short, setShort] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<Quote | null>(null);
  useEffect(() => { if (rfq) setAssistantCtx({ kind: 'rfq', id: rfq.id, label: `${rfq.id} · ${rfq.title[lang]}` }); }, [rfq, lang, setAssistantCtx]);
  if (!rfq) return <NotFound />;
  const quotes = rfq.quotes;
  const minPrice = Math.min(...quotes.map((q) => q.unitPrice));
  const minLead = Math.min(...quotes.map((q) => q.leadDays));
  const toggle = (qid: string) => setShort((s) => { const n = new Set(s); if (n.has(qid)) n.delete(qid); else n.add(qid); return n; });
  const missing = <span className="text-ink-3 italic">{t('compare.missing')}</span>;

  const rows: { label: string; cell: (q: Quote) => ReactNode }[] = [
    { label: t('compare.unit'), cell: (q) => (
      <div><div className="num text-xl font-semibold text-lilac-200"><Num>{fmtMoney(q.unitPrice, q.currency, lang)}</Num></div><div className="text-xs text-ink-3">/ {rfq.unit[lang]}</div>
        {q.unitPrice === minPrice && <Best label={t('compare.bestPrice')} />}</div>) },
    { label: t('compare.total'), cell: (q) => <span className="num font-semibold"><Num>{fmtMoney(q.unitPrice * rfq.quantity, q.currency, lang)}</Num></span> },
    { label: t('compare.terms'), cell: (q) => <span><Num>{q.incoterm}</Num> · <bdi>{q.port[lang]}</bdi></span> },
    { label: t('compare.moq'), cell: (q) => <span><Num>{fmtNumber(q.moq, lang)}</Num> {rfq.unit[lang]}</span> },
    { label: t('compare.lead'), cell: (q) => <div>{t('product.days', { n: q.leadDays })}{q.leadDays === minLead && <Best label={t('compare.bestLead')} />}</div> },
    { label: t('compare.payment'), cell: (q) => (q.payment ? q.payment[lang] : missing) },
    { label: t('compare.valid'), cell: (q) => (q.validUntil ? <bdi className="num">{fmtDate(q.validUntil, lang)}</bdi> : missing) },
    { label: t('compare.reply'), cell: (q) => t('supplier.reply', { n: byId(SUPPLIERS, q.supplierId)!.replyHours }) },
    { label: t('compare.deals'), cell: (q) => <Num>{byId(SUPPLIERS, q.supplierId)!.deals}</Num> },
  ];

  const fee = confirm ? feeForDeal(ME.created, new Date('2026-11-24'), confirm.unitPrice * rfq.quantity) : null;

  return (
    <div>
      <PageHeader title={t('compare.title')} sub={`⁨${rfq.id}⁩ · ${t('compare.quotes', { n: quotes.length })}`}>
        <div className="flex items-center gap-2">
          <SampleBadge />
          <Button variant="secondary" onClick={() => openAssistant(undefined, 'compare')}><AssistantGlyph />{t('compare.ask')}</Button>
        </div>
      </PageHeader>

      <Glass className="mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Fact icon={Package2} label={t('rfq.product')} value={<bdi>{rfq.title[lang]}</bdi>} />
        <Fact icon={Boxes} label={t('rfq.quantity')} value={<><Num>{fmtNumber(rfq.quantity, lang)}</Num> {rfq.unit[lang]}</>} />
        <Fact icon={CircleDot} label={t('rfq.incoterm')} value={<Num>{rfq.incoterm}</Num>} />
        <Fact icon={MapPin} label={t('rfq.port')} value={rfq.port[lang]} />
        <Fact icon={Clock} label={t('rfq.by')} value={<bdi className="num">{fmtDate(rfq.deliverBy, lang)}</bdi>} />
      </Glass>

      {/* Desktop table */}
      <div className="glass hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky start-0 w-48 bg-night-900/90 p-5 text-start align-bottom text-xs font-semibold text-ink-3 backdrop-blur">{t('compare.supplier')}</th>
              {quotes.map((q, i) => {
                const s = byId(SUPPLIERS, q.supplierId)!;
                const on = short.has(q.id);
                return (
                  <th key={q.id} className="p-5 text-start align-top font-normal">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-lilac-400">{lang === 'ar' ? 'العرض' : 'Quote'} {LETTERS[i]}</div>
                        <div className="mt-1 text-base font-semibold text-ink-1"><bdi>{s.name[lang]}</bdi></div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2"><VerifiedBadge level={s.level} short />{s.premium && <PremiumBadge short />}</div>
                      </div>
                      <motion.button whileTap={{ scale: 0.8 }} type="button" onClick={() => toggle(q.id)} aria-pressed={on} aria-label={on ? t('compare.shortlisted') : t('compare.shortlist')} className="grid h-10 w-10 place-items-center rounded-full hover:bg-lilac-400/10">
                        <Star className={`h-5 w-5 ${on ? 'fill-lilac-400 text-lilac-400' : 'text-ink-3'}`} />
                      </motion.button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="group">
                <th scope="row" className="sticky start-0 border-t border-lilac-400/10 bg-night-900/90 p-5 text-start text-xs font-medium text-ink-3 backdrop-blur">{r.label}</th>
                {quotes.map((q) => <td key={q.id} className="border-t border-lilac-400/10 p-5 align-top group-hover:bg-lilac-400/[0.03]">{r.cell(q)}</td>)}
              </tr>
            ))}
            <tr>
              <td className="sticky start-0 bg-night-900/90 p-5" />
              {quotes.map((q) => <td key={q.id} className="p-5"><Button className="w-full" onClick={() => setConfirm(q)}>{t('compare.accept')}</Button></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="scroll-x -mx-4 flex snap-x snap-mandatory gap-4 px-4 pb-4 lg:hidden">
        {quotes.map((q, i) => {
          const s = byId(SUPPLIERS, q.supplierId)!;
          const on = short.has(q.id);
          return (
            <Glass key={q.id} className="w-[86%] shrink-0 snap-center p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-lilac-400">{lang === 'ar' ? 'العرض' : 'Quote'} {LETTERS[i]}</div>
                  <div className="mt-1 font-semibold"><bdi>{s.name[lang]}</bdi></div>
                  <div className="mt-1"><VerifiedBadge level={s.level} short /></div>
                </div>
                <button type="button" onClick={() => toggle(q.id)} aria-pressed={on} aria-label={t('compare.shortlist')} className="grid h-11 w-11 place-items-center"><Star className={`h-5 w-5 ${on ? 'fill-lilac-400 text-lilac-400' : 'text-ink-3'}`} /></button>
              </div>
              <dl className="mt-4 divide-y divide-lilac-400/10 text-sm">
                {rows.map((r) => <div key={r.label} className="flex items-start justify-between gap-3 py-2.5"><dt className="text-xs text-ink-3">{r.label}</dt><dd className="text-end">{r.cell(q)}</dd></div>)}
              </dl>
              <Button className="mt-4 w-full" onClick={() => setConfirm(q)}>{t('compare.accept')}</Button>
            </Glass>
          );
        })}
      </div>

      <AnimatePresence>
        {confirm && fee && (
          <motion.div className="fixed inset-0 z-50 grid place-items-end bg-night-950/70 backdrop-blur-sm sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 36 }} className="glass w-full max-w-lg !rounded-b-none p-6 sm:!rounded-[24px]">
              <div className="flex items-center justify-between"><h2 id="confirm-title" className="text-2xl">{t('compare.confirm.title')}</h2><button type="button" onClick={() => setConfirm(null)} className="grid h-11 w-11 place-items-center" aria-label={t('compare.cancel')}><X className="h-5 w-5" /></button></div>
              <dl className="mt-4 divide-y divide-lilac-400/10 text-sm">
                <Row k={t('compare.supplier')} v={<bdi>{byId(SUPPLIERS, confirm.supplierId)!.name[lang]}</bdi>} />
                <Row k={t('compare.unit')} v={<Num>{fmtMoney(confirm.unitPrice, confirm.currency, lang)}</Num>} />
                <Row k={t('rfq.quantity')} v={<><Num>{fmtNumber(rfq.quantity, lang)}</Num> {rfq.unit[lang]}</>} />
                <Row k={t('compare.total')} v={<span className="text-lg font-semibold text-lilac-200"><Num>{fmtMoney(confirm.unitPrice * rfq.quantity, confirm.currency, lang)}</Num></span>} />
              </dl>
              <div className="mt-4 rounded-[14px] border border-success/40 bg-success/10 p-3 text-sm text-success">
                {fee.kind === 'noFees' ? t('compare.confirm.fee', { date: fmtDate(fee.until, lang) }) : fee.kind === 'commission' ? t('fees.dealCommission', { amount: fmtMoney(fee.amount, confirm.currency, lang) }) : t('plans.coming')}
              </div>
              <p className="mt-3 text-xs text-ink-3">{t('escrow.notConnected')}</p>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setConfirm(null)}>{t('compare.cancel')}</Button>
                <Button className="flex-1" onClick={() => { setConfirm(null); toast(t('deal.n1')); navigate('/deal/D-1042'); }}>{t('compare.confirm.go')}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Best({ label }: { label: string }) {
  return <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-lilac-400/15 px-2 py-0.5 text-[0.7rem] font-semibold text-lilac-200"><CircleDot className="h-3 w-3 text-lilac-400" aria-hidden="true" />{label}</span>;
}
function Fact({ icon: I, label, value }: { icon: typeof Clock; label: string; value: ReactNode }) {
  return <div className="flex items-start gap-3"><I className="mt-0.5 h-5 w-5 shrink-0 text-lilac-400" /><div><div className="text-xs text-ink-3">{label}</div><div className="mt-0.5 font-semibold">{value}</div></div></div>;
}
function Row({ k, v }: { k: string; v: ReactNode }) {
  return <div className="flex items-center justify-between gap-4 py-2.5"><dt className="text-ink-3">{k}</dt><dd>{v}</dd></div>;
}
