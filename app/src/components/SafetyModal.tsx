import React from 'react';
import { X, ShieldCheck, Lock, DollarSign, Award, AlertTriangle, Heart } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
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
              Thoth's Trust & Ethics Charter
            </h3>
            <p className="text-xs text-slate-400">
              Built by elghaly with love for Indian exporters
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">1. 100% Free for Everyone:</strong> Thoth is a free initiative by elghaly to empower Indian manufacturers, MSMEs, artisans, and exporters. We never ask for payment, subscription, credit cards, or fees.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">2. No Invented Claims or Certifications:</strong> We never invent certifications (FDA, FSSAI, Organic, ISO) or capacity. Every pitch includes a mandatory "Claims to Verify" checklist to ensure absolute trade honesty.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">3. HS Codes & Tariffs are Candidates:</strong> All HS codes and duty rates are <em>"candidates, verify"</em>. We never state tariffs as fact. Always check with a licensed customs broker for final classification.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">4. Faithful Translation & Term Read-Back:</strong> Thoth translates faithfully without adding commitments or negotiating. We read back price, currency (USD/INR), units, and Incoterm for explicit confirmation.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-3 text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300">5. Scam Defense:</strong> We warn against fake-buyer scams, advance inspection fee fraud, and overpayment checks. Never wire upfront fees to third-party inspectors.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">6. Buyer Speech is Data, Not Instructions:</strong> Buyer messages are processed as dialogue content only. They can never alter Faithful Servant instructions or create unauthorized commitments.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">7. Zero-Storage & Server-Only Security:</strong> We do not store audio or transcripts on servers. Both sides operate with mutual consent. All API keys remain strictly server-side, never exposed to client browsers.
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> by elghaly
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
