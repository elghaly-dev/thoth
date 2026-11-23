/** Strings for the RFQ screen. English, Arabic, Hindi and Chinese; other UI languages fall back to English. [VERIFY: native review] */
import type { LanguageCode } from '../types';

const EN = {
  tab: 'Request a quote',
  title: 'Request a quote (RFQ)',
  intro: 'Fill in what you want to buy. Elghaly turns it into the same request in English, Arabic, Hindi and Chinese. Nothing is added to your words.',
  note: 'The request is a text you copy and send yourself. Nothing is sent from here.',
  draft: 'Write the request',
  quotesTitle: 'Your request',
  empty: 'Add the product first.',
  copy: 'Copy',
  copied: 'Copied',
  verify: 'Read each request against your facts before you send it.',
  f_product: 'Product', f_quantity: 'Quantity', f_unit: 'Unit (pieces, kg…)', f_port: 'Destination port',
  f_incoterm: 'Delivery term', f_currency: 'Currency', f_price: 'Target price (optional)',
  f_leadTimeDays: 'Needed within (days)', f_payment: 'Payment terms', f_validityDays: 'Please answer within (days)',
  lang_en: 'English', lang_ar: 'Arabic', lang_hi: 'Hindi', lang_zh: 'Chinese',
};
type Strings = typeof EN;

const AR: Strings = {
  tab: 'اطلب عرض سعر',
  title: 'اطلب عرض سعر',
  intro: 'اكتب ما تريد شراءه. يحوّله الغالي إلى الطلب نفسه بالإنجليزية والعربية والهندية والصينية، دون زيادة على كلامك.',
  note: 'الطلب نص تنسخه وترسله بنفسك. لا يُرسل شيء من هنا.',
  draft: 'اكتب الطلب',
  quotesTitle: 'طلبك',
  empty: 'أضف المنتج أولًا.',
  copy: 'نسخ',
  copied: 'تم النسخ',
  verify: 'اقرأ كل طلب مع معلوماتك قبل إرساله.',
  f_product: 'المنتج', f_quantity: 'الكمية', f_unit: 'الوحدة (قطعة، كجم…)', f_port: 'ميناء الوصول',
  f_incoterm: 'شرط التسليم', f_currency: 'العملة', f_price: 'السعر المستهدف (اختياري)',
  f_leadTimeDays: 'مطلوب خلال (أيام)', f_payment: 'شروط الدفع', f_validityDays: 'نرجو الرد خلال (أيام)',
  lang_en: 'الإنجليزية', lang_ar: 'العربية', lang_hi: 'الهندية', lang_zh: 'الصينية',
};

const HI: Strings = {
  tab: 'कोटेशन माँगें',
  title: 'कोटेशन माँगें (RFQ)',
  intro: 'जो खरीदना है वह भरें। एल्घाली वही अनुरोध अंग्रेज़ी, अरबी, हिंदी और चीनी में बनाता है। आपके शब्दों में कुछ जोड़ा नहीं जाता।',
  note: 'अनुरोध एक पाठ है जिसे आप ख़ुद कॉपी करके भेजते हैं। यहाँ से कुछ नहीं भेजा जाता।',
  draft: 'अनुरोध लिखें',
  quotesTitle: 'आपका अनुरोध',
  empty: 'पहले उत्पाद भरें।',
  copy: 'कॉपी करें',
  copied: 'कॉपी हो गया',
  verify: 'भेजने से पहले हर अनुरोध को अपनी जानकारी से मिलाएं।',
  f_product: 'उत्पाद', f_quantity: 'मात्रा', f_unit: 'इकाई (पीस, किलो…)', f_port: 'गंतव्य बंदरगाह',
  f_incoterm: 'डिलीवरी शर्त', f_currency: 'मुद्रा', f_price: 'लक्षित कीमत (वैकल्पिक)',
  f_leadTimeDays: 'कितने दिन में चाहिए', f_payment: 'भुगतान की शर्तें', f_validityDays: 'कितने दिन में उत्तर दें',
  lang_en: 'अंग्रेज़ी', lang_ar: 'अरबी', lang_hi: 'हिंदी', lang_zh: 'चीनी',
};

const ZH: Strings = {
  tab: '发起询价',
  title: '发起询价（RFQ）',
  intro: '填写您想采购的内容。एल्घाली 会把它写成英语、阿拉伯语、印地语和中文的同一份询价，不会添加任何内容。',
  note: '询价是一段文字，由您自己复制并发送。这里不会发送任何内容。',
  draft: '生成询价',
  quotesTitle: '您的询价',
  empty: '请先填写产品。',
  copy: '复制',
  copied: '已复制',
  verify: '发送前请逐份核对您的信息。',
  f_product: '产品', f_quantity: '数量', f_unit: '单位（件、公斤…）', f_port: '目的港',
  f_incoterm: '交货条款', f_currency: '货币', f_price: '目标价格（可选）',
  f_leadTimeDays: '需求时间（天）', f_payment: '付款条件', f_validityDays: '请在几天内回复',
  lang_en: '英语', lang_ar: '阿拉伯语', lang_hi: '印地语', lang_zh: '中文',
};

const TABLES: Partial<Record<LanguageCode, Strings>> = { en: EN, ar: AR, hi: HI, zh: ZH };
export type RfqKey = keyof Strings;
export const RFQ_TABLES = { en: EN, ar: AR, hi: HI, zh: ZH };
export function rs(lang: LanguageCode, key: RfqKey): string {
  return (TABLES[lang] || EN)[key];
}
