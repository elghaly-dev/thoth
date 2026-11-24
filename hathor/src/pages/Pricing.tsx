import { Check, ChevronDown, Crown, Handshake, Hourglass, UserPlus } from 'lucide-react';
import { useI18n, type StringKey } from '../i18n';
import { FEE_CONFIG, ratePer100 } from '../lib/fees';
import { fmtMoney } from '../lib/format';
import { ButtonLink, Glass, PageHeader, Rise, Stagger } from '../components/ui';

export function PricingPage() {
  const { t, lang } = useI18n();
  const rate = ratePer100();
  const premium = FEE_CONFIG.premiumPriceMonthly;
  const cards: [typeof UserPlus, StringKey, StringKey, string][] = [
    [UserPlus, 'pricing.join.t', 'pricing.join.d', '1'],
    [Hourglass, 'pricing.first.t', 'pricing.first.d', '2'],
    [Handshake, 'pricing.after.t', 'pricing.after.d', '3'],
  ];
  return (
    <div>
      <PageHeader title={t('pricing.title')} sub={t('pricing.sub')} />
      <Stagger className="grid gap-4 md:grid-cols-3">
        {cards.map(([I, tk, dk, n]) => (
          <Rise key={tk}>
            <Glass hover className="relative h-full overflow-hidden p-7">
              <span className="num absolute end-5 top-4 text-6xl font-bold text-lilac-400/10" aria-hidden="true">{n}</span>
              <I className="h-8 w-8 text-lilac-400" strokeWidth={1.5} />
              <h2 className="mt-5 text-2xl">{t(tk)}</h2>
              <p className="mt-2 text-ink-2">{t(dk)}</p>
              {tk === 'pricing.after.t' && <p className="mt-4 rounded-[12px] border border-lilac-400/20 bg-night-800/60 px-3 py-2 text-sm text-lilac-200">{rate == null ? t('pricing.rateUnset') : t('pricing.rate', { n: rate })}</p>}
            </Glass>
          </Rise>
        ))}
      </Stagger>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-[24px] border border-lilac-300/50 bg-gradient-to-br from-lilac-400/20 via-night-800 to-night-900 p-7 shadow-[0_0_50px_-12px_rgba(196,161,236,0.6)] md:p-9">
          <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-lilac-400/20 blur-3xl" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-3">
            <Crown className="h-8 w-8 text-lilac-200" />
            <h2 className="title-gradient text-3xl">{t('pricing.premium.t')}</h2>
            <span className="chip">{t('pricing.premium.tag')}</span>
          </div>
          <p className="mt-2 text-ink-2">{t('pricing.premium.d')}</p>
          <div className="mt-5 text-2xl font-semibold text-lilac-100">{premium ? <bdi dir="ltr" className="num">{fmtMoney(premium.amount, premium.currency, lang)}</bdi> : t('plans.coming')}</div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {(['pricing.premium.f1', 'pricing.premium.f2', 'pricing.premium.f3', 'pricing.premium.f4', 'pricing.premium.f5', 'pricing.premium.f6'] as const).map((k) => (
              <li key={k} className="flex items-start gap-2.5 text-sm text-ink-1"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lilac-400 text-on-lilac"><Check className="h-3 w-3" strokeWidth={3} /></span>{t(k)}</li>
            ))}
          </ul>
          <ButtonLink to="/register" className="mt-8">{t('nav.register')}</ButtonLink>
        </div>
        <Glass className="p-7">
          <h2 className="mb-4 text-2xl">{t('pricing.faq')}</h2>
          <div className="space-y-2">
            {([['pricing.q1', 'pricing.a1'], ['pricing.q2', 'pricing.a2'], ['pricing.q3', 'pricing.a3']] as const).map(([q, a], i) => (
              <details key={q} open={i === 0} className="group rounded-[14px] border border-lilac-400/15 p-4 open:border-lilac-400/40 open:bg-lilac-400/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">{t(q)}<ChevronDown className="h-4 w-4 text-lilac-400 transition group-open:rotate-180" /></summary>
                <p className="mt-2 text-sm text-ink-2">{t(a)}</p>
              </details>
            ))}
          </div>
          <p className="mt-5 text-xs text-ink-3">{t('escrow.notConnected')}</p>
        </Glass>
      </div>
    </div>
  );
}
