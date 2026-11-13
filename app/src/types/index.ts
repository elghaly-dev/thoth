export type LanguageCode =
  | 'hi'
  | 'en'
  | 'mr'
  | 'gu'
  | 'ta'
  | 'bn'
  | 'te'
  | 'pa'
  | 'zh';

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechCode: string; // for Web Speech API recognition & synthesis
  voiceName?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-US' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文 (普通话)', speechCode: 'zh-CN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  detectedLang?: string;
  isStreaming?: boolean;
}

export interface SpecCard {
  productName: string;
  moq: string;
  indicativePricing: string;
  originPort: string;
  leadTimeEstimate: string;
}

export interface PitchResult {
  usEmailSubject: string;
  usBuyerEmail: string;
  usBuyerShort: string;
  exporterSummary: string;
  specCard: SpecCard;
  customsNote: string;
  claimsToVerify: string[]; // List of claims, certifications, or capacities to verify before sending
}

export interface ConfirmationReadback {
  price?: string;
  currency?: string; // USD or INR
  units?: string;
  incoterm?: string; // FOB, CIF, etc.
  // Original amount as spoken, verbatim (e.g. "₹5,00,000 (5 lakh)").
  // Never converted: a USD figure appears only if the speaker stated one.
  originalAmount?: string | null;
  originalCurrency?: string | null;
  readbackStatement: string; // Precise confirmation sentence for read-back
}

export interface TranslationRecord {
  id: string;
  speaker: 'exporter' | 'buyer';
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  keyTerms?: string[];
  confirmationReadback?: ConfirmationReadback;
  timestamp: Date;
}
