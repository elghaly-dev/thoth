# Thoth — Faithful Servant for exporters (draft PR #4)

Draft only — not published, not merged, not deployed. Branch `bot/aistudio-export`, head `d831425b` + the fixes below (local, unpushed).

Thoth is a free Faithful Servant by Wyndham Heaven (elghaly) that helps exporters reach and talk to buyers: voice help, honest buyer pitches, live translation, and import basics. Key stays server-side only. No sign-up, no card, no payment, ever.

## Claude FAIL fixes (file 6 — applied locally on top of `d831425b`)

1. **README `.env` vs `.env.local` — FIXED.** README now documents `.env` (README.md:13-14: copy `.env.example` to `.env`; "The server reads `.env` only"); the server reads `.env` via `dotenv.config()` (server.ts:2,7). Verified live: key only in `.env` → read; key only in `.env.local` → 401 "not set".
2. **AI Studio boilerplate + private link removed from README — FIXED.** Banner, "Run and deploy your AI Studio app", and the `ai.studio/apps/...` link are gone. README now opens `# Thoth — Faithful Servant for exporters` (README.md:1): what it is, local run, key server-side only, draft status. Public name Wyndham Heaven, product Faithful Servant.
3. **Fallback replies are now labelled errors — FIXED.** `getFallbackChatReply` deleted from server.ts; any model failure (including an empty response) now returns 502 `{"error":"The model call failed — try again."}` (server.ts:296,310); the client throws the connection error instead of showing a canned line (VoiceAssistantTab.tsx:195); the `fallbackReply` keys are removed from i18n.ts (EN + ZH). This supersedes the earlier round's graceful canned fallback for non-auth failures. Verified live: stub 503 → chat 502, no canned text, not a 200.
4. **Rate-limit + authenticate the proxy — FIXED.** server.ts: per-IP rate limit 60/min on `/api/*` (server.ts:48,68-69; 429 + `Retry-After`, :93-94); same-origin check (cross-origin → 403); `THOTH_PROXY_SECRET` gate (server.ts:60-64,122 — `x-thoth-proxy-secret` header, `Authorization: Bearer`, or the HttpOnly SameSite=Strict cookie the server sets on page loads; gate off with a startup warning when unset). Secret is a name only in .env.example:12,16. No secret or IP in the export.
5. **Faithful Servant naming in every user-facing string touched — FIXED**, except the ZH footer "免费助手" (no approved ZH rendering — see open items). README.md:1, EN footer i18n.ts:17 ("Free Faithful Servant by elghaly for exporters"), i18n.ts:117,125, server.ts:195.
6. **Mic consent defaults to false — FIXED (verified already the case at this head; no change needed).** VoiceAssistantTab.tsx:46, LiveTranslatorTab.tsx:71 (`useState(false)`); mic buttons disabled until the ConsentGate is accepted; no auto-start path.
7. **Model IDs — FIXED (no change needed).** IDs left exactly as-is, nothing invented: `gemini-3.8-flash`, `gemini-3.1-flash-lite` (server.ts:228), `gemini-3.8-flash-lite-tts` (server.ts:514,529); bind address `0.0.0.0` (server.ts:590, wildcard, not a real IP).

## ZH neutral rewrite — country names removed (owner's correction)

Every line below is a neutral rewrite — for owner review. No claims invented; only the country names were removed or replaced with the owner's neutral concepts: 海外买家 = buyers abroad, 海外市场 = overseas markets, 目标市场 = your target market, 本币 = local currency, 本国 = home country, 原产地 = country of origin.

- src/i18n.ts:356 `app.tabPitch`: "美国买家推介工作室" → "海外买家推介工作室"
- src/i18n.ts:358 `app.tabGuide`: "美国进口基础知识" → "海外市场进口基础知识"
- src/i18n.ts:360 `app.footerTagline`: "elghaly 为印度出口商打造的免费语音助手" → "elghaly 为出口商打造的免费语音助手"
- src/i18n.ts:368 `header.byElghaly`: "由 elghaly 为印度出口商打造" → "由 elghaly 为出口商打造"
- src/i18n.ts:369 `header.reachBuyers`: "帮您对接美国买家" → "帮您对接海外买家"
- src/i18n.ts:372 `header.forMakers`: "为印度制造者打造" → "为制造者打造"
- src/i18n.ts:374 `header.bridge`: "印度 🇮🇳 ⇄ 美国 🇺🇸 出口桥梁" → "海外出口桥梁"
- src/i18n.ts:384 `safety.subtitle`: "由 elghaly 用爱为印度出口商打造" → "由 elghaly 用爱为出口商打造"
- src/i18n.ts:387 `safety.item1Body`: "旨在帮助印度制造商、中小微企业、工匠和出口商" → "旨在帮助制造商、中小微企业、工匠和出口商"
- src/i18n.ts:440 `voice.trackerTitle`: "美国推介进度（一步一步来）" → "海外买家推介进度（一步一步来）"
- src/i18n.ts:447 `voice.step3Hint`: "单价（印度卢比或 FOB 美元）" → "单价（本币或 FOB 美元）"
- src/i18n.ts:450 `voice.generatePitch`: "生成美国买家推介与规格表" → "生成海外买家推介与规格表"
- src/i18n.ts:482 `pitch.badge`: "诚实的美国推介工作室" → "诚实的海外买家推介工作室"
- src/i18n.ts:484 `pitch.title`: "把印度手工艺与制造转化为打动美国买家的推介" → "把手工艺与制造转化为打动海外买家的推介"
- src/i18n.ts:486 `pitch.subtitle`: "美国买家看重简洁、准确的数量、诚实的规格和清晰的 FOB 条款。Thoth 按美国采购标准撰写简洁、无夸大的推介。" → "海外买家看重简洁、准确的数量、诚实的规格和清晰的 FOB 条款。Thoth 按海外采购标准撰写简洁、无夸大的推介。"
- src/i18n.ts:500 `pitch.price`: "价格（每单位 ₹ 印度卢比或 $ 美元）" → "价格（每单位本币或美元）"
- src/i18n.ts:504 `pitch.writing`: "Thoth 正在撰写诚实的美国推介……" → "Thoth 正在撰写诚实的海外买家推介……"
- src/i18n.ts:505 `pitch.create`: "生成美国买家推介（免费）" → "生成海外买家推介（免费）"
- src/i18n.ts:506 `pitch.emptyTitle`: "您的美国推介方案将显示在这里" → "您的海外买家推介方案将显示在这里"
- src/i18n.ts:508 `pitch.generatingTitle`: "正在撰写诚实、专业的美国推介……" → "正在撰写诚实、专业的海外买家推介……"
- src/i18n.ts:509 `pitch.generatingBody`: "正在整理规格、FOB 价格和简洁的美式英语措辞。" → "正在整理规格、FOB 价格和简洁的英语措辞。"
- src/i18n.ts:510 `pitch.ready`: "美国推介方案已就绪" → "海外买家推介方案已就绪"
- src/i18n.ts:511 `pitch.hearVoice`: "收听美式发音" → "收听发音"
- src/i18n.ts:513 `pitch.hearTitle`: "听听这在美国买家听来是什么感觉" → "听听这在海外买家听来是什么感觉"
- src/i18n.ts:516 `pitch.emailTitle`: "美国买家开发信（3–4 句，高打开率）" → "海外买家开发信（3–4 句，高打开率）"
- src/i18n.ts:526 `pitch.claimsTitle`: "联系美国买家前需核实的事项" → "联系海外买家前需核实的事项"
- src/i18n.ts:529 `pitch.claimsBody`: "美国买家和海关会进行严格的合规审核。请只陈述您持有书面证明的内容。请逐项核实：" → "海外买家和海关会进行严格的合规审核。请只陈述您持有书面证明的内容。请逐项核实："
- src/i18n.ts:535 `pitch.scamTitle`: "诈骗警告：假美国买家与预付款欺诈" → "诈骗警告：假海外买家与预付款欺诈"
- src/i18n.ts:538 `pitch.scamFeeBody`: "冒充美国买家的骗子会要求您向未经核实的机构预付“供应商注册费”或“实验室验货费”。真正的美国买家会直接向自己的检验机构（SGS、Intertek）付款。" → "冒充海外买家的骗子会要求您向未经核实的机构预付“供应商注册费”或“实验室验货费”。真正的海外买家会直接向自己的检验机构（SGS、Intertek）付款。"
- src/i18n.ts:545 `pitch.importantBody`: "切勿承诺保证销售或利润。向美国发货时，关于 HTS 关税编码、进口关税和清关的最终决定，请咨询持牌报关行。" → "切勿承诺保证销售或利润。向海外市场发货时，关于 HTS 关税编码、进口关税和清关的最终决定，请咨询持牌报关行。"
- src/i18n.ts:553 `trans.titleBuyer`: "美国买家" → "海外买家"
- src/i18n.ts:559 `trans.exporterSpeaking`: "🇮🇳 印度出口商（{lang}）正在发言" → "出口商（{lang}）正在发言"
- src/i18n.ts:560 `trans.buyerSpeaking`: "🇺🇸 美国买家正在发言" → "海外买家正在发言"
- src/i18n.ts:561 `trans.exporterBtn`: "印度出口商" → "出口商"
- src/i18n.ts:562 `trans.buyerBtn`: "美国买家" → "海外买家"
- src/i18n.ts:569 `trans.phBuyer`: "请用美式英语说话或输入，例如：Can you supply 2,000 units with FOB terms by August 15th?" → "请用英语说话或输入，例如：Can you supply 2,000 units with FOB terms by August 15th?"
- src/i18n.ts:577 `trans.exporterLabel`: "🇮🇳 印度出口商" → "出口商"
- src/i18n.ts:578 `trans.buyerLabel`: "🇺🇸 美国买家" → "海外买家"
- src/i18n.ts:580 `trans.usBuyerShort`: "美国买家" → "海外买家"
- src/i18n.ts:607 `guide.badge`: "美国进口知识中心" → "海外市场进口知识中心"
- src/i18n.ts:609 `guide.title`: "讲清美国海关、运输条款与合规要求" → "讲清目标市场海关、运输条款与合规要求"
- src/i18n.ts:611 `guide.subtitle`: "美国买家希望运输条款（FOB 与 CIF）、标签和标准文件都清清楚楚。报价前先了解基础知识！" → "海外买家希望运输条款（FOB 与 CIF）、标签和标准文件都清清楚楚。报价前先了解基础知识！"
- src/i18n.ts:614 `guide.brokerBody`: "美国海关法规由美国海关与边境保护局（CBP）执行。最终关税分类和入境决定请务必咨询持牌报关行。" → "目标市场海关法规由目标市场海关与边境保护局（CBP）执行。最终关税分类和入境决定请务必咨询持牌报关行。"
- src/i18n.ts:615 `guide.askTitle`: "向 Thoth 咨询任何美国进口问题（{lang}）" → "向 Thoth 咨询任何海外市场进口问题（{lang}）"
- src/i18n.ts:617 `guide.askPh`: "用{native}或英语提问（例如：出口到美国的棉衬衫该如何贴标签？）" → "用{native}或英语提问（例如：出口到海外市场的棉衬衫该如何贴标签？）"
- src/i18n.ts:623 `guide.sampleQ1`: "对美国买家来说，FOB 和 CIF 有什么区别？" → "对海外买家来说，FOB 和 CIF 有什么区别？"
- src/i18n.ts:624 `guide.sampleQ2`: "出口到美国的产品必须贴哪些标签？" → "出口到海外市场的产品必须贴哪些标签？"
- src/i18n.ts:626 `guide.sampleQ4`: "关税由美国买家付，还是由印度出口商付？" → "关税由海外买家付，还是由出口商付？"
- src/i18n.ts:631 `guide.card1Body`: "HS 编码（国际 6 位）和美国 HTS 编码（10 位）及相关关税税率仅为候选，仅供核实——绝不要把关税当作事实陈述。" → "HS 编码（国际 6 位）和目标市场 HTS 编码（10 位）及相关关税税率仅为候选，仅供核实——绝不要把关税当作事实陈述。"
- src/i18n.ts:633 `guide.card1Note2`: "• 只有美国海关（CBP）和持牌报关行才能确定法定分类。" → "• 只有目标市场海关（CBP）和持牌报关行才能确定法定分类。"
- src/i18n.ts:636 `guide.card2Body`: "FOB（离岸价）：您承担印度内陆运输，并在印度港口（如 Nhava Sheva）装船。美国买家承担海运费和美国关税。" → "FOB（离岸价）：您承担国内内陆运输，并在本国港口装船。海外买家承担海运费和目标市场关税。"
- src/i18n.ts:637 `guide.card2Note1`: "• 对大多数印度出口商来说，FOB 是最好的选择。" → "• 对大多数出口商来说，FOB 是最好的选择。"
- src/i18n.ts:638 `guide.card2Note2`: "• CIF 意味着您承担到美国港口的海运费和保险费。" → "• CIF 意味着您承担到目标市场港口的海运费和保险费。"
- src/i18n.ts:639 `guide.card3Title`: "3. 必须标注“Made in India”" → "3. 必须标注原产地"
- src/i18n.ts:641 `guide.card3Body`: "根据 19 U.S.C. 1304，进口商品一般须以英文在显著位置、用不易擦除的方式标注原产国——具体标注要求请与持牌报关行确认。" → "根据目标市场原产地标注法规，进口商品一般须以英文在显著位置、用不易擦除的方式标注原产国——具体标注要求请与持牌报关行确认。"
- src/i18n.ts:643 `guide.card3Note2`: "• 必须清晰标注：“Made in India”。" → "• 必须清晰标注原产地。"
- src/i18n.ts:647 `guide.card4Note1`: "• 不合规的木材将在美国港口被退回，费用由出口商承担。" → "• 不合规的木材将在目标市场港口被退回，费用由出口商承担。"
- src/i18n.ts:654 `guide.card5Doc4`: "4. 原产地证书（在印度签发）" → "4. 原产地证书（在本国签发）"
- src/i18n.ts:657 `guide.card6Body`: "美国持牌报关行经美国海关（CBP）许可，可办理进口报关（一般使用 CBP Form 7501）并处理保证金——请与您的报关行确认当前表格和要求。" → "目标市场持牌报关行经目标市场海关（CBP）许可，可办理进口报关（一般使用 CBP Form 7501）并处理保证金——请与您的报关行确认当前表格和要求。"
- src/i18n.ts:668 `guide.card7Sub3Title`: "3. 核实美国企业的真实性：" → "3. 核实海外企业的真实性："
- src/i18n.ts:670 `guide.card7Sub3Body`: "请在官方州登记机构（如 Delaware、California、New York 州务卿网站）查询美国买家。核实企业邮箱域名与官方企业网站一致，而非免费邮箱。" → "请在官方企业登记机构查询海外买家。核实企业邮箱域名与官方企业网站一致，而非免费邮箱。"

Greetings (VoiceAssistantTab.tsx) — same neutral rewrite, for owner review. The 7 non-Chinese greetings were neutralized by deleting only the country word — no new words were introduced in those languages:
- VoiceAssistantTab.tsx:66 (hi): deleted "भारतीय " (Indian) and "अमेरिका में " (in America)
- VoiceAssistantTab.tsx:67 (mr): deleted "भारतीय " (Indian) and "अमेरिकेतील " (of America)
- VoiceAssistantTab.tsx:68 (gu): deleted "ભારતીય " (Indian) and "યુએસ " (US)
- VoiceAssistantTab.tsx:69 (ta): deleted "இந்திய " (Indian) and "அமெரிக்க " (American)
- VoiceAssistantTab.tsx:70 (bn): deleted "ভারতীয় " (Indian) and "মার্কিন " (American)
- VoiceAssistantTab.tsx:71 (te): deleted "భారతీయ " (Indian) and "అమెరికా " (America)
- VoiceAssistantTab.tsx:72 (pa): deleted "ਭਾਰਤੀ " (Indian) and "ਅਮਰੀਕੀ " (American)
- VoiceAssistantTab.tsx:73 (zh): "我将协助您与美国买家对接并洽谈业务。" → "我将协助您与海外买家对接并洽谈业务。"

## Checks

- Plain `npm install` exits 0 (file-6 round, clean tree).
- `npm run build` PASS.
- `npx tsc --noEmit` exit 0.
- No-key 401s hold: `/api/chat` + `/api/pitch` → 401 "GEMINI_API_KEY is not set" (re-verified after the ZH rewrite; the rewrite touches client strings only).
- Grep clean: no country names in the ZH dict or the greetings (印度/美国/中国/英国/日本/德国/法国/俄罗斯/巴西, 美式, India/America/USA/U.S., flags 🇮🇳/🇺🇸).
- Secret scan clean (source + built bundle); no `.env` file in the tree.
- File-6 live stub tests (rate limit, auth gate, 502 on model failure) verified in that round.

## Still open / WHY-NOT

- **ZH "免费助手" — WHY-NOT.** The ZH footer still says 免费语音助手 / 免费助手 (i18n.ts:360,458,465). No approved Chinese rendering of "Faithful Servant" exists — left as-is, needs a human translator. The EN footer already says "Free Faithful Servant by elghaly" (i18n.ts:17).
- **Greetings "voice assistant" renderings — WHY-NOT.** The 8 non-English greetings still say "voice assistant" in their own language — each needs a human translator to render "Faithful Servant" naturally (see `thoth-greetings-translator-pass.md`). Only the country names were removed from them (see table above).
- **Guide card 3 (i18n.ts:639,641,643) — owner review especially welcome.** "Made in India" → 原产地 and "19 U.S.C. 1304" → 目标市场原产地标注法规. The card's point is the origin-marking rule; the citation was removed with the country name — restore it if you want the statute cited.
- **City/port examples left as-is.** Nhava Sheva, Mundra, Chennai, Moradabad, Jaipur, Cochin, New York (`voice.step4Hint`, `pitch.shipFromPh`, sample labels/texts) are place names, not country names. Flag if you want them generalized too.
- **`en-US` speech locale codes** (PitchStudioTab.tsx, LiveTranslatorTab.tsx, types/index.ts) are functional BCP 47 tags for speech synthesis, not copy — left as-is.
