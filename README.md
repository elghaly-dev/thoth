# Thoth — Faithful Servant for exporters

Thoth is a Faithful Servant that helps
exporters reach and talk to buyers: voice help, honest buyer pitches,
translation, and import basics.

- Site: [thoth.elghaly.dev](https://thoth.elghaly.dev)
- Use Thoth: [thoth.elghaly.dev/use/](https://thoth.elghaly.dev/use/)
- الخادم الأمين · Faithful Servant

## مسؤولية المستخدم ودور المنصة · User responsibility & platform role

حتحور (Hathor) تديرها Elghaly LLC، وهي شركة أمريكية.

- حتحور خدمة تربط المورّدين بالمشترين. حتحور ليست البائع ولا المشتري، ولا تملك البضائع ولا تحتفظ بها.
- كل مستخدم مسؤول عن بضاعته، وعن بلد المنشأ الحقيقي لها، وعن الجمارك والرسوم وتراخيص الاستيراد والتصدير، وعن الالتزام بالقانون في بلده.
- ممنوع على حتحور تغيير بلد المنشأ أو إخفاؤه، أو تمرير البضائع عبر بلد آخر للتهرّب من الرسوم الجمركية (تحويل الشحنة).
- البيع يتم بين المورّد والمشتري مباشرة؛ حتحور هي المنصة.
- الرسوم الجمركية والشحن ومستندات الجمارك (مثل شهادة المنشأ) يدفعها ويتولاها البائع و/أو المشتري حسب اتفاقهما؛ حتحور هي السوق.
- يستطيع أي مستخدم الإبلاغ عن أي عرض أو حساب من زر «بلّغ».
- يحق لحتحور مراجعة البلاغات، وإيقاف أو إغلاق الحسابات التي تخالف هذه القواعد، والتعاون مع السلطات عندما يُلزمها القانون بذلك.

Hathor (حتحور) is operated by Elghaly LLC, a US company.

- Hathor is a service that connects suppliers and buyers. Hathor is not the seller or the buyer, and it does not own or hold the goods.
- Each user is responsible for their own goods, their true country of origin, customs, tariffs, import and export licences, and following the law in their own country.
- Changing or hiding the country of origin, or routing goods through another country to avoid duties (transshipment), is forbidden on Hathor.
- The sale is between the supplier and the buyer; Hathor is the platform.
- Duties, shipping and customs documents (such as the certificate of origin) are paid and handled by the seller and/or buyer as they agree; Hathor is the marketplace.
- Any user can report a listing or an account with the «بلّغ» (Report) button.
- Hathor may review reports, suspend or close accounts that break these rules, and cooperate with authorities when the law requires it.

## Run locally (server key)

The app lives in `app/`.

1. `cd app && npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your Gemini API key.
   The server reads `.env` only. Never commit a real key.
3. `npm run dev`

The Gemini key stays on the server. The browser never sees it.

## Public site (GitHub Pages)

The public site cannot run the Node proxy. The built app is in `use/`
and is produced by `cd app && npm run build:pages`. On the public site,
the exporter pastes their own Gemini API key. It stays in this browser
tab (sessionStorage only) and is sent only to Google. Thoth never stores
it on its servers.

Needs your own sign-up: Google AI Studio
(https://aistudio.google.com/apikey).

## Tests

From `app/`:

- `npm test` — locale smoke, idle-session, and no-secrets scans
- `npm run lint` — TypeScript check
- `npm run build` — Vite production build (for the Node server)
- `npm run build:pages` — Vite build into `../use/` for GitHub Pages

## Keys

No secrets belong in this repo, the built bundle, or the README. The
server refuses model requests with a clear 401 when the key is missing.
If a model call fails, the app shows a clearly labelled error instead of
a canned reply.
