/**
 * Server hardening checks. Starts the real server.ts (production mode)
 * against a local stub of the provider API, with a dummy key, and checks:
 * - 20 requests/minute per client on /api/* (21st -> 429), and a spoofed
 *   X-Forwarded-For does not reset the count when TRUST_PROXY_HOPS=0;
 * - strict input validation (unknown fields, wrong types, oversize -> 400);
 * - JSON body limit 100kb (-> 413), malformed JSON (-> 400);
 * - every failure body is exactly "Request failed" / "Invalid request" and
 *   never echoes a provider error message;
 * - unknown /api paths answer a JSON 404, not the SPA page;
 * - the SPA fallback still serves index.html for app routes;
 * - generateWithFallback clears its timeout;
 * - security headers (CSP + frame-ancestors, nosniff, Referrer-Policy,
 *   X-Frame-Options, HSTS) on pages, API 404s and API errors;
 * - <html lang/dir> on the SPA shell follows Accept-Language.
 * Session cookie, Origin and log redaction: tests/server-auth.ts.
 * Needs `npm run build` first (dist/). Run: npm run test:server
 */
import { spawn, type ChildProcess } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LEAK = 'PROVIDER-INTERNAL-DETAIL-7f3a';
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks++;
  if (!ok) fails.push(msg);
};

if (!fs.existsSync(path.join(APP, 'dist', 'index.html'))) {
  console.log('server-hardening: dist/ missing, run `npm run build` first');
  process.exit(1);
}

// ---- static checks on server.ts ----
const src = fs.readFileSync(path.join(APP, 'server.ts'), 'utf8');
check(/clearTimeout\(timer\)/.test(src), 'generateWithFallback clears its timeout');
check(!/json\(\{\s*error:\s*[^}]*\.message/.test(src), 'no response body built from an error message');
check(src.includes("express.json({ limit: '100kb' })"), 'JSON limit is 100kb');
check(!/console\.(log|warn|error)\([^)]*\b(err|error|modelErr|req\.body|body|apiKey|GEMINI_API_KEY|THOTH_PROXY_SECRET)\b/.test(src.replace(/function logFailure[\s\S]*?\n}\n/, '').replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, "''")), 'no log line prints an error object, a body, a key or a secret');
check(/app\.set\('trust proxy', TRUST_PROXY_HOPS\)/.test(src), 'trust proxy is a hop count, not true');

// ---- provider stub ----
const stub = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (body.includes('STUB_OK')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'stub reply' }] } }] }));
      return;
    }
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 500, message: LEAK, status: 'INTERNAL' } }));
  });
});
await new Promise<void>((r) => stub.listen(0, '127.0.0.1', r));
const stubPort = (stub.address() as AddressInfo).port;

async function startServer(port: number): Promise<ChildProcess> {
  const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: APP,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODE_ENV: 'production',
      PORT: String(port),
      GEMINI_API_KEY: 'dummy-test-key-not-real',
      GEMINI_API_BASE_URL: `http://127.0.0.1:${stubPort}`,
      THOTH_PROXY_SECRET: '',
      TRUST_PROXY_HOPS: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout!.on('data', (d) => (log += d));
  child.stderr!.on('data', (d) => (log += d));
  for (let i = 0; i < 100; i++) {
    if (log.includes('Thoth server running')) return child;
    await new Promise((r) => setTimeout(r, 100));
  }
  child.kill();
  throw new Error('server did not start');
}

const base = (port: number) => `http://127.0.0.1:${port}`;
async function post(port: number, p: string, body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  // Same-origin like the served page: the server refuses a POST without Origin.
  const r = await fetch(base(port) + p, { method: 'POST', headers: { 'content-type': 'application/json', origin: base(port), ...headers }, body: raw });
  const text = await r.text();
  return { status: r.status, text, ct: r.headers.get('content-type') || '', res: r };
}

// ---- instance 1: validation, error bodies, 404 ----
const P1 = 39000 + Math.floor(Math.random() * 500);
const s1 = await startServer(P1);
try {
  const ok = await post(P1, '/api/chat', { messages: [{ role: 'user', content: 'STUB_OK hello' }], userLanguage: 'English' });
  check(ok.status === 200 && JSON.parse(ok.text).reply === 'stub reply', `valid chat -> 200 stub reply (got ${ok.status} ${ok.text})`);

  const bad: [string, unknown][] = [
    ['/api/chat', { messages: [{ role: 'user', content: 'x' }], extra: 1 }],
    ['/api/chat', { messages: 'not-an-array' }],
    ['/api/chat', { messages: [{ role: 'system', content: 'x' }] }],
    ['/api/chat', { messages: [{ role: 'user', content: 'x'.repeat(4001) }] }],
    ['/api/chat', { messages: Array.from({ length: 31 }, () => ({ role: 'user', content: 'x' })) }],
    ['/api/pitch', { quantity: '10' }],
    ['/api/pitch', { product: 42 }],
    ['/api/pitch', { product: 'x'.repeat(501) }],
    ['/api/translate', { text: 'hi', speakerRole: 'Admin' }],
  ];
  for (const [p, b] of bad) {
    const r = await post(P1, p, b);
    check(r.status === 400 && r.text === '{"error":"Invalid request"}', `${p} ${JSON.stringify(b).slice(0, 60)} -> 400 Invalid request (got ${r.status} ${r.text.slice(0, 80)})`);
  }

  const fail = await post(P1, '/api/pitch', { product: 'brass lamps' });
  check(fail.status >= 500 && fail.text === '{"error":"Request failed"}', `provider failure -> "Request failed" (got ${fail.status} ${fail.text.slice(0, 120)})`);
  check(!fail.text.includes(LEAK), 'provider error message is not echoed');

  const big = await post(P1, '/api/chat', JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(110 * 1024) }] }));
  check(big.status === 413 && big.text === '{"error":"Request failed"}', `body over 100kb -> 413 (got ${big.status} ${big.text.slice(0, 80)})`);

  const malformed = await post(P1, '/api/chat', '{"messages": [');
  check(malformed.status === 400 && malformed.text === '{"error":"Invalid request"}', `malformed JSON -> 400 (got ${malformed.status} ${malformed.text.slice(0, 80)})`);

  const nf = await fetch(base(P1) + '/api/does-not-exist');
  const nfText = await nf.text();
  check(nf.status === 404 && nfText === '{"error":"Not found"}', `GET unknown /api -> JSON 404 (got ${nf.status} ${nfText.slice(0, 60)})`);
  const nf2 = await post(P1, '/api/does-not-exist', {});
  check(nf2.status === 404 && !nf2.text.includes('<html'), 'POST unknown /api -> 404, not the SPA');

  const spa = await fetch(base(P1) + '/some/app/route');
  const spaText = await spa.text();
  check(spa.status === 200 && spaText.includes('<div id="root">'), 'SPA fallback still serves index.html');

  // Security headers on a page, an API 404 and an API error.
  for (const [label, r] of [['page', spa], ['api 404', nf]] as const) {
    const h = r.headers;
    check(h.get('x-content-type-options') === 'nosniff', `${label}: X-Content-Type-Options nosniff`);
    check(h.get('referrer-policy') === 'strict-origin-when-cross-origin', `${label}: Referrer-Policy`);
    check(h.get('x-frame-options') === 'DENY', `${label}: X-Frame-Options DENY`);
    check(!h.get('content-security-policy'), `${label}: no new enforced CSP header (Report-Only first)`);
    const csp = h.get('content-security-policy-report-only') || '';
    check(csp.includes("frame-ancestors 'none'") && csp.includes("script-src 'self'") && csp.includes("object-src 'none'"), `${label}: CSP with frame-ancestors 'none' (got ${csp.slice(0, 80)})`);
    check((h.get('strict-transport-security') || '') === 'max-age=604800', `${label}: HSTS 1 week, no includeSubDomains`);
    check(!h.get('x-powered-by'), `${label}: no X-Powered-By`);
  }
  const errR = await fetch(base(P1) + '/api/pitch', { method: 'POST', headers: { 'content-type': 'application/json', origin: base(P1) }, body: '{"product":"brass"}' });
  check(errR.headers.get('x-content-type-options') === 'nosniff' && (errR.headers.get('content-security-policy-report-only') || '').includes("frame-ancestors 'none'"), 'api error: security headers present');

  // Device language: <html lang/dir> from Accept-Language on the SPA shell.
  const arPage = await fetch(base(P1) + '/', { headers: { 'accept-language': 'ar-EG,ar;q=0.9,en;q=0.8' } });
  const arText = await arPage.text();
  check(arPage.status === 200 && arText.includes('<html lang="ar" dir="rtl">'), 'Accept-Language ar -> <html lang="ar" dir="rtl">');
  check((arPage.headers.get('vary') || '').toLowerCase().includes('accept-language'), 'shell varies on Accept-Language');
  check((arPage.headers.get('cache-control') || '') === 'no-cache', 'shell: Cache-Control no-cache');
  check((arPage.headers.get('vary') || '').toLowerCase().includes('cookie'), 'shell varies on Cookie');
  const get = async (u: string, h: Record<string, string>) => (await (await fetch(base(P1) + u, { headers: h })).text());
  check((await get('/', { cookie: 'lang=hi', 'accept-language': 'ar' })).includes('<html lang="hi" dir="ltr">'), 'lang cookie beats Accept-Language');
  check((await get('/?lang=ar', { cookie: 'lang=hi', 'accept-language': 'en' })).includes('<html lang="ar" dir="rtl">'), '?lang= beats cookie');
  check((await get('/', { cookie: 'lang=xx', 'accept-language': 'ar' })).includes('<html lang="ar" dir="rtl">'), 'unknown cookie ignored');
  check((await get('/', { 'accept-language': 'zh-TW,en;q=0.5' })).includes('<html lang="zh-CN" dir="ltr">'), 'zh-TW -> zh');
  check((await get('/', { 'accept-language': 'ar;q=0, en' })).includes('<html lang="en" dir="ltr">'), 'q=0 excluded');
  const frText = await (await fetch(base(P1) + '/', { headers: { 'accept-language': 'fr-FR' } })).text();
  check(frText.includes('<html lang="en" dir="ltr">'), 'unsupported Accept-Language -> English');
} finally {
  s1.kill();
}

// ---- instance 2: rate limit ----
const P2 = P1 + 600;
const s2 = await startServer(P2);
try {
  const statuses: number[] = [];
  for (let i = 0; i < 21; i++) {
    const r = await post(P2, '/api/pitch', { product: 'x', extra: 'forces a cheap 400' }, { 'x-forwarded-for': `203.0.113.${i}` });
    statuses.push(r.status);
  }
  check(statuses.slice(0, 20).every((s) => s === 400), `first 20 requests pass the limiter (got ${statuses.slice(0, 20).join(',')})`);
  check(statuses[20] === 429, `21st request in a minute -> 429, spoofed X-Forwarded-For ignored (got ${statuses[20]})`);
} finally {
  s2.kill();
  stub.close();
}

if (fails.length) {
  console.log(`server-hardening: FAIL ${fails.length}/${checks}`);
  for (const f of fails) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`server-hardening: PASS ${checks}/${checks}`);
