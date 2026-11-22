/**
 * No outside requests: open the built app (use/) in a real browser, visit
 * every tab, open the Licences view, and fail on any request that leaves the
 * site. The on-device model host is allowed only when the user downloads the
 * model (not exercised here), and the bring-your-own-key provider only when
 * the user turns that mode on (not exercised here), so neither may appear.
 * Also: no service-worker or beacon traffic, no source maps, no telemetry.
 * Run: npm run test:network   (needs the committed use/ build; CHROME_PATH optional)
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
// Playwright is installed only for this test (CI step), so it is typed loosely here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chromium: any;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('playwright-core'));
}
const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ROOT = path.dirname(APP);
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks++;
  if (!ok) fails.push(msg);
};

// ---- static: built files ----
const assets = path.join(ROOT, 'use', 'assets');
const built = fs.readdirSync(assets);
check(!built.some((f) => f.endsWith('.map')), 'no source map files in use/assets');
for (const f of built.filter((x) => x.endsWith('.js'))) {
  check(!/sourceMappingURL=/.test(fs.readFileSync(path.join(assets, f), 'utf8')), `${f}: no source map reference`);
}
// ---- static: our own source has no telemetry, beacons, remote config or hidden hosts ----
const SRC = path.join(APP, 'src');
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const ALLOWED_HOSTS = new Set(['models.elghaly.dev', 'generativelanguage.googleapis.com', 'thoth.elghaly.dev', 'elghaly.dev', 'aistudio.google.com']);
for (const f of walk(SRC).filter((x) => /\.(tsx?|json)$/.test(x))) {
  const t = fs.readFileSync(f, 'utf8');
  const rel = path.relative(APP, f);
  check(!/sendBeacon|gtag\(|google-analytics|googletagmanager|sentry|mixpanel|posthog|amplitude|hotjar|plausible|segment\.com/i.test(t), `${rel}: no telemetry or analytics`);
  for (const h of t.match(/https?:\/\/[a-zA-Z0-9.-]+/g) || []) check(ALLOWED_HOSTS.has(h.replace(/^https?:\/\//, '')), `${rel}: unexpected host ${h}`);
}

// ---- runtime: every request in a real browser ----
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(new URL(req.url!, 'http://x').pathname));
  if (p.endsWith('/')) p += 'index.html';
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
const ORIGIN = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
const outside: string[] = [];
const errors: string[] = [];
page.on('request', (r: { url(): string }) => {
  if (!r.url().startsWith(ORIGIN) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url());
});
page.on('pageerror', (e: Error) => errors.push(String(e)));
await page.goto(ORIGIN + '/use/', { waitUntil: 'networkidle' });
const tabs = page.locator('[aria-label] > button[type="button"]');
const n = await tabs.count();
check(n >= 5, `found the tabs (${n})`);
for (let i = 0; i < n; i++) {
  await tabs.nth(i).click();
  await page.waitForLoadState('networkidle');
}
await page.getByRole('button', { name: 'Licences' }).or(page.getByRole('button', { name: 'लाइसेंस' })).first().click();
// Poll from Node (waitForFunction evaluates a string in the page on some
// Playwright versions, which this page's CSP blocks).
for (let i = 0; i < 100; i++) {
  if (((await page.textContent('[aria-labelledby="licences-title"] pre')) || '').includes('Apache License')) break;
  await new Promise((r) => setTimeout(r, 100));
}
check(((await page.textContent('[aria-labelledby="licences-title"] pre')) || '').includes('Qwen2.5-0.5B-Instruct'), 'Licences view shows the model notice');
await page.waitForLoadState('networkidle');
check(outside.length === 0, 'no request left the site: ' + outside.join(', '));
check(errors.length === 0, 'no page errors: ' + errors.join(' | '));
await browser.close();
server.close();

if (fails.length) {
  console.log(`FAIL ${fails.length}/${checks}`);
  fails.forEach((m) => console.log('  FAIL | ' + m));
  process.exit(1);
}
console.log(`OK ${checks}/${checks} network checks`);
