import React, { useState } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from './types';
import { Header } from './components/Header';
import { VoiceAssistantTab } from './components/VoiceAssistantTab';
import { PitchStudioTab } from './components/PitchStudioTab';
import { LiveTranslatorTab } from './components/LiveTranslatorTab';
import { ImportGuideTab } from './components/ImportGuideTab';
import { SafetyModal } from './components/SafetyModal';
import { tx } from './i18n';
import {
  Mic,
  Sparkles,
  ArrowRightLeft,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Globe,
} from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(
    SUPPORTED_LANGUAGES[0] // Hindi as default, easily switchable to English, Marathi, Gujarati, etc.
  );
  const [activeTab, setActiveTab] = useState<'assistant' | 'pitch' | 'translate' | 'guide'>('assistant');
  const [isMuted, setIsMuted] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Data passed from voice conversation to Pitch Studio
  const [pitchInitialData, setPitchInitialData] = useState<{
    product: string;
    quantity: string;
    price: string;
    shippingOrigin: string;
  }>({
    product: '',
    quantity: '',
    price: '',
    shippingOrigin: '',
  });

  const handleOpenPitchStudioWithData = (data: {
    product: string;
    quantity: string;
    price: string;
    shippingOrigin: string;
  }) => {
    setPitchInitialData(data);
    setActiveTab('pitch');
  };

  const lang = currentLang.code;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-white">
      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {/* Tab 1: Voice Assistant */}
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-300" />
              <span>{tx(lang, 'app.tabAssistant')}</span>
            </button>

            {/* Tab 2: US Pitch Maker */}
            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-950/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{tx(lang, 'app.tabPitch')}</span>
            </button>

            {/* Tab 3: Live Translator */}
            <button
              onClick={() => setActiveTab('translate')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'translate'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-cyan-300" />
              <span>{tx(lang, 'app.tabTranslate')}</span>
            </button>

            {/* Tab 4: US Customs & Import Steps */}
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <span>{tx(lang, 'app.tabGuide')}</span>
            </button>
          </div>

          {/* Language context quick notice */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {tx(lang, 'app.speakingIn', { native: currentLang.nativeName, name: currentLang.name })}
            </span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'assistant' && (
          <VoiceAssistantTab
            currentLang={currentLang}
            isMuted={isMuted}
            onOpenPitchStudioWithData={handleOpenPitchStudioWithData}
          />
        )}

        {activeTab === 'pitch' && (
          <PitchStudioTab
            currentLang={currentLang}
            initialData={pitchInitialData}
          />
        )}

        {activeTab === 'translate' && (
          <LiveTranslatorTab currentLang={currentLang} />
        )}

        {activeTab === 'guide' && (
          <ImportGuideTab currentLang={currentLang} />
        )}
      </main>

      {/* Trust & Compliance Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="text-emerald-400 font-black">Θ</span> Thoth
              <span className="text-slate-500 font-normal">•</span>
              <span className="text-slate-300">{tx(lang, 'app.footerTagline')}</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-emerald-400 font-medium">{tx(lang, 'app.footerFree')}</span>
          </div>

          {/* Prominent broker disclaimer */}
          <div className="flex items-center gap-2 text-amber-300 bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-lg text-center">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{tx(lang, 'app.footerBroker')}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer text-xs"
            >
              {tx(lang, 'app.footerPrivacy')}
            </button>
            <span className="text-slate-600">|</span>
            <span>{tx(lang, 'app.footerNoPasswords')}</span>
          </div>
        </div>
      </footer>

      {/* Safety & Charter Modal */}
      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
