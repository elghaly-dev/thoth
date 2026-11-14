import React from 'react';
import { X, ShieldCheck, Lock, DollarSign, Award, AlertTriangle, Heart } from 'lucide-react';
import type { LanguageCode } from '../types';
import { tx } from '../i18n';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {tx(lang, 'safety.title')}
            </h3>
            <p className="text-xs text-slate-400">
              {tx(lang, 'safety.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{tx(lang, 'safety.item1Title')}</strong> {tx(lang, 'safety.item1Body')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{tx(lang, 'safety.item2Title')}</strong> {tx(lang, 'safety.item2Body')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{tx(lang, 'safety.item3Title')}</strong> {tx(lang, 'safety.item3Body')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{tx(lang, 'safety.item4Title')}</strong> {tx(lang, 'safety.item4Body')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-3 text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <strong className="text-rose-300">{tx(lang, 'safety.item5Title')}</strong> {tx(lang, 'safety.item5Body')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{tx(lang, 'safety.item6Title')}</strong> {tx(lang, 'safety.item6Body')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{tx(lang, 'safety.item7Title')}</strong> {tx(lang, 'safety.item7Body')}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            {tx(lang, 'safety.madeWith')} <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> {tx(lang, 'safety.byElghaly')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
          >
            {tx(lang, 'safety.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
