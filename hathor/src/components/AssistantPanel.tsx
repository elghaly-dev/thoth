import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Mic, SendHorizontal, Volume2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { useStore } from '../lib/store';
import { RFQS, SUPPLIERS, THREADS, PRODUCTS, byId } from '../data/sample';
import { fmtMoney } from '../lib/format';
import { AssistantGlyph } from './Brand';

type Turn = { id: number; who: 'user' | 'bot'; text: string; suggestion?: boolean };

// «الغالي» answers from the data on the page. It never invents numbers: every
// figure below is read from the sample records, and gaps are named as gaps.
function useAnswer() {
  const { t, lang } = useI18n();
  const { assistantCtx } = useStore();
  return (intent: string): { text: string; suggestion?: boolean } => {
    if (intent === 'compare') {
      const rfq = RFQS[0];
      const letters = ['A', 'B', 'C', 'D'];
      const lines = rfq.quotes.map((q, i) => `• ${lang === 'ar' ? 'العرض' : 'Quote'} ${letters[i]} (${byId(SUPPLIERS, q.supplierId)?.name[lang]}): \u2066${fmtMoney(q.unitPrice, q.currency, lang)}\u2069 / ${rfq.unit[lang]} · ${q.incoterm} · ${q.port[lang]}`).join('\n');
      const missing = rfq.quotes.flatMap((q, i) => {
        const out: string[] = [];
        if (!q.validUntil) out.push(`• ${lang === 'ar' ? 'العرض' : 'Quote'} ${letters[i]}: ${lang === 'ar' ? 'لا تاريخ صلاحية' : 'no validity date'}`);
        if (!q.payment) out.push(`• ${lang === 'ar' ? 'العرض' : 'Quote'} ${letters[i]}: ${lang === 'ar' ? 'لا شروط دفع' : 'no payment terms'}`);
        return out;
      }).join('\n');
      return { text: t('assistant.a.compare', { lines, missing: missing || '—' }) };
    }
    if (intent === 'incoterm') return { text: t('assistant.a.incoterm') };
    if (intent === 'escrow') return { text: t('assistant.a.escrow') };
    if (intent === 'write') {
      const p = assistantCtx?.kind === 'product' ? byId(PRODUCTS, assistantCtx.id || '') : undefined;
      const text = p
        ? (lang === 'ar' ? `نطلب ${p.title.ar}، الكمية: (اكتب الكمية) ${p.unit.ar}، بشرط ${p.incoterm}، التسليم إلى (اختر الميناء).` : `We need ${p.title.en}, quantity: (enter quantity) ${p.unit.en}, ${p.incoterm}, delivered to (pick a port).`)
        : (lang === 'ar' ? 'نطلب (اسم المنتج)، الكمية: (اكتب الكمية)، بشرط (شرط التسليم)، التسليم إلى (الميناء) قبل (التاريخ).' : 'We need (product), quantity: (enter quantity), (Incoterm), delivered to (port) by (date).');
      return { text: t('assistant.a.write', { text }), suggestion: true };
    }
    if (intent === 'check') {
      const msgs = THREADS[0].messages.filter((m) => m.from === 'them' && m.check);
      const last = msgs[msgs.length - 2] ?? msgs[0];
      const key: StringKey = last.check === 'dangerous' ? 'check.dangerous' : last.check === 'unknown' ? 'check.unknown' : 'check.clear';
      return { text: t('assistant.a.check', { verdict: t(key) }) };
    }
    return { text: t('assistant.missing') };
  };
}

const STARTERS: { intent: string; key: StringKey }[] = [
  { intent: 'write', key: 'assistant.s.write' },
  { intent: 'compare', key: 'assistant.s.compare' },
  { intent: 'incoterm', key: 'assistant.s.explain' },
  { intent: 'escrow', key: 'assistant.s.escrow' },
  { intent: 'check', key: 'assistant.s.check' },
];

function Streamed({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 3)), 12);
    return () => clearInterval(id);
  }, [text, reduce]);
  return <>{text.slice(0, n)}</>;
}

export function AssistantPanel() {
  const { t, lang } = useI18n();
  const { assistantOpen, closeAssistant, assistantCtx, setAssistantCtx, assistantPrompt, clearPrompt, toast } = useStore();
  const answer = useAnswer();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 64rem)').matches;

  const ask = (label: string, intent: string) => {
    const id = Date.now();
    setTurns((tt) => [...tt, { id, who: 'user', text: label }]);
    setThinking(true);
    setTimeout(() => {
      const a = answer(intent);
      setThinking(false);
      setTurns((tt) => [...tt, { id: id + 1, who: 'bot', text: a.text, suggestion: a.suggestion }]);
    }, 520);
  };

  useEffect(() => {
    if (assistantOpen && assistantPrompt) {
      const s = STARTERS.find((x) => x.intent === assistantPrompt);
      if (s) ask(t(s.key), s.intent);
      clearPrompt();
    }
  }, [assistantOpen, assistantPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [turns, thinking]);

  const submit = () => {
    const v = input.trim();
    if (!v) return;
    setInput('');
    const low = v.toLowerCase();
    const intent = /قارن|compare/.test(low) ? 'compare' : /incoterm|fob|cif|cfr|شرط/.test(low) ? 'incoterm' : /escrow|أمانة|الأمانة/.test(low) ? 'escrow' : /اكتب|write|request/.test(low) ? 'write' : 'missing';
    ask(v, intent);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ar' ? 'ar' : 'en';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <AnimatePresence>
      {assistantOpen && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-night-950/50 backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAssistant} />
          <motion.aside
            role="dialog" aria-modal="true" aria-labelledby="assistant-title"
            initial={isDesktop ? { x: lang === 'ar' ? -440 : 440 } : { y: '100%' }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: lang === 'ar' ? -440 : 440 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="glass fixed inset-x-0 bottom-0 z-40 flex h-[88dvh] flex-col !rounded-b-none !rounded-t-[24px] lg:inset-y-3 lg:end-3 lg:start-auto lg:h-auto lg:w-[420px] lg:!rounded-[24px]"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-lilac-400/40 lg:hidden" aria-hidden="true" />
            <div className="flex items-start gap-3 border-b border-lilac-400/15 p-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-lilac-400/40 bg-night-800 shadow-node"><AssistantGlyph className="h-7 w-7" /></div>
              <div className="flex-1">
                <h2 id="assistant-title" lang="ar" className="title-gradient text-2xl leading-none">الغالي</h2>
                <p className="mt-1.5 text-xs text-ink-2">{t('assistant.role')}</p>
              </div>
              <button type="button" onClick={closeAssistant} className="grid h-11 w-11 place-items-center rounded-xl text-ink-2 hover:bg-lilac-400/10 hover:text-lilac-200" aria-label={t('assistant.close')}><X className="h-5 w-5" /></button>
            </div>
            {assistantCtx && (
              <div className="px-5 pt-3">
                <span className="chip">
                  {t('assistant.looking', { what: assistantCtx.label })}
                  <button type="button" onClick={() => setAssistantCtx(null)} aria-label={t('assistant.discard')} className="-me-1 grid h-5 w-5 place-items-center rounded-full hover:bg-lilac-400/20"><X className="h-3 w-3" /></button>
                </span>
              </div>
            )}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <div className="rounded-2xl rounded-ss-sm border border-lilac-400/20 bg-night-800/70 p-3.5 text-sm leading-relaxed text-ink-1">{t('assistant.hello')}</div>
              {turns.map((x) => (
                <motion.div key={x.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={x.who === 'user' ? 'flex justify-end' : ''}>
                  {x.who === 'user' ? (
                    <div className="max-w-[85%] rounded-2xl rounded-se-sm bg-lilac-400/20 px-3.5 py-2.5 text-sm text-ink-1">{x.text}</div>
                  ) : (
                    <div className="rounded-2xl rounded-ss-sm border border-lilac-400/20 bg-night-800/70 p-3.5 text-sm leading-relaxed text-ink-1">
                      <p className="whitespace-pre-line"><Streamed text={x.text} /></p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {x.suggestion && (
                          <>
                            <button type="button" className="h-9 rounded-lg bg-lilac-400 px-3 text-xs font-semibold text-on-lilac" onClick={() => toast(t('rfq.saved'))}>{t('assistant.use')}</button>
                            <button type="button" className="h-9 rounded-lg border border-border-strong px-3 text-xs text-lilac-200" onClick={() => setTurns((tt) => tt.filter((y) => y.id !== x.id))}>{t('assistant.discard')}</button>
                          </>
                        )}
                        <button type="button" onClick={() => speak(x.text)} className="ms-auto grid h-9 w-9 place-items-center rounded-lg text-ink-3 hover:text-lilac-200" aria-label={t('common.readAloud')}><Volume2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {thinking && (
                <div className="space-y-2 rounded-2xl border border-lilac-400/15 bg-night-800/50 p-3.5" aria-hidden="true">
                  <div className="skeleton h-3 w-11/12" /><div className="skeleton h-3 w-9/12" /><div className="skeleton h-3 w-6/12" />
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="border-t border-lilac-400/15 p-4">
              <div className="scroll-x -mx-1 mb-3 flex gap-2 px-1">
                {STARTERS.map((s) => (
                  <button key={s.intent} type="button" onClick={() => ask(t(s.key), s.intent)} className="chip shrink-0 hover:border-lilac-400 hover:bg-lilac-400/20">{t(s.key)}</button>
                ))}
              </div>
              <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-lilac-400/30 text-lilac-200" aria-label={t('msg.voice')}><Mic className="h-5 w-5" /></button>
                <input value={input} onChange={(e) => setInput(e.target.value)} className="field" placeholder={t('assistant.placeholder')} aria-label={t('assistant.placeholder')} />
                <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lilac-400 text-on-lilac" aria-label={t('msg.send')}><SendHorizontal className="h-5 w-5 rtl:-scale-x-100" /></button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
