# Thoth — «الغالي» for exporters

Thoth and its assistant «الغالي» help
exporters reach and talk to buyers: voice help, honest buyer pitches,
translation, and import basics.

## Install

You need Node.js 22 or newer. Use one lockfile, matching your tool:

- **npm** (uses `package-lock.json`):
  `npm ci`
- **Bun** (uses `bun.lock`):
  `bun install --frozen-lockfile`

Both lockfiles are kept in step with `package.json`. After changing a
dependency, run `npm install` and `bun install` and commit both lockfiles.

## Configure

Copy `.env.example` to `.env` and fill in the values in your own
environment. Never commit `.env`. The server reads these names:

- `GEMINI_API_KEY`: required for the model routes.
- `THOTH_PROXY_SECRET`: optional proxy gate (see below).
- `TRUST_PROXY_HOPS`: how many reverse proxies sit in front of the
  server. Default `1` (one front end, as on Cloud Run). Use `0` when the
  server is exposed directly.
- `PORT`: optional, default `3000`.

## Run

- Development: `npm run dev`
- Production: `npm run build`, then `NODE_ENV=production npm start`

## Check

- `npm run lint`: TypeScript, no emit.
- `npm run test:smoke`, `npm run test:zh`, `npm run test:nofree`,
  `npm run test:locales`: string checks.
- `npm run test:server`: starts the server against a local stub and
  checks the rate limit, input validation, error bodies and the `/api`
  404.

## Keys stay server-side

The Gemini key is server-side only. It is not in client code, the built
bundle, or this README. The server refuses model requests with a clear
401 when the key is missing, and it never pretends the model answered.
If a model call fails, the app shows a clearly labelled error instead of
a canned reply. Error bodies say only "Request failed"; details go to the
server log.

## What is sent where

Text you submit is sent to Google's Gemini API to generate replies;
Google's handling is outside this app. Voice input uses your browser's
speech recognition. Nothing is spoken aloud until you tap a speaker
button or send a message.

## Proxy protection

Model requests go through a small server proxy (`server.ts`):

- Rate limit: 20 requests per minute per client on `/api/*`
  (`express-rate-limit`).
- Input: JSON bodies up to 100 KB; each route accepts only its own
  fields, as strings of bounded length, and refuses anything else with
  400.
- Same-origin requests only, so other sites cannot use it as an open
  relay.
- Optional shared secret: set `THOTH_PROXY_SECRET` in `.env` (name only,
  never commit a value) to turn the gate on. The served page receives
  the secret as an HttpOnly cookie, so client code never sees it.
- Unknown `/api/*` paths answer a JSON 404, never the app page.
