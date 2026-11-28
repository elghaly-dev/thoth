import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Mic, Pencil, Plus, Trash2, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { CATEGORIES, PORTS, PRODUCTS, byId, type CategoryId } from '../data/sample';
import { GlowLine } from '../components/GlowLine';
import { Button, ButtonLink, Glass, Num, PageHeader } from '../components/ui';
import { AssistantGlyph } from '../components/Brand';

type Form = {
  product: string; category: CategoryId; specs: { k: string; v: string }[];
  quantity: string; unit: string; target: string; currency: string; payment: string;
  incoterm: string; port: number; by: string; audience: 'all' | 'pick';
};

const INCOTERMS = ['EXW', 'FOB', 'CFR', 'CIF', 'DAP'] as const;

export function RfqNew() {
  const { t, lang } = useI18n();
  const { search } = useRouter();
  const { openAssistant, toast } = useStore();
  const pre = byId(PRODUCTS, search.get('product') ?? '');
  const [step, setStep] = useState(0);
  const [posted, setPosted] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [f, setF] = useState<Form>({
    product: pre ? pre.title[lang] : '', category: pre?.category ?? 'dates', specs: pre ? pre.specs.slice(0, 2).map((s) => ({ k: s.k[lang], v: s.v[lang] })) : [{ k: '', v: '' }],
    quantity: '', unit: pre ? pre.unit[lang] : (lang === 'ar' ? 'كغ' : 'kg'), target: '', currency: 'USD', payment: '',
    incoterm: 'CFR', port: 0, by: '', audience: 'all',
  });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  useEffect(() => { setSavedAt(false); const id = setTimeout(() => setSavedAt(true), 700); return () => clearTimeout(id); }, [f]);

  const steps: StringKey[] = ['rfq.step.what', 'rfq.step.qty', 'rfq.step.where', 'rfq.step.review'];
  const nodes = steps.map((k, i) => ({ label: t(k), state: (i < step ? 'done' : i === step ? 'now' : 'next') as 'done' | 'now' | 'next' }));
  const label = 'mb-1.5 block text-sm text-ink-2';

  if (posted)
    return (
      <Glass className="mx-auto mt-6 max-w-xl p-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lilac-400 text-on-lilac shadow-glow"><CheckCircle2 className="h-8 w-8" /></motion.div>
        <h1 className="title-gradient mt-6 text-3xl">{t('rfq.post')}</h1>
        <p className="mt-3 text-ink-1">{t('rfq.posted')}</p>
        <p className="mt-2 text-sm text-info">{t('rfq.posted.sample')}</p>
        <div className="mt-8 flex justify-center gap-3"><ButtonLink to="/rfq/R-2041">{t('rfq.view')}</ButtonLink><ButtonLink to="/catalog" variant="secondary">{t('cta.browse')}</ButtonLink></div>
      </Glass>
    );

  const review: [StringKey, string, number][] = [
    ['rfq.product', f.product || '—', 0],
    ['rfq.quantity', f.quantity ? `${f.quantity} ${f.unit}` : '—', 1],
    ['rfq.target', f.target ? `${f.currency} ${f.target}` : '—', 1],
    ['rfq.payment', f.payment || '—', 1],
    ['rfq.incoterm', f.incoterm, 2],
    ['rfq.port', PORTS[f.port][lang], 2],
    ['rfq.by', f.by || '—', 2],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t('rfq.new')}>
        <span className="text-sm text-ink-3" aria-live="polite">{savedAt ? `✓ ${t('rfq.saved')}` : '…'}</span>
      </PageHeader>
      <Glass className="mb-6 px-6 pt-6 lg:pb-2"><GlowLine nodes={nodes} pulse compact /></Glass>

      <Glass className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            {step === 0 && (
              <div className="space-y-5">
                <button type="button" onClick={() => openAssistant(pre ? { kind: 'product', id: pre.id, label: pre.title[lang] } : null, 'write')} className="flex w-full items-center gap-3 rounded-[14px] border border-dashed border-lilac-400/50 bg-lilac-400/5 p-4 text-start hover:bg-lilac-400/10">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-lilac-400 text-on-lilac"><Mic className="h-5 w-5" /></span>
                  <span className="flex-1"><span className="block font-semibold text-lilac-200">{t('rfq.voice')}</span><span className="text-xs text-ink-3"><span lang="ar">«الغالي»</span> · {t('assistant.role')}</span></span>
                  <AssistantGlyph className="h-6 w-6" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block"><span className={label}>{t('rfq.product')}</span><input className="field" value={f.product} onChange={(e) => set('product', e.target.value)} placeholder={t('rfq.product.ph')} /></label>
                  <label className="block"><span className={label}>{t('catalog.category')}</span>
                    <select className="field" value={f.category} onChange={(e) => set('category', e.target.value as CategoryId)}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}</select>
                  </label>
                </div>
                <div>
                  <div className={label}>{t('rfq.specs')}</div>
                  <div className="space-y-2">
                    {f.specs.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <input className="field" placeholder={t('rfq.specs.key')} aria-label={t('rfq.specs.key')} value={s.k} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} />
                        <input className="field" placeholder={t('rfq.specs.value')} aria-label={t('rfq.specs.value')} value={s.v} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
                        <button type="button" onClick={() => set('specs', f.specs.filter((_, j) => j !== i))} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-lilac-400/20 text-ink-3 hover:text-danger" aria-label={t('common.remove')}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => set('specs', [...f.specs, { k: '', v: '' }])} className="mt-2 inline-flex h-11 items-center gap-1.5 text-sm text-lilac-400 hover:text-lilac-200"><Plus className="h-4 w-4" />{t('rfq.specs.add')}</button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block"><span className={label}>{t('rfq.quantity')}</span><input inputMode="decimal" dir="ltr" className="field num" value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></label>
                <label className="block"><span className={label}>{t('rfq.unit')}</span><input className="field" value={f.unit} onChange={(e) => set('unit', e.target.value)} /></label>
                <label className="block"><span className={label}>{t('rfq.target')}</span><input inputMode="decimal" dir="ltr" className="field num" value={f.target} onChange={(e) => set('target', e.target.value)} /></label>
                <label className="block"><span className={label}>{t('rfq.currency')}</span>
                  <select className="field" value={f.currency} onChange={(e) => set('currency', e.target.value)}>{['USD', 'AED', 'SAR', 'OMR', 'QAR', 'INR', 'CNY'].map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                <label className="block md:col-span-2"><span className={label}>{t('rfq.payment')}</span><input className="field" value={f.payment} onChange={(e) => set('payment', e.target.value)} placeholder={t('rfq.payment.ph')} /></label>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <fieldset>
                  <legend className={label}>{t('rfq.incoterm')}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {INCOTERMS.map((it) => (
                      <label key={it} className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-[14px] border p-3 transition ${f.incoterm === it ? 'border-lilac-400 bg-lilac-400/10 shadow-glow' : 'border-lilac-400/20 hover:border-lilac-400/50'}`}>
                        <input type="radio" name="inc" className="mt-1 accent-[#c4a1ec]" checked={f.incoterm === it} onChange={() => set('incoterm', it)} />
                        <span><span className="num font-semibold text-lilac-200">{it}</span><span className="block text-xs text-ink-2">{t(`incoterm.${it}` as StringKey)}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block"><span className={label}>{t('rfq.port')}</span><select className="field" value={f.port} onChange={(e) => set('port', Number(e.target.value))}>{PORTS.map((p, i) => <option key={i} value={i}>{p[lang]}</option>)}</select></label>
                  <label className="block"><span className={label}>{t('rfq.by')}</span><input type="date" dir="ltr" className="field num" value={f.by} onChange={(e) => set('by', e.target.value)} /></label>
                </div>
                <fieldset>
                  <legend className={label}>{t('rfq.audience')}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'pick'] as const).map((a) => (
                      <button key={a} type="button" onClick={() => set('audience', a)} aria-pressed={f.audience === a} className={`chip h-11 !px-4 ${f.audience === a ? '!border-lilac-400 !bg-lilac-400/25' : ''}`}>{t(a === 'all' ? 'rfq.audience.all' : 'rfq.audience.pick')}</button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}
            {step === 3 && (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-ink-2">{t('rfq.readBack')}</p>
                  <button type="button" onClick={() => { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(review.map(([k, v]) => `${t(k)}: ${v}`).join('. ')); u.lang = lang; speechSynthesis.speak(u); } }} className="inline-flex h-11 items-center gap-2 rounded-xl border border-lilac-400/30 px-3 text-sm text-lilac-200"><Volume2 className="h-4 w-4" />{t('common.readAloud')}</button>
                </div>
                <dl className="divide-y divide-lilac-400/10">
                  {review.map(([k, v, s]) => (
                    <div key={k} className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-sm text-ink-3">{t(k)}</dt>
                      <dd className="flex items-center gap-3 text-end"><span className="num text-lg font-semibold text-ink-1"><bdi>{v}</bdi></span>
                        <button type="button" onClick={() => setStep(s)} className="grid h-9 w-9 place-items-center rounded-lg text-lilac-400 hover:bg-lilac-400/10" aria-label={t('rfq.edit')}><Pencil className="h-4 w-4" /></button></dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-lilac-400/10 pt-6">
          <Button variant="quiet" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>{t('rfq.back')}</Button>
          <span className="num text-xs text-ink-3"><Num>{step + 1} / 4</Num></span>
          {step < 3 ? <Button onClick={() => setStep((s) => s + 1)}>{t('rfq.next')}</Button> : <Button onClick={() => { setPosted(true); toast(t('rfq.posted')); }}>{t('rfq.post')}</Button>}
        </div>
      </Glass>
    </div>
  );
}
