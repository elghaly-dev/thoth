import { BadgeCheck, Building2, CalendarDays, Clock, Languages, MapPin, MessageSquare, ShieldOff, Star } from 'lucide-react';
import { useI18n, type StringKey } from '../i18n';
import { PRODUCTS, SUPPLIERS, byId } from '../data/sample';
import { fmtDate } from '../lib/format';
import { ProductCard } from '../components/Cards';
import { ButtonLink, Glass, PremiumBadge, SampleBadge, SectionTitle, VerifiedBadge } from '../components/ui';
import { ReportButton } from '../components/Report';
import { NotFound } from './NotFound';

export function SupplierPage({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const s = byId(SUPPLIERS, id);
  if (!s) return <NotFound />;
  const levels: [StringKey, StringKey][] = [['verify.documents', 'verify.documents.d'], ['verify.partner', 'verify.partner.d'], ['verify.site', 'verify.site.d']];
  return (
    <div className="space-y-10">
      <Glass className="relative overflow-hidden p-6 md:p-10">
        <div className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-lilac-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="wordmark grid h-24 w-24 shrink-0 place-items-center rounded-[28px] border border-lilac-400/50 bg-gradient-to-br from-night-700 to-night-900 text-3xl font-bold text-lilac-200 shadow-glow" dir="ltr" aria-hidden="true">{s.name.en.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2"><SampleBadge />{s.premium && <PremiumBadge />}</div>
            <h1 className="title-gradient mt-2 text-[clamp(2rem,1.6rem+1.6vw,3rem)] leading-tight"><bdi>{s.name[lang]}</bdi></h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-lilac-400" />{s.city[lang]}، {s.country[lang]}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-lilac-400" />{t('supplier.since', { date: fmtDate(s.since, lang, { month: 'long', year: 'numeric' }) })}</span>
              <span className="inline-flex items-center gap-1.5"><Languages className="h-4 w-4 text-lilac-400" />{s.languages.join(' · ')}</span>
            </div>
            <div className="mt-3"><VerifiedBadge level={s.level} date={s.verifiedOn} /></div>
            <p className="mt-3 max-w-2xl text-ink-2">{s.about[lang]}</p>
          </div>
          <div className="flex gap-3 md:flex-col">
            <ButtonLink to="/rfq/new">{t('cta.requestQuote')}</ButtonLink>
            <ButtonLink to="/messages/t1" variant="secondary"><MessageSquare className="h-4 w-4" />{t('nav.messages')}</ButtonLink>
            <ReportButton target={{ kind: 'supplier', id: s.id, label: s.name[lang] }} className="justify-center" />
          </div>
        </div>
      </Glass>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Glass className="p-6">
          <h2 className="mb-5 text-2xl">{t('verify.title')}</h2>
          <ol className="space-y-3">
            {levels.map(([k, d], i) => {
              const done = s.level > i;
              return (
                <li key={k} className={`flex gap-4 rounded-[14px] border p-4 ${done ? 'border-lilac-400/40 bg-lilac-400/5' : 'border-lilac-400/10'}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${done ? 'bg-lilac-400 text-on-lilac' : 'border border-lilac-400/40 text-ink-3'}`}>{done ? <BadgeCheck className="h-5 w-5" /> : <span className="num text-sm">{i + 1}</span>}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{t(k)}</span>
                      <span className="text-xs text-ink-3">{done ? fmtDate(s.verifiedOn, lang) : t('verify.pending')}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-2">{t(d)}</p>
                    <p className="mt-1 text-xs text-warning">{t('verify.notConnected')}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Glass>
        <div className="space-y-6">
          <Glass className="p-6">
            <h2 className="mb-4 text-2xl">{t('supplier.record')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                [Star, t('supplier.deals', { n: s.deals })],
                [BadgeCheck, t('record.onTime', { done: s.onTime[0], total: s.onTime[1] })],
                [Clock, t('supplier.reply', { n: s.replyHours })],
                [Building2, t('record.disputes', { n: s.disputes })],
              ].map(([I, label], i) => {
                const Icon = I as typeof Star;
                return <div key={i} className="rounded-[14px] border border-lilac-400/15 bg-night-800/50 p-4"><Icon className="h-5 w-5 text-lilac-400" /><div className="mt-2 text-sm">{label as string}</div></div>;
              })}
            </div>
          </Glass>
          <div className="glass flex items-start gap-3 p-5 text-sm text-ink-2"><ShieldOff className="h-5 w-5 shrink-0 text-lilac-400" />{t('supplier.noContact')}</div>
        </div>
      </div>

      <section>
        <SectionTitle title={t('supplier.products')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.filter((p) => p.supplierId === s.id).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
