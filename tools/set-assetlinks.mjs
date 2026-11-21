#!/usr/bin/env node
// Write .well-known/assetlinks.json from the SHA-256 certificate fingerprint(s)
// the owner copies from Play Console (Setup > App signing). Public values only.
// Usage: node tools/set-assetlinks.mjs <app-signing SHA-256> [<upload-key SHA-256>]
// The first argument must be the Play App Signing key; the upload key is optional.
import fs from 'node:fs';

const FP = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const fps = process.argv.slice(2).map((s) => s.trim().toUpperCase());
if (fps.length < 1 || fps.length > 2) { console.error('give 1 or 2 fingerprints'); process.exit(2); }
for (const f of fps) if (!FP.test(f)) { console.error(`not a SHA-256 fingerprint (AA:BB:… 32 bytes): ${f}`); process.exit(2); }
if (new Set(fps).size !== fps.length) { console.error('the two fingerprints are the same'); process.exit(2); }

const out = [{
  relation: ['delegate_permission/common.handle_all_urls'],
  target: { namespace: 'android_app', package_name: 'dev.elghaly.thoth', sha256_cert_fingerprints: fps },
}];
fs.writeFileSync('.well-known/assetlinks.json', JSON.stringify(out, null, 2) + '\n');
console.log(`assetlinks.json written with ${fps.length} fingerprint(s). Run: node tools/check-twa.mjs`);
