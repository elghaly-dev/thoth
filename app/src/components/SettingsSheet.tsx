import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { LanguageCode } from '../types';
import { PALETTES, type PaletteId } from '../theme/palettes';
import { ts } from '../theme/strings';
import { MAX_NAME, cleanName } from '../theme/prefs';
import { ThemeTile } from './ThemeTile';

interface SettingsSheetProps {
  lang: LanguageCode;
  theme: PaletteId;
  name: string;
  onTheme: (id: PaletteId) => void;
  onName: (name: string) => void;
  onClose: () => void;
}

/** Settings: change the look and the name used in the greeting. Language stays in the header. */
export const SettingsSheet: React.FC<SettingsSheetProps> = ({ lang, theme, name, onTheme, onName, onClose }) => {
  const [draft, setDraft] = useState(name);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="thoth-settings-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 space-y-7"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="thoth-settings-title" className="thoth-display text-3xl text-white">{ts(lang, 'settingsTitle')}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={ts(lang, 'close')} className="rounded-full border border-slate-700 p-2 text-slate-300 hover:border-violet-500 cursor-pointer">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <span className="block h-px bg-slate-700" aria-hidden="true" />

        <section className="space-y-4" aria-labelledby="thoth-settings-look">
          <h3 id="thoth-settings-look" className="thoth-display text-xl text-white">{ts(lang, 'look')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PALETTES.map((p) => (
              <ThemeTile key={p.id} compact palette={p} lang={lang} selected={p.id === theme} onPick={() => onTheme(p.id)} />
            ))}
          </div>
        </section>

        <form
          className="space-y-3"
          onSubmit={(e) => { e.preventDefault(); onName(cleanName(draft)); onClose(); }}
        >
          <label htmlFor="thoth-settings-name" className="thoth-display block text-xl text-white">{ts(lang, 'yourName')}</label>
          <div className="flex flex-wrap gap-3">
            <input
              id="thoth-settings-name"
              autoComplete="given-name"
              dir="auto"
              maxLength={MAX_NAME}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={ts(lang, 'namePh')}
              className="flex-1 min-w-0 rounded-2xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button type="submit" className="rounded-full bg-violet-500 px-6 py-3 font-semibold text-slate-950 hover:bg-violet-400 cursor-pointer">
              {ts(lang, 'save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
