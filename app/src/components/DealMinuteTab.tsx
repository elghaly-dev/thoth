import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Wand2, FileText, Copy, Check, Loader2, ShieldAlert } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { postModel } from '../utils/api';
import { useRequestGuard } from '../utils/useRequestGuard';
import { createSpeechRecognizer, isSpeechRecognitionSupported, isMicBlockedError } from '../utils/audio';
import { hasUsableModelAccess } from '../utils/runtime';
import { tx } from '../i18n';
import { ds, type DealKey } from '../deal/strings';
import {
  DealFacts, FACT_KEYS, NUMBER_KEYS, CURRENCIES, INCOTERMS, MAX_TRANSCRIPT, QUOTE_LANGS, QuoteLang,
  cleanFacts, emptyFacts, groundFacts, renderAll,
} from '../deal/deal';

interface DealMinuteTabProps {
  currentLang: SupportedLanguage;
}

const DIR: Record<QuoteLang, 'rtl' | 'ltr'> = { ar: 'rtl', hi: 'ltr', zh: 'ltr' };

/**
 * Deal in a Minute. The merchant speaks (or types) the facts once; the Faithful Servant pulls
 * them out (only values found in what was said are kept); the merchant checks them; Thoth fills
 * fixed Arabic, Hindi and Chinese quote templates with those facts only. No model writes a quote.
 */
export const DealMinuteTab: React.FC<DealMinuteTabProps> = ({ currentLang }) => {
  const lang = currentLang.code;
  const t = (k: DealKey) => ds(lang, k);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [facts, setFacts] = useState<DealFacts>(emptyFacts());
  const [quotes, setQuotes] = useState<Record<QuoteLang, string> | null>(null);
  const [copied, setCopied] = useState<QuoteLang | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const { begin, mountedRef } = useRequestGuard();

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* already stopped */ } }, []);

  const toggleMic = () => {
    if (listening) { try { recRef.current?.stop(); } catch { /* ignore */ } setListening(false); return; }
    if (!isSpeechRecognitionSupported()) { setNote(t('noMic')); return; }
    setNote(null);
    const rec = createSpeechRecognizer(
      currentLang.speechCode,
      (text, isFinal) => { if (isFinal) setTranscript((prev) => (prev ? prev + ' ' : '') + text); },
      (err) => { setNote(isMicBlockedError(err) ? tx(lang, 'common.micBlocked') : t('noMic')); setListening(false); },
      () => setListening(false),
    );
    if (!rec) { setNote(t('noMic')); return; }
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const extract = async () => {
    const text = transcript.trim().slice(0, MAX_TRANSCRIPT);
    if (!text || busy) return;
    if (!hasUsableModelAccess()) { setNote(t('needKey')); return; }
    setBusy(true); setNote(null); setQuotes(null);
    const req = begin();
    try {
      const data = await postModel<{ raw?: string }>('/api/deal-facts', { transcript: text }, req.signal);
      if (!req.isCurrent()) return;
      const { facts: found, dropped } = groundFacts(data.raw ?? '', text);
      setFacts(found);
      if (dropped.length) setNote(t('dropped').replace('{fields}', dropped.map((k) => t(`f_${k}` as DealKey)).join(', ')));
    } catch {
      if (req.isCurrent()) setNote(t('failed'));
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  };

  const draft = () => {
    const clean = cleanFacts(facts);
    setFacts(clean);
    const all = renderAll(clean);
    if (!QUOTE_LANGS.some((l) => all[l])) { setQuotes(null); setNote(t('empty')); return; }
    setNote(null);
    setQuotes(all);
  };

  const copy = async (l: QuoteLang) => {
    if (!quotes) return;
    try { await navigator.clipboard.writeText(quotes[l]); setCopied(l); setTimeout(() => mountedRef.current && setCopied(null), 1500); } catch { /* clipboard not allowed */ }
  };

  const field = (k: keyof DealFacts) => {
    const label = t(`f_${k}` as DealKey);
    const common = 'w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400';
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

        <button
          type="button"
          onClick={toggleMic}
          aria-pressed={listening}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold ${listening ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
        >
          {listening ? <Square className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
          {listening ? t('listening') : t('speak')}
        </button>

        <label className="block text-sm text-slate-300">
          {t('transcriptLabel')}
          <textarea
            className="mt-1 w-full min-h-[110px] rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
            dir="auto"
            maxLength={MAX_TRANSCRIPT}
            placeholder={t('transcriptPh')}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={extract}
          disabled={busy || !transcript.trim()}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Wand2 className="w-5 h-5" aria-hidden="true" />}
          {busy ? t('extracting') : t('extract')}
        </button>

        {note && <p role="status" className="text-amber-300 text-sm">{note}</p>}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">{t('factsTitle')}</h3>
        <p className="text-slate-300 text-sm">{t('factsNote')}</p>
        <div className="grid gap-3 sm:grid-cols-2">{FACT_KEYS.map(field)}</div>
        <button
          type="button"
          onClick={draft}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <FileText className="w-5 h-5" aria-hidden="true" />
          {t('draft')}
        </button>
      </section>

      {quotes && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4" aria-live="polite">
          <h3 className="text-xl font-bold text-white">{t('quotesTitle')}</h3>
          <p className="flex items-start gap-2 text-amber-300 text-sm">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            {t('verify')}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {QUOTE_LANGS.map((l) => (
              <article key={l} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-amber-300">{t(`lang_${l}` as DealKey)}</h4>
                  <button
                    type="button"
                    onClick={() => copy(l)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:border-amber-400"
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
                  {quotes[l]}
                </pre>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
