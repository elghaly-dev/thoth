# Hathor (حتحور) — marketplace front end

A B2B marketplace between Gulf, UAE, Saudi, India and China suppliers and business buyers.
Arabic first (right to left), English second. The in-app assistant is «الغالي».

This folder is a standalone Vite app. It does not touch the Thoth app in `app/`.

## Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS 4 with the design tokens in `src/index.css` (`@theme`): deep navy and lilac `#c4a1ec`, one dark theme
- Motion (Framer Motion) for page transitions and micro-interactions
- `cmdk` command palette (Ctrl K / ⌘ K, or `/`)
- Self-hosted fonts through `@fontsource` (Cinzel, Cormorant Garamond, Outfit, Cairo, Amiri)
- PWA: `public/manifest.webmanifest` and an offline shell in `public/sw.js`

## Screens

Home (hero search, glowing journey line, categories, featured products, verified suppliers),
catalog with filters, product page with price tiers and a landed-cost panel, supplier profile
with verification levels, the request-for-quotation wizard, quote comparison, the deal room
timeline, messages with masked contact details and the message check, registration for
companies, fees and plans, buyer dashboard, supplier dashboard, and the «الغالي» side panel.

Every price, company and count on screen is sample data and carries a «Sample data» badge.
Escrow, verification partners and freight rates are not connected yet; the screens say so.

## Run

```
npm install
npm run dev        # http://localhost:5173/app.html (the source page)
npm run lint       # TypeScript
npm test           # wording, i18n parity, contact masking, fees, number lock
npm run build && npm run preview
python3 scripts/shots.py http://localhost:4173 shots   # screenshots, plus an on-screen wording check
```

Fee settings live in `src/lib/fees.ts` (`FEE_CONFIG`). While the commission rate and the
Premium price are unset, the UI shows «Plans coming» and never shows a made-up number.

## Publishing to thoth.elghaly.dev/hathor/

The site serves this folder as it is; nothing is built on the host. The source page is `app.html`.
`npm run publish` builds it for `/hathor/` and writes the built page (`index.html`), `assets/` and the
shell files (`sw.js`, `manifest.webmanifest`, icons) here. Run it after any change under `src/`,
`public/` or `app.html`, and commit what it writes. `hathor-checks` builds again and fails when the
committed files differ.
