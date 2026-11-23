import React, { useEffect, useRef, useState } from 'react';
import { FileText, Copy, Check, ShieldAlert } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { rs, type RfqKey } from '../deal/rfq-strings';
import { DealFacts, NUMBER_KEYS, CURRENCIES, INCOTERMS, emptyFacts } from '../deal/deal';
import { RFQ_KEYS, RFQ_LANGS, renderRfqAll, type RfqLang } from '../deal/rfq';

interface RfqTabProps {
  currentLang: SupportedLanguage;
}

const DIR: Record<RfqLang, 'rtl' | 'ltr'> = { en: 'ltr', ar: 'rtl', hi: 'ltr', zh: 'ltr' };

/**
 * Request a quote (RFQ). The buyer fills the facts; the same request is written from fixed
 * templates in English, Arabic, Hindi and Chinese (deal/rfq.ts, built on deal/deal.ts).
 * No model is called and nothing is sent: the buyer copies the text and sends it themselves.
 */
export const RfqTab: React.FC<RfqTabProps> = ({ currentLang }) => {
  const lang = currentLang.code;
  const t = (k: RfqKey) => rs(lang, k);
  const [facts, setFacts] = useState<DealFacts>(emptyFacts());
  const [rfqs, setRfqs] = useState<Record<RfqLang, string> | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState<RfqLang | null>(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const draft = () => {
    const all = renderRfqAll(facts);
    if (!facts.product.trim() || !RFQ_LANGS.some((l) => all[l])) { setRfqs(null); setNote(t('empty')); return; }
    setNote(null);
    setRfqs(all);
  };

  const copy = async (l: RfqLang) => {
    if (!rfqs) return;
    try {
      await navigator.clipboard.writeText(rfqs[l]);
      setCopied(l);
      setTimeout(() => alive.current && setCopied(null), 1500);
    } catch { /* clipboard not allowed */ }
  };

  const field = (k: keyof DealFacts) => {
    const label = t(`f_${k}` as RfqKey);
    const common = 'w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-400';
    if (k === 'currency' || k === 'incoterm') {
      const opts = k === 'currency' ? CURRENCIES : INCOTERMS;
      return (
        <label key={k} className="block text-sm text-slate-300">
          {label}
          <select className={common + ' mt-1'} value={facts[k]} onChange={(e) => setFacts({ ...facts, [k]: e.target.value })}>
            <option value="">—</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      );
    }
    return (
      <label key={k} className="block text-sm text-slate-300">
        {label}
        <input
          className={common + ' mt-1'}
          dir="auto"
          inputMode={NUMBER_KEYS.includes(k) ? 'decimal' : 'text'}
          maxLength={200}
          value={facts[k]}
          onChange={(e) => setFacts({ ...facts, [k]: e.target.value })}
        />
      </label>
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
        <p className="text-slate-300">{t('intro')}</p>
        <p className="text-slate-400 text-sm">{t('note')}</p>
        <div className="grid gap-3 sm:grid-cols-2">{RFQ_KEYS.map(field)}</div>
        <button
          type="button"
          onClick={draft}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <FileText className="w-5 h-5" aria-hidden="true" />
          {t('draft')}
        </button>
        {note && <p role="status" className="text-violet-300 text-sm">{note}</p>}
      </section>

      {rfqs && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4" aria-live="polite">
          <h3 className="text-xl font-bold text-white">{t('quotesTitle')}</h3>
          <p className="flex items-start gap-2 text-violet-300 text-sm">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            {t('verify')}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {RFQ_LANGS.map((l) => (
              <article key={l} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-violet-300">{t(`lang_${l}` as RfqKey)}</h4>
                  <button
                    type="button"
                    onClick={() => copy(l)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:border-violet-400"
                  >
                    {copied === l ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                    {copied === l ? t('copied') : t('copy')}
                  </button>
                </div>
                <pre
                  lang={l === 'zh' ? 'zh-CN' : l}
                  dir={DIR[l]}
                  className="whitespace-pre-wrap break-words font-sans text-slate-100 leading-relaxed"
                >
                  {rfqs[l]}
                </pre>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
