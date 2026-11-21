/**
 * Site-wide wording check for everything thoth.elghaly.dev serves:
 * the landing (index.html), 404.html, the built app (use/index.html and
 * use/assets/*.js), the agent page (agent/index.html and its visible
 * strings), app/index.html, app/metadata.json, robots/sitemap, and every UI
 * string + greeting in every language.
 *
 * Fails on:
 *  - "free" wording (English word + the UI languages' words);
 *  - a missing credit (owner decision, REQUIRED): every page (landing,
 *    404, the /use/ app header, agent/) shows "by Elghaly LLC" linking to
 *    https://elghaly.dev under the title, and "Wyndham Heaven" at the bottom;
 *    every page's meta description carries "by Elghaly LLC";
 *  - any other "elghaly" / "Wyndham" wording (only those two exact credits,
 *    in Latin letters, are allowed; URLs are addresses, not text);
 *  - the word "AI" in visible app strings (use "Faithful Servant");
 * and enforces the Hindi site (owner decision): <html lang="hi"> on the
 * landing, 404 and app pages; landing/404/meta text in Devanagari only;
 * Hindi is the app's default; every Hindi UI string free of English words
 * (brand/trade codes such as FOB, MOQ, Gemini, Google are allowed);
 * a favicon (svg + ico) linked from every page.
 * Run: npm run test:site   (needs the committed use/ build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN_ALL, GREETINGS, tx, type StringKey } from '../src/i18n';
import { SUPPORTED_LANGUAGES } from '../src/types';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ROOT = path.dirname(APP);
const FREE = /\bfree\b|免费|निःशुल्क|मुफ़्त|मुफ्त|मोफत|મફત|இலவச|বিনামূল্যে|ఉచిత|ਮੁਫ਼ਤ|ਮੁਫਤ/i;
const CREDIT = /elghaly/i;
const TOP = 'by Elghaly LLC';
const TOP_URL = 'https://elghaly.dev';
const FOOT = 'Wyndham Heaven';
// The two exact credits are allowed (and required); anything else is not.
const noCredits = (s: string) => s.split(TOP).join(' ').split(FOOT).join(' ');
const AI = /\bAI\b/;
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };

// Remove addresses (they may contain the domain) before looking for the credit.
const stripUrls = (s: string) => s.replace(/https?:\/\/[^\s"'<>)]+/g, ' ').replace(/\b[\w.-]*elghaly\.dev\b/g, ' ');
const visible = (html: string) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ');
const metaTexts = (html: string) => {
  const out: string[] = [];
  for (const m of html.matchAll(/<title>([\s\S]*?)<\/title>/gi)) out.push(m[1]);
  for (const m of html.matchAll(/<meta\b[^>]*\bcontent="([^"]*)"/gi)) out.push(m[1]);
  return out;
};
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const pages = ['index.html', '404.html', 'use/index.html', 'agent/index.html', 'app/index.html'];
for (const rel of pages) {
  const html = read(rel);
  const text = noCredits(stripUrls(visible(html)));
  check(!FREE.test(text), `${rel}: "free" in visible text`);
  check(!CREDIT.test(text), `${rel}: "elghaly" in visible text (other than "${TOP}")`);
  check(!/Wyndham/i.test(text), `${rel}: "Wyndham" in visible text (other than "${FOOT}")`);
  check(!AI.test(text), `${rel}: "AI" in visible text`);
  for (const m of metaTexts(html)) {
    const t = noCredits(stripUrls(m));
    check(!FREE.test(t), `${rel}: "free" in title/meta: ${m.slice(0, 60)}`);
    check(!CREDIT.test(t), `${rel}: "elghaly" in title/meta: ${m.slice(0, 60)}`);
    check(!/Wyndham/i.test(t), `${rel}: "Wyndham" in title/meta: ${m.slice(0, 60)}`);
    check(!AI.test(t), `${rel}: "AI" in title/meta: ${m.slice(0, 60)}`);
  }
  // REQUIRED: the meta description carries the credit.
  const desc = (/<meta\s+name="description"\s+content="([^"]*)"/.exec(html) || [])[1] || '';
  check(desc.includes(TOP), `${rel}: meta description must include "${TOP}"`);
  for (const prop of ['og:description', 'twitter:description']) {
    const v = (new RegExp(`<meta\\s+(?:name|property)="${prop}"\\s+content="([^"]*)"`).exec(html) || [])[1];
    if (v !== undefined) check(v.includes(TOP), `${rel}: ${prop} must include "${TOP}"`);
  }
}

// REQUIRED credits on the static pages: "by Elghaly LLC" (link to
// https://elghaly.dev) under the title, inside <main>/<header>, and
// "Wyndham Heaven" at the bottom, after the main content.
const TOP_LINK = new RegExp(`<a href="${TOP_URL.replace(/\./g, '\\.')}"[^>]*>${TOP}</a>`);
for (const rel of ['index.html', '404.html', 'agent/index.html']) {
  const html = read(rel);
  const body = html.slice(html.indexOf('<body'));
  const h1 = body.indexOf('<h1');
  const top = body.search(TOP_LINK);
  const mainEnd = body.lastIndexOf('</main>');
  check(top !== -1, `${rel}: REQUIRED "${TOP}" linking to ${TOP_URL}`);
  check(top > h1 && h1 !== -1 && top < mainEnd, `${rel}: "${TOP}" sits under the title`);
  const foot = body.lastIndexOf(FOOT);
  check(foot !== -1, `${rel}: REQUIRED "${FOOT}" footer`);
  check(foot > mainEnd && body.slice(mainEnd, foot).includes('<footer'), `${rel}: "${FOOT}" is in the footer at the bottom`);
}
// The landing keeps its call to action and has no "free" badge.
const landing = read('index.html');
check(landing.includes('href="/use/"'), 'index.html: "Open Thoth" still links to /use/');
check(!/class="free"/.test(landing), 'index.html: no "free" badge');

// REQUIRED credits in the /use/ app: source and built bundle.
const credit = read('app/src/credit.ts');
check(credit.includes(`CREDIT_TOP = '${TOP}'`) && credit.includes(`CREDIT_URL = '${TOP_URL}'`) && credit.includes(`CREDIT_FOOTER = '${FOOT}'`), 'app/src/credit.ts: the two exact credits');
const header = read('app/src/components/Header.tsx');
check(/<a href=\{CREDIT_URL\}[^>]*>\{CREDIT_TOP\}<\/a>/.test(header) && header.indexOf('CREDIT_TOP}') > header.indexOf('<h1'), 'Header.tsx: REQUIRED "by Elghaly LLC" link under the title');
const appTsx = read('app/src/App.tsx');
const footerJsx = appTsx.slice(appTsx.indexOf('<footer'), appTsx.indexOf('</footer>'));
check(footerJsx.includes('{CREDIT_FOOTER}'), 'App.tsx: REQUIRED "Wyndham Heaven" in the app footer');

// Built bundle: the strings users see are inside the JS.
const assets = fs.readdirSync(path.join(ROOT, 'use', 'assets')).filter((f) => f.endsWith('.js'));
check(assets.length > 0, 'use/assets has the built JS');
const bundle = assets.map((f) => read(path.join('use', 'assets', f))).join('\n');
check(bundle.includes(TOP) && bundle.includes(TOP_URL) && bundle.includes(FOOT), `use/ bundle: REQUIRED "${TOP}", ${TOP_URL} and "${FOOT}"`);
for (const f of assets) {
  const js = noCredits(stripUrls(read(path.join('use', 'assets', f))));
  check(!/\bfree Faithful Servant|100% Free|Free tool|elghaly|Wyndham/i.test(js), `use/assets/${f}: free wording or a credit other than the two exact ones`);
}

// The Pages build never probes the (absent) server: no 404 console error.
check(assets.every((f) => !read(path.join('use', 'assets', f)).includes('/api/health')), 'use/ bundle does not probe /api/health');

// Agent page visible strings and metadata.
const metadata = JSON.parse(read('app/metadata.json')) as { name: string; description: string };
for (const v of [metadata.name, metadata.description]) {
  check(!FREE.test(v) && !CREDIT.test(v) && !AI.test(v), `app/metadata.json: ${v.slice(0, 60)}`);
}
for (const rel of ['agent/thoth-page.js', 'agent/site-actions.js', 'agent/agent-manifest.json', 'agent/thoth_assistant.hocon', 'agent/site.js']) {
  const s = stripUrls(read(rel));
  check(!FREE.test(s.replace(/Object\.freeze/g, '')), `${rel}: "free" wording`);
  check(!CREDIT.test(s), `${rel}: "elghaly" credit`);
  check(!/Wyndham/i.test(s), `${rel}: "Wyndham" credit`);
}

// Every UI string and greeting, every language.
for (const lang of SUPPORTED_LANGUAGES.map((l) => l.code)) {
  for (const key of Object.keys(EN_ALL) as StringKey[]) {
    const v = tx(lang, key);
    check(!FREE.test(v), `${lang}.${key}: "free" wording`);
    check(!CREDIT.test(v), `${lang}.${key}: "elghaly" credit`);
    // "Google AI Studio" is a product name (where to get a key), not our wording.
    check(!AI.test(v.replace(/Google AI Studio/g, '')), `${lang}.${key}: "AI"`);
  }
  const g = GREETINGS[lang];
  check(!FREE.test(g) && !CREDIT.test(g), `${lang} greeting: free/credit wording`);
}

// The English Translator example is English (no Devanagari in EN strings).
for (const [k, v] of Object.entries(EN_ALL)) {
  check(!/[ऀ-ॿ]/.test(v), `en.${k}: Devanagari text in an English string`);
}

// Model prompts never claim a price or a credit.
for (const rel of ['app/server.ts', 'app/src/utils/gemini-browser.ts']) {
  const s = read(rel);
  const prompt = (/SYSTEM_INSTRUCTION = `([\s\S]*?)`/.exec(s) || [])[1] || '';
  check(prompt.length > 0, `${rel}: system prompt found`);
  check(!FREE.test(prompt) && !CREDIT.test(prompt), `${rel}: free/credit wording in the system prompt`);
}

// ---- Hindi site (owner decision) ----
const DEVANAGARI = /[\u0900-\u097F]/;
const LATIN_WORD = /[A-Za-z]{2,}/g;
for (const rel of ['index.html', '404.html', 'app/index.html', 'use/index.html']) {
  const html = read(rel);
  check(/<html lang="hi"/.test(html), `${rel}: <html lang="hi">`);
  check(/<link rel="icon" href="\/favicon\.svg"/.test(html) && /<link rel="icon" href="\/favicon\.ico"/.test(html), `${rel}: favicon (svg + ico) linked`);
  const human: string[] = [];
  for (const m of html.matchAll(/<title>([\s\S]*?)<\/title>/gi)) human.push(m[1]);
  for (const m of html.matchAll(/<meta\b(?=[^>]*\b(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)")[^>]*\bcontent="([^"]*)"/gi)) human.push(m[1]);
  check(human.length >= 2, `${rel}: title and description found`);
  for (const m of human) {
    check(DEVANAGARI.test(m) && !(noCredits(stripUrls(m)).match(LATIN_WORD) || []).length, `${rel}: title/meta in Hindi only (credit in Latin allowed): ${m.slice(0, 50)}`);
  }
}
for (const rel of ['index.html', '404.html']) {
  const words = noCredits(stripUrls(visible(read(rel)))).match(LATIN_WORD) || [];
  check(words.length === 0, `${rel}: visible text in Hindi only (found: ${words.slice(0, 8).join(' ')})`);
}
check(fs.existsSync(path.join(ROOT, 'favicon.svg')) && fs.existsSync(path.join(ROOT, 'favicon.ico')), 'favicon.svg and favicon.ico exist');
for (const f of ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'manifest.webmanifest']) {
  check(fs.existsSync(path.join(ROOT, f)), `${f} exists`);
}
{
  const man = JSON.parse(read('manifest.webmanifest')) as { lang: string; name: string; description: string; icons: { src: string }[] };
  check(man.lang === 'hi' && DEVANAGARI.test(man.name), 'manifest.webmanifest: Hindi');
  check(man.description.includes(TOP) && !FREE.test(man.description) && !AI.test(man.description), 'manifest.webmanifest: description with the credit');
  for (const ic of man.icons) check(fs.existsSync(path.join(ROOT, ic.src.replace(/^\//, ''))), `manifest icon ${ic.src} exists`);
}
for (const rel of ['index.html', '404.html', 'use/index.html', 'agent/index.html']) {
  const html = read(rel);
  check(html.includes('href="/manifest.webmanifest"') && html.includes('href="/apple-touch-icon.png"') && html.includes('href="/favicon-32.png"'), `${rel}: manifest, apple-touch-icon and PNG favicon linked`);
}
check(SUPPORTED_LANGUAGES[0].code === 'hi', 'Hindi is the default UI language');
const HI_ALLOW = new Set(['FOB', 'CIF', 'DDP', 'MOQ', 'HS', 'HTS', 'ISPM', 'USD', 'INR', 'SGS', 'Intertek', 'Incoterm', 'FDA', 'FSSAI', 'ISO', 'MSME', 'LinkedIn', 'WhatsApp', 'Zoom', 'TXT', 'txt', 'Gemini', 'Google', 'API', 'Chrome', 'Edge', 'CE', 'USDA', 'PAN', 'GSTIN', 'x5', 'x8', 'L/C', 'B/L']);
for (const key of Object.keys(EN_ALL) as StringKey[]) {
  const v = tx('hi', key).replace(/\{[a-z]+\}/gi, ' ');
  const bad = (v.match(/[A-Za-z]{2,}/g) || []).filter((w) => !HI_ALLOW.has(w));
  check(bad.length === 0, `hi.${key}: English words in a Hindi string (${bad.join(' ')})`);
}
check(!/[A-Za-z]{3,}/.test(GREETINGS.hi), 'hi greeting has no English words');

// Agent page: Hindi too; trade codes, file names and the runtime's licence line stay Latin.
{
  const html = read('agent/index.html');
  check(/<html lang="hi"/.test(html), 'agent/index.html: <html lang="hi">');
  check(/<link rel="icon" href="\/favicon\.svg"/.test(html), 'agent/index.html: favicon linked');
  const AGENT_ALLOW = new Set(['FOB', 'CIF', 'thoth', 'assistant', 'network', 'json', 'agent', 'manifest', 'Apache', 'Open', 'Agentic', 'Web', 'runtime', 'LICENSE', 'txt']);
  const words = (noCredits(stripUrls(visible(html))).match(LATIN_WORD) || []).filter((w) => !AGENT_ALLOW.has(w));
  check(words.length === 0, `agent/index.html: visible text in Hindi (found: ${words.slice(0, 8).join(' ')})`);
  const facts = read('agent/thoth-page.js');
  const shown = [...facts.matchAll(/(?:name|does|price|helps|privacy): "([^"]*)"|^\s+"([^"]*)",?$/gm)].map((m) => m[1] ?? m[2]).filter((v) => v && !/^https?:/.test(v));
  check(shown.length > 20, 'agent/thoth-page.js: facts found');
  for (const v of shown) {
    const bad = (v.match(/[A-Za-z]{2,}/g) || []).filter((w) => !HI_ALLOW.has(w) && !['Organic', 'Incoterm'].includes(w));
    check(DEVANAGARI.test(v) && bad.length === 0, `agent/thoth-page.js: fact in Hindi: ${v.slice(0, 50)} (${bad.join(' ')})`);
  }
  check(!/\bby:\s*"/.test(facts), 'agent/thoth-page.js: no by: field');
}

if (fails.length) {
  console.log(`site-wording: FAIL ${fails.length}/${checks}`);
  for (const m of fails.slice(0, 40)) console.log('  FAIL | ' + m);
  process.exit(1);
}
console.log(`site-wording: PASS ${checks}/${checks}`);
