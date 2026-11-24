import { BadgeCheck, CheckCircle2, Clock, FileText, Heart, MapPin, MessageSquare, Package2, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { CATEGORIES, PORTS, PRODUCTS, SUPPLIERS, byId } from '../data/sample';
import { fmtMoney, fmtNumber } from '../lib/format';
import { ProductArt } from '../components/ProductArt';
import { ProductCard } from '../components/Cards';
import { AssistantGlyph } from '../components/Brand';
import { Button, ButtonLink, EstimateTag, Glass, Num, PremiumBadge, SampleBadge, SectionTitle, VerifiedBadge } from '../components/ui';
import { NotFound } from './NotFound';

export function ProductPage({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { saved, toggleSaved, openAssistant, setAssistantCtx } = useStore();
  const p = byId(PRODUCTS, id);
  const [qty, setQty] = useState(p ? p.tiers[0].minQty : 0);
  const [port, setPort] = useState(0);
  const [view, setView] = useState(0);
  useEffect(() => { if (p) setAssistantCtx({ kind: 'product', id: p.id, label: p.title[lang] }); }, [p, lang, setAssistantCtx]);
  const unitPrice = useMemo(() => {
    if (!p) return 0;
    const tier = [...p.tiers].reverse().find((x) => qty >= x.minQty) ?? p.tiers[0];
    return tier.price;
  }, [p, qty]);
  if (!p) return <NotFound />;
  const s = byId(SUPPLIERS, p.supplierId)!;
  const cat = CATEGORIES.find((c) => c.id === p.category)!;
  const goods = unitPrice * qty;
  const views = [p.art, { ...p.art, pattern: 'rings' as const, hue: p.art.hue + 20 }, { ...p.art, pattern: 'grid' as const, hue: p.art.hue - 20 }];
  const isSaved = saved.has(p.id);

  return (
    <div className="pb-24 lg:pb-0">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-ink-3" aria-label="breadcrumb">
        <Link to="/catalog" className="hover:text-lilac-200">{t('nav.catalog')}</Link><span>/</span>
        <Link to={`/catalog?cat=${cat.id}`} className="hover:text-lilac-200">{cat.name[lang]}</Link><span>/</span>
        <span className="text-ink-2"><bdi>{p.title[lang]}</bdi></span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="glass overflow-hidden"><ProductArt {...views[view]} label={p.title[lang]} className="aspect-[4/3]" /></div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {views.map((v, i) => (
              <button key={i} type="button" onClick={() => setView(i)} aria-label={`${p.title[lang]} ${i + 1}`} aria-pressed={view === i}
                className={`overflow-hidden rounded-[14px] border transition ${view === i ? 'border-lilac-400 shadow-glow' : 'border-lilac-400/20 opacity-70 hover:opacity-100'}`}>
                <ProductArt {...v} label="" className="aspect-[4/3]" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="chip">{cat.name[lang]}</span>
              {p.sampleAvailable && <span className="chip"><CheckCircle2 className="h-3.5 w-3.5" />{t('product.sample')}</span>}
              <SampleBadge />
            </div>
            <h1 className="title-gradient text-[clamp(1.9rem,1.5rem+1.6vw,2.8rem)] leading-tight"><bdi>{p.title[lang]}</bdi></h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
              <span>{t('product.hs')}: <Num>{p.hs}</Num></span>
              <span>{t('product.origin')}: {p.origin[lang]}</span>
            </div>
          </div>

          <Link to={`/supplier/${s.id}`} className="glass glass-hover flex items-center gap-4 p-4">
            <div className="wordmark grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-lilac-400/40 bg-night-800 text-sm font-bold text-lilac-200" dir="ltr">{s.name.en.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-semibold"><bdi>{s.name[lang]}</bdi></span>{s.premium && <PremiumBadge short />}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-2">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city[lang]}، {s.country[lang]}</span>
                <VerifiedBadge level={s.level} date={s.verifiedOn} />
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-3">
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{t('supplier.deals', { n: s.deals })}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{t('supplier.reply', { n: s.replyHours })}</span>
              </div>
            </div>
          </Link>

          <Glass className="p-5">
            <h2 className="mb-3 text-xl">{t('product.tiers')}</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-ink-3"><th className="pb-2 text-start font-medium">{t('product.qty')}</th><th className="pb-2 text-end font-medium">{t('product.unitPrice')}</th></tr></thead>
              <tbody>
                {p.tiers.map((tier, i) => {
                  const active = unitPrice === tier.price;
                  return (
                    <tr key={i} className={`border-t border-lilac-400/10 ${active ? 'text-lilac-200' : ''}`}>
                      <td className="py-2.5"><Num>≥ {fmtNumber(tier.minQty, lang)}</Num> {p.unit[lang]}</td>
                      <td className="py-2.5 text-end font-semibold"><Num>{fmtMoney(tier.price, p.currency, lang)}</Num> <span className="text-xs font-normal text-ink-3">/ {p.unit[lang]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-2">
              <span><Num>{p.incoterm}</Num> · <bdi>{p.port[lang]}</bdi></span>
              <span className="inline-flex items-center gap-1"><Package2 className="h-3.5 w-3.5 text-lilac-400" />{t('product.moq')} <Num>{fmtNumber(p.moq, lang)}</Num> {p.unit[lang]}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-lilac-400" />{t('product.days', { n: p.leadDays })}</span>
            </div>
          </Glass>

          <div className="hidden gap-3 lg:flex">
            <ButtonLink to={`/rfq/new?product=${p.id}`} size="lg" className="flex-1">{t('cta.requestQuote')}</ButtonLink>
            <ButtonLink to="/messages/t1" variant="secondary" size="lg"><MessageSquare className="h-4 w-4" />{t('product.message')}</ButtonLink>
            <Button variant="secondary" size="lg" onClick={() => toggleSaved(p.id)} aria-pressed={isSaved} aria-label={t('product.save')}><Heart className={`h-4 w-4 ${isSaved ? 'fill-lilac-400' : ''}`} /></Button>
          </div>
          <button type="button" onClick={() => openAssistant({ kind: 'product', id: p.id, label: p.title[lang] }, 'write')} className="flex w-full items-center gap-3 rounded-[14px] border border-lilac-400/30 bg-lilac-400/5 p-3 text-start text-sm text-lilac-200 hover:border-lilac-400 hover:bg-lilac-400/10">
            <AssistantGlyph className="h-6 w-6" /> <span className="flex-1">{t('assistant.ask')}</span><span className="text-xs text-ink-3">{t('assistant.s.write')}</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Glass className="p-6">
          <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-2xl">{t('product.landed')}</h2><EstimateTag /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs text-ink-3">{t('product.qty')} ({p.unit[lang]})</span>
              <input type="number" min={p.moq} value={qty} onChange={(e) => setQty(Math.max(0, Number(e.target.value)))} className="field num" dir="ltr" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-ink-3">{t('product.landed.port')}</span>
              <select value={port} onChange={(e) => setPort(Number(e.target.value))} className="field">{PORTS.map((pp, i) => <option key={i} value={i}>{pp[lang]}</option>)}</select>
            </label>
          </div>
          <dl className="mt-5 divide-y divide-lilac-400/10 text-sm">
            <div className="flex items-center justify-between py-2.5"><dt>{t('product.landed.goods')}</dt><dd className="font-semibold text-lilac-200"><Num>{fmtMoney(goods, p.currency, lang)}</Num></dd></div>
            {(['product.landed.freight', 'product.landed.insurance', 'product.landed.duty', 'product.landed.tax'] as const).map((k) => (
              <div key={k} className="flex items-center justify-between py-2.5"><dt className="text-ink-2">{t(k)}</dt><dd className="text-ink-3">{t('estimate.missing')}</dd></div>
            ))}
            <div className="flex items-center justify-between py-3"><dt className="font-semibold">{t('product.landed.total')}</dt><dd className="text-lg font-semibold text-lilac-200"><Num>{fmtMoney(goods, p.currency, lang)}</Num></dd></div>
          </dl>
          <p className="mt-2 text-xs text-ink-3">{t('product.landed.source')} · {t('estimate.ratesNote')}</p>
          <p className="mt-1 text-xs text-warning">{t('estimate.broker')}</p>
        </Glass>
        <div className="space-y-6">
          <Glass className="p-6">
            <h2 className="mb-3 text-2xl">{t('product.specs')}</h2>
            <dl className="divide-y divide-lilac-400/10 text-sm">
              {p.specs.map((sp, i) => <div key={i} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-3">{sp.k[lang]}</dt><dd className="text-end">{sp.v[lang]}</dd></div>)}
            </dl>
            <h3 className="mb-2 mt-5 text-lg">{t('product.certs')}</h3>
            <div className="flex flex-wrap gap-2">{p.certs.map((c) => <span key={c} className="chip"><FileText className="h-3.5 w-3.5" /><bdi dir="ltr">{c}</bdi></span>)}</div>
          </Glass>
          <Glass className="p-6">
            <h2 className="mb-3 text-2xl">{t('product.readiness')}</h2>
            <ul className="space-y-2 text-sm">
              {(['ready.iec', 'ready.label', 'ready.origin', 'ready.food'] as const).map((k) => (
                <li key={k} className="flex items-center justify-between gap-3 rounded-lg border border-lilac-400/10 px-3 py-2.5">
                  <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-lilac-400" />{t(k)}</span>
                  <button type="button" onClick={() => openAssistant(undefined, 'incoterm')} className="text-xs font-semibold text-lilac-400 hover:text-lilac-200">{t('ready.check')}</button>
                </li>
              ))}
            </ul>
          </Glass>
        </div>
      </div>

      <section className="mt-14">
        <SectionTitle title={t('supplier.products')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.filter((x) => x.id !== p.id && (x.supplierId === p.supplierId || x.category === p.category)).slice(0, 3).map((x) => <ProductCard key={x.id} p={x} />)}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-16 z-20 flex gap-2 border-t border-lilac-400/20 bg-night-900/90 p-3 backdrop-blur-xl lg:hidden">
        <Button className="flex-1" onClick={() => navigate(`/rfq/new?product=${p.id}`)}>{t('cta.requestQuote')}</Button>
        <Button variant="secondary" onClick={() => navigate('/messages/t1')} aria-label={t('product.message')}><MessageSquare className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
