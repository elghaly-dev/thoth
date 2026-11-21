#!/usr/bin/env node
// manifest-check for the Thoth TWA (no network, no Android SDK needed).
// Fails on: wrong TWA manifest values or URLs that the site does not serve;
// app/public/site.webmanifest not Hindi / not standalone / icons wrong / no
// "by Elghaly LLC" / banned words; targetSdk not 35; any signing config or
// signing material; assetlinks without its TODO placeholder (no guessed key).
// Run: node tools/check-twa.mjs
import fs from 'node:fs';
import { execSync } from 'node:child_process';

let checks = 0;
const fails = [];
const check = (ok, msg) => { checks++; if (!ok) fails.push(msg); };
const read = (p) => fs.readFileSync(p, 'utf8');
const BANNED = [/\bfree\b|मुफ़्त|مجان|免费/i, new RegExp('\\bsa' + 'fe\\b', 'i'), /آمن/, /\bAI\b/];

const twa = JSON.parse(read('twa-manifest.json'));
check(twa.packageId === 'dev.elghaly.thoth' && twa.host === 'thoth.elghaly.dev', 'twa: package and host');
check(twa.startUrl === '/use/', 'twa: startUrl /use/');
check(twa.themeColor === '#0b0c10' && twa.backgroundColor === '#0b0c10', 'twa: colours #0b0c10');
for (const k of ['iconUrl', 'maskableIconUrl', 'webManifestUrl']) {
  const u = new URL(twa[k]);
  check(u.host === 'thoth.elghaly.dev' && fs.existsSync('.' + u.pathname), `twa: ${k} ${u.pathname} is a file in this repo`);
}
check(!twa.signingKey || !fs.existsSync(twa.signingKey.path), 'twa: no keystore file present');

const sw = JSON.parse(read('app/public/site.webmanifest'));
check(sw.lang === 'hi' && sw.display === 'standalone', 'site.webmanifest: lang hi, display standalone');
check(/by Elghaly LLC/.test(sw.name), 'site.webmanifest: name reads "by Elghaly LLC"');
const icons = Object.fromEntries(sw.icons.map((i) => [i.sizes, i]));
check(icons['192x192'] && fs.existsSync('app/public/' + icons['192x192'].src), 'site.webmanifest: 192x192 icon exists');
check(icons['512x512'] && icons['512x512'].purpose === 'any maskable' && fs.existsSync('app/public/' + icons['512x512'].src), 'site.webmanifest: 512x512 "any maskable" icon exists');
const pngSize = (p) => { const b = fs.readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)].join('x'); };
check(pngSize('app/public/icon-192.png') === '192x192' && pngSize('app/public/icon-512.png') === '512x512', 'icon files have the stated pixel sizes');
for (const v of [sw.name, sw.short_name, sw.description]) for (const re of BANNED) check(!re.test(v), `site.webmanifest: no banned word ${re} in "${v}"`);
check(fs.existsSync('use/site.webmanifest'), 'use/ build carries site.webmanifest');

const gradle = read('android/app/build.gradle');
check(/targetSdk 35\b/.test(gradle) && /compileSdk 35\b/.test(gradle), 'android: compileSdk/targetSdk 35');
check(/applicationId 'dev\.elghaly\.thoth'/.test(gradle), 'android: applicationId dev.elghaly.thoth');
check(!/signingConfig|storePassword|keyPassword|storeFile/.test(gradle), 'android: no signing config (unsigned)');
const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
check(!tracked.some((f) => /\.(jks|keystore|p12)$|keystore\.properties$/.test(f)), 'repo: no signing material tracked');
const mf = read('android/app/src/main/AndroidManifest.xml');
check(!/uses-permission/.test(mf), 'android: wrapper asks for no permissions');
check(/https:\/\/thoth\.elghaly\.dev\/use\//.test(gradle), 'android: opens /use/');

const al = JSON.parse(read('.well-known/assetlinks.json'));
const fp = al[0].target.sha256_cert_fingerprints;
check(fp.length === 1 && /^REPLACE_WITH_/.test(fp[0]), 'assetlinks: fingerprint is still the TODO placeholder (never guessed)');

if (fails.length) { console.log(`manifest-check: FAIL ${fails.length}/${checks}`); fails.forEach((m) => console.log('  FAIL | ' + m)); process.exit(1); }
console.log(`manifest-check: PASS ${checks}/${checks}`);
