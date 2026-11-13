import React from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import type { LanguageCode } from '../types';
import { tx } from '../i18n';

interface ConsentGateProps {
  lang: LanguageCode;
  accepted: boolean;
  onAccept: () => void;
}

/**
 * Real consent gate for microphone use. Shown before the first mic use;
 * the mic stays disabled until the user explicitly accepts. Once accepted
 * it collapses to a one-line confirmation. This replaces the old static
 * notice (and the dead `hasConsented` state that defaulted to true).
 */
export const ConsentGate: React.FC<ConsentGateProps> = ({ lang, accepted, onAccept }) => {
  if (accepted) {
    return (
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2.5 text-xs">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-emerald-300">{tx(lang, 'consent.given')}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-white">{tx(lang, 'consent.title')}</strong>
          <span className="block mt-0.5">{tx(lang, 'consent.body')}</span>
        </div>
      </div>
      <button
        onClick={onAccept}
        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer shrink-0"
      >
        {tx(lang, 'consent.accept')}
      </button>
    </div>
  );
};
