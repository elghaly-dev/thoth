import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, ChatMessage } from '../types';
import { VoiceOrb } from './VoiceOrb';
import {
  Send,
  Volume2,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Package,
  Layers,
  DollarSign,
  Ship,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { playTextToSpeech, stopAudio, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/audio';

interface VoiceAssistantTabProps {
  currentLang: SupportedLanguage;
  isMuted: boolean;
  onOpenPitchStudioWithData: (data: {
    product: string;
    quantity: string;
    price: string;
    shippingOrigin: string;
  }) => void;
}

export const VoiceAssistantTab: React.FC<VoiceAssistantTabProps> = ({
  currentLang,
  isMuted,
  onOpenPitchStudioWithData,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extracted step detection from conversation
  const [details, setDetails] = useState({
    product: '',
    quantity: '',
    price: '',
    shippingOrigin: '',
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'msg-init')) {
      const greetings: Record<string, string> = {
        hi: 'नमस्ते! मैं थोथ (Thoth) हूँ, भारतीय निर्यातकों के लिए elghaly का निःशुल्क वॉइस असिस्टेंट। अमेरिका में खरीदारों तक पहुँचने में मैं आपकी सहायता करूँगा। सबसे पहले बताएं: आप क्या उत्पाद बनाते या बेचते हैं?',
        mr: 'नमस्कार! मी थोथ (Thoth) आहे, भारतीय निर्यातदारांसाठी elghaly चा मोफत व्हॉईस असिस्टंट. अमेरिकेतील खरेदीदारांपर्यंत पोहोचण्यासाठी मी मदत करेन. सांगा, आपण कोणते उत्पादन तयार करता किंवा विकता?',
        gu: 'નમસ્તે! હું થોથ (Thoth) છું, ભારતીય નિકાસકારો માટે elghaly નો મફત વૉઇસ સહાયક. યુએસ ખરીદદારો સાથે જોડાવવા હું મદદ કરીશ. મને જણાવો: તમે કઈ પ્રોડક્ટ બનાવો છો કે વેચો છો?',
        ta: 'வணக்கம்! நான் தோத் (Thoth), இந்திய ஏற்றுமதியாளர்களுக்கான elghaly இன் இலவச குரல் உதவியாளர். அமெரிக்க வாங்குபவர்களிடம் உங்கள் தயாரிப்புகளைக் கொண்டு சேர்க்க நான் உதவுவேன். நீங்கள் என்ன பொருள் தயாரிக்கிறீர்கள் அல்லது விற்கிறீர்கள்?',
        bn: 'নমস্কার! আমি থথ (Thoth), ভারতীয় রপ্তানিকারকদের জন্য elghaly-এর বিনামূল্যে ভয়েस সহকারী। মার্কিন ক্রেতাদের সাথে ব্যবসা করতে আমি আপনাকে সাহায্য করব। প্রথমে বলুন: আপনি কী পণ্য তৈরি বা বিক্রি করেন?',
        te: 'నమస్కారం! నేను థోత్ (Thoth), భారతీయ ఎగుమతిదారుల కోసం elghaly ఉచిత వాయిస్ అసిస్టెంట్. అమెరికా కొనుగోలుదారులకు చేరడంలో నేను మీకు సహాయం చేస్తాను. మీరు ఏ ఉత్పత్తిని తయారు చేస్తారు లేదా అమ్ముతారు?',
        pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਥੋਥ (Thoth) ਹਾਂ, ਭਾਰਤੀ ਨਿਰਯਾਤਕਾਂ ਲਈ elghaly ਦਾ ਮੁਫ਼ਤ ਆਵਾਜ਼ ਸਹਾਇਕ। ਅਮਰੀਕੀ ਖਰੀਦਦਾਰਾਂ ਤੱਕ ਪਹੁੰਚਣ ਵਿੱਚ ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਾਂਗਾ। ਦੱਸੋ, ਤੁਸੀਂ ਕੀ ਉਤਪਾਦ ਬਣਾਉਂਦੇ ਜਾਂ ਵੇਚਦੇ ਹੋ?',
        zh: '您好！我是 Thoth，由 elghaly 为出口商打造的免费语音助手。我将协助您与美国买家对接并洽谈业务。第一步：请问您生产或销售什么产品？',
        en: 'Namaste! I am Thoth, a free Faithful Servant by elghaly for Indian exporters. I will help you reach and pitch to buyers in the United States. Step 1: What product do you sell or manufacture?',
      };

      const initialText =
        greetings[currentLang.code] || greetings['en'];

      const initialMessage: ChatMessage = {
        id: 'msg-init',
        role: 'assistant',
        content: initialText,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);

      if (!isMuted) {
        playTextToSpeech(
          initialText,
          currentLang,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    }
  }, [currentLang.code]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Speech Recognition Handling
  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.');
      return;
    }

    stopAudio();
    setIsSpeaking(false);

    try {
      const recognition = createSpeechRecognizer(
        currentLang.speechCode,
        (transcript: string, isFinal: boolean) => {
          setInputText(transcript);
          if (isFinal) {
            handleSendMessage(transcript);
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
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  const handleStopSpeech = () => {
    stopAudio();
    setIsSpeaking(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    setInputText('');
    stopAudio();
    setIsSpeaking(false);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsThinking(true);

    // Heuristically check if exporter supplied steps:
    detectSteps(text);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userLanguage: currentLang.name,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantText = data.reply || 'Thank you. What is your minimum quantity or capacity?';

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Play audio automatically if not muted
      if (!isMuted) {
        playTextToSpeech(
          assistantText,
          currentLang,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, there was a momentary connection issue. Please check with a licensed customs broker for final decisions. Could you please repeat that?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Heuristic updater for step tracker
  const detectSteps = (text: string) => {
    const lower = text.toLowerCase();
    setDetails((prev) => {
      const next = { ...prev };
      if (!next.product && (lower.includes('rug') || lower.includes('brass') || lower.includes('spices') || lower.includes('textile') || lower.includes('ceramic') || lower.includes('leather') || lower.includes('cotton') || lower.includes('sell') || lower.includes('make') || lower.length > 5)) {
        next.product = prev.product || text.slice(0, 40);
      }
      if (!next.quantity && (lower.includes('moq') || lower.includes('pcs') || lower.includes('kg') || lower.includes('ton') || lower.includes('pieces') || /\d+/.test(lower))) {
        next.quantity = prev.quantity || text;
      }
      if (!next.price && (lower.includes('$') || lower.includes('₹') || lower.includes('inr') || lower.includes('usd') || lower.includes('dollar') || lower.includes('rupee') || lower.includes('per'))) {
        next.price = prev.price || text;
      }
      if (!next.shippingOrigin && (lower.includes('mumbai') || lower.includes('nhava') || lower.includes('mundra') || lower.includes('chennai') || lower.includes('delhi') || lower.includes('cochin') || lower.includes('jaipur') || lower.includes('moradabad') || lower.includes('surat') || lower.includes('port'))) {
        next.shippingOrigin = prev.shippingOrigin || text;
      }
      return next;
    });
  };

  const handlePlayMessageAudio = (text: string) => {
    if (isSpeaking) {
      stopAudio();
      setIsSpeaking(false);
    } else {
      playTextToSpeech(
        text,
        currentLang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    stopAudio();
    setIsSpeaking(false);
    setIsListening(false);
    setMessages([]);
    setDetails({ product: '', quantity: '', price: '', shippingOrigin: '' });
  };

  const samplePrompts = [
    { label: 'Brass Decor (Moradabad)', text: 'I manufacture handmade brass home decor in Moradabad. We can do 500 pieces MOQ.' },
    { label: 'Handwoven Rugs (Jaipur)', text: 'We weave pure cotton durries and dhurries in Jaipur. FOB Mumbai port.' },
    { label: 'Organic Turmeric (Cochin)', text: 'We produce organic Lakadong turmeric powder with 7% curcumin from Cochin port.' },
    { label: 'Leather Wallets (Chennai)', text: 'We make genuine leather wallets and cardholders in Chennai. Price $5 per piece.' },
    { label: 'FOB vs CIF to New York', text: 'Can you explain the difference between FOB Nhava Sheva and CIF New York in simple words?' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Voice Orb & Step-by-Step Tracker */}
      <div className="lg:col-span-5 space-y-4">
        {/* Voice Interaction Orb Card */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Faithful Servant Voice
            </span>
          </div>

          <h2 className="text-sm font-semibold text-slate-300 mb-1">
            Voice Conversation with Thoth
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Speak naturally in {currentLang.nativeName} ({currentLang.name})
          </p>

          {/* Interactive Voice Orb */}
          <VoiceOrb
            isListening={isListening}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            onToggleListen={handleToggleListening}
            onStopSpeech={handleStopSpeech}
            langLabel={currentLang.nativeName}
          />

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Mic: {isSpeechRecognitionSupported() ? 'Supported' : 'Type mode'}
            </span>
            <span className="text-slate-600">•</span>
            <span>Always 100% Free</span>
          </div>
        </div>

        {/* 4-Step US Pitch Tracker Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              US Pitch Progress (One Step at a Time)
            </h3>
            <span className="text-[11px] text-slate-400">
              {Object.values(details).filter(Boolean).length}/4 Captured
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Step 1: Product */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                details.product
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  details.product ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  What You Sell (Product)
                </div>
                <div className="text-[11px] truncate">
                  {details.product || 'Tell Thoth what item you manufacture or export'}
                </div>
              </div>
              {details.product && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>

            {/* Step 2: Quantity */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                details.quantity
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  details.quantity ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Quantity / MOQ Capacity
                </div>
                <div className="text-[11px] truncate">
                  {details.quantity || 'e.g. 500 pcs MOQ, 1x20ft container/month'}
                </div>
              </div>
              {details.quantity && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>

            {/* Step 3: Price */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                details.price
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  details.price ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Target Price (₹ or $)
                </div>
                <div className="text-[11px] truncate">
                  {details.price || 'Unit price in INR or FOB USD'}
                </div>
              </div>
              {details.price && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>

            {/* Step 4: Shipping Port */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                details.shippingOrigin
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  details.shippingOrigin
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                4
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-indigo-400" />
                  Where You Ship From
                </div>
                <div className="text-[11px] truncate">
                  {details.shippingOrigin || 'e.g. Nhava Sheva (Mumbai), Mundra, Chennai'}
                </div>
              </div>
              {details.shippingOrigin && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
          </div>

          {/* Action to Jump to Pitch Studio */}
          <button
            onClick={() =>
              onOpenPitchStudioWithData({
                product: details.product || 'Handmade Brass Decor',
                quantity: details.quantity || '500 pieces MOQ',
                price: details.price || '$4.50 / piece FOB',
                shippingOrigin: details.shippingOrigin || 'Nhava Sheva (JNPT Mumbai)',
              })
            }
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:from-amber-400 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Generate US Buyer Pitch & Spec Sheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 mb-2.5">
            Quick exporter examples (click to ask):
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:border-slate-500 transition-colors text-left cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Live Chat Stream */}
      <div className="lg:col-span-7 flex flex-col h-[650px] bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Dialogue Stream ({currentLang.name})
            </h3>
          </div>
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Customs Broker Notice */}
        <div className="bg-amber-950/30 border-b border-amber-900/40 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Safety rule:</strong> Check with a licensed customs broker for final import/tariff decisions. Thoth never asks for passwords or bank info.
          </span>
        </div>

        {/* Messages Stream */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-3.5"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-500 mb-1 px-1">
                  {isUser ? 'You (Exporter)' : 'Thoth (Faithful Servant)'}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Message actions (TTS & Copy) */}
                  <div
                    className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isUser
                        ? 'border-emerald-500/40 text-emerald-100'
                        : 'border-slate-700/70 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayMessageAudio(msg.content)}
                        className="p-1 rounded hover:bg-slate-700/50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Listen to this message"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Listen</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-slate-700/50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-slate-500 mb-1 px-1">Thoth</div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-amber-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Thoth is crafting a short, friendly response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleListening}
              title={isListening ? 'Stop recording' : 'Speak message'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type in ${currentLang.name} or English... (e.g. We make cotton rugs, 500 pcs)`}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium transition-all shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>Faithful Servant by elghaly • No card or payment ever</span>
            <span>One step at a time</span>
          </div>
        </div>
      </div>
    </div>
  );
};
