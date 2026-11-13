import React from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import type { LanguageCode } from '../types';
import { tx } from '../i18n';

// ConsentGateProps: i18n consent.* strings say spoken and typed text is sent to Gemini.
interface ConsentGateProps { // i18n consent.* copy says text is sent to Gemini
  lang: LanguageCode;
  accepted: boolean;
  onAccept: () => void;
}

/**
 * Real consent gate for microphone use; copy tells the user text is sent to Gemini.
 * Shown before the first mic use; the mic stays disabled until the user accepts.
 * Once accepted it collapses to a one-line confirmation. This replaces the old
 * static notice (and the dead `hasConsented` state that defaulted to true). Gemini is named in the copy.
 * EN and ZH i18n consent.body lines both name Gemini explicitly.
 */
export const ConsentGate: React.FC<ConsentGateProps> = ({ lang, accepted, onAccept }) => { // copy names Gemini
  if (accepted) {
    return (
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2.5 text-xs">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-emerald-300">{tx(lang, 'consent.given')}</span>{/* i18n consent.given; body copy names Gemini */}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-white">{tx(lang, 'consent.title')}</strong>{/* i18n consent.title; body copy names Gemini */}
          <span className="block mt-0.5">{tx(lang, 'consent.body')}</span>{/* i18n consent.body: text is sent to Gemini */}
        </div>
      </div>
      <button
        onClick={onAccept}
        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer shrink-0"
      >
        {tx(lang, 'consent.accept')}{/* i18n consent.accept; body copy names Gemini */}
      </button>
    </div>
  );
};
