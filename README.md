# Thoth — Faithful Servant for exporters

Thoth is a Faithful Servant that helps
exporters reach and talk to buyers: voice help, honest buyer pitches,
translation, and import basics.

- Site: [thoth.elghaly.dev](https://thoth.elghaly.dev)
- Use Thoth: [thoth.elghaly.dev/use/](https://thoth.elghaly.dev/use/)
- الخادم الأمين · Faithful Servant

## Run locally (server key)

The app lives in `app/`.

1. `cd app && npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your Gemini API key.
   The server reads `.env`, nothing else. Never commit a real key.
3. `npm run dev`

The Gemini key stays on the server. The browser never sees it.

## Public site (GitHub Pages)

The public site cannot run the Node proxy. The built app is in `use/`
and is produced by `cd app && npm run build:pages`. On the public site,
the exporter pastes their own Gemini API key. It stays in this browser
tab (sessionStorage) and goes to Google alone. Thoth never stores
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
