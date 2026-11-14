# Thoth — Faithful Servant for exporters

Thoth is a free Faithful Servant by Wyndham Heaven (elghaly) that helps
exporters reach and talk to buyers: voice help, honest buyer pitches,
live translation, and import basics.

## Run locally

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your Gemini API key.
   The server reads `.env` only.
3. Run the app:
   `npm run dev`

## Keys stay server-side

The Gemini key is server-side only. It never goes into client code, the
built bundle, or this README. The server refuses model requests with a
clear 401 when the key is missing, and it never pretends the model
answered. If a model call fails, the app shows a clearly labelled error
instead of a canned reply.

## Proxy protection

Model requests go through a small server proxy (`server.ts`). It is
rate-limited per client (60 requests per minute) and accepts
same-origin requests only, so other sites cannot use it as an open relay.
It can also require a shared secret: set `THOTH_PROXY_SECRET` in `.env`
(name only — never commit a value) to turn the gate on. The served page
receives the secret as an HttpOnly cookie, so client code never sees it.
