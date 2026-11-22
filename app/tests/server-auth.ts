/**
 * Items 2-4 + 7: proxy auth, cookie flags, Origin and log redaction.
 * Unit checks on server-security.ts, then the real server.ts (production
 * mode, dummy key, local provider stub) with THOTH_PROXY_SECRET set:
 * - a page load sets no cookie (the secret is never handed out);
 * - POST /api/session refuses a missing/foreign Origin (403) and a wrong
 *   secret (401); with the right secret it sets thoth-session with
 *   Secure, HttpOnly, SameSite=Strict, Path=/api, and the value is a
 *   signed token that does not contain the secret;
 * - that cookie authorizes /api/chat; a tampered or absent cookie -> 401;
 * - /api/chat with a missing Origin or a foreign Origin -> 403;
 * - the server log never contains the Gemini key or the proxy secret,
 *   even when the provider error echoes the key.
 * Needs `npm run build` first (dist/). Run: npm run test:auth
 */
import { spawn, type ChildProcess } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';
import {
  checkOrigin,
  issueSessionToken,
  redact,
  secretsEqual,
  verifySessionToken,
  SESSION_COOKIE_OPTIONS,
} from '../server-security';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks++;
  if (!ok) fails.push(msg);
};

// Test-only values, generated per run; not real credentials.
const KEY = 'AIza' + 'T'.repeat(8) + Math.random().toString(36).slice(2).padEnd(27, 'x');
const SECRET = 'test-proxy-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

// ---- unit: server-security.ts ----
check(secretsEqual('abc', 'abc') && !secretsEqual('abc', 'abd') && !secretsEqual('', ''), 'secretsEqual');
const tok = issueSessionToken(SECRET);
check(!tok.includes(SECRET), 'session token does not contain the secret');
check(verifySessionToken(SECRET, tok), 'fresh token verifies');
check(!verifySessionToken('other-secret', tok), 'token signed with another secret fails');
check(!verifySessionToken(SECRET, tok.slice(0, -1) + (tok.endsWith('A') ? 'B' : 'A')), 'tampered signature fails');
check(!verifySessionToken(SECRET, tok.replace(/^v1\.(\d+)/, (_m, n) => `v1.${Number(n) + 999}`)), 'tampered expiry fails');
check(!verifySessionToken(SECRET, issueSessionToken(SECRET, Date.now() - 13 * 3600_000)), 'expired token fails');
check(!verifySessionToken(SECRET, SECRET) && !verifySessionToken(SECRET, null), 'raw secret / null is not a token');
check(SESSION_COOKIE_OPTIONS.secure && SESSION_COOKIE_OPTIONS.httpOnly && SESSION_COOKIE_OPTIONS.sameSite === 'strict', 'cookie options: Secure, HttpOnly, SameSite=Strict');
check(checkOrigin('POST', undefined, 'a.test') === 'missing', 'POST without Origin -> missing');
check(checkOrigin('POST', 'https://evil.test', 'a.test') === 'foreign', 'POST foreign Origin -> foreign');
check(checkOrigin('POST', 'null', 'a.test') === 'foreign', 'Origin "null" -> foreign');
check(checkOrigin('POST', 'https://a.test', 'a.test') === 'ok', 'same Origin -> ok');
check(checkOrigin('GET', undefined, 'a.test') === 'ok', 'same-origin GET without Origin -> ok');
check(checkOrigin('GET', 'https://evil.test', 'a.test') === 'foreign', 'GET foreign Origin -> foreign');
const red = redact(
  `key=${KEY} Authorization: Bearer ${SECRET} cookie: thoth-session=${tok} x-thoth-proxy-secret: ${SECRET} {"token":"abc123"} https://x/y?key=${KEY}`,
  [KEY, SECRET]
);
check(!red.includes(KEY) && !red.includes(SECRET) && !red.includes(tok) && !red.includes('abc123'), `redact scrubs keys, secrets and tokens (got ${red})`);
check(!redact(new Error(`API key not valid: ${KEY}`)).includes(KEY), 'redact scrubs AIza keys inside an Error');
check(redact('Model gemini-x returned an empty response') === 'Model gemini-x returned an empty response', 'redact leaves plain text alone');

// ---- static: no page-load cookie, every log goes through redact ----
const src = fs.readFileSync(path.join(APP, 'server.ts'), 'utf8');
check(!/res\.cookie\([^)]*THOTH_PROXY_SECRET\s*,/.test(src), 'server never puts the raw secret in a cookie');
check((src.match(/res\.cookie\(/g) || []).length === 1, 'exactly one res.cookie call (POST /api/session)');
check(!/console\.(error|warn)\([^)]*(error|err|modelErr)\b/.test(src), 'no console.error/warn of a raw error object');

if (!fs.existsSync(path.join(APP, 'dist', 'index.html'))) {
  console.log('server-auth: dist/ missing, run `npm run build` first');
  process.exit(1);
}

// ---- provider stub: echoes the key it received in its error, like a careless upstream ----
const stub = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (body.includes('STUB_OK')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'stub reply' }] } }] }));
      return;
    }
    const seen = String(req.headers['x-goog-api-key'] || '') + ' ' + (req.url || '');
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 500, message: `upstream saw ${seen}`, status: 'INTERNAL' } }));
  });
});
await new Promise<void>((r) => stub.listen(0, '127.0.0.1', r));
const stubPort = (stub.address() as AddressInfo).port;

let log = '';
async function startServer(port: number): Promise<ChildProcess> {
  const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: APP,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODE_ENV: 'production',
      PORT: String(port),
      GEMINI_API_KEY: KEY,
      GEMINI_API_BASE_URL: `http://127.0.0.1:${stubPort}`,
      THOTH_PROXY_SECRET: SECRET,
      TRUST_PROXY_HOPS: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout!.on('data', (d) => (log += d));
  child.stderr!.on('data', (d) => (log += d));
  for (let i = 0; i < 100; i++) {
    if (log.includes('Thoth server running')) return child;
    await new Promise((r) => setTimeout(r, 100));
  }
  child.kill();
  throw new Error('server did not start');
}

const P = 41000 + Math.floor(Math.random() * 500);
const base = `http://127.0.0.1:${P}`;
const chatBody = JSON.stringify({ messages: [{ role: 'user', content: 'STUB_OK hi' }], userLanguage: 'Arabic' });
async function req(p: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  const r = await fetch(base + p, { method: init.method || 'POST', headers: { 'content-type': 'application/json', ...(init.headers || {}) }, body: init.body, redirect: 'manual' });
  return { status: r.status, setCookie: r.headers.get('set-cookie') || '', text: await r.text() };
}

const s = await startServer(P);
try {
  const page = await fetch(base + '/');
  await page.text();
  check(page.status === 200 && !page.headers.get('set-cookie'), `page load sets no cookie (got ${page.headers.get('set-cookie')})`);

  const noOrigin = await req('/api/session', { headers: { 'x-thoth-proxy-secret': SECRET } });
  check(noOrigin.status === 403 && !noOrigin.setCookie, `POST /api/session without Origin -> 403, no cookie (got ${noOrigin.status})`);
  const foreign = await req('/api/session', { headers: { origin: 'https://evil.example', 'x-thoth-proxy-secret': SECRET } });
  check(foreign.status === 403 && !foreign.setCookie, `POST /api/session foreign Origin -> 403 (got ${foreign.status})`);
  const wrong = await req('/api/session', { headers: { origin: base, 'x-thoth-proxy-secret': 'wrong' } });
  check(wrong.status === 401 && !wrong.setCookie, `POST /api/session wrong secret -> 401, no cookie (got ${wrong.status})`);

  const ok = await req('/api/session', { headers: { origin: base, authorization: `Bearer ${SECRET}` } });
  const sc = ok.setCookie;
  check(ok.status === 204, `POST /api/session right secret -> 204 (got ${ok.status})`);
  check(/^thoth-session=v1\.\d+\.[A-Za-z0-9_-]{43};/.test(sc), `Set-Cookie carries a signed token (got ${sc.replace(/=[^;]+/, '=<token>')})`);
  check(/;\s*Secure/i.test(sc) && /;\s*HttpOnly/i.test(sc) && /;\s*SameSite=Strict/i.test(sc) && /;\s*Path=\/api/i.test(sc), `cookie flags Secure, HttpOnly, SameSite=Strict, Path=/api (got ${sc.replace(/=[^;]+/, '=<token>')})`);
  check(!sc.includes(SECRET), 'cookie never contains the proxy secret');
  const cookie = sc.split(';')[0];

  const authed = await req('/api/chat', { headers: { origin: base, cookie }, body: chatBody });
  check(authed.status === 200 && JSON.parse(authed.text).reply === 'stub reply', `session cookie authorizes /api/chat (got ${authed.status})`);
  const noAuth = await req('/api/chat', { headers: { origin: base }, body: chatBody });
  check(noAuth.status === 401, `no cookie, no secret -> 401 (got ${noAuth.status})`);
  const tampered = await req('/api/chat', { headers: { origin: base, cookie: cookie.slice(0, -2) + 'zz' }, body: chatBody });
  check(tampered.status === 401, `tampered cookie -> 401 (got ${tampered.status})`);
  const rawSecretCookie = await req('/api/chat', { headers: { origin: base, cookie: `thoth-session=${SECRET}` }, body: chatBody });
  check(rawSecretCookie.status === 401, `raw secret as cookie -> 401 (got ${rawSecretCookie.status})`);
  const missingOrigin = await req('/api/chat', { headers: { cookie }, body: chatBody });
  check(missingOrigin.status === 403, `/api/chat without Origin -> 403 (got ${missingOrigin.status})`);
  const foreignOrigin = await req('/api/chat', { headers: { origin: 'https://evil.example', cookie }, body: chatBody });
  check(foreignOrigin.status === 403, `/api/chat foreign Origin -> 403 (got ${foreignOrigin.status})`);
  const health = await fetch(base + '/api/health');
  check(health.status === 200, `same-origin GET /api/health without Origin still works (got ${health.status})`);

  // Provider failure that echoes the key: the response stays generic and the log is redacted.
  const fail = await req('/api/pitch', { headers: { origin: base, cookie }, body: JSON.stringify({ product: 'brass lamps' }) });
  check(fail.status >= 500 && !fail.text.includes(KEY), `provider failure -> generic error (got ${fail.status})`);
  await new Promise((r) => setTimeout(r, 300));
  check(log.includes('[REDACTED]'), 'the echoed key was logged only as [REDACTED]');
  check(!log.includes(KEY), 'server log never contains the Gemini key');
  check(!log.includes(SECRET), 'server log never contains the proxy secret');
} finally {
  s.kill();
  stub.close();
}

if (fails.length) {
  console.log(`server-auth: FAIL ${fails.length}/${checks}`);
  for (const f of fails) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`server-auth: PASS ${checks}/${checks}`);
