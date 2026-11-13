import React from 'react';
import { Mic, MicOff, Loader2, Volume2, Square } from 'lucide-react';
import type { LanguageCode } from '../types';
import { tx } from '../i18n';

interface VoiceOrbProps {
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  onStopSpeech?: () => void;
  langLabel: string;
  lang: LanguageCode;
  disabled?: boolean;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isListening,
  isThinking,
  isSpeaking,
  onToggleListen,
  onStopSpeech,
  langLabel,
  lang,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow rings */}
        <div
          className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
            isListening
              ? 'w-44 h-44 bg-emerald-500/25 blur-2xl animate-pulse scale-110'
              : isThinking
              ? 'w-44 h-44 bg-amber-500/25 blur-2xl animate-pulse'
              : isSpeaking
              ? 'w-44 h-44 bg-cyan-500/25 blur-2xl animate-pulse'
              : 'w-36 h-36 bg-slate-800/40 blur-xl'
          }`}
        />

        {/* Concentric pulsing circles when active */}
        {(isListening || isSpeaking) && (
          <>
            <div className="absolute w-36 h-36 rounded-full border border-emerald-500/30 animate-ping opacity-30 pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-emerald-400/20 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Main interactive button */}
        <button
          onClick={isSpeaking && onStopSpeech ? onStopSpeech : onToggleListen}
          disabled={disabled && !isListening && !isSpeaking}
          title={
            disabled
              ? tx(lang, 'consent.micHint')
              : isListening
              ? tx(lang, 'orb.titleStopListening')
              : isSpeaking
              ? tx(lang, 'orb.titleStopSpeaking')
              : tx(lang, 'orb.titleSpeak', { lang: langLabel })
          }
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer transform active:scale-95 ${
            disabled && !isListening && !isSpeaking
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 shadow-slate-950/80 border border-slate-700/80 opacity-60 cursor-not-allowed'
              : isListening
              ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/50 ring-4 ring-emerald-400/50 scale-105'
              : isThinking
              ? 'bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-amber-500/50 ring-4 ring-amber-400/40'
              : isSpeaking
              ? 'bg-gradient-to-br from-cyan-600 to-indigo-700 text-white shadow-cyan-500/50 ring-4 ring-cyan-400/50'
              : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 hover:from-slate-700 hover:to-slate-800 shadow-slate-950/80 border border-slate-700/80 hover:border-emerald-500/50'
          }`}
        >
          {isThinking ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <Mic className="w-8 h-8 animate-bounce" />
          ) : isSpeaking ? (
            <div className="flex flex-col items-center">
              <Square className="w-6 h-6 fill-current mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tx(lang, 'orb.stop')}</span>
            </div>
          ) : (
            <Mic className="w-8 h-8 text-emerald-400" />
          )}

          {/* Equalizer frequency bars when listening/speaking */}
          {(isListening || isSpeaking) && (
            <div className="absolute -bottom-2 flex items-center gap-1">
              <span className="w-1 bg-white rounded-full animate-wave-1" />
              <span className="w-1 bg-white rounded-full animate-wave-2" />
              <span className="w-1 bg-white rounded-full animate-wave-3" />
              <span className="w-1 bg-white rounded-full animate-wave-4" />
              <span className="w-1 bg-white rounded-full animate-wave-5" />
            </div>
          )}
        </button>
      </div>

      {/* Status indicator label */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-semibold">{tx(lang, 'orb.listening', { lang: langLabel })}</span>
            </>
          ) : isThinking ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400">{tx(lang, 'orb.thinking')}</span>
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span className="text-cyan-400 font-semibold">{tx(lang, 'orb.speaking')}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>{tx(lang, 'orb.tapToTalk', { lang: langLabel })}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
