#!/usr/bin/env node
// manifest-check for the Thoth TWA (no network, no Android SDK needed).
// Fails on: wrong TWA manifest values or URLs that the site does not serve;
// app/public/site.webmanifest not Hindi / not standalone / icons wrong / no
// "by Elghaly LLC" / banned words; targetSdk not 35; signing values that are
// not environment reads, or signing material in the repo; assetlinks that is
// neither the TODO placeholder nor well-formed fingerprints (no guessed key).
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
// Signing may only come from environment variables (CI secrets): every
// signing value must be a System.getenv(...) read, never a literal.
const signLines = gradle.split('\n').filter((l) => /\b(storeFile|storePassword|keyAlias|keyPassword)\b/.test(l));
check(signLines.length === 4, 'android: exactly 4 signing lines (store file, store password, alias, key password)');
check(signLines.every((l) => /storeFile file\(uploadStore\)|System\.getenv\('THOTH_UPLOAD_[A-Z_]+'\)/.test(l)), 'android: every signing value comes from an environment variable');
check(/def uploadStore = System\.getenv\('THOTH_UPLOAD_STORE_FILE'\)/.test(gradle) && /if \(uploadStore\) signingConfig signingConfigs\.upload/.test(gradle), 'android: signing only when the CI variable is set (unsigned otherwise)');
check(!/['"][^'"]*\.(jks|keystore|p12)['"]/.test(gradle), 'android: no keystore path written in build.gradle');
const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
check(!tracked.some((f) => /\.(jks|keystore|p12)$|keystore\.properties$/.test(f)), 'repo: no signing material tracked');
const mf = read('android/app/src/main/AndroidManifest.xml');
check(!/uses-permission/.test(mf), 'android: wrapper asks for no permissions');
check(/https:\/\/thoth\.elghaly\.dev\/use\//.test(gradle), 'android: opens /use/');
// Deep-link filter: https only, the exact host, and only /use or /use/...
// (no wildcard host, no pathPattern, no http, no other paths).
const viewFilters = [...mf.matchAll(/<intent-filter[^>]*>([\s\S]*?)<\/intent-filter>/g)].map((m) => m[0]).filter((f) => /android\.intent\.action\.VIEW/.test(f));
check(viewFilters.length === 1, 'android: exactly one VIEW (deep-link) intent filter');
const vf = viewFilters[0] || '';
const attr = (name) => [...vf.matchAll(new RegExp(`android:${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const gradleHost = (gradle.match(/hostName\s*:\s*'([^']+)'/) || [])[1];
check(/android:autoVerify="true"/.test(vf), 'android: deep-link filter is autoVerify');
check(JSON.stringify(attr('scheme')) === '["https"]', `android: deep-link scheme is https only (got ${attr('scheme')})`);
check(JSON.stringify(attr('host')) === '["thoth.elghaly.dev"]' && gradleHost === 'thoth.elghaly.dev' && twa.host === 'thoth.elghaly.dev', `android: deep-link host is exactly thoth.elghaly.dev and matches build.gradle + twa-manifest (got ${attr('host')})`);
check(JSON.stringify(attr('path')) === '["/use"]' && JSON.stringify(attr('pathPrefix')) === '["/use/"]', `android: deep-link paths are /use and /use/ only (got path=${attr('path')} prefix=${attr('pathPrefix')})`);
check(attr('pathPattern').length === 0 && attr('pathAdvancedPattern').length === 0 && attr('pathSuffix').length === 0 && attr('port').length === 0, 'android: no pathPattern/pathSuffix/port in the deep-link filter');
check(!/REPLACE_|\$\{hostName\}|\*/.test(vf), 'android: deep-link filter has no placeholder or wildcard');
check(['', '/', '/agent/', '/index.html'].every((p) => !(p === '/use' || p.startsWith('/use/'))) && ['/use', '/use/', '/use/index.html'].every((p) => p === '/use' || p.startsWith('/use/')), 'android: /use paths open the app, /, /agent/ stay in the browser');

const al = JSON.parse(read('.well-known/assetlinks.json'));
const fp = al[0].target.sha256_cert_fingerprints;
const FP = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const placeholder = fp.length === 1 && /^REPLACE_WITH_/.test(fp[0]);
check(placeholder || (fp.length >= 1 && fp.length <= 2 && fp.every((f) => FP.test(f)) && new Set(fp).size === fp.length),
  'assetlinks: either the TODO placeholder, or 1-2 real SHA-256 fingerprints (AA:BB:… 32 bytes), never a mix');
check(al.length === 1 && al[0].target.package_name === 'dev.elghaly.thoth' && al[0].relation[0] === 'delegate_permission/common.handle_all_urls', 'assetlinks: package and relation');
if (placeholder) console.log('assetlinks: TODO placeholder still in place (owner fills it from Play Console)');

if (fails.length) { console.log(`manifest-check: FAIL ${fails.length}/${checks}`); fails.forEach((m) => console.log('  FAIL | ' + m)); process.exit(1); }
console.log(`manifest-check: PASS ${checks}/${checks}`);
