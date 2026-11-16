import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`pages-redirect: FAIL -- ${msg}`);
    process.exit(1);
  }
}

const appRoot = resolve(new URL('..', import.meta.url).pathname);
const sourcePath = resolve(appRoot, 'index.html');
const builtPath = resolve(appRoot, '..', 'use', 'index.html');

const source = readFileSync(sourcePath, 'utf8');
assert(
  source.includes("window.location.pathname.indexOf('/use') !== 0"),
  'app/index.html must guard the /use/ fallback with pathname.indexOf("/use") !== 0',
);
assert(
  source.includes("window.location.replace('/use/')"),
  'app/index.html must still offer the /use/ fallback for unbuilt /app/',
);

assert(existsSync(builtPath), 'use/index.html is missing — run npm run build:pages first');
const built = readFileSync(builtPath, 'utf8');

// The Vite build copies the fallback script into /use/. It must not
// reload /use/ when already on that path (slow networks would loop).
const replaceIdx = built.indexOf("window.location.replace('/use/')");
assert(replaceIdx !== -1, 'use/index.html should still contain the fallback script from the source');

const ifIdx = built.lastIndexOf('if (', replaceIdx);
assert(ifIdx !== -1 && ifIdx < replaceIdx, 'location.replace(/use/) must sit inside an if-condition');
const condition = built.slice(ifIdx, replaceIdx);
assert(
  condition.includes("window.location.pathname.indexOf('/use') !== 0"),
  'use/index.html must not redirect to /use/ when the path already starts with /use',
);

// Simulate the built-page condition: pathname /use or /use/ must not pass.
function wouldRedirect(pathname: string, mounted: boolean): boolean {
  const rootMissingMounted = !mounted;
  return rootMissingMounted && pathname.indexOf('/use') !== 0;
}
assert(!wouldRedirect('/use', false), 'pathname /use must not redirect to itself');
assert(!wouldRedirect('/use/', false), 'pathname /use/ must not redirect to itself');
assert(!wouldRedirect('/use/index.html', false), 'pathname /use/index.html must not redirect to itself');
assert(wouldRedirect('/app/', false), 'unbuilt /app/ should still redirect when unmounted');
assert(wouldRedirect('/', false), 'site root should still be able to take the fallback if this script ran there unmounted');
assert(!wouldRedirect('/use/', true), 'a mounted /use/ page must not redirect');

console.log('pages-redirect: PASS -- built use/index.html cannot redirect to itself.');
