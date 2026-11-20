/**
 * Site-wide wording check for everything thoth.elghaly.dev serves:
 * the landing (index.html), 404.html, the built app (use/index.html and
 * use/assets/*.js), the agent page (agent/index.html and its visible
 * strings), app/index.html, app/metadata.json, robots/sitemap, and every UI
 * string + greeting in every language.
 *
 * Fails on:
 *  - "free" wording (English word + the UI languages' words);
 *  - the credit "elghaly" anywhere visible (URLs such as thoth.elghaly.dev
 *    in href/src/canonical/og:url are allowed: they are addresses, not text);
 *  - "Wyndham Heaven" in <title> or any <meta> content;
 *  - the word "AI" in visible app strings (use "Faithful Servant").
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
  const text = stripUrls(visible(html));
  check(!FREE.test(text), `${rel}: "free" in visible text`);
  check(!CREDIT.test(text), `${rel}: "elghaly" in visible text`);
  for (const m of metaTexts(html)) {
    const t = stripUrls(m);
    check(!FREE.test(t), `${rel}: "free" in title/meta: ${m.slice(0, 60)}`);
    check(!CREDIT.test(t), `${rel}: "elghaly" in title/meta: ${m.slice(0, 60)}`);
    check(!/Wyndham Heaven/.test(t), `${rel}: "Wyndham Heaven" in title/meta: ${m.slice(0, 60)}`);
    check(!AI.test(t), `${rel}: "AI" in title/meta: ${m.slice(0, 60)}`);
  }
}
// The landing keeps its call to action and loses the old badge, byline and footer.
const landing = read('index.html');
check(landing.includes('href="/use/"'), 'index.html: "Open Thoth" still links to /use/');
check(!/class="free"|<footer|class="by"/.test(landing), 'index.html: no "free" badge, byline or footer');

// Built bundle: the strings users see are inside the JS.
const assets = fs.readdirSync(path.join(ROOT, 'use', 'assets')).filter((f) => f.endsWith('.js'));
check(assets.length > 0, 'use/assets has the built JS');
for (const f of assets) {
  // Key names such as header.byElghaly are identifiers, never shown.
  const js = stripUrls(read(path.join('use', 'assets', f))).replace(/\b[a-z]+\.byElghaly\b/g, ' ');
  check(!/\bfree Faithful Servant|100% Free|Free tool|elghaly/i.test(js), `use/assets/${f}: free/credit wording in the bundle`);
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

if (fails.length) {
  console.log(`site-wording: FAIL ${fails.length}/${checks}`);
  for (const m of fails.slice(0, 40)) console.log('  FAIL | ' + m);
  process.exit(1);
}
console.log(`site-wording: PASS ${checks}/${checks}`);
