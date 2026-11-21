#!/usr/bin/env node
// Write .well-known/assetlinks.json from the SHA-256 certificate fingerprint(s)
// the owner copies from Play Console (Setup > App signing). Public values only.
// Usage: node tools/set-assetlinks.mjs <app-signing SHA-256> [<upload-key SHA-256>]
// The first argument must be the Play App Signing key; the upload key is optional.
import fs from 'node:fs';

const FP = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const fps = process.argv.slice(2).map((s) => s.trim().toUpperCase());
const USAGE = `usage: node tools/set-assetlinks.mjs <app-signing SHA-256> [<upload-key SHA-256>]
example (made-up values, use the ones from Play Console > App integrity > App signing):
  node tools/set-assetlinks.mjs \\
    14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5 \\
    9A:2B:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD`;
if (fps.length < 1 || fps.length > 2) { console.error(USAGE); process.exit(2); }
for (const f of fps) if (!FP.test(f)) { console.error(`not a SHA-256 fingerprint (AA:BB:… 32 bytes): ${f}\n${USAGE}`); process.exit(2); }
if (new Set(fps).size !== fps.length) { console.error('the two fingerprints are the same'); process.exit(2); }

const out = [{
  relation: ['delegate_permission/common.handle_all_urls'],
  target: { namespace: 'android_app', package_name: 'dev.elghaly.thoth', sha256_cert_fingerprints: fps },
}];
fs.writeFileSync('.well-known/assetlinks.json', JSON.stringify(out, null, 2) + '\n');
console.log(`assetlinks.json written with ${fps.length} fingerprint(s). Run: node tools/check-twa.mjs`);
