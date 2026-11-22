# Thoth on Google Play: owner pack (draft, nothing submitted)

Prepared for review only. Nothing has been sent to Google Play. The Android app is the Trusted
Web Activity in `android/` (package `dev.elghaly.thoth`, now compile and target SDK 36, the
current Play target level). It opens `https://thoth.elghaly.dev/use/`.

The merchant directory, merchant profiles and buyer-merchant chat are parked until after the
Play launch; nothing below covers them.

## Owner steps before submission

1. Signing: follow `docs/TWA.md` (upload key on your own computer, the four
   `THOTH_UPLOAD_*` repository secrets, run the signed-release workflow by hand).
2. Play App Signing: copy the app signing certificate SHA-256 from Play Console and run
   `node tools/set-assetlinks.mjs <sha256>` in a reviewed PR, so `/.well-known/assetlinks.json`
   matches the app.
3. Privacy policy URL for the listing: `https://thoth.elghaly.dev/privacy/` (Arabic:
   `/ar/privacy/`). Both pages are in this PR and linked from the app footer and the landing page.
4. Fill the forms below, upload the signed bundle to an internal test track first.

## Reviewer access

No account and no sign-in. A reviewer opens the app and can use every tab. Two ways to see
answers:
- On a phone with WebGPU: "Faithful Servant on this phone" downloads about 291 MB once and
  then answers on the device.
- Otherwise: paste a Gemini key (from Google's key page) in the key box ("Use for this visit").

Suggested note for the reviewer:

> No login is needed. Every screen opens without an account. To see answers, either use
> "Faithful Servant on this phone" (a one-time download of about 291 MB on a phone with WebGPU)
> or paste your own Gemini key in the key box at the top; the key stays in the page's memory
> only and is sent only to Google.

## Play data-disclosure form (proposed answers; owner confirms)

These match what the app does today (checked in the code at main c544ba0):

| Data | Proposed answer | What the app does |
|---|---|---|
| Messages / other user-generated content (what the exporter types) | Collected: yes, only when the person uses their own Gemini key. Shared: no (sent only to the service the person chose, at their request). Processed ephemerally: yes. Optional: yes. Purpose: app functionality | With the person's own key, the text goes from the browser straight to Google's Gemini service. With the on-device Faithful Servant, nothing leaves the phone. Elghaly LLC never receives it |
| Audio (voice) | Not collected by the app | The microphone is used only after a tap; speech-to-text is the browser's own speech service (in Chrome on Android, Google processes the audio). Stated on the privacy page |
| Personal info, financial info, location, contacts, photos, files, health, device IDs | Not collected | None of these is requested or sent |
| App activity, app info and performance (analytics, crash logs) | Not collected | No analytics, no crash reporting, no telemetry (checked by `test:network`) |
| Encrypted in transit | Yes | HTTPS only; the Android wrapper turns cleartext off |
| Deletion | Nothing is held by Elghaly LLC; clearing site data or uninstalling removes everything on the phone | The only stored items are the language code (browser storage + a small `lang` cookie) and the model files if downloaded |

Note for the owner: models.elghaly.dev and GitHub Pages see IP addresses as any web host does;
the privacy page says so.

## Content rating and audience

Business and productivity. No violence, sexual content, gambling or location use. No
user-to-user communication in this version. Target audience: adults (exporters and
businesses); not directed at children.

## Store listing (draft)

App name: Thoth

Short description (EN, 78 characters):
The Faithful Servant for exporters: honest pitches, trade translation, basics.

Short description (AR):
الخادم الأمين للمصدّرين: عروض صادقة، وترجمة تجارية، وأساسيات الاستيراد.

Full description (EN):

> Thoth is the Faithful Servant for exporters, small and large. by Elghaly LLC.
>
> - Buyer Pitch Studio: turn your own facts (product, quantity, price, port) into a short,
>   honest pitch and spec sheet a buyer can read. It never invents facts.
> - Trade Translator: speak or type with a buyer in their language. Amounts and terms are read
>   back word for word, so nothing changes in translation.
> - Import Basics: plain answers on FOB, CIF, documents and first steps. HS codes and duty rates
>   are shown as candidates to check with a licensed customs broker, never as final.
> - Talk with Thoth: ask by voice, hear the answer.
> - Faithful Servant on this phone: after a one-time download of about 291 MB, it explains and
>   translates trade messages on the phone itself. Needs a phone with WebGPU.
> - Ten languages: Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Punjabi, Arabic, Chinese
>   and English. Opens in your phone's language.
>
> No account and no sign-in. Thoth collects nothing about you: no ads, no analytics. You can
> also use your own Gemini key; it stays in the page's memory and goes only to Google.
>
> Privacy policy: thoth.elghaly.dev/privacy/

Full description (AR):

> Thoth هو الخادم الأمين للمصدّرين، صغارًا وكبارًا. by Elghaly LLC.
>
> - استوديو عروض المشترين: حوّل حقائقك (المنتج، الكمية، السعر، الميناء) إلى عرض قصير وصادق
>   وورقة مواصفات يقرؤها المشتري. لا يخترع أي معلومة.
> - المترجم التجاري: تكلّم أو اكتب مع المشتري بلغته. تُعاد قراءة المبالغ والشروط حرفيًا، فلا
>   يتغير شيء في الترجمة.
> - أساسيات الاستيراد: إجابات واضحة عن FOB وCIF والمستندات والخطوات الأولى. تظهر رموز HS
>   والرسوم الجمركية كاحتمالات يجب التحقق منها مع مخلّص جمركي مرخّص، وليست نهائية.
> - تحدّث مع Thoth: اسأل بصوتك واسمع الإجابة.
> - الخادم الأمين على هذا الهاتف: بعد تنزيل لمرة واحدة بحجم نحو ٢٩١ ميغابايت، يشرح الرسائل
>   التجارية ويترجمها على الهاتف نفسه. يحتاج هاتفًا يدعم WebGPU.
> - عشر لغات: الهندية والماراثية والغوجاراتية والبنغالية والتاميلية والتيلوغوية والبنجابية
>   والعربية والصينية والإنجليزية. يفتح بلغة هاتفك.
>
> لا حساب ولا تسجيل دخول. لا يجمع Thoth أي شيء عنك: لا إعلانات ولا تحليلات. ويمكنك أيضًا
> استخدام مفتاح Gemini الخاص بك؛ يبقى في ذاكرة الصفحة ويذهب إلى Google فقط.
>
> سياسة الخصوصية: thoth.elghaly.dev/ar/privacy/

## Graphics (in this folder)

- `feature-graphic-1024x500.png`
- `screens/en-1-home.png` … `screens/en-5-import-basics.png` (1080 x 1920)
- `screens/ar-1-home.png` … `screens/ar-5-import-basics.png` (1080 x 1920)
- App icon 512 x 512: `icon-512.png` at the repository root.

The screens are rendered from the built app (`use/`) at main plus this PR, with no key and no
model loaded, so they show the app as a new user first sees it. A shot of the on-device
Faithful Servant answering needs a phone with WebGPU; take it on a real phone before
submission.

## Risks

- Play may ask about the microphone: it is requested by the browser on tap; the wrapper asks
  for no permission.
- Phones without WebGPU cannot run the on-device Faithful Servant; the listing says so and the
  own-key path still works.
- HS codes and duty rates must stay worded as candidates in every language.
