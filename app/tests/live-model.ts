/**
 * Manual, not in CI (downloads ~0.3 GB): run the app's own downloader against
 * the live models.elghaly.dev and check every file against the pinned manifest.
 * Uses Node's fetch (no browser CORS) and an in-memory Cache Storage.
 * Run: npm run test:live-model
 */
import { webcrypto } from 'node:crypto';
import { MANIFEST, isReady, totalBytes, fileUrl, cacheScopeFor } from '../src/ondevice/manifest';
import { allVerified, downloadAndVerify } from '../src/ondevice/download';

class MemCache {
  m = new Map<string, Response>();
  async match(u: string) {
    const r = this.m.get(u);
    return r ? r.clone() : undefined;
  }
  async put(u: string, r: Response) {
    this.m.set(u, r);
  }
}
class MemCaches {
  c = new Map<string, MemCache>();
  async open(n: string) {
    if (!this.c.has(n)) this.c.set(n, new MemCache());
    return this.c.get(n)!;
  }
  async delete(n: string) {
    return this.c.delete(n);
  }
}
if (!isReady()) {
  console.log('manifest not ready; nothing to check');
  process.exit(1);
}
const caches = new MemCaches() as unknown as CacheStorage;
const t0 = Date.now();
let last = 0;
const r = await downloadAndVerify(
  MANIFEST,
  (p) => {
    if (p.doneBytes - last > 50e6 || p.doneBytes === p.totalBytes) {
      last = p.doneBytes;
      console.log(`  ${(p.doneBytes / 1e6).toFixed(0)} / ${(p.totalBytes / 1e6).toFixed(0)} MB  ${p.file}`);
    }
  },
  undefined,
  { cachesImpl: caches, digest: (b) => webcrypto.subtle.digest('SHA-256', b) },
);
if (!r.ok) {
  console.log('FAIL', JSON.stringify(r));
  process.exit(1);
}
const ok = await allVerified(MANIFEST, { cachesImpl: caches });
const scopes = new Set([MANIFEST.modelLib!, ...MANIFEST.files].map((f) => cacheScopeFor(MANIFEST, f) + ' ' + fileUrl(MANIFEST, f).split('/').pop()));
console.log(ok ? `OK all ${scopes.size} files match their sha256 (${totalBytes()} bytes) in ${((Date.now() - t0) / 1000).toFixed(0)} s` : 'FAIL not all verified');
process.exit(ok ? 0 : 1);
