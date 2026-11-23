/**
 * Strings for Deal in a Minute. English, Hindi, Arabic and Chinese are complete
 * ([VERIFY] Hindi, Arabic and Chinese: native review pending); other UI languages fall back to
 * English. Kept apart from the main tables, like the on-device strings.
 */
import type { LanguageCode } from '../types';

const EN = {
  tab: 'Deal in a Minute',
  title: 'Deal in a Minute',
  intro: 'Say your product facts once. الغالي drafts the same quote in Arabic, Hindi and Chinese, using what you said, nothing added.',
  speak: 'Speak the facts',
  listening: 'Listening… say product, quantity, price, port, delivery time and payment.',
  noMic: 'Voice is not available in this browser. Type the facts instead.',
  transcriptLabel: 'What you said (you can edit it)',
  transcriptPh: 'Example: Brass lamps, 500 pieces, 12 USD per piece, FOB Mumbai, ready in 30 days, advance payment first, offer valid 15 days',
  extract: 'Pull out the facts',
  extracting: 'Reading your words…',
  needKey: 'To pull out the facts automatically, add your Gemini key above. You can also fill the facts below by hand.',
  dropped: 'Not used, because it was not in what you said: {fields}. Check and type it yourself if needed.',
  factsTitle: 'Check the facts',
  factsNote: 'These facts, and nothing else, go into the quotes. Product, port and payment stay in your own words.',
  draft: 'Draft the quotes',
  quotesTitle: 'Quotes',
  empty: 'Add at least one fact first.',
  copy: 'Copy',
  copied: 'Copied',
  failed: 'Could not read the facts right now. Fill them in by hand, or try again.',
  verify: 'Check every quote against your facts before you send it.',
  f_product: 'Product', f_quantity: 'Quantity', f_unit: 'Unit (pieces, kg…)', f_moq: 'Minimum order', f_price: 'Price',
  f_currency: 'Currency', f_priceUnit: 'Price per (piece, kg…)', f_incoterm: 'Delivery term', f_port: 'Port',
  f_leadTimeDays: 'Ready in (days)', f_payment: 'Payment terms', f_validityDays: 'Offer valid (days)',
  lang_ar: 'Arabic', lang_hi: 'Hindi', lang_zh: 'Chinese',
};
type Strings = typeof EN;

const HI: Strings = {
  tab: 'एक मिनट में सौदा',
  title: 'एक मिनट में सौदा',
  intro: 'अपने उत्पाद की जानकारी एक बार बोलें। الغالي वही कोटेशन अरबी, हिंदी और चीनी में बनाता है, सिर्फ़ आपकी बताई बातों से।',
  speak: 'जानकारी बोलें',
  listening: 'सुन रहा है… उत्पाद, मात्रा, कीमत, बंदरगाह, तैयारी का समय और भुगतान बताएं।',
  noMic: 'इस ब्राउज़र में आवाज़ उपलब्ध नहीं है। जानकारी टाइप करें।',
  transcriptLabel: 'आपने क्या कहा (आप इसे बदल सकते हैं)',
  transcriptPh: 'उदाहरण: पीतल के लैंप, 500 पीस, 12 USD प्रति पीस, FOB मुंबई, 30 दिन में तैयार, पहले अग्रिम भुगतान, ऑफ़र 15 दिन मान्य',
  extract: 'जानकारी निकालें',
  extracting: 'आपके शब्द पढ़ रहा है…',
  needKey: 'जानकारी अपने-आप निकालने के लिए ऊपर अपनी Gemini कुंजी डालें। आप नीचे जानकारी ख़ुद भी भर सकते हैं।',
  dropped: 'इस्तेमाल नहीं किया, क्योंकि यह आपकी कही बातों में नहीं था: {fields}। ज़रूरत हो तो जाँचकर ख़ुद लिखें।',
  factsTitle: 'जानकारी जाँचें',
  factsNote: 'कोटेशन में सिर्फ़ यही जानकारी जाती है। उत्पाद, बंदरगाह और भुगतान आपके अपने शब्दों में रहते हैं।',
  draft: 'कोटेशन बनाएं',
  quotesTitle: 'कोटेशन',
  empty: 'पहले कम से कम एक जानकारी भरें।',
  copy: 'कॉपी करें',
  copied: 'कॉपी हो गया',
  failed: 'अभी जानकारी नहीं पढ़ सका। ख़ुद भरें या फिर से कोशिश करें।',
  verify: 'भेजने से पहले हर कोटेशन को अपनी जानकारी से मिलाएं।',
  f_product: 'उत्पाद', f_quantity: 'मात्रा', f_unit: 'इकाई (पीस, किलो…)', f_moq: 'न्यूनतम ऑर्डर', f_price: 'कीमत',
  f_currency: 'मुद्रा', f_priceUnit: 'कीमत प्रति (पीस, किलो…)', f_incoterm: 'डिलीवरी शर्त', f_port: 'बंदरगाह',
  f_leadTimeDays: 'तैयार होने में (दिन)', f_payment: 'भुगतान की शर्तें', f_validityDays: 'ऑफ़र मान्य (दिन)',
  lang_ar: 'अरबी', lang_hi: 'हिंदी', lang_zh: 'चीनी',
};

const AR: Strings = {
  tab: 'صفقة في دقيقة',
  title: 'صفقة في دقيقة',
  intro: 'قل معلومات منتجك مرة واحدة. يكتب الغالي عرض السعر نفسه بالعربية والهندية والصينية، وبما قلته دون زيادة.',
  speak: 'قل المعلومات',
  listening: 'أستمع… قل المنتج والكمية والسعر والميناء ومدة التجهيز والدفع.',
  noMic: 'الصوت غير متاح في هذا المتصفح. اكتب المعلومات بدلًا من ذلك.',
  transcriptLabel: 'ما قلته (يمكنك تعديله)',
  transcriptPh: 'مثال: مصابيح نحاس، 500 قطعة، 12 USD للقطعة، FOB مومباي، جاهزة خلال 30 يومًا، دفعة مقدمة أولًا، العرض صالح 15 يومًا',
  extract: 'استخرج المعلومات',
  extracting: 'أقرأ كلماتك…',
  needKey: 'لاستخراج المعلومات تلقائيًا أضف مفتاح Gemini الخاص بك في الأعلى. ويمكنك أيضًا ملء المعلومات بنفسك أدناه.',
  dropped: 'لم يُستخدم لأنه لم يكن فيما قلته: {fields}. راجعه واكتبه بنفسك إن لزم.',
  factsTitle: 'راجع المعلومات',
  factsNote: 'هذه المعلومات وحدها تدخل في العروض. المنتج والميناء وشروط الدفع تبقى بكلماتك أنت.',
  draft: 'اكتب العروض',
  quotesTitle: 'العروض',
  empty: 'أضف معلومة واحدة على الأقل أولًا.',
  copy: 'نسخ',
  copied: 'تم النسخ',
  failed: 'تعذرت قراءة المعلومات الآن. املأها بنفسك أو حاول مرة أخرى.',
  verify: 'راجع كل عرض مقابل معلوماتك قبل إرساله.',
  f_product: 'المنتج', f_quantity: 'الكمية', f_unit: 'الوحدة (قطعة، كجم…)', f_moq: 'الحد الأدنى للطلب', f_price: 'السعر',
  f_currency: 'العملة', f_priceUnit: 'السعر لكل (قطعة، كجم…)', f_incoterm: 'شرط التسليم', f_port: 'الميناء',
  f_leadTimeDays: 'جاهز خلال (أيام)', f_payment: 'شروط الدفع', f_validityDays: 'صلاحية العرض (أيام)',
  lang_ar: 'العربية', lang_hi: 'الهندية', lang_zh: 'الصينية',
};

const ZH: Strings = {
  tab: '一分钟成交',
  title: '一分钟成交',
  intro: '把产品信息说一遍。الغالي 只根据您说的内容，同时写出阿拉伯语、印地语和中文的同一份报价。',
  speak: '说出信息',
  listening: '正在听…请说产品、数量、价格、港口、备货期和付款方式。',
  noMic: '此浏览器不支持语音。请输入信息。',
  transcriptLabel: '您说的内容（可以修改）',
  transcriptPh: '例如：黄铜灯，500 件，每件 12 USD，FOB 孟买，30 天备货，先付预付款，报价 15 天有效',
  extract: '提取信息',
  extracting: '正在读取您的话…',
  needKey: '要自动提取信息，请在上方添加您的 Gemini 密钥。您也可以在下方手动填写。',
  dropped: '未使用，因为您没有说到：{fields}。如有需要，请核对后自行填写。',
  factsTitle: '核对信息',
  factsNote: '只有这些信息会写进报价。产品、港口和付款条件保持您的原话。',
  draft: '生成报价',
  quotesTitle: '报价',
  empty: '请先填写至少一项信息。',
  copy: '复制',
  copied: '已复制',
  failed: '暂时无法读取信息。请手动填写或重试。',
  verify: '发送前，请对照您的信息核对每份报价。',
  f_product: '产品', f_quantity: '数量', f_unit: '单位（件、公斤…）', f_moq: '最小起订量', f_price: '价格',
  f_currency: '币种', f_priceUnit: '计价单位（每件、每公斤…）', f_incoterm: '交货条款', f_port: '港口',
  f_leadTimeDays: '备货期（天）', f_payment: '付款条件', f_validityDays: '报价有效期（天）',
  lang_ar: '阿拉伯语', lang_hi: '印地语', lang_zh: '中文',
};

const TABLES: Partial<Record<LanguageCode, Strings>> = { en: EN, hi: HI, ar: AR, zh: ZH };
export type DealKey = keyof Strings;
export const DEAL_TABLES = { en: EN, hi: HI, ar: AR, zh: ZH };
export function ds(lang: LanguageCode, key: DealKey): string {
  return (TABLES[lang] || EN)[key];
}
