/**
 * Strings for the on-device Faithful Servant. English, Hindi, Chinese and
 * Arabic are complete ([VERIFY] Hindi, Chinese and Arabic: native review pending); other
 * UI languages fall back to English. Kept apart from the main tables so the
 * existing locale-parity tests stay as they are. {size}, {done}, {total} and
 * {pct} are filled in at run time.
 */
import type { LanguageCode } from '../types';

const EN = {
  tab: 'Faithful Servant on this phone',
  title: 'Faithful Servant on this phone',
  intro: 'Translate and explain trade messages in Hindi, Arabic, Chinese and English. It all runs on this phone; nothing you type leaves it.',
  needDownload: 'First use needs a one-time download of {size}. Wi-Fi is recommended. After that it works with no internet.',
  downloadBtn: 'Download the Faithful Servant ({size})',
  downloading: 'Downloading and checking each file: {done} of {total}',
  stop: 'Stop',
  failHash: 'A file did not match its check, so it was not kept. Please try again later.',
  failNet: 'The download stopped. Please try again, ideally on Wi-Fi.',
  notYet: 'The on-device Faithful Servant is being prepared. For now, use your own key above.',
  noGpu: 'This phone cannot run the on-device Faithful Servant. You can use your own key above instead.',
  start: 'Start the Faithful Servant',
  loading: 'Starting on this phone: {pct}%',
  input: 'Paste or type the message',
  from: 'From',
  into: 'Into',
  detect: 'Detect',
  translate: 'Translate',
  explain: 'Explain',
  working: 'Working on this phone…',
  readAloud: 'Read aloud',
  noVoice: 'This phone has no offline voice for this language. You can add one in the phone’s text-to-speech settings.',
  checkTerms: 'Check numbers, prices and terms with the other side before you agree.',
  remove: 'Remove from this phone ({size})',
  removed: 'Removed from this phone.',
  failStart: 'The Faithful Servant could not start on this phone. You can use your own key above instead.',
  licences: 'Licences',
  close: 'Close',
};

export type DeviceStringKey = keyof typeof EN;

const HI: Record<DeviceStringKey, string> = {
  tab: 'इस फ़ोन पर वफ़ादार सेवक',
  title: 'इस फ़ोन पर वफ़ादार सेवक',
  intro: 'हिन्दी, अरबी, चीनी और अंग्रेज़ी में व्यापार संदेशों का अनुवाद करें और उन्हें समझें। सब कुछ इसी फ़ोन पर चलता है; आप जो लिखते हैं वह फ़ोन से बाहर नहीं जाता।',
  needDownload: 'पहली बार {size} का एक बार डाउनलोड चाहिए। वाई-फ़ाई बेहतर है। उसके बाद यह बिना इंटरनेट के चलता है।',
  downloadBtn: 'वफ़ादार सेवक डाउनलोड करें ({size})',
  downloading: 'हर फ़ाइल डाउनलोड और जाँची जा रही है: {total} में से {done}',
  stop: 'रोकें',
  failHash: 'एक फ़ाइल अपनी जाँच से मेल नहीं खाई, इसलिए रखी नहीं गई। कृपया बाद में फिर कोशिश करें।',
  failNet: 'डाउनलोड रुक गया। कृपया फिर कोशिश करें, हो सके तो वाई-फ़ाई पर।',
  notYet: 'फ़ोन पर चलने वाला वफ़ादार सेवक तैयार हो रहा है। अभी के लिए ऊपर अपनी कुंजी का उपयोग करें।',
  noGpu: 'यह फ़ोन फ़ोन पर चलने वाला वफ़ादार सेवक नहीं चला सकता। आप ऊपर अपनी कुंजी का उपयोग कर सकते हैं।',
  start: 'वफ़ादार सेवक शुरू करें',
  loading: 'इस फ़ोन पर शुरू हो रहा है: {pct}%',
  input: 'संदेश चिपकाएँ या लिखें',
  from: 'किस भाषा से',
  into: 'किस भाषा में',
  detect: 'पहचानें',
  translate: 'अनुवाद करें',
  explain: 'समझाएँ',
  working: 'इस फ़ोन पर काम हो रहा है…',
  readAloud: 'पढ़कर सुनाएँ',
  noVoice: 'इस फ़ोन में इस भाषा की ऑफ़लाइन आवाज़ नहीं है। आप फ़ोन की टेक्स्ट-टू-स्पीच सेटिंग में इसे जोड़ सकते हैं।',
  checkTerms: 'सहमत होने से पहले संख्याएँ, कीमतें और शर्तें दूसरे पक्ष से जाँच लें।',
  remove: 'इस फ़ोन से हटाएँ ({size})',
  removed: 'इस फ़ोन से हटा दिया गया।',
  failStart: 'वफ़ादार सेवक इस फ़ोन पर शुरू नहीं हो सका। आप ऊपर अपनी कुंजी का उपयोग कर सकते हैं।',
  licences: 'लाइसेंस',
  close: 'बंद करें',
};

const ZH: Record<DeviceStringKey, string> = {
  tab: '本机上的 Faithful Servant',
  title: '本机上的 Faithful Servant',
  intro: '用印地语、阿拉伯语、中文和英语翻译并解释贸易消息。全部在本机运行；你输入的内容不会离开手机。',
  needDownload: '首次使用需要一次性下载 {size}。建议使用 Wi-Fi。之后无需网络即可使用。',
  downloadBtn: '下载 Faithful Servant（{size}）',
  downloading: '正在下载并核对每个文件：{done} / {total}',
  stop: '停止',
  failHash: '有一个文件没有通过核对，因此没有保留。请稍后再试。',
  failNet: '下载已中断。请重试，最好使用 Wi-Fi。',
  notYet: '本机版 Faithful Servant 正在准备中。目前请使用上方你自己的密钥。',
  noGpu: '这部手机无法运行本机版 Faithful Servant。你可以改用上方你自己的密钥。',
  start: '启动 Faithful Servant',
  loading: '正在本机启动：{pct}%',
  input: '粘贴或输入消息',
  from: '原文',
  into: '译成',
  detect: '自动识别',
  translate: '翻译',
  explain: '解释',
  working: '正在本机处理…',
  readAloud: '朗读',
  noVoice: '这部手机没有该语言的离线语音。你可以在手机的文字转语音设置中添加。',
  checkTerms: '同意之前，请与对方核对数字、价格和条款。',
  remove: '从本机删除（{size}）',
  removed: '已从本机删除。',
  failStart: 'Faithful Servant 无法在这部手机上启动。你可以改用上方你自己的密钥。',
  licences: '许可证',
  close: '关闭',
};

// [VERIFY] Arabic: native review pending.
const AR: Record<DeviceStringKey, string> = {
  tab: 'الخادم الأمين على هذا الهاتف',
  title: 'الخادم الأمين على هذا الهاتف',
  intro: 'ترجمة رسائل التجارة وشرحها بالهندية والعربية والصينية والإنجليزية. يعمل كل شيء على هذا الهاتف، ولا يغادره شيء مما تكتبه.',
  needDownload: 'أول استخدام يحتاج إلى تنزيل لمرة واحدة بحجم {size}. يُفضَّل استخدام Wi-Fi. بعد ذلك يعمل دون إنترنت.',
  downloadBtn: 'نزّل الخادم الأمين ({size})',
  downloading: 'جارٍ التنزيل وفحص كل ملف: {done} من {total}',
  stop: 'إيقاف',
  failHash: 'لم يطابق أحد الملفات فحصه، لذلك لم يُحفظ. حاول مرة أخرى لاحقًا.',
  failNet: 'توقف التنزيل. حاول مرة أخرى، ويُفضَّل عبر Wi-Fi.',
  notYet: 'الخادم الأمين على الجهاز قيد التجهيز. استخدم الآن مفتاحك الخاص في الأعلى.',
  noGpu: 'لا يستطيع هذا الهاتف تشغيل الخادم الأمين على الجهاز. يمكنك استخدام مفتاحك الخاص في الأعلى بدلًا من ذلك.',
  start: 'شغّل الخادم الأمين',
  loading: 'جارٍ التشغيل على هذا الهاتف: {pct}٪',
  input: 'الصق الرسالة أو اكتبها',
  from: 'من',
  into: 'إلى',
  detect: 'اكتشاف تلقائي',
  translate: 'ترجم',
  explain: 'اشرح',
  working: 'جارٍ العمل على هذا الهاتف…',
  readAloud: 'اقرأ بصوت عالٍ',
  noVoice: 'لا يوجد في هذا الهاتف صوت دون إنترنت لهذه اللغة. يمكنك إضافة صوت من إعدادات تحويل النص إلى كلام في الهاتف.',
  checkTerms: 'راجع الأرقام والأسعار والشروط مع الطرف الآخر قبل أن توافق.',
  remove: 'احذفه من هذا الهاتف ({size})',
  removed: 'حُذف من هذا الهاتف.',
  failStart: 'تعذّر تشغيل الخادم الأمين على هذا الهاتف. يمكنك استخدام مفتاحك الخاص في الأعلى بدلًا من ذلك.',
  licences: 'التراخيص',
  close: 'إغلاق',
};

export const DEVICE_STRINGS: Partial<Record<LanguageCode, Record<DeviceStringKey, string>>> = { en: EN, hi: HI, zh: ZH, ar: AR };

export function dt(lang: LanguageCode, key: DeviceStringKey, vars: Record<string, string> = {}): string {
  const s = (DEVICE_STRINGS[lang] ?? EN)[key] ?? EN[key];
  return s.replace(/\{([a-z]+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}
