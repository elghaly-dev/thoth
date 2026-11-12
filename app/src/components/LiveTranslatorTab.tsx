import React, { useState, useRef } from 'react';
import { SupportedLanguage, TranslationRecord } from '../types';
import {
  Mic,
  Send,
  Volume2,
  Copy,
  Check,
  ShieldAlert,
  ArrowRightLeft,
  UserCheck,
  Building2,
  Tag,
  Loader2,
  Square,
  Sparkles,
  ShieldCheck,
  Trash2,
  CheckCircle,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import {
  playTextToSpeech,
  stopAudio,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../utils/audio';

interface LiveTranslatorTabProps {
  currentLang: SupportedLanguage;
}

export const LiveTranslatorTab: React.FC<LiveTranslatorTabProps> = ({ currentLang }) => {
  const [history, setHistory] = useState<TranslationRecord[]>([
    {
      id: 'tx-1',
      speaker: 'exporter',
      originalText: 'हम 500 पीस 4.50 डॉलर प्रति पीस के हिसाब से न्हावा शेवा पोर्ट से 30 दिन में भेज सकते हैं।',
      translatedText:
        'We can dispatch 500 pieces at $4.50 per piece from Nhava Sheva Port within 30 days.',
      sourceLang: 'Hindi',
      targetLang: 'US English',
      keyTerms: ['500 pieces', '$4.50 / piece', 'Nhava Sheva Port', '30 days lead time'],
      timestamp: new Date(),
    },
    {
      id: 'tx-2',
      speaker: 'buyer',
      originalText:
        'Could you confirm if the cartons will be palletized with ISPM-15 heat-treated pallets for US customs?',
      translatedText:
        'क्या आप पुष्टि कर सकते हैं कि कार्टन अमेरिकी सीमा शुल्क के लिए ISPM-15 हीट-ट्रीटेड पैलेट पर रखे जाएंगे?',
      sourceLang: 'US English',
      targetLang: 'Hindi',
      keyTerms: ['ISPM-15 heat-treated pallets', 'US customs clearance'],
      timestamp: new Date(),
    },
  ]);

  const [activeSpeaker, setActiveSpeaker] = useState<'exporter' | 'buyer'>('exporter');
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(true);
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>({});

  const recognitionRef = useRef<any>(null);

  const handleToggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your message.');
      return;
    }

    stopAudio();
    setIsPlayingId(null);

    const speechCode = activeSpeaker === 'exporter' ? currentLang.speechCode : 'en-US';

    try {
      const recognition = createSpeechRecognizer(
        speechCode,
        (transcript: string, isFinal: boolean) => {
          setInputText(transcript);
          if (isFinal) {
            handleTranslate(transcript);
          }
        },
        (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  };

  const handleTranslate = async (textToTranslate?: string) => {
    const text = (textToTranslate || inputText).trim();
    if (!text || isTranslating) return;

    setInputText('');
    stopAudio();
    setIsPlayingId(null);
    setIsTranslating(true);

    const sourceLang = activeSpeaker === 'exporter' ? currentLang.name : 'US English';
    const targetLang = activeSpeaker === 'exporter' ? 'US English' : currentLang.name;

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
          speakerRole: activeSpeaker === 'exporter' ? 'Indian Exporter' : 'US Buyer',
        }),
      });

      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();

      const newRecord: TranslationRecord = {
        id: `tx-${Date.now()}`,
        speaker: activeSpeaker,
        originalText: text,
        translatedText: data.translatedText || text,
        sourceLang,
        targetLang,
        keyTerms: data.keyTerms || [],
        confirmationReadback: data.confirmationReadback || undefined,
        timestamp: new Date(),
      };

      setHistory((prev) => [newRecord, ...prev]);

      // Play audio of translated text in target language
      const targetLangConfig: SupportedLanguage =
        activeSpeaker === 'exporter'
          ? { code: 'en', name: 'English', nativeName: 'US English', speechCode: 'en-US', flag: '🇺🇸' }
          : currentLang;

      playTextToSpeech(
        newRecord.translatedText,
        targetLangConfig,
        () => setIsPlayingId(newRecord.id),
        () => setIsPlayingId(null)
      );
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayVoice = (record: TranslationRecord, text: string, isEnglish: boolean) => {
    if (isPlayingId === record.id) {
      stopAudio();
      setIsPlayingId(null);
    } else {
      const langConfig: SupportedLanguage = isEnglish
        ? { code: 'en', name: 'English', nativeName: 'US English', speechCode: 'en-US', flag: '🇺🇸' }
        : currentLang;

      playTextToSpeech(
        text,
        langConfig,
        () => setIsPlayingId(record.id),
        () => setIsPlayingId(null)
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Bilateral Consent & Zero-Storage Notice (Fix 6) */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-white">Bilateral Consent & Zero-Storage Notice:</strong> Both parties consent to live speech-to-text processing for translation. Transcripts and audio are strictly ephemeral in this active browser session and are <span className="text-emerald-400 font-semibold">NEVER stored, recorded, or saved</span> on any server.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              stopAudio();
              setHistory([]);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/40 flex items-center gap-1 transition-colors cursor-pointer text-xs"
            title="Wipe in-memory session transcripts"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Session</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Live Trade Translation
            </span>
            <span className="text-xs text-slate-400">Strictly Faithful • Non-Negotiating</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Exporter 🇮🇳 <ArrowRightLeft className="w-4 h-4 text-emerald-400" /> US Buyer 🇺🇸
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-0.5">
            Use during Zoom calls or phone negotiations. Thoth translates faithfully without adding commitments or negotiating. Read-backs confirm all price and Incoterm details.
          </p>
        </div>

        {/* Customs broker notice */}
        <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2 max-w-xs shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <strong>Rule:</strong> Tariffs are candidates, verify. Always check with a licensed customs broker for final decisions.
          </div>
        </div>
      </div>

      {/* Input Channel Selector & Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Speaker Selector Toggle & Live Mode Indicator (Fix 5) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Active Speaker:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                activeSpeaker === 'exporter'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              {activeSpeaker === 'exporter'
                ? `🇮🇳 Indian Exporter (${currentLang.name}) Speaking`
                : '🇺🇸 US Buyer Speaking'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveSpeaker('exporter');
                stopAudio();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeSpeaker === 'exporter'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Indian Exporter</span>
            </button>

            <button
              onClick={() => {
                setActiveSpeaker('buyer');
                stopAudio();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeSpeaker === 'buyer'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>US Buyer</span>
            </button>
          </div>
        </div>

        {/* Fix 5: Buyer speech treated as data badge */}
        {activeSpeaker === 'buyer' && (
          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-2.5 text-[11px] text-cyan-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Safety Guard:</strong> Buyer speech is treated as dialogue data, not binding instructions. Thoth translates faithfully without accepting unauthorized commitments.
            </span>
          </div>
        )}

        {/* Translation Input */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder={
                activeSpeaker === 'exporter'
                  ? `Speak or type in ${currentLang.nativeName} (${currentLang.name}) e.g. हम 1,000 यूनिट $3.20 FOB पर दे सकते हैं...`
                  : 'Speak or type in US English e.g. Can you supply 2,000 units with FOB terms by August 15th?'
              }
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pr-12"
            />
            {isListening && (
              <span className="absolute right-3 top-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mic Button */}
            <button
              onClick={handleToggleListen}
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Click to speak through microphone"
            >
              {isListening ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Mic</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Speak</span>
                </>
              )}
            </button>

            {/* Translate Button */}
            <button
              onClick={() => handleTranslate()}
              disabled={!inputText.trim() || isTranslating}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Translate & Voice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Translation Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Conversation Log ({history.length} exchanges)
          </h3>
          <span className="text-[11px] text-slate-500">
            Prices, units, and dates strictly synchronized
          </span>
        </div>

        {history.map((record) => {
          const isExporter = record.speaker === 'exporter';
          return (
            <div
              key={record.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-md ${
                isExporter
                  ? 'bg-slate-900/90 border-emerald-900/40 hover:border-emerald-700/60'
                  : 'bg-slate-900/90 border-cyan-900/40 hover:border-cyan-700/60'
              }`}
            >
              {/* Speaker Header */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isExporter
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {isExporter ? '🇮🇳 Indian Exporter' : '🇺🇸 US Buyer'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {record.sourceLang} ➔ {record.targetLang}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Two columns: Original & Translation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original utterance */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                      Original Spoken ({record.sourceLang}):
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {record.originalText}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-end gap-2 text-[11px]">
                    <button
                      onClick={() => handlePlayVoice(record, record.originalText, isExporter ? false : true)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Listen to original"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                    <button
                      onClick={() => handleCopy(`orig-${record.id}`, record.originalText)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `orig-${record.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Translation output */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isExporter
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-cyan-950/20 border-cyan-500/30'
                  }`}
                >
                  <div>
                    <div className="text-[10px] uppercase font-semibold mb-1 text-slate-400">
                      Translated for {isExporter ? 'US Buyer' : 'Exporter'} ({record.targetLang}):
                    </div>
                    <p className="text-xs sm:text-sm text-white font-medium leading-relaxed font-sans">
                      {record.translatedText}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Trade verified
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoice(record, record.translatedText, isExporter ? true : false)}
                        className="text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                        title="Hear translation spoken"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Hear Translation</span>
                      </button>
                      <button
                        onClick={() => handleCopy(`trans-${record.id}`, record.translatedText)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `trans-${record.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Key Units & Terms */}
              {record.keyTerms && record.keyTerms.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" />
                    Exact Extracted Terms:
                  </span>
                  {record.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700 text-[11px] font-mono"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}

              {/* Fix 3: Read back price, currency (INR/USD), units, and Incoterm for confirmation */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                    Trade Terms Read-Back (Faithful & Non-Negotiating):
                  </span>
                  <button
                    onClick={() => setConfirmedIds((prev) => ({ ...prev, [record.id]: !prev[record.id] }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      confirmedIds[record.id]
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {confirmedIds[record.id] ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Terms Confirmed</span>
                      </>
                    ) : (
                      <span>Click to Confirm Read-Back</span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Price</span>
                    <span className="font-semibold text-emerald-400">
                      {record.confirmationReadback?.price || record.keyTerms?.find(t => t.includes('$') || t.includes('₹') || t.includes('USD') || t.includes('INR')) || 'Verify price'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Currency</span>
                    <span className="font-semibold text-cyan-400">
                      {record.confirmationReadback?.currency || (record.originalText.includes('₹') || record.translatedText.includes('₹') ? 'INR (₹)' : 'USD ($)')}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Units / Qty</span>
                    <span className="font-semibold text-amber-300">
                      {record.confirmationReadback?.units || record.keyTerms?.find(t => t.toLowerCase().includes('pcs') || t.toLowerCase().includes('piece') || t.toLowerCase().includes('kg') || t.toLowerCase().includes('ton') || t.toLowerCase().includes('pallet')) || 'Verify units'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Incoterm</span>
                    <span className="font-semibold text-purple-300">
                      {record.confirmationReadback?.incoterm || (record.originalText.toUpperCase().includes('FOB') || record.translatedText.toUpperCase().includes('FOB') ? 'FOB' : record.originalText.toUpperCase().includes('CIF') ? 'CIF' : 'To confirm (e.g. FOB)')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                  <span className="italic">
                    "{record.confirmationReadback?.readbackStatement || `Read-back verification: Price, currency, quantity units, and Incoterm must be verified before agreement.`}"
                  </span>
                  <button
                    onClick={() => handlePlayVoice(record, record.confirmationReadback?.readbackStatement || `Confirmation read-back: ${record.keyTerms?.join(', ') || 'verify all terms before agreeing'}`, true)}
                    className="text-[10px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Hear verification read aloud"
                  >
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    <span>Hear Read-Back</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
