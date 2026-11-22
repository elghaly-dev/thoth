import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { LanguageCode } from '../types';
import { dt } from '../ondevice/strings';

/** Shows public/licences.txt (served by this site; no outside request). */
export function LicencesModal({ lang, onClose }: { lang: LanguageCode; onClose: () => void }) {
  const [text, setText] = useState('');
  const close = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    close.current?.focus();
    fetch(import.meta.env.BASE_URL + 'licences.txt', { credentials: 'omit' })
      .then((r) => (r.ok ? r.text() : ''))
      .then(setText)
      .catch(() => setText(''));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="licences-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-3">
          <h2 id="licences-title" className="text-base font-semibold text-slate-100">
            {dt(lang, 'licences')}
          </h2>
          <button ref={close} type="button" onClick={onClose} aria-label={dt(lang, 'close')} className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <pre lang="en" dir="ltr" className="flex-1 overflow-auto whitespace-pre-wrap break-words px-5 py-4 text-xs leading-relaxed text-slate-300">
          {text || '…'}
        </pre>
      </div>
    </div>
  );
}
