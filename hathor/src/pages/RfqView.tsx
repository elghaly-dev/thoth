// A posted RFQ: summary, open or closed state, and the side-by-side compare
// view of the quotes suppliers sent.
import { Boxes, CalendarClock, Clock, FileText, MapPin, Package2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { CATEGORIES, SUPPLIERS, byId } from '../data/sample';
import { DESTINATIONS, ORIGIN_PORTS, bestOf, isClosed, loadQuotes, loadRfqs, type StoredQuote } from '../lib/rfq';
import { browserKV } from '../lib/reports';
import { fmtDate, fmtMoney, fmtNumber } from '../lib/format';
import { ButtonLink, Glass, MaskedText, Num, PageHeader, VerifiedBadge } from '../components/ui';
import { LandedCost } from '../components/LandedCost';
import { NotFound } from './NotFound';

export function RfqView({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const kv = browserKV();
  const rfq = loadRfqs(kv).find((r) => r.id === id);
  if (!rfq) return <NotFound />;
  const quotes = loadQuotes(kv, rfq.id);
  const closed = isClosed(rfq);
  const best = bestOf(quotes);
  const dest = DESTINATIONS.find((d) => d.id === rfq.destination);
  const cat = CATEGORIES.find((c) => c.id === rfq.category);
  const sameCur = quotes.every((q) => q.currency === quotes[0]?.currency);
  // The estimate starts from the lowest-priced quote. With mixed currencies no
  // lowest price is marked, so it starts from the first quote and says so.
  const basis = quotes.find((q) => best.price.includes(q.id)) ?? quotes[0];
  const basisName = basis ? (byId(SUPPLIERS, basis.supplierId)?.name[lang] ?? basis.supplierId) : '';
  const yes = (b: boolean) => (b ? t('compare.yes') : t('compare.no'));
  const missing = <span className="italic text-ink-3">{t('compare.missing')}</span>;

  const rows: { label: string; cell: (q: StoredQuote) => ReactNode }[] = [
    { label: t('compare.unit'), cell: (q) => <div><Num>{fmtMoney(q.unitPrice, q.currency, lang)}</Num>{best.price.includes(q.id) && <span className="ms-2 chip !text-[0.7rem]">{t('compare.bestPrice')}</span>}</div> },
    { label: t('compare.total'), cell: (q) => <Num>{fmtMoney(q.total, q.currency, lang)}</Num> },
    { label: t('compare.moq'), cell: (q) => <span><Num>{fmtNumber(q.moq, lang)}</Num> <bdi>{rfq.unit}</bdi></span> },
    { label: t('compare.lead'), cell: (q) => <div>{t('product.days', { n: q.leadDays })}{best.lead.includes(q.id) && <span className="ms-2 chip !text-[0.7rem]">{t('compare.bestLead')}</span>}</div> },
    { label: t('compare.terms'), cell: (q) => <span><Num>{q.incoterm}</Num> · {ORIGIN_PORTS.find((p) => p.id === q.originPort)?.[lang]}</span> },
    { label: t('compare.payment'), cell: (q) => <MaskedText text={q.paymentTerms} /> },
    { label: t('compare.valid'), cell: (q) => <bdi className="num">{fmtDate(q.validUntil, lang)}</bdi> },
    { label: t('compare.freight'), cell: (q) => (q.freight === null ? missing : <Num>{fmtMoney(q.freight, q.currency, lang)}</Num>) },
    { label: t('compare.sample'), cell: (q) => yes(q.sampleAvailable) },
    { label: t('compare.datasheet'), cell: (q) => (q.datasheet ? <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /><bdi>{q.datasheet}</bdi></span> : missing) },
  ];

  return (
    <div>
      <PageHeader title={rfq.title} sub={`⁨${rfq.id}⁩ · ${t('compare.quotes', { n: quotes.length })}`}>
        {!closed && <ButtonLink to={`/rfq/${rfq.id}/quote`} variant="secondary">{t('rfq.sendQuote')}</ButtonLink>}
      </PageHeader>
      <p className={`mb-4 inline-flex rounded-full border px-4 py-1.5 text-sm ${closed ? 'border-warning/40 bg-warning/10 text-warning' : 'border-success/40 bg-success/10 text-success'}`}>
        {t(closed ? 'rfq.isClosed' : 'rfq.isOpen', { date: fmtDate(rfq.quoteDeadline, lang) })}
      </p>
      <Glass className="mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Fact icon={Package2} label={t('rfq.category')} value={cat ? cat.name[lang] : rfq.category} />
        <Fact icon={Boxes} label={t('rfq.quantity')} value={<><Num>{fmtNumber(rfq.quantity, lang)}</Num> <bdi>{rfq.unit}</bdi></>} />
        <Fact icon={MapPin} label={t('rfq.destination')} value={<><Num>{rfq.incoterm}</Num> · {dest?.[lang]}</>} />
        <Fact icon={Clock} label={t('rfq.by')} value={<bdi className="num">{fmtDate(rfq.deliverBy, lang)}</bdi>} />
        <Fact icon={CalendarClock} label={t('rfq.deadline')} value={<bdi className="num">{fmtDate(rfq.quoteDeadline, lang)}</bdi>} />
      </Glass>
      <Glass className="mb-6 p-5 text-sm">
        <dl className="grid gap-2 sm:grid-cols-2">
          {rfq.specs.map((s, i) => <div key={i} className="flex justify-between gap-3"><dt className="text-ink-3"><MaskedText text={s.k} /></dt><dd><MaskedText text={s.v} /></dd></div>)}
        </dl>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {rfq.target && <span className="chip">{t('rfq.target')}: <Num>{fmtMoney(rfq.target.price, rfq.target.currency, lang)}</Num></span>}
          {rfq.sampleNeeded && <span className="chip">{t('rfq.sampleNeeded')}</span>}
          {rfq.certs.map((c) => <span key={c} className="chip">{c}</span>)}
          {rfq.attachments.map((a) => <span key={a} className="chip"><FileText className="h-3 w-3" /><bdi>{a}</bdi></span>)}
        </div>
      </Glass>

      {quotes.length === 0 ? <Glass className="mb-6 p-8 text-center text-ink-3">{t('rfq.noQuotes')}</Glass> : (
        <div className="glass mb-6 overflow-x-auto">
          {!sameCur && <p className="p-4 text-xs text-warning">{t('compare.mixed')}</p>}
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead><tr>
              <th className="sticky start-0 w-44 bg-night-900/90 p-4 text-start text-xs text-ink-3">{t('compare.supplier')}</th>
              {quotes.map((q) => { const s = byId(SUPPLIERS, q.supplierId); return (
                <th key={q.id} className="p-4 text-start align-top font-normal"><div className="font-semibold text-ink-1"><bdi>{s ? s.name[lang] : q.supplierId}</bdi></div>{s && <div className="mt-1"><VerifiedBadge level={s.level} short /></div>}</th>
              ); })}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="sticky start-0 border-t border-lilac-400/10 bg-night-900/90 p-4 text-start text-xs font-medium text-ink-3">{r.label}</th>
                  {quotes.map((q) => <td key={q.id} className="border-t border-lilac-400/10 p-4 align-top">{r.cell(q)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {basis && <p className="mb-3 text-xs text-ink-3"><bdi>{t(sameCur ? 'rfq.estimateLowest' : 'rfq.estimateFirst', { name: basisName })}</bdi></p>}
      <LandedCost key={basis?.id ?? 'none'} currency={basis?.currency ?? 'USD'} value={basis?.total ?? 0} incoterm={rfq.incoterm} rateId={rfq.category === 'packaging' ? 'packaging' : rfq.category === 'dates' || rfq.category === 'fertilisers' ? 'food-agri' : 'other'} />
    </div>
  );
}

function Fact({ icon: I, label, value }: { icon: typeof Boxes; label: string; value: ReactNode }) {
  return <div className="flex items-start gap-3"><I className="mt-0.5 h-4 w-4 shrink-0 text-lilac-400" /><div><div className="text-xs text-ink-3">{label}</div><div className="mt-0.5 font-semibold">{value}</div></div></div>;
}
