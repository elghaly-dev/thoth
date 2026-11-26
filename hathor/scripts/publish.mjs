// Builds Hathor for https://thoth.elghaly.dev/hathor/ and writes the built page and its files into
// this folder, which the site serves as it is (no build runs on the host). Run after any change
// under src/, public/ or app.html, and commit what it writes; hathor-checks fails when they differ.
// Written here: index.html, assets/, manifest.webmanifest, sw.js, icon.svg, icon-192.png, icon-512.png.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const here = new URL('..', import.meta.url).pathname;
const dist = join(here, 'dist');
rmSync(dist, { recursive: true, force: true });
execFileSync('npx', ['vite', 'build', '--logLevel', 'warn'], { cwd: here, stdio: 'inherit', env: { ...process.env, HATHOR_BASE: '/hathor/' } });
renameSync(join(dist, 'app.html'), join(dist, 'index.html'));
rmSync(join(here, 'assets'), { recursive: true, force: true });
for (const name of readdirSync(dist)) cpSync(join(dist, name), join(here, name), { recursive: true });
for (const must of ['index.html', 'assets', 'sw.js', 'manifest.webmanifest']) if (!existsSync(join(here, must))) throw new Error('publish: missing ' + must);
rmSync(dist, { recursive: true, force: true });
console.log('published: index.html, assets/ and the shell files in hathor/');
