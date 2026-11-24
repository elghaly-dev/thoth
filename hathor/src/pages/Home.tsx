import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Calculator, Coins, EyeOff, Languages, Search, ShieldCheck, Info, Sparkle } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';
import { Link, useRouter } from '../lib/router';
import { CATEGORIES, PRODUCTS, SUPPLIERS } from '../data/sample';
import { GlowLine } from '../components/GlowLine';
import { NamedIcon } from '../components/Icon';
import { ProductCard, SupplierCard } from '../components/Cards';
import { ButtonLink, Glass, Rise, SampleBadge, SectionTitle, Stagger } from '../components/ui';

function HeroArc({ labels }: { labels: { t: string; d: string }[] }) {
  const reduce = useReducedMotion();
  const { dir } = useI18n();
  const d = 'M 30 220 C 300 20, 900 20, 1170 220';
  const dots = [0.06, 0.28, 0.5, 0.72, 0.94];
  // Points along the curve, sampled from the same cubic.
  const pt = (t: number) => {
    const x = (1 - t) ** 3 * 30 + 3 * (1 - t) ** 2 * t * 300 + 3 * (1 - t) * t ** 2 * 900 + t ** 3 * 1170;
    const y = (1 - t) ** 3 * 220 + 3 * (1 - t) ** 2 * t * 20 + 3 * (1 - t) * t ** 2 * 20 + t ** 3 * 220;
    return { x, y };
  };
  return (
    <div className="relative">
    <svg viewBox="0 0 1200 300" className="pointer-events-none block h-auto w-full" style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <defs>
        <filter id="hero-glow" x="-0.1" y="-0.5" width="1.2" height="2">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="hero-g" x1="0" x2="1">
          <stop offset="0" stopColor="#9f7fd1" stopOpacity="0" />
          <stop offset="0.2" stopColor="#c4a1ec" />
          <stop offset="0.5" stopColor="#f1e7fd" />
          <stop offset="0.8" stopColor="#c4a1ec" />
          <stop offset="1" stopColor="#9f7fd1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="rgba(196,161,236,0.12)" strokeWidth="26" strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke="url(#hero-g)" strokeWidth="3" filter="url(#hero-glow)" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
      {dots.map((t, i) => {
        const p = pt(t);
        return (
          <motion.g key={i} initial={reduce ? false : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.18, duration: 0.4 }} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
            <circle cx={p.x} cy={p.y} r="16" fill="rgba(196,161,236,0.16)" />
            <circle cx={p.x} cy={p.y} r="7" fill={i === 2 ? '#f1e7fd' : '#c4a1ec'} filter="url(#hero-glow)" />
          </motion.g>
        );
      })}
    </svg>
    <ol className="absolute inset-0 hidden md:block">
      {dots.map((tt, i) => {
        const p = pt(tt);
        const left = (dir === 'rtl' ? 1 - p.x / 1200 : p.x / 1200) * 100;
        return (
          <motion.li key={i} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.15 }}
            className="absolute w-40 -translate-x-1/2 text-center" style={{ left: `${left}%`, top: `calc(${(p.y / 300) * 100}% + 22px)` }}>
            <div className={`text-sm font-semibold ${i === 2 ? 'text-lilac-100' : 'text-lilac-200'}`}>{labels[i]?.t}</div>
            <div className="mt-0.5 text-xs leading-snug text-ink-3">{labels[i]?.d}</div>
          </motion.li>
        );
      })}
    </ol>
    </div>
  );
}

export function Home() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const [q, setQ] = useState('');
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  const popular = lang === 'ar' ? ['تمر مجدول', 'HDPE', 'يوريا', 'دهن العود', 'حديد تسليح'] : ['Medjool dates', 'HDPE', 'Urea', 'Oud oil', 'Rebar'];

  return (
    <div className="space-y-20 lg:space-y-28">
      {/* Hero */}
      <section className="relative -mt-6 pt-10 lg:-mt-10 lg:pt-20">
        <div className="pointer-events-none absolute inset-y-0 w-screen" style={{ left: '50%', transform: 'translateX(-50%)' }} aria-hidden="true">
          <div className="grid-noise absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_30%,black_20%,transparent_70%)]" />
          <div className="absolute -top-40 h-[560px] w-[900px] max-w-full rounded-full bg-[radial-gradient(closest-side,rgba(64,96,210,0.38),transparent)]" style={{ left: '50%', transform: 'translateX(-50%)' }} />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-lilac-400/30 bg-night-800/60 px-4 py-1.5 text-xs text-lilac-200 backdrop-blur">
            <Sparkle className="h-3.5 w-3.5 text-lilac-400" aria-hidden="true" /> {t('hero.kicker')}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="title-gradient text-[clamp(2.4rem,1.6rem+3.6vw,4.4rem)] leading-[1.12]">
            {t('hero.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }} className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2 md:text-lg">
            {t('hero.tagline')}
          </motion.p>
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}
            onSubmit={(e) => { e.preventDefault(); navigate(`/catalog${q ? `?q=${encodeURIComponent(q)}` : ''}`); }}
            className="glass mx-auto mt-9 flex max-w-2xl items-center gap-2 !rounded-[20px] p-2 shadow-[0_0_0_1px_rgba(196,161,236,0.25),0_20px_60px_-20px_rgba(159,127,209,0.55)]" role="search">
            <Search className="ms-3 h-5 w-5 shrink-0 text-lilac-400" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.placeholder')} aria-label={t('search.placeholder')} className="h-12 min-w-0 flex-1 bg-transparent text-base text-ink-1 outline-none placeholder:text-ink-3" />
            <button type="submit" className="h-12 shrink-0 rounded-[14px] bg-lilac-400 px-6 font-semibold text-on-lilac hover:bg-lilac-300 hover:shadow-glow">{t('search.button')}</button>
          </motion.form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-ink-3">{t('search.popular')}:</span>
            {popular.map((p) => <Link key={p} to={`/catalog?q=${encodeURIComponent(p)}`} className="chip hover:border-lilac-400">{p}</Link>)}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink to="/rfq/new" size="lg">{t('cta.requestQuote')} <Arrow className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink to="/catalog" variant="secondary" size="lg">{t('cta.browse')}</ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto mt-6 max-w-[1200px] md:-mb-10">
          <HeroArc labels={(['find', 'quote', 'deal', 'ship', 'receive'] as const).map((k) => ({ t: t(`journey.${k}`), d: t(`journey.${k}.d`) }))} />
        </div>
      </section>

      {/* Journey */}
      <section aria-labelledby="journey" className="md:hidden">
        <Glass className="relative overflow-hidden p-6 md:p-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 id="journey" className="title-gradient text-2xl md:text-3xl">{t('journey.title')}</h2>
          </div>
          <GlowLine nodes={[
            { label: t('journey.find'), caption: t('journey.find.d'), state: 'done' },
            { label: t('journey.quote'), caption: t('journey.quote.d'), state: 'done' },
            { label: t('journey.deal'), caption: t('journey.deal.d'), state: 'now' },
            { label: t('journey.ship'), caption: t('journey.ship.d'), state: 'next' },
            { label: t('journey.receive'), caption: t('journey.receive.d'), state: 'next' },
          ]} />
        </Glass>
      </section>

      {/* Categories */}
      <section aria-labelledby="cats">
        <SectionTitle title={t('home.categories')} action={<Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-lilac-400 hover:text-lilac-200">{t('home.categories.all')} <Arrow className="h-4 w-4" /></Link>} />
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {CATEGORIES.map((c) => (
            <Rise key={c.id}>
              <Link to={`/catalog?cat=${c.id}`} className="glass glass-hover group flex h-full items-center gap-3 p-4 md:flex-col md:items-start md:gap-5 md:p-5">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-lilac-400/30 bg-night-800">
                  <span className="absolute inset-0 rounded-2xl opacity-0 blur-md transition-opacity group-hover:opacity-100" style={{ background: `hsl(${c.hue} 70% 65% / 0.3)` }} />
                  <NamedIcon name={c.icon} className="relative h-6 w-6 text-lilac-200" />
                </span>
                <span className="text-sm font-semibold text-ink-1 md:text-base">{c.name[lang]}</span>
              </Link>
            </Rise>
          ))}
        </Stagger>
      </section>

      {/* Featured */}
      <section aria-labelledby="featured">
        <SectionTitle title={t('home.featured')} kicker={t('home.featured.label')} action={<SampleBadge />} />
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PRODUCTS.filter((p) => p.featured).map((p) => <Rise key={p.id}><ProductCard p={p} /></Rise>)}
        </Stagger>
      </section>

      {/* Suppliers */}
      <section aria-labelledby="suppliers">
        <SectionTitle title={t('home.suppliers')} action={<SampleBadge />} />
        <div className="scroll-x -mx-4 flex gap-4 px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {SUPPLIERS.filter((s) => s.level >= 2).map((s) => <SupplierCard key={s.id} s={s} />)}
        </div>
      </section>

      {/* Why */}
      <section>
        <SectionTitle title={t('home.why')} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {([
            [Calculator, 'why.landed.t', 'why.landed.d'],
            [ShieldCheck, 'why.verified.t', 'why.verified.d'],
            [Languages, 'why.locked.t', 'why.locked.d'],
            [EyeOff, 'why.masked.t', 'why.masked.d'],
          ] as const).map(([I, tk, dk]) => (
            <Glass key={tk} hover className="p-6">
              <I className="h-7 w-7 text-lilac-400" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 text-xl">{t(tk)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{t(dk)}</p>
            </Glass>
          ))}
        </div>
      </section>

      {/* Fees + escrow honesty */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Glass className="relative overflow-hidden p-7 md:p-9">
          <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-lilac-400/10 blur-3xl" aria-hidden="true" />
          <div className="flex items-center gap-3"><Coins className="h-6 w-6 text-lilac-400" aria-hidden="true" /><h2 className="title-gradient text-2xl md:text-3xl">{t('home.fees.title')}</h2></div>
          <ol className="mt-6 space-y-4">
            {(['fees.join', 'fees.first3', 'fees.after'] as const).map((k, i) => (
              <li key={k} className="flex items-start gap-4">
                <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-full border border-lilac-400/50 bg-night-800 text-sm font-semibold text-lilac-200">{i + 1}</span>
                <span className="pt-1 text-ink-1">{t(k)}</span>
              </li>
            ))}
          </ol>
          <Link to="/pricing" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-lilac-400 hover:text-lilac-200">{t('fees.seePlans')} <Arrow className="h-4 w-4" /></Link>
        </Glass>
        <div className="flex flex-col gap-4">
          <div className="glass flex items-start gap-3 !border-info/40 p-6">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ink-1">{t('escrow.notConnected')}</p>
          </div>
          <Glass className="flex flex-1 flex-col justify-between gap-4 p-6">
            <div>
              <h3 className="text-2xl">{t('home.cta.title')}</h3>
              <p className="mt-2 text-sm text-ink-2">{t('home.cta.d')}</p>
            </div>
            <ButtonLink to="/register" className="self-start">{t('nav.register')} <Arrow className="h-4 w-4" /></ButtonLink>
          </Glass>
        </div>
      </section>
    </div>
  );
}
