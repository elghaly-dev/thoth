# Thoth: security policy and threat model

Thoth, the Faithful Servant for exporters, helps write product pitches, talk with buyers in
their language and read import basics. The web app runs at thoth.elghaly.dev; the Android app
is a Trusted Web Activity that opens the same site.

Report a weakness to **security@elghaly.dev**. Please do not open a public issue. We answer
within 3 working days.

Elghaly LLC, 548 Market St, San Francisco, CA 94104, USA

## Assets

| Asset | Where it lives | What must hold |
|---|---|---|
| What a person types or says | The browser; sent to the model provider only to make a reply | Never stored, logged or sent to us |
| The person's own model key (bring your own key) | The person's browser only | Never sent to our servers; only to the provider's API |
| Server model key and proxy secret (server mode) | Server environment only | Never in the repo, in a response, or in a log |
| Android upload key | Repository secrets, used only by the manual `android-release` workflow | Never in the repo; PR runs cannot read it |
| Owner identity | Nowhere in the repo | Legal name and personal e-mail blocked by `.github/security/personal_scan.py` |

## Entry points

1. The web app on GitHub Pages (`use/`) and the landing pages (`index.html`, `404.html`).
2. Server mode (`app/server.ts`): `/api/*` routes.
3. The Android wrapper: launcher intent and verified `https://thoth.elghaly.dev` links.
4. Pull requests and pushes (CI).

## Attackers

- **Page attacker**: injects script through text that the app shows, or frames the app.
- **API abuser**: drives `/api/*` to spend the server's model quota, or probes errors for detail.
- **Network attacker**: tries HTTP downgrade or a user-installed certificate on Android.
- **Supply chain**: a changed npm package, Gradle library or GitHub Action; a malicious PR.

## Trust boundaries

```
 person ──► browser app (CSP: scripts from self only) ──► provider API (own key)
                    │
                    └──► server mode /api/* (rate limit, size limits, same-origin, proxy gate)
 Android wrapper ──► HTTPS only, system CAs only ──► thoth.elghaly.dev (verified by assetlinks)
 PR from anyone ──► CI with a read-only token and no signing secrets
```

## Controls

| Control | Where |
|---|---|
| CSP without inline script, inline style or eval on the app | `app/vite.config.ts` (Pages), `app/server.ts` (server) |
| Landing pages: hashed-style CSP, no script | `tools/check-landing-csp.mjs` |
| Server headers on every response: HSTS (1 week for now), nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP; the server CSP (with `frame-ancestors 'none'`) runs in report-only mode until a real-browser pass shows no violations; no CORS grant | `app/server.ts`, `app/tests/server-hardening.ts` |
| Rate limit, 100 kB body limit, strict input checks, generic error bodies (no stack traces) | `app/server.ts`, `app/tests/server-hardening.ts` |
| Android: no permissions, no backup, no cleartext, system CAs only, R8, only the launcher exported | `android/`, `tools/check-twa.mjs` |
| Full-history secret scan on every branch (gitleaks 8.28.0, sha256-pinned) | `.github/workflows/security.yml` |
| Legal-name and personal e-mail scan over every blob in history | `.github/security/personal_scan.py` (fingerprints from a repository secret, since this repo is public) |
| Exact dependency versions, `npm ci`, `npm audit` | `.github/workflows/security.yml` |
| Every Action pinned to a commit SHA; no write permission or credential secret on PR runs | `.github/security/check_workflows.py` |
| Dependabot (Actions, npm, Gradle), CODEOWNERS | `.github/` |

## Known gaps

- GitHub Pages cannot send HTTP headers, so the Pages site relies on the CSP meta tag: no HSTS
  header from us and no `frame-ancestors` there. The server mode sends both.
- The app loads its fonts from Google Fonts. The stylesheet changes per browser, so it cannot
  carry a sha256 pin; self-hosting the fonts would close this.
- In server mode the proxy gate is off until `THOTH_PROXY_SECRET` is set; the rate limit and
  same-origin check still apply. The proxy cookie proves only that the client loaded the page.
- `frame-ancestors 'none'` in server mode also refuses the AI Studio preview frame.
- `.well-known/assetlinks.json` still holds the placeholder until the Play Console certificate
  fingerprint is filled in.
