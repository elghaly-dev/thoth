import React from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { Volume2, VolumeX, ShieldCheck, Sparkles, Globe, Heart } from 'lucide-react';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSafetyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  isMuted,
  onToggleMute,
  onOpenSafetyModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro-bar: 100% Free Guarantee & Trust */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/60 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">100% Free Forever</span>
          <span className="text-slate-500">•</span>
          <span>By <strong className="text-white">elghaly</strong> for Indian Exporters</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 hidden sm:inline">Reach & talk to US Buyers</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSafetyModal}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors text-xs font-medium cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Safety & Trust Policy</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for India's Makers
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-emerald-600 to-indigo-600 p-[2px] shadow-lg shadow-emerald-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Θ
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Thoth
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Voice Assistant
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              India 🇮🇳 ⇄ United States 🇺🇸 Export Bridge
            </p>
          </div>
        </div>

        {/* Controls: Language switcher, audio toggle, safety badge */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs shadow-inner">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <select
              aria-label="Select preferred language"
              value={currentLang.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Voice muted (click to unmute)' : 'Voice active (click to mute)'}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              isMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isMuted ? 'Muted' : 'Voice On'}</span>
          </button>

          {/* Safe Export guarantee */}
          <button
            onClick={onOpenSafetyModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 hover:border-slate-600 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>elghaly Free Tool</span>
          </button>
        </div>
      </div>
    </header>
  );
};
