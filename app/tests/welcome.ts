/**
 * First launch and Settings, in a real browser on the built app (use/):
 *  - a new visitor sees 1) look, 2) name, 3) language, then the app;
 *  - one tap on a look applies it and moves on; the name appears in the greeting;
 *  - look and name are kept only in this device's localStorage (thoth.theme, thoth.name,
 *    thoth.welcomed) and never in a cookie or the URL; nothing leaves the site;
 *  - a returning visitor goes straight to the app; Settings changes the look and the name;
 *  - the first-launch screens follow the language (Arabic is right-to-left, no English).
 * Run: npm run test:welcome   (needs the committed use/ build)
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { THEME_TABLES } from '../src/theme/strings';
import { PALETTES } from '../src/theme/palettes';

const require = createRequire(import.meta.url);
let chromium: any;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('playwright-core')); }
const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ROOT = path.dirname(APP);
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };

// Strings: complete in every language, no emoji, no banned words.
const enKeys = Object.keys(THEME_TABLES.en);
for (const [code, t] of Object.entries(THEME_TABLES)) {
  check(enKeys.every((k) => (t as Record<string, string>)[k]?.trim()), `${code}: every first-launch string present`);
  const text = Object.values(t).join(' ');
  check(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${code}: no emoji`);
  check(!/\bfree\b|\bsafe\b|\bAI\b|آمن|مجان/i.test(text), `${code}: no banned words`);
}

const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(new URL(req.url!, 'http://x').pathname));
  if (p.endsWith('/')) p += 'index.html';
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
const ORIGIN = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
try {
  // ---- English, first launch ----
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const outside: string[] = [];
  page.on('request', (r: any) => { if (!r.url().startsWith(ORIGIN) && !r.url().startsWith('data:')) outside.push(r.url()); });
  const errors: string[] = [];
  page.on('pageerror', (e: Error) => errors.push(e.message));
  await page.goto(`${ORIGIN}/use/?lang=en`);
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('heading', { name: 'Choose your look' }).waitFor();
  check(await dialog.getByText('Step 1 of 3').isVisible(), 'step 1 of 3 shown');
  check((await dialog.getByRole('button', { pressed: false }).count()) + 1 === PALETTES.length, 'six look tiles, one selected');

  await dialog.getByRole('button', { name: /Sand & Rose/ }).click();
  await dialog.getByRole('heading', { name: 'What should we call you?' }).waitFor();
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'sand-rose', 'one tap applies the look');
  const paper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check(paper === 'rgb(248, 240, 232)', `page colour follows the look (got ${paper})`);

  await dialog.getByPlaceholder('Your name').fill('Amal');
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await dialog.getByRole('heading', { name: 'Choose your language' }).waitFor();
  check((await dialog.getByRole('button', { pressed: true }).innerText()).includes('English'), 'current language pre-selected');
  await dialog.getByRole('button', { name: 'Open Thoth' }).click();
  await page.getByText('Welcome, Amal').waitFor();
  check(!(await page.getByRole('dialog').count()), 'first-launch screens closed');

  const stored = await page.evaluate(() => ({ ls: { ...localStorage }, cookie: document.cookie, url: location.href }));
  check(stored.ls['thoth.theme'] === 'sand-rose' && stored.ls['thoth.name'] === 'Amal' && stored.ls['thoth.welcomed'] === '1', 'look, name and done-flag saved on the device');
  check(!stored.cookie.includes('Amal') && !stored.cookie.includes('sand-rose'), 'look and name are not in a cookie');
  check(!stored.url.includes('Amal'), 'name is not in the URL');

  // ---- Returning visitor + Settings ----
  await page.reload();
  await page.getByText('Welcome, Amal').waitFor();
  check(!(await page.getByRole('dialog').count()), 'returning visitor goes straight to the app');
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'sand-rose', 'look kept after reload');
  await page.getByRole('button', { name: 'Settings' }).click();
  const sheet = page.getByRole('dialog', { name: 'Settings' });
  await sheet.waitFor();
  await sheet.getByRole('button', { name: /Cream & Teal/ }).click();
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'cream-teal', 'Settings changes the look');
  await sheet.getByLabel('Your name').fill('Amal K');
  await sheet.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Welcome, Amal K').waitFor();
  check((await page.evaluate(() => localStorage.getItem('thoth.name'))) === 'Amal K', 'Settings changes the name');
  check(outside.length === 0, `nothing leaves the site (${outside.slice(0, 3).join(', ')})`);
  check(errors.length === 0, `no page errors (${errors.slice(0, 2).join(' | ')})`);
  await ctx.close();

  // ---- Arabic, first launch ----
  const ar = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ar', serviceWorkers: 'block' });
  const p2 = await ar.newPage();
  await p2.goto(`${ORIGIN}/use/?lang=ar`);
  const d2 = p2.getByRole('dialog');
  await d2.getByRole('heading', { name: THEME_TABLES.ar.lookTitle }).waitFor();
  check((await p2.evaluate(() => document.documentElement.dir)) === 'rtl', 'Arabic first launch is right-to-left');
  const arText = await d2.innerText();
  check(!/Choose|Step|Ivory/.test(arText), 'Arabic first launch has no English text');
  await d2.getByRole('button', { name: new RegExp(THEME_TABLES.ar['navy-lilac']) }).click();
  await d2.getByRole('button', { name: THEME_TABLES.ar.skip }).click();
  await d2.getByRole('button', { name: THEME_TABLES.ar.start }).click();
  await p2.getByText(THEME_TABLES.ar.welcomeAnon, { exact: true }).waitFor();
  check(true, 'Arabic: skipping the name shows the plain greeting');
  const tabs = await p2.locator('#thoth-main').innerText();
  check(tabs.includes('الخادم الأمين على هذا الهاتف') && !tabs.includes('Faithful Servant on this phone'), 'Arabic: the on-device tab label is in Arabic');
  await p2.getByRole('button', { name: 'الخادم الأمين على هذا الهاتف' }).click();
  await p2.waitForTimeout(400);
  const ltr = await p2.evaluate(() => [...document.querySelectorAll('#thoth-main *')]
    .filter((el) => !el.closest('[dir="auto"]') && getComputedStyle(el).direction !== 'rtl')
    .map((el) => el.tagName + (el.id ? '#' + el.id : '')));
  check(ltr.length === 0, `Arabic: the whole on-device tab is right-to-left (left-to-right: ${ltr.slice(0, 5).join(', ')})`);
  const tabText = await p2.locator('#thoth-main').innerText();
  check(!/Faithful Servant|Download the|Start the|this phone/.test(tabText), 'Arabic: no English on-device text in the tab');
  await ar.close();
} finally {
  await browser.close();
  server.close();
}

if (fails.length) { console.log(`welcome: FAIL ${fails.length}/${checks}`); fails.forEach((m) => console.log('  FAIL | ' + m)); process.exit(1); }
console.log(`welcome: PASS ${checks}/${checks}`);
