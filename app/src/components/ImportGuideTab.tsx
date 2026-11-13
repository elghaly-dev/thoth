import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import {
  HelpCircle,
  ShieldAlert,
  Send,
  Loader2,
  Volume2,
  BookOpen,
  Anchor,
  Tag,
  FileText,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { playTextToSpeech, stopAudio } from '../utils/audio';
import { tx } from '../i18n';

interface ImportGuideTabProps {
  currentLang: SupportedLanguage;
}

export const ImportGuideTab: React.FC<ImportGuideTabProps> = ({ currentLang }) => {
  const lang = currentLang.code;
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAskQuestion = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const q = (customQ || query).trim();
    if (!q || isAsking) return;

    setIsAsking(true);
    stopAudio();
    setIsPlayingAudio(false);

    try {
      const res = await fetch('/api/import-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          userLanguage: currentLang.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch guide answer');
      const data = await res.json();
      setQaAnswer(data.answer);

      // Play voice read aloud
      playTextToSpeech(
        data.answer,
        currentLang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    } catch (err) {
      console.error('Error fetching import answer:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = [
    tx(lang, 'guide.sampleQ1'),
    tx(lang, 'guide.sampleQ2'),
    tx(lang, 'guide.sampleQ3'),
    tx(lang, 'guide.sampleQ4'),
    tx(lang, 'guide.sampleQ5'),
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {tx(lang, 'guide.badge')}
            </span>
            <span className="text-xs text-slate-400">{tx(lang, 'guide.badgeSub')}</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {tx(lang, 'guide.title')}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            {tx(lang, 'guide.subtitle')}
          </p>
        </div>

        {/* Customs Broker Mandatory Disclaimer */}
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2 max-w-sm shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <strong>{tx(lang, 'guide.brokerTitle')}</strong> {tx(lang, 'guide.brokerBody')}
          </div>
        </div>
      </div>

      {/* Interactive Ask Thoth Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            {tx(lang, 'guide.askTitle', { lang: currentLang.name })}
          </h3>
          <span className="text-[11px] text-slate-400">{tx(lang, 'guide.plainWords')}</span>
        </div>

        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx(lang, 'guide.askPh', { native: currentLang.nativeName })}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || isAsking}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-950 transition-all cursor-pointer"
          >
            {isAsking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tx(lang, 'guide.explaining')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{tx(lang, 'guide.askBtn')}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick query buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleAskQuestion(undefined, sq);
              }}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer text-left"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Answer Box */}
        {qaAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {tx(lang, 'guide.answerTitle')}
              </span>
              <button
                onClick={() => {
                  if (isPlayingAudio) {
                    stopAudio();
                    setIsPlayingAudio(false);
                  } else {
                    playTextToSpeech(
                      qaAnswer,
                      currentLang,
                      () => setIsPlayingAudio(true),
                      () => setIsPlayingAudio(false)
                    );
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isPlayingAudio ? tx(lang, 'guide.stopVoice') : tx(lang, 'guide.listen')}</span>
              </button>
            </div>
            <p className="whitespace-pre-line text-slate-200">{qaAnswer}</p>
          </div>
        )}
      </div>

      {/* Visual Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. HS / HTS Codes (Fix 2: Candidate, verify - never state as fact) */}
        <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
              {tx(lang, 'guide.card1Tag')}
            </span>
            <h4 className="text-sm font-bold text-white">{tx(lang, 'guide.card1Title')}</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {tx(lang, 'guide.card1Body')}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>{tx(lang, 'guide.card1Note1')}</div>
            <div>{tx(lang, 'guide.card1Note2')}</div>
          </div>
        </div>

        {/* 2. FOB vs CIF */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Anchor className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">{tx(lang, 'guide.card2Title')}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {tx(lang, 'guide.card2Body')}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>{tx(lang, 'guide.card2Note1')}</div>
            <div>{tx(lang, 'guide.card2Note2')}</div>
          </div>
        </div>

        {/* 3. Labeling Rules */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Tag className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">{tx(lang, 'guide.card3Title')}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {tx(lang, 'guide.card3Body')}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>{tx(lang, 'guide.card3Note1')}</div>
            <div>{tx(lang, 'guide.card3Note2')}</div>
          </div>
        </div>

        {/* 4. Wood Packaging (ISPM-15) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">{tx(lang, 'guide.card4Title')}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {tx(lang, 'guide.card4Body')}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>{tx(lang, 'guide.card4Note1')}</div>
            <div>{tx(lang, 'guide.card4Note2')}</div>
          </div>
        </div>

        {/* 5. Essential Documents */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">{tx(lang, 'guide.card5Title')}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {tx(lang, 'guide.card5Body')}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>{tx(lang, 'guide.card5Doc1')}</div>
            <div>{tx(lang, 'guide.card5Doc2')}</div>
            <div>{tx(lang, 'guide.card5Doc3')}</div>
            <div>{tx(lang, 'guide.card5Doc4')}</div>
          </div>
        </div>

        {/* 6. Why Customs Brokers Matter */}
        <div className="bg-slate-900/80 border border-amber-900/50 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">{tx(lang, 'guide.card6Title')}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {tx(lang, 'guide.card6Body')}
          </p>
          <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-500/30 text-[11px] text-amber-200">
            <strong>{tx(lang, 'guide.card6Golden')}</strong> {tx(lang, 'guide.card6GoldenBody')}
          </div>
        </div>

        {/* 7. Scam Warning: Fake-Buyer & Advance-Payment Fraud (Fix 4) */}
        <div className="md:col-span-2 lg:col-span-3 bg-rose-950/20 border border-rose-800/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-rose-300">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-rose-200">
              {tx(lang, 'guide.card7Title')}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/30">
              <strong className="text-rose-300 block mb-1">{tx(lang, 'guide.card7Sub1Title')}</strong>
              {tx(lang, 'guide.card7Sub1Body')}
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/30">
              <strong className="text-rose-300 block mb-1">{tx(lang, 'guide.card7Sub2Title')}</strong>
              {tx(lang, 'guide.card7Sub2Body')}
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/30">
              <strong className="text-rose-300 block mb-1">{tx(lang, 'guide.card7Sub3Title')}</strong>
              {tx(lang, 'guide.card7Sub3Body')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
