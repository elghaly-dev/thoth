import React, { useState } from 'react';
import { SupportedLanguage, PitchResult } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  Download,
  Mail,
  MessageSquare,
  ShieldAlert,
  Loader2,
  Package,
  Layers,
  DollarSign,
  Ship,
  ExternalLink,
  CheckSquare,
  Square,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';
import { playTextToSpeech, stopAudio } from '../utils/audio';

interface PitchStudioTabProps {
  currentLang: SupportedLanguage;
  initialData?: {
    product: string;
    quantity: string;
    price: string;
    shippingOrigin: string;
  };
}

export const PitchStudioTab: React.FC<PitchStudioTabProps> = ({
  currentLang,
  initialData,
}) => {
  const [product, setProduct] = useState(initialData?.product || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [shippingOrigin, setShippingOrigin] = useState(
    initialData?.shippingOrigin || 'Nhava Sheva (JNPT Mumbai)'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitchResult, setPitchResult] = useState<PitchResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [verifiedClaims, setVerifiedClaims] = useState<Record<number, boolean>>({});

  const presets = [
    {
      label: 'Brass Decor (Moradabad)',
      product: 'Handmade Solid Brass Decorative Bowls & Planters',
      quantity: '300 pcs MOQ (Capacity: 4,000 pcs/mo to verify)',
      price: '$6.50 / pc FOB Nhava Sheva',
      origin: 'Nhava Sheva (Mumbai) via Moradabad ICD',
    },
    {
      label: 'Spices / Turmeric (Cochin)',
      product: 'High-Curcumin Turmeric Powder (Verify lab testing & grade specs)',
      quantity: '1,000 kg MOQ (Standard 25kg export bags)',
      price: '$3.80 / kg FOB Cochin Port',
      origin: 'Cochin Port (Kerala)',
    },
    {
      label: 'Cotton Durries (Jaipur)',
      product: 'Handwoven 100% Cotton Dhurrie Area Rugs (3x5 ft & 5x8 ft)',
      quantity: '150 rugs MOQ',
      price: '$18.00 / rug FOB Mundra Port',
      origin: 'Mundra Port (Gujarat)',
    },
    {
      label: 'Leather Goods (Chennai)',
      product: 'Leather Wallets & Passport Holders (Verify leather grade specs)',
      quantity: '250 pcs MOQ',
      price: '$5.20 / pc FOB Chennai Port',
      origin: 'Chennai Port (Tamil Nadu)',
    },
  ];

  const handleGeneratePitch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!product.trim() || isGenerating) return;

    setIsGenerating(true);
    stopAudio();
    setIsPlayingAudio(false);

    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          quantity: quantity || 'Flexible MOQ upon discussion',
          price: price || 'Competitive FOB pricing upon spec review',
          shippingOrigin: shippingOrigin || 'India Port',
          exporterLanguage: currentLang.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate pitch');
      const data = await res.json();
      setPitchResult(data);
    } catch (err) {
      console.error('Error generating pitch:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReadAloudUS = (text: string) => {
    if (isPlayingAudio) {
      stopAudio();
      setIsPlayingAudio(false);
    } else {
      const usLang: SupportedLanguage = {
        code: 'en',
        name: 'English',
        nativeName: 'English (US)',
        speechCode: 'en-US',
        flag: '🇺🇸',
      };
      playTextToSpeech(
        text,
        usLang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleDownloadTxt = () => {
    if (!pitchResult) return;
    const content = `================================================
THOTH - US BUYER PITCH SPEC SHEET (Free by elghaly)
Product: ${pitchResult.specCard?.productName || product}
MOQ: ${pitchResult.specCard?.moq || quantity}
Price: ${pitchResult.specCard?.indicativePricing || price}
Origin Port: ${pitchResult.specCard?.originPort || shippingOrigin}
================================================

[US BUYER COLD EMAIL]
Subject: ${pitchResult.usEmailSubject}

${pitchResult.usBuyerEmail}

------------------------------------------------
[SHORT DIRECT MESSAGE (LinkedIn / WhatsApp)]
${pitchResult.usBuyerShort}

------------------------------------------------
[CLAIMS TO VERIFY BEFORE CONTACTING BUYER]
${(pitchResult.claimsToVerify || []).map((c, i) => `${i + 1}. [ ] ${c}`).join('\n')}

------------------------------------------------
[SCAM WARNING: FAKE-BUYER & ADVANCE-PAYMENT FRAUD]
- Never pay upfront "inspection fees", "registration fees", or "tender processing charges" to unverified third parties. Legitimate US buyers pay inspection agencies directly.
- Verify buyer company registration on US state Secretary of State databases.
- Insist on verified Irrevocable Letters of Credit (L/C) or secure escrow through commercial banks.

------------------------------------------------
[EXPORTER GUIDANCE IN ${currentLang.name.toUpperCase()}]
${pitchResult.exporterSummary}

------------------------------------------------
[CUSTOMS COMPLIANCE NOTE]
${pitchResult.customsNote || 'Check with a licensed customs broker for final decisions.'}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thoth_us_pitch_${product.slice(0, 15).replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Honest US Pitch Studio
            </span>
            <span className="text-xs text-slate-400">100% Free by elghaly</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Transform Indian Craft & Manufacturing into Compelling US Pitches
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            US buyers want brevity, exact quantities, honest specs, and clear FOB terms. Thoth writes clean, hype-free pitches tailored to American sourcing standards.
          </p>
        </div>

        {/* Customs Broker Badge */}
        <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2 max-w-xs shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <strong>Customs Rule:</strong> Always check with a licensed customs broker for final import/tariff decisions.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Product Details
              </h3>
              <span className="text-[11px] text-slate-400">Step-by-step</span>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Fill Examples
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProduct(preset.product);
                      setQuantity(preset.quantity);
                      setPrice(preset.price);
                      setShippingOrigin(preset.origin);
                    }}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-[11px] text-left text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGeneratePitch} className="space-y-3.5">
              {/* Product */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  What do you sell / manufacture? *
                </label>
                <input
                  type="text"
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. Handmade Solid Brass Planters & Bowls"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Quantity / MOQ (Minimum Order)
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 300 pieces MOQ, capacity 5,000/mo"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Price (₹ INR or $ USD per unit)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. $6.50 / piece FOB or ₹550 / pc"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Shipping Origin */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-indigo-400" />
                  Where do you ship from? (Port / City)
                </label>
                <input
                  type="text"
                  value={shippingOrigin}
                  onChange={(e) => setShippingOrigin(e.target.value)}
                  placeholder="e.g. Nhava Sheva (JNPT Mumbai), Mundra, Chennai"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!product.trim() || isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thoth is writing honest US pitch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Create US Buyer Pitch (Free)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Generated Pitch Display Column */}
        <div className="lg:col-span-7 space-y-4">
          {!pitchResult && !isGenerating && (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-amber-400">
                <Mail className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                Your US Pitch Package will appear here
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Enter your product name, quantity, price, and shipping port, or select one of the quick presets on the left.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-white">
                Crafting honest, professional US pitch...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Formatting specs, FOB pricing, and concise US English wording.
              </p>
            </div>
          )}

          {pitchResult && !isGenerating && (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  US Pitch Package Ready
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReadAloudUS(pitchResult.usBuyerEmail)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    title="Listen to how this sounds to an American buyer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isPlayingAudio ? 'Stop Voice' : 'Hear US Voice'}</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    title="Download pitch as .txt"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>

              {/* 1. Cold Email Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      US Buyer Cold Email (3-4 Sentences, High Open Rate)
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy('email', `Subject: ${pitchResult.usEmailSubject}\n\n${pitchResult.usBuyerEmail}`)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Subject: </span>
                  <span className="text-emerald-300 font-medium">
                    {pitchResult.usEmailSubject}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {pitchResult.usBuyerEmail}
                </div>
              </div>

              {/* 2. Short Message Card (LinkedIn / WhatsApp) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Direct Message Pitch (LinkedIn / WhatsApp / Direct Message)
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy('short', pitchResult.usBuyerShort)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'short' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {pitchResult.usBuyerShort}
                </div>
              </div>

              {/* 3. Spec Card & Summary */}
              {pitchResult.specCard && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Product</div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">
                      {pitchResult.specCard.productName}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">MOQ</div>
                    <div className="text-xs font-bold text-amber-300 truncate mt-0.5">
                      {pitchResult.specCard.moq}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Price Indicative</div>
                    <div className="text-xs font-bold text-emerald-400 truncate mt-0.5">
                      {pitchResult.specCard.indicativePricing}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Port of Origin</div>
                    <div className="text-xs font-bold text-indigo-300 truncate mt-0.5">
                      {pitchResult.specCard.originPort}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Claims to Verify Checklist (Fix 1) */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Claims to Verify Before Contacting US Buyers
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Never invent FDA, FSSAI, or Organic claims
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  US buyers and customs authorities conduct rigorous compliance audits. Only state what you hold physical documentation for. Verify each item below:
                </p>

                <div className="space-y-2">
                  {(pitchResult.claimsToVerify && pitchResult.claimsToVerify.length > 0
                    ? pitchResult.claimsToVerify
                    : [
                        'Verify product material composition and laboratory test reports',
                        'Verify FDA, FSSAI, or organic certifications (never claim without valid certificate)',
                        'Confirm production capacity and delivery schedule without delay',
                        'Ensure wood pallets have ISPM-15 heat-treated stamp'
                      ]
                  ).map((claim, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setVerifiedClaims((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                        verifiedClaims[idx]
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {verifiedClaims[idx] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className="flex-1">
                        <strong>Check {idx + 1}:</strong> {claim}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Scam Advisory: Fake-Buyer & Advance-Payment Warning (Fix 4) */}
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-5 shadow-lg space-y-2.5">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">
                    Scam Warning: Fake US Buyers & Advance-Payment Fraud
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/30">
                    <strong className="text-rose-300 block mb-1">• Fake Inspection & Registration Fee:</strong>
                    Scammers posing as US buyers ask you to wire an upfront "vendor registration fee" or "lab inspection charge" to an unverified agency. Legitimate US buyers pay their own inspection agencies (SGS, Intertek) directly.
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/30">
                    <strong className="text-rose-300 block mb-1">• Check & Overpayment Wire Fraud:</strong>
                    Never accept an overpayment check with a request to wire back the surplus. Insist on verified Irrevocable Letters of Credit (L/C) or secure escrow through commercial banks.
                  </div>
                </div>
              </div>

              {/* 6. Exporter Advice in Native Tongue */}
              {pitchResult.exporterSummary && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Exporter Advice in {currentLang.nativeName} ({currentLang.name}):
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pitchResult.exporterSummary}
                  </p>
                </div>
              )}

              {/* Mandatory Customs Rule Reminder */}
              <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Notice:</strong> Never promise guaranteed sales or profit. When shipping to the USA, <em>check with a licensed customs broker for final decisions</em> regarding HTS tariff codes, import duties, and entry clearance.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
