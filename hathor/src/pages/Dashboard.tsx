import { ArrowLeft, ArrowRight, Calculator, Camera, Eye, FileWarning, Hash, Heart, Inbox, Layers, ShieldCheck, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { Link } from '../lib/router';
import { useStore } from '../lib/store';
import { DEAL, ME, PRODUCTS, RFQS, SUPPLIERS, byId } from '../data/sample';
import { addMonths } from '../lib/fees';
import { fmtDate, fmtNumber } from '../lib/format';
import { MiniLine } from '../components/GlowLine';
import { ProductArt } from '../components/ProductArt';
import { ButtonLink, Glass, Num, SampleBadge, VerifiedBadge } from '../components/ui';

const STATUS: Record<string, StringKey> = { draft: 'dash.status.draft', open: 'dash.status.open', quotes: 'dash.status.quotes', closed: 'dash.status.closed' };

function Shell({ title, sub, switchTo, switchLabel, children }: { title: string; sub: string; switchTo: string; switchLabel: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2"><SampleBadge /></div>
          <h1 className="title-gradient text-[clamp(2rem,1.5rem+2vw,3rem)] leading-tight">{title}</h1>
          <p className="mt-1 text-ink-2">{sub}</p>
        </div>
        <ButtonLink to={switchTo} variant="secondary">{switchLabel}</ButtonLink>
      </div>
      {children}
    </div>
  );
}

function FeeCard() {
  const { t, lang } = useI18n();
  const until = addMonths(ME.created, 3).toISOString();
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-success/40 bg-gradient-to-br from-success/10 to-night-900 p-5">
      <div className="text-xs font-semibold text-success">{t('dash.fee')}</div>
      <div className="mt-2 text-lg font-semibold text-ink-1">{t('fees.until', { date: fmtDate(until, lang) })}</div>
      <Link to="/pricing" className="mt-2 inline-block text-xs text-lilac-400 hover:text-lilac-200">{t('fees.seePlans')}</Link>
    </div>
  );
}

export function BuyerDashboard() {
  const { t, lang } = useI18n();
  const { saved } = useStore();
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  const next = [
    { label: `${t('deal.fund')} — ${DEAL.id}`, to: `/deal/${DEAL.id}`, note: t('escrow.notConnected') },
    { label: `${t('compare.title')} — ${RFQS[0].id}`, to: `/rfq/${RFQS[0].id}`, note: t('dash.newQuotes', { n: RFQS[0].newQuotes }) },
    { label: `${t('rfq.post')} — ${RFQS[2].id}`, to: '/rfq/new', note: t('dash.status.draft') },
  ];
  return (
    <Shell title={t('dash.hello', { name: ME.name[lang] })} sub={ME.company[lang]} switchTo="/dashboard/supplier" switchLabel={t('dash.switchSupplier')}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Glass className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-2xl">{t('dash.next')}</h2>
          <ul className="space-y-2">
            {next.map((n, i) => (
              <li key={i}>
                <Link to={n.to} className="flex items-center gap-4 rounded-[14px] border border-lilac-400/15 p-4 hover:border-lilac-400/50 hover:bg-lilac-400/5">
                  <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lilac-400/15 text-sm font-semibold text-lilac-200">{i + 1}</span>
                  <span className="flex-1"><span className="block font-semibold">{n.label}</span><span className="text-xs text-ink-3">{n.note}</span></span>
                  <Arrow className="h-4 w-4 text-lilac-400" />
                </Link>
              </li>
            ))}
          </ul>
        </Glass>
        <div className="space-y-4">
          <FeeCard />
          <Link to="/product/medjool-premium" className="glass glass-hover flex items-center gap-3 p-5"><Calculator className="h-6 w-6 text-lilac-400" /><span className="font-semibold">{t('dash.calculator')}</span></Link>
        </div>

        <Glass className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-2xl">{t('dash.requests')}</h2>
          <div className="divide-y divide-lilac-400/10">
            {RFQS.map((r) => (
              <Link key={r.id} to={r.status === 'draft' ? '/rfq/new' : `/rfq/${r.id}`} className="flex items-center gap-4 py-3.5 hover:text-lilac-200">
                <Inbox className="h-5 w-5 shrink-0 text-lilac-400" />
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold"><bdi>{r.title[lang]}</bdi></span><span className="text-xs text-ink-3"><bdi className="num">{r.id}</bdi> · <bdi className="num">{fmtNumber(r.quantity, lang)}</bdi> {r.unit[lang]} · <bdi>{r.incoterm}</bdi></span></span>
                {r.newQuotes > 0 && <span className="chip">{t('dash.newQuotes', { n: r.newQuotes })}</span>}
                <span className={`rounded-full px-2.5 py-1 text-xs ${r.status === 'quotes' ? 'bg-lilac-400 text-on-lilac font-semibold' : 'border border-lilac-400/30 text-ink-2'}`}>{t(STATUS[r.status])}</span>
              </Link>
            ))}
          </div>
        </Glass>
        <Glass className="p-6">
          <h2 className="mb-4 text-2xl">{t('dash.deals')}</h2>
          <Link to={`/deal/${DEAL.id}`} className="block rounded-[14px] border border-lilac-400/15 p-4 hover:border-lilac-400/50">
            <div className="flex items-center justify-between"><span className="num font-semibold">{DEAL.id}</span><span className="text-xs text-warning">{t('deal.n3')}</span></div>
            <div className="mt-1 text-sm text-ink-2"><bdi>{DEAL.title[lang]}</bdi></div>
            <div className="mt-4"><MiniLine total={DEAL.nodes.length} current={DEAL.nodes.findIndex((n) => n.state === 'now')} /></div>
          </Link>
        </Glass>

        <Glass className="p-6 lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 text-2xl"><Heart className="h-5 w-5 text-lilac-400" />{t('dash.saved')}</h2>
          <div className="scroll-x flex gap-4">
            {PRODUCTS.filter((p) => saved.has(p.id) || p.featured).slice(0, 5).map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="w-52 shrink-0 overflow-hidden rounded-[14px] border border-lilac-400/15 hover:border-lilac-400/50">
                <ProductArt {...p.art} label={p.title[lang]} className="aspect-[4/3]" />
                <div className="p-3 text-sm font-semibold"><bdi>{p.title[lang]}</bdi></div>
              </Link>
            ))}
          </div>
        </Glass>
      </div>
    </Shell>
  );
}

export function SupplierDashboard() {
  const { t, lang } = useI18n();
  const me = byId(SUPPLIERS, 'nakheel-alwaha')!;
  const quotes: [string, StringKey][] = [['R-2041', 'dash.q.short'], ['R-2029', 'dash.q.sent'], ['R-2017', 'dash.q.accepted'], ['R-2004', 'dash.q.expired']];
  return (
    <Shell title={t('dash.hello', { name: lang === 'ar' ? 'سارة' : 'Sara' })} sub={me.name[lang]} switchTo="/dashboard" switchLabel={t('dash.switchBuyer')}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Glass className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-2xl">{t('dash.matching')}</h2>
          <ul className="space-y-2">
            {RFQS.slice(0, 2).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-[14px] border border-lilac-400/15 p-4">
                <span className="min-w-0 flex-1"><span className="block font-semibold"><bdi>{r.title[lang]}</bdi></span><span className="text-xs text-ink-3"><bdi className="num">{r.id}</bdi> · <bdi className="num">{fmtNumber(r.quantity, lang)}</bdi> {r.unit[lang]} · <bdi>{r.incoterm}</bdi> · {r.port[lang]}</span></span>
                <ButtonLink to={`/rfq/${r.id}`}>{t('dash.sendQuote')}</ButtonLink>
              </li>
            ))}
          </ul>
        </Glass>
        <div className="space-y-4">
          <FeeCard />
          <Glass className="p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-5 w-5 text-lilac-400" />{t('dash.verify')}</div>
            <VerifiedBadge level={me.level} date={me.verifiedOn} />
            <p className="mt-2 text-xs text-warning">{t('verify.notConnected')}</p>
          </Glass>
        </div>

        <Glass className="p-6">
          <h2 className="mb-4 text-2xl">{t('dash.quotesSent')}</h2>
          <ul className="divide-y divide-lilac-400/10 text-sm">
            {quotes.map(([id, k]) => (
              <li key={id} className="flex items-center justify-between py-3"><span className="num">{id}</span><span className={`rounded-full px-2.5 py-1 text-xs ${k === 'dash.q.accepted' ? 'bg-lilac-400 font-semibold text-on-lilac' : k === 'dash.q.expired' ? 'text-ink-3' : 'border border-lilac-400/30 text-lilac-200'}`}>{t(k)}</span></li>
            ))}
          </ul>
        </Glass>
        <Glass className="p-6">
          <h2 className="mb-4 text-2xl">{t('dash.health')}</h2>
          <ul className="space-y-2 text-sm">
            {([[Hash, 'dash.health.hs', 0], [Camera, 'dash.health.photos', 2], [Layers, 'dash.health.tiers', 1]] as const).map(([I, k, n]) => (
              <li key={k} className="flex items-center gap-3 rounded-[12px] border border-lilac-400/10 p-3">
                <I className="h-4 w-4 text-lilac-400" /><span className="flex-1">{t(k)}</span><span className="num font-semibold">{n}</span>
                {n > 0 && <button type="button" className="text-xs font-semibold text-lilac-400 hover:text-lilac-200">{t('dash.fix')}</button>}
              </li>
            ))}
          </ul>
        </Glass>
        <Glass className="p-6">
          <h2 className="mb-4 text-2xl">{t('dash.performance')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border border-lilac-400/15 bg-night-800/50 p-4"><Eye className="h-5 w-5 text-lilac-400" /><div className="num mt-2 text-2xl font-semibold"><Num>{fmtNumber(1240, lang)}</Num></div><div className="text-xs text-ink-3">{t('dash.views')}</div></div>
            <div className="rounded-[14px] border border-lilac-400/15 bg-night-800/50 p-4"><Timer className="h-5 w-5 text-lilac-400" /><div className="mt-2 text-sm font-semibold">{t('supplier.reply', { n: me.replyHours })}</div></div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-2"><FileWarning className="h-4 w-4 text-lilac-400" />{t('dash.matched', { a: 12, b: 40 })}</p>
        </Glass>
      </div>
    </Shell>
  );
}
