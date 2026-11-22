// Arabic in a real browser (Chromium), on the built Pages app (use/):
// - a phone set to Arabic (ar-EG) opens in Arabic, <html lang="ar" dir="rtl">;
// - ?lang=en overrides the device language; a saved pick wins over the device;
// - Arabic typed with the keyboard and pasted text both land unchanged in the
//   input, and the input lays out right-to-left;
// - the page's font stack carries an Arabic-capable font (Noto Sans Arabic).
// Run from the repo root: node tools/check-arabic-browser.mjs
// (CHROME_PATH=... for a system Chrome; SCREENSHOT=path.png saves a phone shot)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('playwright-core')); }
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let checks = 0;
const fails = [];
const check = (ok, msg) => { checks++; if (!ok) fails.push(msg); };

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

async function open(locale, query = '', init = '') {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale, hasTouch: true, isMobile: true });
  // A returning visitor: past the first-launch screens (look, name, language).
  await ctx.addInitScript(() => { try { localStorage.setItem('thoth.welcomed', '1'); } catch { /* storage blocked */ } });
  if (init) await ctx.addInitScript(init);
  // Fonts come from Google in production; the test does not depend on the network.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/use/${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 15000 });
  return { ctx, page };
}
const htmlLangDir = (page) => page.evaluate(() => [document.documentElement.lang, document.documentElement.dir]);

// 1. Device language Arabic -> Arabic, RTL.
let { ctx, page } = await open('ar-EG');
let [lang, dir] = await htmlLangDir(page);
check(lang === 'ar' && dir === 'rtl', `ar-EG phone opens in Arabic RTL (got lang=${lang} dir=${dir})`);

// 2. Typing and pasting Arabic.
// A message field, never the key field (type=password).
const input = page.locator('textarea:visible, input[type=text]:visible, input:not([type]):visible').first();
check(await input.count() === 1, 'a visible text field exists');
const typed = 'نصنع سجادًا قطنيًا، ٥٠٠ قطعة';
await input.click();
await input.fill('');
await page.keyboard.type(typed);
check(await input.inputValue() === typed, 'Arabic typed with the keyboard is kept exactly');
const pasted = ' — شحن من ميناء جدة';
await page.keyboard.insertText(pasted); // the same path a paste or IME commit takes
check(await input.inputValue() === typed + pasted, 'Arabic pasted text is kept exactly');
const fieldDir = await input.evaluate((el) => getComputedStyle(el).direction);
check(fieldDir === 'rtl', `the text field lays out right-to-left (got ${fieldDir})`);
const fontStack = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check(/Noto Sans Arabic/.test(fontStack), 'the font stack carries Noto Sans Arabic');
if (process.env.SCREENSHOT) {
  await input.fill('');
  await page.screenshot({ path: process.env.SCREENSHOT });
}
await ctx.close();

// 3. ?lang=en wins over the device language.
({ ctx, page } = await open('ar-EG', '?lang=en'));
[lang, dir] = await htmlLangDir(page);
check(lang === 'en' && dir === 'ltr', `?lang=en overrides an Arabic phone (got lang=${lang} dir=${dir})`);
await ctx.close();

// 4. A saved pick wins over the device language.
({ ctx, page } = await open('en-US', '', "try { localStorage.setItem('thoth.lang', 'ar'); } catch (e) {}"));
[lang, dir] = await htmlLangDir(page);
check(lang === 'ar' && dir === 'rtl', `a saved Arabic pick wins on an English phone (got lang=${lang} dir=${dir})`);
await ctx.close();

// 5. An unsupported device language falls back to English.
({ ctx, page } = await open('sw-KE'));
[lang, dir] = await htmlLangDir(page);
check(lang === 'en' && dir === 'ltr', `an unsupported phone language falls back to English (got lang=${lang} dir=${dir})`);
await ctx.close();

await browser.close();
server.close();
if (fails.length) { console.log(`arabic-browser: FAIL ${fails.length}/${checks}`); fails.forEach((m) => console.log('  FAIL | ' + m)); process.exit(1); }
console.log(`arabic-browser: PASS ${checks}/${checks}`);
