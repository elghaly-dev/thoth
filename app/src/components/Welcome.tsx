import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../types';
import { PALETTES, type PaletteId } from '../theme/palettes';
import { ts } from '../theme/strings';
import { MAX_NAME, cleanName } from '../theme/prefs';
import { ThemeTile } from './ThemeTile';
import { dirFor } from '../utils/lang-pref';

interface WelcomeProps {
  currentLang: SupportedLanguage;
  theme: PaletteId;
  onTheme: (id: PaletteId) => void;
  onName: (name: string) => void;
  onLanguage: (lang: SupportedLanguage) => void;
  onDone: () => void;
}

/**
 * First launch: 1) look, 2) name, 3) language, then the app.
 * Look and name stay on this device; both can be changed later in Settings.
 */
export const Welcome: React.FC<WelcomeProps> = ({ currentLang, theme, onTheme, onName, onLanguage, onDone }) => {
  const lang = currentLang.code;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const Back = dirFor(lang) === 'rtl' ? ArrowRight : ArrowLeft;
  const Next = dirFor(lang) === 'rtl' ? ArrowLeft : ArrowRight;
  const title = step === 1 ? ts(lang, 'lookTitle') : step === 2 ? ts(lang, 'nameTitle') : ts(lang, 'langTitle');
  const sub = step === 1 ? ts(lang, 'lookSub') : step === 2 ? ts(lang, 'nameSub') : ts(lang, 'langSub');

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="thoth-welcome-title" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-16 flex flex-col gap-8 min-h-full">
        <div className="flex items-center justify-between gap-4">
          <span className="thoth-display text-2xl text-white">Thoth</span>
          <span className="text-sm text-slate-400">{ts(lang, 'step').replace('{n}', String(step))}</span>
        </div>
        <span className="block h-px bg-slate-700" aria-hidden="true" />

        <header className="space-y-3">
          <h2 id="thoth-welcome-title" ref={headingRef} tabIndex={-1} className="thoth-display text-4xl sm:text-5xl text-white leading-tight focus:outline-none">
            {title}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">{sub}</p>
        </header>

        {step === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {PALETTES.map((p) => (
              <ThemeTile key={p.id} palette={p} lang={lang} selected={p.id === theme} onPick={() => { onTheme(p.id); setStep(2); }} />
            ))}
          </div>
        )}

        {step === 2 && (
          <form
            className="space-y-6"
            onSubmit={(e) => { e.preventDefault(); onName(cleanName(name)); setStep(3); }}
          >
            <label className="block">
              <span className="sr-only">{ts(lang, 'yourName')}</span>
              <input
                autoComplete="given-name"
                dir="auto"
                maxLength={MAX_NAME}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ts(lang, 'namePh')}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-slate-200 hover:border-amber-500 cursor-pointer">
                <Back className="w-4 h-4" aria-hidden="true" />
                {ts(lang, 'back')}
              </button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer">
                {ts(lang, 'next')}
                <Next className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => { onName(''); setStep(3); }} className="px-3 py-3 text-slate-400 hover:text-slate-200 underline-offset-4 hover:underline cursor-pointer">
                {ts(lang, 'skip')}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map((l) => {
                const on = l.code === lang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    lang={l.code === 'zh' ? 'zh-CN' : l.code}
                    aria-pressed={on}
                    onClick={() => onLanguage(l)}
                    className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-4 text-lg cursor-pointer transition-colors ${
                      on ? 'border-amber-500 bg-amber-950 text-white' : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-500'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    {on && <Check className="w-4 h-4 text-amber-300" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-slate-200 hover:border-amber-500 cursor-pointer">
                <Back className="w-4 h-4" aria-hidden="true" />
                {ts(lang, 'back')}
              </button>
              <button type="button" onClick={onDone} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer">
                {ts(lang, 'start')}
                <Next className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
