import { AnimatePresence, motion } from 'motion/react';
import { Building2, CheckCircle2, CloudUpload, Sparkles, ShieldCheck, ShoppingCart, Store, Users } from 'lucide-react';
import { useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { CATEGORIES, type CategoryId } from '../data/sample';
import { addMonths } from '../lib/fees';
import { fmtDate } from '../lib/format';
import { GlowLine } from '../components/GlowLine';
import { Button, ButtonLink, Glass } from '../components/ui';

export function RegisterPage() {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<'supplier' | 'buyer' | 'both'>('supplier');
  const [cats, setCats] = useState<Set<CategoryId>>(new Set(['dates']));
  const [langs, setLangs] = useState<Set<string>>(new Set(['العربية', 'English']));
  const [agree, setAgree] = useState(false);
  const steps: StringKey[] = ['reg.step.company', 'reg.step.contact', 'reg.step.verify', 'reg.step.done'];
  const nodes = steps.map((k, i) => ({ label: t(k), state: (i < step ? 'done' : i === step ? 'now' : 'next') as 'done' | 'now' | 'next' }));
  const label = 'mb-1.5 block text-sm text-ink-2';
  const until = fmtDate(addMonths(new Date().toISOString(), 3).toISOString(), lang);
  const toggle = <T,>(s: Set<T>, v: T, fn: (x: Set<T>) => void) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); fn(n); };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h1 className="title-gradient text-[clamp(2.1rem,1.6rem+2vw,3.2rem)] leading-tight">{t('reg.title')}</h1>
        <p className="mt-3 text-ink-2">{t('reg.sub')}</p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mt-8 overflow-hidden rounded-[22px] border border-lilac-300/60 bg-gradient-to-br from-lilac-400/25 via-night-800 to-night-900 p-6 shadow-[0_0_40px_-8px_rgba(196,161,236,0.55)]">
          <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-lilac-400/25 blur-3xl" aria-hidden="true" />
          <Sparkles className="h-8 w-8 text-lilac-200" aria-hidden="true" />
          <div className="mt-3 text-2xl font-bold text-lilac-100">{t('reg.banner.t')}</div>
          <div className="mt-1 text-ink-1">{t('reg.banner.d')}</div>
        </motion.div>
        <ul className="mt-6 space-y-3 text-sm text-ink-2">
          <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-lilac-400" />{t('why.verified.d')}</li>
          <li className="flex items-center gap-3"><Users className="h-5 w-5 text-lilac-400" />{t('why.masked.d')}</li>
        </ul>
      </div>

      <Glass className="p-6 md:p-8">
        <div className="mb-6"><GlowLine nodes={nodes} pulse compact /></div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="space-y-5">
            {step === 0 && (
              <>
                <fieldset>
                  <legend className={label}>{t('reg.type')}</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {([['supplier', Store], ['buyer', ShoppingCart], ['both', Building2]] as const).map(([v, I]) => (
                      <button key={v} type="button" aria-pressed={type === v} onClick={() => setType(v)} className={`flex flex-col items-center gap-2 rounded-[14px] border p-4 text-sm transition ${type === v ? 'border-lilac-400 bg-lilac-400/10 text-lilac-100 shadow-glow' : 'border-lilac-400/20 text-ink-2 hover:border-lilac-400/50'}`}>
                        <I className="h-6 w-6" />{t(`reg.type.${v}` as StringKey)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2"><span className={label}>{t('reg.company')}</span><input className="field" autoComplete="organization" /></label>
                  <label className="block"><span className={label}>{t('reg.country')}</span>
                    <select className="field">{(lang === 'ar' ? ['الإمارات', 'السعودية', 'مصر', 'عُمان', 'قطر', 'الكويت', 'البحرين', 'الهند'] : ['UAE', 'Saudi Arabia', 'Egypt', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'India']).map((c) => <option key={c}>{c}</option>)}</select>
                  </label>
                  <label className="block"><span className={label}>{t('reg.crn')}</span><input className="field num" dir="ltr" /><span className="mt-1 block text-xs text-ink-3">{t('reg.crn.note')}</span></label>
                </div>
                <fieldset>
                  <legend className={label}>{t('reg.categories')}</legend>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => <button key={c.id} type="button" aria-pressed={cats.has(c.id)} onClick={() => toggle(cats, c.id, setCats)} className={`chip h-10 !px-3.5 ${cats.has(c.id) ? '!border-lilac-400 !bg-lilac-400/25 !text-lilac-100' : ''}`}>{c.name[lang]}</button>)}
                  </div>
                </fieldset>
              </>
            )}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block"><span className={label}>{t('reg.person')}</span><input className="field" autoComplete="name" /></label>
                <label className="block"><span className={label}>{t('reg.role')}</span><input className="field" autoComplete="organization-title" /></label>
                <label className="block md:col-span-2"><span className={label}>{t('reg.email')}</span><input type="email" dir="ltr" className="field" autoComplete="email" /><span className="mt-1 block text-xs text-ink-3">{t('reg.email.note')}</span></label>
                <fieldset className="md:col-span-2">
                  <legend className={label}>{t('reg.langs')}</legend>
                  <div className="flex flex-wrap gap-2">
                    {['العربية', 'English', 'हिन्दी', '中文'].map((l) => <button key={l} type="button" aria-pressed={langs.has(l)} onClick={() => toggle(langs, l, setLangs)} className={`chip h-10 !px-3.5 ${langs.has(l) ? '!border-lilac-400 !bg-lilac-400/25 !text-lilac-100' : ''}`}>{l}</button>)}
                  </div>
                </fieldset>
              </div>
            )}
            {step === 2 && (
              <>
                <div className={label}>{t('reg.docs')}</div>
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-[18px] border-2 border-dashed border-lilac-400/40 bg-lilac-400/5 p-10 text-center hover:border-lilac-400 hover:bg-lilac-400/10">
                  <CloudUpload className="h-10 w-10 text-lilac-400" />
                  <span className="text-sm text-ink-1">{t('reg.docs.d')}</span>
                  <input type="file" className="sr-only" accept=".pdf,image/*" multiple />
                </label>
                <p className="text-xs text-ink-3">{t('reg.docs.status')}</p>
                <p className="text-xs text-warning">{t('verify.notConnected')}</p>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#c4a1ec]" checked={agree} onChange={() => setAgree(!agree)} />{t('reg.terms')}</label>
              </>
            )}
            {step === 3 && (
              <div className="py-6 text-center">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lilac-400 text-on-lilac shadow-glow"><CheckCircle2 className="h-8 w-8" /></motion.div>
                <h2 className="mt-5 text-3xl">{t('reg.done.t')}</h2>
                <p className="mt-2 text-sm text-info">{t('reg.done.d')}</p>
                <p className="mt-4 inline-flex rounded-full border border-success/40 bg-success/10 px-4 py-1.5 text-sm text-success">{t('reg.done.until', { date: until })}</p>
                <div className="mt-6"><ButtonLink to={type === 'buyer' ? '/dashboard' : '/dashboard/supplier'}>{t(type === 'buyer' ? 'nav.dashboard' : 'nav.supplierDashboard')}</ButtonLink></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {step < 3 && (
          <div className="mt-8 flex items-center justify-between border-t border-lilac-400/10 pt-6">
            <Button variant="quiet" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>{t('rfq.back')}</Button>
            {step < 2 ? <Button onClick={() => setStep((s) => s + 1)}>{t('rfq.next')}</Button> : <Button disabled={!agree} onClick={() => setStep(3)}>{t('reg.submit')}</Button>}
          </div>
        )}
      </Glass>
    </div>
  );
}
