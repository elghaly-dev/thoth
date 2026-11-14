import type { LanguageCode } from './types';

/**
 * UI strings for Thoth. English is the complete source of truth;
 * Chinese (Mandarin) is the second language. Every other supported
 * language falls back to English (greeting + speech code still work
 * per-language, as before). Never invent a translation: if a key is
 * missing in ZH, `tx` falls back to the English string.
 */
const EN = {
  // ---- App shell ----
  'app.tabAssistant': 'Talk with Thoth (वॉइस)',
  'app.tabPitch': 'Buyer Pitch Studio',
  'app.tabTranslate': 'Trade Translator',
  'app.tabGuide': 'Import Basics',
  'app.speakingIn': 'Speaking in {native} ({name})',
  'app.footerTagline': 'Free Faithful Servant by elghaly for exporters',
  'app.footerFree': 'Free for all exporters, small & large',
  'app.footerBroker': 'Always check with a licensed customs broker for final decisions.',
  'app.footerPrivacy': 'Privacy & Trust Policy',
  'app.footerNoPasswords': 'No passwords or bank details ever requested',

  // ---- Header ----
  'header.freeForever': '100% Free Forever',
  'header.byElghaly': 'By elghaly for exporters',
  'header.reachBuyers': 'Reach & talk to buyers',
  'header.safetyPolicy': 'Safety & Trust Policy',
  'header.madeWith': 'Made with',
  'header.forMakers': 'for makers',
  'header.voiceAssistant': 'Faithful Servant',
  'header.bridge': 'Exporter ⇄ Buyer Trade Bridge',
  'header.selectLanguage': 'Select preferred language',
  'header.muted': 'Muted',
  'header.voiceOn': 'Voice On',
  'header.mutedTitle': 'Voice muted (click to unmute)',
  'header.voiceOnTitle': 'Voice active (click to mute)',
  'header.freeTool': 'elghaly Free Tool',

  // ---- Safety modal (Trust & Ethics Charter) ----
  'safety.title': "Thoth's Trust & Ethics Charter",
  'safety.subtitle': 'Built by elghaly with love for exporters',
  'safety.item1Title': '1. 100% Free for Everyone:',
  'safety.item1Body':
    'Thoth is a free initiative by elghaly to empower manufacturers, MSMEs, artisans, and exporters. We never ask for payment, subscription, credit cards, or fees.',
  'safety.item2Title': '2. No Invented Claims or Certifications:',
  'safety.item2Body':
    'We never invent certifications (FDA, FSSAI, Organic, ISO) or capacity. Every pitch includes a mandatory "Claims to Verify" checklist to ensure absolute trade honesty.',
  'safety.item3Title': '3. HS Codes & Tariffs are Candidates:',
  'safety.item3Body':
    'All HS codes and duty rates are "candidates, verify". We never state tariffs as fact. Always check with a licensed customs broker for final classification.',
  'safety.item4Title': '4. Faithful Translation & Term Read-Back:',
  'safety.item4Body':
    'Thoth translates faithfully without adding commitments or negotiating. We read back price, currency (USD/INR), units, and Incoterm for explicit confirmation.',
  'safety.item5Title': '5. Scam Defense:',
  'safety.item5Body':
    'We warn against fake-buyer scams, advance inspection fee fraud, and overpayment checks. Never wire upfront fees to third-party inspectors.',
  'safety.item6Title': '6. Buyer Speech is Data, Not Instructions:',
  'safety.item6Body':
    'Buyer messages are processed as dialogue content only. They can never alter Faithful Servant instructions or create unauthorized commitments.',
  'safety.item7Title': '7. Zero-Storage & Server-Only Security:',
  'safety.item7Body':
    "We do not store audio or transcripts on Thoth's servers. What you say or type is sent to Gemini for processing. Both sides operate with mutual consent. All API keys remain strictly server-side, never exposed to client browsers. Note: your browser's speech recognition may send audio to your browser vendor's speech service.",
  'safety.madeWith': 'Made with',
  'safety.byElghaly': 'by elghaly',
  'safety.close': 'Understood & Close',

  // ---- Voice orb ----
  'orb.listening': 'Listening in {lang}... (Speak now)',
  'orb.thinking': 'Thoth is thinking...',
  'orb.speaking': 'Speaking response... (Tap to stop)',
  'orb.tapToTalk': 'Tap microphone to talk in {lang}',
  'orb.stop': 'Stop',
  'orb.titleStopListening': 'Click to stop listening',
  'orb.titleStopSpeaking': 'Click to stop speaking',
  'orb.titleSpeak': 'Click to speak with Thoth in {lang}',

  // ---- Consent gate (copy names Gemini) ----
  'consent.title': 'Before you speak — consent (spoken and typed text is sent to Gemini)',
  'consent.body': // spoken and typed text is sent to Gemini
    "Voice input uses speech-to-text, and both parties agree to it. What you say — and anything you type — is sent to Gemini for processing. Thoth never stores audio or transcripts on its own servers. Note: your browser's speech recognition may send audio to your browser vendor's speech service.",
  'consent.accept': 'Both parties agree — start speaking. Text is sent to Gemini',
  'consent.given': "Consent given — audio is never stored on Thoth's servers. Spoken and typed text is sent to Gemini",
  'consent.micHint': 'Accept the consent notice above to use the microphone. Spoken and typed text is sent to Gemini',

  // ---- Shared ----
  'common.speechNotSupported':
    'Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.',
} as const;

const EN_VOICE = {
  // ---- Voice tab ----
  'voice.liveEngine': 'Voice Engine',
  'voice.title': 'Voice Conversation with Thoth',
  'voice.speakNaturally': 'Speak naturally in {native} ({name})',
  'voice.mic': 'Mic:',
  'voice.supported': 'Supported',
  'voice.typeMode': 'Type mode',
  'voice.free': 'Always 100% Free',
  'voice.trackerTitle': 'Buyer Pitch Progress (One Step at a Time)',
  'voice.captured': '{n}/4 Captured',
  'voice.step1Title': 'What You Sell (Product)',
  'voice.step1Hint': 'Tell Thoth what item you manufacture or export',
  'voice.step2Title': 'Quantity / MOQ Capacity',
  'voice.step2Hint': 'e.g. 500 pcs MOQ, 1x20ft container/month',
  'voice.step3Title': 'Target Price (₹ or $)',
  'voice.step3Hint': 'Unit price in INR or FOB USD',
  'voice.step4Title': 'Where You Ship From',
  'voice.step4Hint': 'e.g. your origin port',
  'voice.generatePitch': 'Generate Buyer Pitch & Spec Sheet',
  'voice.quickExamples': 'Quick exporter examples (click to ask):',
  'voice.dialogueStream': 'Dialogue Stream ({lang})',
  'voice.newChat': 'New Chat',
  'voice.newChatTitle': 'Start new conversation',
  'voice.safetyRule':
    'Safety rule: Check with a licensed customs broker for final import/tariff decisions. Thoth never asks for passwords or bank info.',
  'voice.youExporter': 'You (Exporter)',
  'voice.thothFree': 'Thoth (Free Faithful Servant)',
  'voice.thinking': 'Thoth is crafting a short, friendly response...',
  'voice.listen': 'Listen',
  'voice.copyTitle': 'Copy text',
  'voice.stopRecording': 'Stop recording',
  'voice.speakMessage': 'Speak message',
  'voice.typePlaceholder':
    'Type in {lang} or English... (e.g. We make cotton rugs, 500 pcs)',
  'voice.freeFooter': 'Free Faithful Servant by elghaly • No card or payment ever',
  'voice.oneStep': 'One step at a time',
  'voice.connectionError':
    'Sorry, there was a momentary connection issue. Please check with a licensed customs broker for final decisions. Could you please repeat that?',
  // Sample prompts (labels + example utterances; turmeric/leather/rugs
  // worded as examples with no certification or percentage claims)
  'voice.sampleBrassLabel': 'Brass Decor',
  'voice.sampleBrassText':
    'I manufacture handmade brass home decor. We can do 500 pieces MOQ.',
  'voice.sampleRugsLabel': 'Handwoven Rugs',
  'voice.sampleRugsText': 'We weave cotton durries and dhurries. FOB origin port.',
  'voice.sampleTurmericLabel': 'Turmeric',
  'voice.sampleTurmericText':
    'Example: We produce Lakadong turmeric powder — verify grade and certificates before claiming.',
  'voice.sampleLeatherLabel': 'Leather Wallets',
  'voice.sampleLeatherText':
    'We make leather wallets and cardholders. Price $5 per piece.',
  'voice.sampleFobLabel': 'FOB vs CIF',
  'voice.sampleFobText':
    'Can you explain the difference between FOB and CIF in simple words?',
} as const;

const EN_PITCH = {
  // ---- Pitch studio tab ----
  'pitch.badge': 'Honest Buyer Pitch Studio',
  'pitch.freeBy': '100% Free by elghaly',
  'pitch.title': 'Transform craft & manufacturing into compelling buyer pitches',
  'pitch.subtitle':
    'Buyers want brevity, exact quantities, honest specs, and clear FOB terms. Thoth writes clean, hype-free pitches tailored to sourcing standards.',
  'pitch.customsRule': 'Customs Rule:',
  'pitch.customsRuleBody':
    'Always check with a licensed customs broker for final import/tariff decisions.',
  'pitch.productDetails': 'Product Details',
  'pitch.stepByStep': 'Step-by-step',
  'pitch.quickFill': 'Quick Fill Examples',
  'pitch.presetBrass': 'Brass Decor · Example',
  'pitch.presetTurmeric': 'Spices / Turmeric · Example',
  'pitch.presetCotton': 'Cotton Durries · Example',
  'pitch.presetLeather': 'Leather Goods · Example',
  'pitch.whatSell': 'What do you sell / manufacture? *',
  'pitch.whatSellPh': 'e.g. Handmade Solid Brass Planters & Bowls',
  'pitch.quantity': 'Quantity / MOQ (Minimum Order)',
  'pitch.quantityPh': 'e.g. 300 pieces MOQ, capacity 5,000/mo',
  'pitch.price': 'Price (₹ INR or $ USD per unit)',
  'pitch.pricePh': 'e.g. $6.50 / piece FOB or ₹550 / pc',
  'pitch.shipFrom': 'Where do you ship from? (Port / City)',
  'pitch.shipFromPh': 'e.g. your origin port',
  'pitch.writing': 'Thoth is writing honest US pitch...',
  'pitch.create': 'Create Buyer Pitch (Free)',
  'pitch.emptyTitle': 'Your Buyer Pitch Package will appear here',
  'pitch.emptyBody':
    'Enter your product name, quantity, price, and shipping port, or select one of the quick presets on the left.',
  'pitch.generatingTitle': 'Crafting honest, professional US pitch...',
  'pitch.generatingBody': 'Formatting specs, FOB pricing, and concise US English wording.',
  'pitch.ready': 'Buyer Pitch Package Ready',
  'pitch.hearVoice': 'Hear US Voice',
  'pitch.stopVoice': 'Stop Voice',
  'pitch.hearTitle': 'Listen to how this sounds to a buyer',
  'pitch.downloadTxt': 'Download TXT',
  'pitch.downloadTitle': 'Download pitch as .txt',
  'pitch.emailTitle': 'Buyer Cold Email (3-4 Sentences, High Open Rate)',
  'pitch.copyEmail': 'Copy Email',
  'pitch.copied': 'Copied!',
  'pitch.subject': 'Subject: ',
  'pitch.dmTitle': 'Direct Message Pitch (LinkedIn / WhatsApp / Direct Message)',
  'pitch.copy': 'Copy',
  'pitch.specProduct': 'Product',
  'pitch.specMoq': 'MOQ',
  'pitch.specPrice': 'Price Indicative',
  'pitch.specPort': 'Port of Origin',
  'pitch.claimsTitle': 'Claims to Verify Before Contacting Buyers',
  'pitch.claimsBadge': 'Never invent FDA, FSSAI, or Organic claims',
  'pitch.claimsBody':
    'Buyers and customs authorities conduct rigorous compliance checks. Only state what you hold physical documentation for. Verify each item below:',
  'pitch.check': 'Check {n}:',
  'pitch.claimDefault1': 'Verify product material composition and laboratory test reports',
  'pitch.claimDefault2':
    'Verify FDA, FSSAI, or organic certifications (never claim without valid certificate)',
  'pitch.claimDefault3': 'Confirm production capacity and delivery schedule without delay',
  'pitch.claimDefault4': 'Ensure wood pallets have ISPM-15 heat-treated stamp',
  'pitch.scamTitle': 'Scam Warning: Fake Buyers & Advance-Payment Fraud',
  'pitch.scamFeeTitle': '• Fake Inspection & Registration Fee:',
  'pitch.scamFeeBody':
    'Scammers posing as buyers ask you to wire an upfront "vendor registration fee" or "lab inspection charge" to an unverified agency. Legitimate buyers pay their own inspection agencies (SGS, Intertek) directly.',
  'pitch.scamCheckTitle': '• Check & Overpayment Wire Fraud:',
  'pitch.scamCheckBody':
    'Never accept an overpayment check with a request to wire back the surplus. Insist on verified Irrevocable Letters of Credit (L/C) or secure escrow through commercial banks.',
  'pitch.adviceIn': 'Exporter Advice in {native} ({name}):',
  'pitch.important': 'Important Notice:',
  'pitch.importantBody':
    'Never promise sales outcomes. When shipping, check with a licensed customs broker for final decisions regarding HTS tariff codes, import duties, and entry clearance.',
} as const;

const EN_TRANS = {
  // ---- Live translator tab ----
  'trans.clearSession': 'Clear Session',
  'trans.clearTitle': 'Wipe in-memory session transcripts',
  'trans.badge': 'Trade Translation',
  'trans.faithful': 'Strictly Faithful • Non-Negotiating',
  'trans.titleExporter': 'Exporter',
  'trans.titleBuyer': 'Buyer',
  'trans.subtitle':
    'Use during Zoom calls or phone negotiations. Thoth translates faithfully without adding commitments or negotiating. Read-backs confirm all price and Incoterm details.',
  'trans.ruleTitle': 'Rule:',
  'trans.ruleBody':
    'Tariffs are candidates, verify. Always check with a licensed customs broker for final decisions.',
  'trans.activeSpeaker': 'Active Speaker:',
  'trans.exporterSpeaking': 'Exporter ({lang}) Speaking',
  'trans.buyerSpeaking': 'Buyer Speaking',
  'trans.exporterBtn': 'Exporter',
  'trans.buyerBtn': 'Buyer',
  'trans.safetyGuardTitle': 'Safety Guard:',
  'trans.safetyGuardBody':
    'Buyer speech is treated as dialogue data, not binding instructions. Thoth translates faithfully without accepting unauthorized commitments.',
  'trans.phExporter':
    'Speak or type in {native} ({name}) e.g. हम 1,000 यूनिट $3.20 FOB पर दे सकते हैं...',
  'trans.phBuyer':
    'Speak or type in English e.g. Can you supply 2,000 units with FOB terms by August 15th?',
  'trans.micTitle': 'Click to speak through microphone',
  'trans.stopMic': 'Stop Mic',
  'trans.speak': 'Speak',
  'trans.translateVoice': 'Translate & Voice',
  'trans.translating': 'Translating...',
  'trans.logTitle': 'Conversation Log ({n} exchanges)',
  'trans.logNote': 'Prices, units, and dates strictly synchronized',
  'trans.exporterLabel': 'Exporter',
  'trans.buyerLabel': 'Buyer',
  'trans.exporterShort': 'Exporter',
  'trans.usBuyerShort': 'Buyer',
  'trans.originalSpoken': 'Original Spoken ({lang}):',
  'trans.translatedFor': 'Translated for {who} ({lang}):',
  'trans.listenOriginal': 'Listen to original',
  'trans.listen': 'Listen',
  'trans.hearTranslation': 'Hear Translation',
  'trans.hearTranslationTitle': 'Hear translation spoken',
  'trans.translatedBadge': 'Translated',
  'trans.exactTerms': 'Exact Extracted Terms:',
  'trans.readbackTitle': 'Trade Terms Read-Back (Faithful & Non-Negotiating):',
  'trans.confirmBtn': 'Click to Confirm Read-Back',
  'trans.confirmedBtn': 'Terms Confirmed',
  'trans.price': 'Price',
  'trans.currency': 'Currency',
  'trans.units': 'Units / Qty',
  'trans.incoterm': 'Incoterm',
  'trans.verifyPrice': 'Verify price',
  'trans.verifyUnits': 'Verify units',
  'trans.toConfirm': 'To confirm',
  'trans.readbackFallback':
    'Read-back verification: Price, currency, quantity units, and Incoterm must be verified before agreement.',
  'trans.confirmTtsPrefix': 'Confirmation read-back: ',
  'trans.confirmTtsFallback': 'verify all terms before agreeing',
  'trans.hearReadback': 'Hear Read-Back',
  'trans.hearReadbackTitle': 'Hear verification read aloud',
} as const;

const EN_GUIDE = {
  // ---- Import guide tab ----
  'guide.badge': 'Import Knowledge Hub',
  'guide.badgeSub': 'Simple Words for First-Time & Seasoned Exporters',
  'guide.title': 'Demystifying Customs, Shipping Terms & Compliance',
  'guide.subtitle':
    'Buyers expect clarity on shipping terms (FOB vs CIF), accurate labeling, and standard documentation. Learn the basics before quoting!',
  'guide.brokerTitle': 'Customs Broker Rule:',
  'guide.brokerBody':
    'Customs regulations are enforced by the destination customs authority. Always check with a licensed customs broker for final tariff classifications and entry decisions.',
  'guide.askTitle': 'Ask Thoth Any Import Question ({lang})',
  'guide.plainWords': 'Plain words, zero jargon',
  'guide.askPh':
    'Ask in {native} or English (e.g. How do I label cotton shirts for customs?)',
  'guide.askBtn': 'Ask Thoth',
  'guide.explaining': 'Explaining...',
  'guide.answerTitle': "Thoth's Plain-Language Explanation:",
  'guide.listen': 'Listen',
  'guide.stopVoice': 'Stop Voice',
  'guide.sampleQ1': 'What is the difference between FOB and CIF for buyers?',
  'guide.sampleQ2': 'What labeling is mandatory on exported products?',
  'guide.sampleQ3': 'How do I find the correct HS code for my product?',
  'guide.sampleQ4': 'Do buyers pay the customs duty or does the exporter?',
  'guide.sampleQ5': 'What happens if my wooden pallets are not ISPM-15 certified?',
  'guide.card1Tag': 'Candidate Code • Verify',
  'guide.card1Title': '1. HS / HTS Codes & Duty Rates',
  'guide.card1Body':
    'HS codes (6 digits international) and HTS codes (10 digits) and associated duty percentages are candidates for verification only — never state a tariff as fact.',
  'guide.card1Note1': '• Tariff rates fluctuate and depend on exact material specs and origin.',
  'guide.card1Note2':
    '• Only the destination customs authority and licensed customs brokers determine legal classification.',
  'guide.card2Title': '2. Shipping Terms: FOB vs CIF',
  'guide.card2Body':
    'FOB (Free on Board): You pay inland transport and load onto the ship at your origin port. The buyer pays ocean freight and customs.',
  'guide.card2Note1': '• FOB is best for most exporters.',
  'guide.card2Note2': '• CIF means you pay ocean freight and insurance to the destination port.',
  'guide.card3Title': '3. Mandatory Origin Label',
  'guide.card3Body':
    'Import rules generally require articles to be marked with their country of origin in English in a conspicuous, indelible manner — confirm the exact marking rule with a licensed customs broker.',
  'guide.card3Note1': '• Mark individual product AND master shipping carton.',
  'guide.card3Note2': '• Must read clearly: the origin country, in English.',
  'guide.card4Title': '4. Pallets & ISPM-15 Fumigation',
  'guide.card4Body':
    'All solid wood packaging (pallets, crates, dunnage) must be heat-treated and carry the official ISPM-15 wheat stamp.',
  'guide.card4Note1': '• Non-compliant wood is turned back at the destination port at exporter expense.',
  'guide.card4Note2': '• Alternatively, use plastic or compressed paper pallets.',
  'guide.card5Title': '5. Essential Export Documents',
  'guide.card5Body': 'Every shipment requires four clean, accurate papers:',
  'guide.card5Doc1': '1. Commercial Invoice (itemized value in USD)',
  'guide.card5Doc2': '2. Packing List (gross/net weight, carton counts)',
  'guide.card5Doc3': '3. Bill of Lading (B/L from shipping line)',
  'guide.card5Doc4': '4. Certificate of Origin (issued at origin)',
  'guide.card6Title': "6. The Customs Broker's Role",
  'guide.card6Body':
    'A licensed customs broker is licensed to file import entries (generally form 7501) and handle bonds — confirm the current form and requirements with your broker.',
  'guide.card6Golden': 'Golden rule:',
  'guide.card6GoldenBody':
    'Thoth gives you education and pitch tools; check with a licensed customs broker for final decisions before container booking.',
  'guide.card7Title': '7. Security Guide: Guard Against Fake-Buyer & Advance-Payment Scams',
  'guide.card7Sub1Title': '1. Upfront "Inspection Fee" Fraud:',
  'guide.card7Sub1Body':
    'A scammer sends a massive purchase order but insists you must pay an upfront inspection, vendor enrollment, or lab fee to an unverified third party. Real buyers pay certified agencies (SGS, Intertek) directly.',
  'guide.card7Sub2Title': '2. Overpayment & Check Scams:',
  'guide.card7Sub2Body':
    'Scammer sends a counterfeit cashier check exceeding invoice value, then asks you to wire back the "overpayment". Never ship or wire funds until an official bank wire has cleared with full recourse settlement.',
  'guide.card7Sub3Title': '3. Verify Buyer Business Legitimacy:',
  'guide.card7Sub3Body':
    'Look up the buyer on official business registries. Verify that corporate email domains match official business websites, not free webmail.',
} as const;

const EN_ALL = { ...EN, ...EN_VOICE, ...EN_PITCH, ...EN_TRANS, ...EN_GUIDE };
export type StringKey = keyof typeof EN_ALL;

const ZH: Record<StringKey, string> = {
  // ---- App shell ----
  'app.tabAssistant': '与 Thoth 对话（语音）',
  'app.tabPitch': '海外买家推介工作室',
  'app.tabTranslate': '贸易翻译',
  'app.tabGuide': '海外市场进口基础知识',
  'app.speakingIn': '当前语言：{native}（{name}）',
  'app.footerTagline': 'elghaly 为出口商打造的Faithful Servant（免费）',
  'app.footerFree': '面向所有出口商，大小企业均免费',
  'app.footerBroker': '最终决定请务必咨询持牌报关行。',
  'app.footerPrivacy': '隐私与信任政策',
  'app.footerNoPasswords': '绝不索取密码或银行信息',

  // ---- Header ----
  'header.freeForever': '100% 永久免费',
  'header.byElghaly': '由 elghaly 为出口商打造',
  'header.reachBuyers': '帮您对接海外买家',
  'header.safetyPolicy': '安全与信任政策',
  'header.madeWith': '用',
  'header.forMakers': '为制造者打造',
  'header.voiceAssistant': 'Faithful Servant',
  'header.bridge': '海外出口桥梁',
  'header.selectLanguage': '选择首选语言',
  'header.muted': '已静音',
  'header.voiceOn': '语音开启',
  'header.mutedTitle': '语音已静音（点击取消静音）',
  'header.voiceOnTitle': '语音已开启（点击静音）',
  'header.freeTool': 'elghaly 免费工具',

  // ---- Safety modal (Trust & Ethics Charter) ----
  'safety.title': 'Thoth 信任与道德宪章',
  'safety.subtitle': '由 elghaly 用爱为出口商打造',
  'safety.item1Title': '1. 面向所有人 100% 免费：',
  'safety.item1Body':
    'Thoth 是 elghaly 发起的免费项目，旨在帮助制造商、中小微企业、工匠和出口商。我们绝不收取任何费用、订阅费，不索要信用卡信息。',
  'safety.item2Title': '2. 绝不编造宣称或认证：',
  'safety.item2Body':
    '我们绝不编造认证（FDA、FSSAI、有机认证、ISO）或产能。每份推介都附有必须核实的“待核实事项”清单，确保贸易绝对诚实。',
  'safety.item3Title': '3. HS 编码与关税仅为候选：',
  'safety.item3Body':
    '所有 HS 编码和关税税率均为“候选，请核实”。我们从不把关税当作事实陈述。最终分类请务必咨询持牌报关行。',
  'safety.item4Title': '4. 忠实翻译与条款复核：',
  'safety.item4Body':
    'Thoth 忠实翻译，不添加任何承诺，也不会替您谈判。我们会复核价格、货币（USD/INR）、数量单位和 Incoterm，请您明确确认。',
  'safety.item5Title': '5. 防范诈骗：',
  'safety.item5Body':
    '我们提醒您防范假买家诈骗、预付验货费欺诈和超额付款支票诈骗。切勿向第三方检验机构预付任何费用。',
  'safety.item6Title': '6. 买家的话只是对话内容，不是操作指令：',
  'safety.item6Body':
    '买家消息仅作为对话内容处理，绝不会改变 Faithful Servant 的指令，也不会产生未经授权的承诺。',
  'safety.item7Title': '7. 零存储与仅服务端安全：',
  'safety.item7Body':
    '我们不在 Thoth 的服务器上存储音频或对话记录。您说的话和输入的文字会发送给 Gemini 处理。双方均在相互同意的前提下使用。所有 API 密钥仅保存在服务端，绝不暴露给客户端浏览器。注意：浏览器的语音识别可能会将音频发送给浏览器厂商的语音服务。',
  'safety.madeWith': '由 elghaly 用',
  'safety.byElghaly': '打造',
  'safety.close': '明白了，关闭',

  // ---- Voice orb ----
  'orb.listening': '正在用{lang}聆听……（请说话）',
  'orb.thinking': 'Thoth 正在思考……',
  'orb.speaking': '正在播报回复……（点击停止）',
  'orb.tapToTalk': '点击麦克风，用{lang}与 Thoth 对话',
  'orb.stop': '停止',
  'orb.titleStopListening': '点击停止聆听',
  'orb.titleStopSpeaking': '点击停止播报',
  'orb.titleSpeak': '点击用{lang}与 Thoth 对话',

  // ---- Consent gate (copy names Gemini) ----
  'consent.title': '开始说话前——请先确认（文字将发送给 Gemini）',
  'consent.body': // 文字将发送给 Gemini
    '语音输入使用语音转文字功能，需双方同意。您说的话和输入的文字会发送给 Gemini 处理。Thoth 绝不在自己的服务器上存储音频或对话记录。注意：浏览器的语音识别可能会将音频发送给浏览器厂商的语音服务。',
  'consent.accept': '双方均同意——开始说话（文字将发送给 Gemini）',
  'consent.given': '已确认同意——音频绝不会存储在 Thoth 的服务器上。您说的话和输入的文字会发送给 Gemini 处理。',
  'consent.micHint': '请先接受上方的确认提示，再使用麦克风。您说的话和输入的文字会发送给 Gemini 处理。',

  // ---- Shared ----
  'common.speechNotSupported':
    '此浏览器不支持语音识别。请使用 Chrome 或 Edge，或直接输入消息。',

  // ---- Voice tab ----
  'voice.liveEngine': '语音引擎',
  'voice.title': '与 Thoth 语音对话',
  'voice.speakNaturally': '请用{native}（{name}）自然说话',
  'voice.mic': '麦克风：',
  'voice.supported': '支持',
  'voice.typeMode': '打字模式',
  'voice.free': '始终 100% 免费',
  'voice.trackerTitle': '海外买家推介进度（一步一步来）',
  'voice.captured': '已收集 {n}/4',
  'voice.step1Title': '您销售的产品',
  'voice.step1Hint': '告诉 Thoth 您生产或出口什么产品',
  'voice.step2Title': '数量 / 最小起订量',
  'voice.step2Hint': '例如：500 件起订，每月 1 个 20 尺柜',
  'voice.step3Title': '目标价格（₹ 或 $）',
  'voice.step3Hint': '单价（本币或 FOB 美元）',
  'voice.step4Title': '发货地点',
  'voice.step4Hint': '例如：Nhava Sheva（孟买）、Mundra、Chennai',
  'voice.generatePitch': '生成海外买家推介与规格表',
  'voice.quickExamples': '出口商示例（点击提问）：',
  'voice.dialogueStream': '对话记录（{lang}）',
  'voice.newChat': '新对话',
  'voice.newChatTitle': '开始新对话',
  'voice.safetyRule':
    '安全规则：最终进口/关税决定请咨询持牌报关行。Thoth 绝不索取密码或银行信息。',
  'voice.youExporter': '您（出口商）',
  'voice.thothFree': 'Thoth（Faithful Servant（免费））',
  'voice.thinking': 'Thoth 正在准备简短友好的回复……',
  'voice.listen': '收听',
  'voice.copyTitle': '复制文本',
  'voice.stopRecording': '停止录音',
  'voice.speakMessage': '语音输入',
  'voice.typePlaceholder': '用{lang}或英语输入……（例如：我们生产棉地毯，500 件）',
  'voice.freeFooter': 'elghaly Faithful Servant（免费） • 永不索要卡片或付款',
  'voice.oneStep': '一步一步来',
  'voice.connectionError':
    '抱歉，连接出现短暂问题。最终决定请咨询持牌报关行。请再说一遍好吗？',
  'voice.sampleBrassLabel': '黄铜装饰品（Moradabad）',
  'voice.sampleBrassText': '我在 Moradabad 生产手工黄铜家居装饰品，最小起订量 500 件。',
  'voice.sampleRugsLabel': '手工编织地毯（Jaipur）',
  'voice.sampleRugsText': '我们在 Jaipur 编织棉质 durries 地毯，FOB 孟买港。',
  'voice.sampleTurmericLabel': '姜黄（Cochin）',
  'voice.sampleTurmericText':
    '示例：我们生产 Lakadong 姜黄粉——宣称前请先核实等级和证书。',
  'voice.sampleLeatherLabel': '皮夹（Chennai）',
  'voice.sampleLeatherText': '我们在 Chennai 生产皮夹和卡包，每件 5 美元。',
  'voice.sampleFobLabel': 'FOB 与 CIF（至纽约）',
  'voice.sampleFobText': '请用简单的话解释一下 FOB Nhava Sheva 和 CIF 纽约的区别。',

  // ---- Pitch studio tab ----
  'pitch.badge': '诚实的海外买家推介工作室',
  'pitch.freeBy': '由 elghaly 提供，100% 免费',
  'pitch.title': '把手工艺与制造转化为打动海外买家的推介',
  'pitch.subtitle':
    '海外买家看重简洁、准确的数量、诚实的规格和清晰的 FOB 条款。Thoth 按海外采购标准撰写简洁、无夸大的推介。',
  'pitch.customsRule': '海关规则：',
  'pitch.customsRuleBody': '最终进口/关税决定请务必咨询持牌报关行。',
  'pitch.productDetails': '产品详情',
  'pitch.stepByStep': '逐步填写',
  'pitch.quickFill': '快速填写示例',
  'pitch.presetBrass': '黄铜装饰品（Moradabad）· 示例',
  'pitch.presetTurmeric': '香料 / 姜黄（Cochin）· 示例',
  'pitch.presetCotton': '棉质 Durries 地毯（Jaipur）· 示例',
  'pitch.presetLeather': '皮具（Chennai）· 示例',
  'pitch.whatSell': '您销售 / 生产什么产品？*',
  'pitch.whatSellPh': '例如：手工黄铜花盆与碗',
  'pitch.quantity': '数量 / 最小起订量（MOQ）',
  'pitch.quantityPh': '例如：300 件起订，产能 5,000 件/月',
  'pitch.price': '价格（每单位本币或美元）',
  'pitch.pricePh': '例如：$6.50 / 件 FOB 或 ₹550 / 件',
  'pitch.shipFrom': '从哪里发货？（港口 / 城市）',
  'pitch.shipFromPh': '例如：Nhava Sheva（JNPT 孟买）、Mundra、Chennai',
  'pitch.writing': 'Thoth 正在撰写诚实的海外买家推介……',
  'pitch.create': '生成海外买家推介（免费）',
  'pitch.emptyTitle': '您的海外买家推介方案将显示在这里',
  'pitch.emptyBody': '请输入产品名称、数量、价格和发货港口，或从左侧选择一个快速示例。',
  'pitch.generatingTitle': '正在撰写诚实、专业的海外买家推介……',
  'pitch.generatingBody': '正在整理规格、FOB 价格和简洁的英语措辞。',
  'pitch.ready': '海外买家推介方案已就绪',
  'pitch.hearVoice': '收听发音',
  'pitch.stopVoice': '停止播放',
  'pitch.hearTitle': '听听这在海外买家听来是什么感觉',
  'pitch.downloadTxt': '下载 TXT',
  'pitch.downloadTitle': '将推介下载为 .txt 文件',
  'pitch.emailTitle': '海外买家开发信（3–4 句，高打开率）',
  'pitch.copyEmail': '复制邮件',
  'pitch.copied': '已复制！',
  'pitch.subject': '主题：',
  'pitch.dmTitle': '直发消息推介（LinkedIn / WhatsApp / 私信）',
  'pitch.copy': '复制',
  'pitch.specProduct': '产品',
  'pitch.specMoq': '最小起订量',
  'pitch.specPrice': '参考价格',
  'pitch.specPort': '起运港',
  'pitch.claimsTitle': '联系海外买家前需核实的事项',
  'pitch.claimsBadge': '绝不编造 FDA、FSSAI 或有机认证宣称',
  'pitch.claimsBody':
    '海外买家和海关会进行严格的合规检查。请只陈述您持有书面证明的内容。请逐项核实：',
  'pitch.check': '核实 {n}：',
  'pitch.claimDefault1': '核实产品材质成分和实验室检测报告',
  'pitch.claimDefault2': '核实 FDA、FSSAI 或有机认证（无有效证书绝不宣称）',
  'pitch.claimDefault3': '确认产能和交货时间，确保按时交付',
  'pitch.claimDefault4': '确保木托盘带有 ISPM-15 热处理印章',
  'pitch.scamTitle': '诈骗警告：假海外买家与预付款欺诈',
  'pitch.scamFeeTitle': '• 虚假验货费与注册费：',
  'pitch.scamFeeBody':
    '冒充海外买家的骗子会要求您向未经核实的机构预付“供应商注册费”或“实验室验货费”。真正的海外买家会直接向自己的检验机构（SGS、Intertek）付款。',
  'pitch.scamCheckTitle': '• 支票与超额付款汇款诈骗：',
  'pitch.scamCheckBody':
    '切勿接受超额付款支票并按要求汇回多余款项。请坚持使用经核实的不可撤销信用证（L/C）或通过商业银行的安全托管。',
  'pitch.adviceIn': '{native}（{name}）版出口商建议：',
  'pitch.important': '重要提示：',
  'pitch.importantBody':
    '切勿承诺销售结果。向海外市场发货时，关于 HTS 关税编码、进口关税和清关的最终决定，请咨询持牌报关行。',

  // ---- Live translator tab ----
  'trans.clearSession': '清除会话',
  'trans.clearTitle': '清除内存中的会话记录',
  'trans.badge': '贸易翻译',
  'trans.faithful': '严格忠实 • 绝不谈判',
  'trans.titleExporter': '出口商',
  'trans.titleBuyer': '海外买家',
  'trans.subtitle':
    '可在 Zoom 通话或电话谈判中使用。Thoth 忠实翻译，不添加任何承诺，也不会替您谈判。复核功能会确认所有价格和 Incoterm 细节。',
  'trans.ruleTitle': '规则：',
  'trans.ruleBody': '关税仅为候选，请核实。最终决定请务必咨询持牌报关行。',
  'trans.activeSpeaker': '当前发言人：',
  'trans.exporterSpeaking': '出口商（{lang}）正在发言',
  'trans.buyerSpeaking': '海外买家正在发言',
  'trans.exporterBtn': '出口商',
  'trans.buyerBtn': '海外买家',
  'trans.safetyGuardTitle': '安全提示：',
  'trans.safetyGuardBody':
    '买家的话仅作为对话内容处理，不具有约束力。Thoth 忠实翻译，绝不接受未经授权的承诺。',
  'trans.phExporter':
    '请用{native}（{name}）说话或输入，例如：我们可以提供 1,000 件，每件 3.20 美元 FOB……',
  'trans.phBuyer':
    '请用英语说话或输入，例如：Can you supply 2,000 units with FOB terms by August 15th?',
  'trans.micTitle': '点击通过麦克风说话',
  'trans.stopMic': '停止麦克风',
  'trans.speak': '说话',
  'trans.translateVoice': '翻译并播报',
  'trans.translating': '正在翻译……',
  'trans.logTitle': '对话记录（{n} 条）',
  'trans.logNote': '价格、单位和日期严格同步',
  'trans.exporterLabel': '出口商',
  'trans.buyerLabel': '海外买家',
  'trans.exporterShort': '出口商',
  'trans.usBuyerShort': '海外买家',
  'trans.originalSpoken': '原话（{lang}）：',
  'trans.translatedFor': '译文（给{who}，{lang}）：',
  'trans.listenOriginal': '收听原话',
  'trans.listen': '收听',
  'trans.hearTranslation': '收听译文',
  'trans.hearTranslationTitle': '收听译文发音',
  'trans.translatedBadge': '已翻译',
  'trans.exactTerms': '准确提取的条款：',
  'trans.readbackTitle': '贸易条款复核（忠实且不谈判）：',
  'trans.confirmBtn': '点击确认复核内容',
  'trans.confirmedBtn': '条款已确认',
  'trans.price': '价格',
  'trans.currency': '货币',
  'trans.units': '数量 / 单位',
  'trans.incoterm': '贸易术语',
  'trans.verifyPrice': '请核实价格',
  'trans.verifyUnits': '请核实数量',
  'trans.toConfirm': '待确认',
  'trans.readbackFallback':
    '复核确认：达成协议前，请务必核实价格、货币、数量单位和贸易术语。',
  'trans.confirmTtsPrefix': '复核确认：',
  'trans.confirmTtsFallback': '请在达成协议前核实所有条款',
  'trans.hearReadback': '收听复核内容',
  'trans.hearReadbackTitle': '朗读复核内容',

  // ---- Import guide tab ----
  'guide.badge': '海外市场进口知识中心',
  'guide.badgeSub': '用简单的话讲给新手和老手出口商',
  'guide.title': '讲清目标市场海关、运输条款与合规要求',
  'guide.subtitle':
    '海外买家希望运输条款（FOB 与 CIF）、标签和标准文件都清清楚楚。报价前先了解基础知识！',
  'guide.brokerTitle': '报关行规则：',
  'guide.brokerBody':
    '目标市场海关法规由目标市场海关与边境保护局（CBP）执行。最终关税分类和入境决定请务必咨询持牌报关行。',
  'guide.askTitle': '向 Thoth 咨询任何海外市场进口问题（{lang}）',
  'guide.plainWords': '简单明了，零术语',
  'guide.askPh': '用{native}或英语提问（例如：出口到海外市场的棉衬衫该如何贴标签？）',
  'guide.askBtn': '问 Thoth',
  'guide.explaining': '正在解释……',
  'guide.answerTitle': 'Thoth 的通俗解释：',
  'guide.listen': '收听',
  'guide.stopVoice': '停止播放',
  'guide.sampleQ1': '对海外买家来说，FOB 和 CIF 有什么区别？',
  'guide.sampleQ2': '出口到海外市场的产品必须贴哪些标签？',
  'guide.sampleQ3': '如何找到自己产品的正确 HS 编码？',
  'guide.sampleQ4': '关税由海外买家付，还是由出口商付？',
  'guide.sampleQ5': '如果木托盘没有 ISPM-15 认证会怎样？',
  'guide.card1Tag': '候选编码 • 请核实',
  'guide.card1Title': '1. HS / HTS 编码与关税税率',
  'guide.card1Body':
    'HS 编码（国际 6 位）和目标市场 HTS 编码（10 位）及相关关税税率仅为候选，仅供核实——绝不要把关税当作事实陈述。',
  'guide.card1Note1': '• 关税税率会波动，取决于具体材质规格和原产地。',
  'guide.card1Note2': '• 只有目标市场海关（CBP）和持牌报关行才能确定法定分类。',
  'guide.card2Title': '2. 运输条款：FOB 与 CIF',
  'guide.card2Body':
    'FOB（离岸价）：您承担国内内陆运输，并在本国港口装船。海外买家承担海运费和目标市场关税。',
  'guide.card2Note1': '• 对大多数出口商来说，FOB 是最好的选择。',
  'guide.card2Note2': '• CIF 意味着您承担到目标市场港口的海运费和保险费。',
  'guide.card3Title': '3. 必须标注原产地',
  'guide.card3Body':
    '根据目标市场原产地标注法规，进口商品一般须以英文在显著位置、用不易擦除的方式标注原产国——具体标注要求请与持牌报关行确认。',
  'guide.card3Note1': '• 单个产品和外包装箱都要标注。',
  'guide.card3Note2': '• 必须清晰标注原产地。',
  'guide.card4Title': '4. 托盘与 ISPM-15 熏蒸',
  'guide.card4Body':
    '所有实木包装（托盘、板条箱、垫木）必须经过热处理，并加盖官方 ISPM-15 麦穗印章。',
  'guide.card4Note1': '• 不合规的木材将在目标市场港口被退回，费用由出口商承担。',
  'guide.card4Note2': '• 也可以改用塑料托盘或压缩纸托盘。',
  'guide.card5Title': '5. 必备出口文件',
  'guide.card5Body': '每次出货都需要四份准确无误的文件：',
  'guide.card5Doc1': '1. 商业发票（逐项列明美元价值）',
  'guide.card5Doc2': '2. 装箱单（毛重/净重、箱数）',
  'guide.card5Doc3': '3. 提单（船公司出具的 B/L）',
  'guide.card5Doc4': '4. 原产地证书（在本国签发）',
  'guide.card6Title': '6. 报关行的作用',
  'guide.card6Body':
    '目标市场持牌报关行经目标市场海关（CBP）许可，可办理进口报关（一般使用 CBP Form 7501）并处理保证金——请与您的报关行确认当前表格和要求。',
  'guide.card6Golden': '黄金法则：',
  'guide.card6GoldenBody':
    'Thoth 为您提供知识和推介工具；订舱前的最终决定，请咨询持牌报关行。',
  'guide.card7Title': '7. 安全指南：防范假买家与预付款诈骗',
  'guide.card7Sub1Title': '1. 预付“验货费”诈骗：',
  'guide.card7Sub1Body':
    '骗子会发来大额采购订单，却坚持要求您向未经核实的第三方预付验货费、供应商注册费或实验室费用。真正的买家会直接向认证机构（SGS、Intertek）付款。',
  'guide.card7Sub2Title': '2. 超额付款与支票诈骗：',
  'guide.card7Sub2Body':
    '骗子会寄来一张金额超过发票的伪造本票，然后要求您把“多余款项”汇回去。在官方银行汇款到账并可全额追索之前，切勿发货或汇款。',
  'guide.card7Sub3Title': '3. 核实海外企业的真实性：',
  'guide.card7Sub3Body':
    '请在官方企业登记机构查询海外买家。核实企业邮箱域名与官方企业网站一致，而非免费邮箱。',
};

/**
 * Look up a UI string. Only 'zh' has translations; every other language
 * (and any missing key) falls back to English. `{name}` placeholders are
 * replaced from `vars`.
 */
export function tx(
  lang: LanguageCode,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  const dict = lang === 'zh' ? ZH : EN_ALL;
  let s: string = dict[key] ?? EN_ALL[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

export function t(lang: LanguageCode, key: StringKey): string {
  return tx(lang, key);
}
