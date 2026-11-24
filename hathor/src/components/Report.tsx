// The «بلّغ» button and its dialog. Used on supplier pages, product listings,
// conversation headers and single messages.
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Flag, Info } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { useStore } from '../lib/store';
import { NOTE_MAX, REPORT_REASONS, reportsEndpoint, type ReportReason, type ReportTarget } from '../lib/reports';
import { Button } from './ui';

const LABEL: Record<ReportTarget['kind'], StringKey> = {
  supplier: 'report.supplier',
  product: 'report.listing',
  thread: 'report.thread',
  message: 'report.message',
};

export function ReportButton({ target, variant = 'link', className = '' }: { target: ReportTarget; variant?: 'link' | 'icon' | 'chip'; className?: string }) {
  const { t } = useI18n();
  const { isReported } = useStore();
  const [open, setOpen] = useState(false);
  const done = isReported(target);
  const label = done ? t('report.reported') : t(LABEL[target.kind]);
  const base = 'inline-flex items-center gap-1.5 transition disabled:cursor-default';
  const styles = {
    link: 'text-sm text-ink-3 hover:text-lilac-200 disabled:hover:text-ink-3',
    icon: 'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-2 hover:bg-lilac-400/10 hover:text-lilac-200',
    chip: 'text-lilac-400 hover:text-lilac-200',
  }[variant];
  return (
    <>
      <button
        type="button"
        className={`${base} ${styles} ${className}`}
        onClick={() => setOpen(true)}
        disabled={done}
        aria-label={variant === 'icon' ? label : undefined}
        title={variant === 'icon' ? label : undefined}
        data-report={target.kind}
      >
        <Flag className={`${variant === 'icon' ? 'h-5 w-5' : 'h-3.5 w-3.5'} ${done ? 'fill-lilac-400 text-lilac-400' : ''}`} aria-hidden="true" />
        {variant !== 'icon' && <span>{variant === 'chip' && !done ? t('report.action') : label}</span>}
      </button>
      <AnimatePresence>{open && <ReportDialog target={target} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

export function ReportDialog({ target, onClose }: { target: ReportTarget; onClose: () => void }) {
  const { t } = useI18n();
  const { fileReport } = useStore();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<StringKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | { server: boolean }>(null);
  const titleId = useId();
  const noteId = useId();
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const r = await fileReport(target, reason, note);
    setBusy(false);
    if (!r.ok) { setError(r.error === 'noteRequired' ? 'report.err.note' : 'report.err.reason'); return; }
    setSent({ server: r.report.sent });
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-night-950/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby={titleId} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass max-h-[90dvh] w-full max-w-md overflow-y-auto p-6">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-lilac-400" aria-hidden="true" />
            <h2 id={titleId} className="mt-3 text-xl">{t('report.done.t')}</h2>
            <p className="mt-2 text-sm text-ink-2">{t('report.done.d')}</p>
            {!sent.server && !reportsEndpoint() && <p className="mt-3 flex items-start gap-2 rounded-[12px] border border-lilac-400/20 bg-lilac-400/5 p-3 text-start text-xs text-ink-2"><Info className="h-4 w-4 shrink-0 text-lilac-400" />{t('report.notConnected')}</p>}
            <Button className="mt-6 w-full" onClick={onClose}>{t('report.close')}</Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            <div className="flex items-center gap-2"><Flag className="h-5 w-5 text-lilac-400" aria-hidden="true" /><h2 id={titleId} className="text-xl">{t('report.title')}</h2></div>
            <p className="mt-1 truncate text-sm text-lilac-400"><bdi>{t('report.target', { name: target.label })}</bdi></p>
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold">{t('report.why')}</legend>
              <div className="space-y-2">
                {REPORT_REASONS.map((r, i) => (
                  <label key={r} className={`flex cursor-pointer gap-3 rounded-[14px] border p-3 transition ${reason === r ? 'border-lilac-400 bg-lilac-400/10' : 'border-lilac-400/15 hover:border-lilac-400/40'}`}>
                    <input ref={i === 0 ? first : undefined} type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => { setReason(r); setError(null); }} className="mt-1 accent-[var(--color-lilac-400)]" />
                    <span>
                      <span className="block text-sm font-semibold">{t(`report.r.${r}` as StringKey)}</span>
                      <span className="block text-xs text-ink-3">{t(`report.r.${r}.d` as StringKey)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label htmlFor={noteId} className="mt-5 block text-sm font-semibold">{t('report.note')}</label>
            <textarea id={noteId} value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} rows={3} className="field mt-2 !h-auto py-2" aria-describedby={`${noteId}-hint`} />
            <p id={`${noteId}-hint`} className="mt-1 text-xs text-ink-3">{t(reason === 'other' ? 'report.noteHintOther' : 'report.noteHint')}</p>
            {error && <p role="alert" className="mt-3 text-sm text-warning">{t(error)}</p>}
            <div className="mt-6 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('report.cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={busy}>{t('report.send')}</Button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
