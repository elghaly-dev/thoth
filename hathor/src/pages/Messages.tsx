import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CheckCheck, EyeOff, Languages, Mic, Paperclip, Search, SendHorizontal, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { SUPPLIERS, THREADS, byId, type Msg } from '../data/sample';
import { maskContacts } from '../lib/mask';
import { numbersMatch } from '../lib/numberlock';
import { Button, MaskedText, SampleBadge, ScamCheckTag, VerifiedBadge } from '../components/ui';

type Local = Msg & { status?: 'pending' | 'delivered' };

function Bubble({ m }: { m: Local }) {
  const { t, lang } = useI18n();
  const mine = m.from === 'me';
  const canTranslate = !!m.translation && m.lang !== lang;
  const [showT, setShowT] = useState(canTranslate);
  const ok = m.translation ? numbersMatch(m.text, m.translation) : true;
  const shown = showT && canTranslate && ok ? m.translation! : m.text;
  const masked = maskContacts(shown).text;
  const time = new Date(m.at).toLocaleTimeString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] md:max-w-[70%] ${mine ? 'rounded-[18px] rounded-ee-md bg-lilac-400/20 border border-lilac-400/30' : 'glass !rounded-[18px] !rounded-es-md'} px-4 py-3`}>
        <p className="text-[0.95rem] leading-relaxed text-ink-1" lang={showT && canTranslate && ok ? lang : m.lang}><MaskedText text={masked} /></p>
        {canTranslate && !ok && <p className="mt-1.5 flex items-center gap-1 text-xs text-warning"><EyeOff className="h-3 w-3" />{t('translate.hidden')}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-ink-3">
          <span className="num">{time}</span>
          {!mine && m.check && <ScamCheckTag check={m.check} />}
          {canTranslate && ok && (
            <button type="button" onClick={() => setShowT((v) => !v)} className="inline-flex items-center gap-1 text-lilac-400 hover:text-lilac-200"><Languages className="h-3 w-3" />{showT ? t('msg.original') : t('msg.translated')}</button>
          )}
          {mine && m.status === 'pending' && <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" />{t('msg.pending')}</span>}
          {mine && m.status !== 'pending' && <span className="inline-flex items-center gap-1 text-lilac-400"><CheckCheck className="h-3.5 w-3.5" />{t('msg.delivered')}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export function MessagesPage({ id }: { id?: string }) {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { setAssistantCtx } = useStore();
  const [filter, setFilter] = useState('');
  const [local, setLocal] = useState<Record<string, Local[]>>({});
  const [draft, setDraft] = useState('');
  const [warn, setWarn] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const active = id ? byId(THREADS, id) : undefined;
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => { if (active) setAssistantCtx({ kind: 'thread', id: active.id, label: active.context.label[lang] }); }, [active, lang, setAssistantCtx]);
  const msgs: Local[] = useMemo(() => (active ? [...active.messages, ...(local[active.id] ?? [])] : []), [active, local]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, id]);

  const list = THREADS.filter((th) => {
    const s = byId(SUPPLIERS, th.supplierId)!;
    return !filter || `${s.name.ar} ${s.name.en} ${th.context.label.ar} ${th.context.label.en}`.toLowerCase().includes(filter.toLowerCase());
  });

  const send = (text: string) => {
    if (!active || !text.trim()) return;
    const mid = `l${Date.now()}`;
    const msg: Local = { id: mid, from: 'me', text, lang, at: new Date().toISOString(), status: 'pending' };
    setLocal((l) => ({ ...l, [active.id]: [...(l[active.id] ?? []), msg] }));
    setDraft('');
    setTimeout(() => setLocal((l) => ({ ...l, [active.id]: (l[active.id] ?? []).map((x) => (x.id === mid ? { ...x, status: 'delivered' } : x)) })), 900);
  };
  const trySend = () => {
    const r = maskContacts(draft);
    if (r.found.length) setWarn(draft); else send(draft);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3"><h1 className="title-gradient text-[clamp(2rem,1.5rem+2vw,3rem)]">{t('msg.title')}</h1><SampleBadge /></div>
      <div className="glass grid h-[calc(100dvh-230px)] min-h-[520px] lg:h-[calc(100dvh-260px)] lg:min-h-[560px] grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[340px_1fr]">
        {/* Thread list */}
        <div className={`min-h-0 flex-col border-e border-lilac-400/15 ${active ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4">
            <div className="flex items-center gap-2 rounded-[12px] border border-lilac-400/20 bg-input px-3">
              <Search className="h-4 w-4 text-lilac-400" /><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('msg.search')} aria-label={t('msg.search')} className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3" />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto px-2 pb-2">
            {list.map((th) => {
              const s = byId(SUPPLIERS, th.supplierId)!;
              const last = th.messages[th.messages.length - 1];
              const on = th.id === id;
              return (
                <li key={th.id}>
                  <Link to={`/messages/${th.id}`} aria-current={on ? 'true' : undefined} className={`flex gap-3 rounded-[14px] p-3 transition ${on ? 'bg-lilac-400/15' : 'hover:bg-lilac-400/5'}`}>
                    <div className="wordmark grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-lilac-400/30 bg-night-800 text-xs font-bold text-lilac-200" dir="ltr">{s.name.en.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold"><bdi>{s.name[lang]}</bdi></span>{th.unread > 0 && <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-lilac-400 px-1.5 text-[0.7rem] font-bold text-on-lilac">{th.unread}</span>}</div>
                      <div className="truncate text-xs text-lilac-400">{th.context.label[lang]}</div>
                      <div className="mt-0.5 truncate text-xs text-ink-3"><MaskedText text={maskContacts(last.text).text} /></div>
                      {th.flagged && <div className="mt-1"><ScamCheckTag check={th.flagged} /></div>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Thread view */}
        <div className={`min-h-0 flex-col ${active ? 'flex' : 'hidden lg:flex'}`}>
          {!active ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-ink-3">{t('msg.empty')}</div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-lilac-400/15 p-4">
                <button type="button" onClick={() => navigate('/messages')} className="grid h-11 w-11 place-items-center rounded-xl lg:hidden" aria-label={t('rfq.back')}><Back className="h-5 w-5" /></button>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold"><bdi>{byId(SUPPLIERS, active.supplierId)!.name[lang]}</bdi></div>
                  <VerifiedBadge level={byId(SUPPLIERS, active.supplierId)!.level} short />
                </div>
                <Link to={active.context.to} className="chip hidden max-w-[50%] truncate hover:border-lilac-400 sm:inline-flex">{t('msg.context')}: {active.context.label[lang]}</Link>
              </div>
              {active.flagged === 'dangerous' && (
                <div className="flex items-start gap-2 border-b border-danger/30 bg-danger/10 px-4 py-3 text-sm"><ShieldAlert className="h-4 w-4 shrink-0 text-danger" />{t('pay.outside')}</div>
              )}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
                {msgs.map((m) => <Bubble key={m.id} m={m} />)}
                <div ref={endRef} />
              </div>
              <div className="border-t border-lilac-400/15 p-3 md:p-4">
                <div className="scroll-x mb-2 flex gap-2">
                  {(['msg.quick1', 'msg.quick2', 'msg.quick3'] as const).map((k) => <button key={k} type="button" onClick={() => send(t(k))} className="chip shrink-0 hover:border-lilac-400">{t(k)}</button>)}
                </div>
                <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); trySend(); }}>
                  <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-2 hover:text-lilac-200" aria-label={t('msg.attach')}><Paperclip className="h-5 w-5" /></button>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} className="field" placeholder={t('msg.placeholder')} aria-label={t('msg.placeholder')} />
                  <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-2 hover:text-lilac-200" aria-label={t('msg.voice')}><Mic className="h-5 w-5" /></button>
                  <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lilac-400 text-on-lilac hover:shadow-glow" aria-label={t('msg.send')}><SendHorizontal className="h-5 w-5 rtl:-scale-x-100" /></button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {warn !== null && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-night-950/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div role="alertdialog" aria-modal="true" aria-labelledby="warn-t" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass max-w-md p-6">
              <div className="flex items-center gap-2"><EyeOff className="h-5 w-5 text-lilac-400" /><h2 id="warn-t" className="text-xl">{t('chat.hidden')}</h2></div>
              <p className="mt-3 text-sm text-ink-2">{t('chat.hiddenDialog')}</p>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setWarn(null)}>{t('chat.edit')}</Button>
                <Button className="flex-1" onClick={() => { const v = maskContacts(warn).text; setWarn(null); send(v); }}>{t('chat.sendWithout')}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
