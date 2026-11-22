import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`pages-redirect: FAIL -- ${msg}`);
    process.exit(1);
  }
}

const APP = dirname(fileURLToPath(import.meta.url)).replace(/\/tests$/, '');
const REPO = join(APP, '..');
const sourcePath = join(APP, 'index.html');
const builtPath = join(REPO, 'use/index.html');
const source = readFileSync(sourcePath, 'utf8');

assert(existsSync(builtPath), 'use/index.html must exist (run npm run build:pages)');
const built = readFileSync(builtPath, 'utf8');

assert(
  /<script\b[^>]*\bdata-app-redirect\b/.test(source),
  'app/index.html fallback script must be marked data-app-redirect',
);

const timeoutIdx = source.indexOf('setTimeout(function () {');
assert(timeoutIdx !== -1, 'app/index.html must keep the /app/ fallback setTimeout');
const afterOpen = source.slice(timeoutIdx + 'setTimeout(function () {'.length);
const firstLine = afterOpen.split('\n').map((l) => l.trim()).filter(Boolean)[0] || '';
const GUARD = "if (!/^\\/app(\\/|$)/.test(location.pathname)) return;";
assert(
  firstLine === GUARD,
  `first line inside setTimeout must be exactly ${GUARD} (got: ${firstLine})`,
);

// Built page: the inline redirect would violate script-src 'self', so it is stripped.
assert(
  !built.includes("window.location.replace('/use/')"),
  'built use/index.html must not contain the /app/ fallback redirect (it would reload /use/ and violate CSP)',
);
assert(
  !/\bdata-app-redirect\b/.test(built),
  'built use/index.html must not keep the data-app-redirect script',
);
assert(
  /http-equiv="Content-Security-Policy"/.test(built),
  'built use/index.html must include the pages-hardening CSP meta tag',
);
assert(
  /script-src 'self'/.test(built) &&
    /connect-src 'self' https:\/\/generativelanguage\.googleapis\.com/.test(built),
  'built CSP must allow same-origin scripts and Google Generative Language connect-src',
);

// Source-guard simulation: only unmounted /app and /app/... may redirect.
// This is also what npm run dev serves at `/` — the script must no-op there.
function wouldRedirect(pathname: string, mounted: boolean): boolean {
  if (!/^\/app(\/|$)/.test(pathname)) return false;
  return !mounted;
}

assert(!wouldRedirect('/', false), 'dev server path / must not redirect');
assert(!wouldRedirect('/use', false), 'pathname /use must not redirect to itself');
assert(!wouldRedirect('/use/', false), 'pathname /use/ must not redirect to itself');
assert(!wouldRedirect('/use/index.html', false), 'pathname /use/index.html must not redirect');
assert(wouldRedirect('/app', false), 'unbuilt /app should redirect when unmounted');
assert(wouldRedirect('/app/', false), 'unbuilt /app/ should redirect when unmounted');
assert(wouldRedirect('/app/index.html', false), 'unbuilt /app/index.html should redirect when unmounted');
assert(!wouldRedirect('/app/', true), 'a mounted /app/ page must not redirect');
assert(!wouldRedirect('/application', false), 'paths that only start with "app" as a prefix must not redirect');

console.log('pages-redirect: PASS -- /app/ fallback is source-only, /use/ cannot redirect to itself.');
