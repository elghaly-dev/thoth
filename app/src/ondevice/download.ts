/**
 * Download the model files once, after the user taps the button, and keep
 * only files whose sha256 matches the manifest. Verified files go into the
 * caches WebLLM reads from, so WebLLM never downloads anything itself.
 * A small record of what was verified lives in its own cache, so the next
 * start does not re-hash a gigabyte.
 */
import { cacheScopeFor, fileUrl, type ModelFile, type ModelManifest } from './manifest';

export const VERIFIED_CACHE = 'thoth/verified-model';

export interface DownloadDeps {
  fetchImpl?: typeof fetch;
  cachesImpl?: CacheStorage;
  digest?: (data: ArrayBuffer) => Promise<ArrayBuffer>;
}

export interface Progress {
  doneBytes: number;
  totalBytes: number;
  file: string;
}

export type DownloadResult =
  | { ok: true }
  | { ok: false; file: string; reason: 'hash' | 'size' | 'http' | 'network' | 'aborted' };

export async function sha256Hex(data: ArrayBuffer, digest?: DownloadDeps['digest']): Promise<string> {
  const d = await (digest ?? ((b: ArrayBuffer) => crypto.subtle.digest('SHA-256', b)))(data);
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('');
}

function allFiles(m: ModelManifest): ModelFile[] {
  return [...(m.modelLib ? [m.modelLib] : []), ...m.files];
}

async function isVerified(caches: CacheStorage, url: string, sha: string): Promise<boolean> {
  const v = await caches.open(VERIFIED_CACHE);
  const r = await v.match(url);
  return !!r && (await r.text()) === sha;
}

/** True when every file of the manifest has been downloaded and verified. */
export async function allVerified(m: ModelManifest, deps: DownloadDeps = {}): Promise<boolean> {
  const caches = deps.cachesImpl ?? globalThis.caches;
  if (!caches) return false;
  for (const f of allFiles(m)) {
    const url = fileUrl(m, f);
    if (!(await isVerified(caches, url, f.sha256))) return false;
    if (!(await (await caches.open(cacheScopeFor(m, f))).match(url))) return false;
  }
  return true;
}

export async function downloadAndVerify(
  m: ModelManifest,
  onProgress: (p: Progress) => void,
  signal?: AbortSignal,
  deps: DownloadDeps = {},
): Promise<DownloadResult> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const caches = deps.cachesImpl ?? globalThis.caches;
  const files = allFiles(m);
  const total = files.reduce((s, f) => s + f.bytes, 0);
  let done = 0;
  for (const f of files) {
    const url = fileUrl(m, f);
    if (signal?.aborted) return { ok: false, file: f.path, reason: 'aborted' };
    const scope = await caches.open(cacheScopeFor(m, f));
    if ((await isVerified(caches, url, f.sha256)) && (await scope.match(url))) {
      done += f.bytes;
      onProgress({ doneBytes: done, totalBytes: total, file: f.path });
      continue;
    }
    let res: Response;
    try {
      // No cookies, no referrer, no shared HTTP cache: the file is fetched as is.
      res = await fetchImpl(url, { mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal });
    } catch {
      return { ok: false, file: f.path, reason: signal?.aborted ? 'aborted' : 'network' };
    }
    if (!res.ok) return { ok: false, file: f.path, reason: 'http' };
    const buf = await res.arrayBuffer();
    if (buf.byteLength !== f.bytes) return { ok: false, file: f.path, reason: 'size' };
    if ((await sha256Hex(buf, deps.digest)) !== f.sha256) return { ok: false, file: f.path, reason: 'hash' };
    const type = f.path.endsWith('.json') ? 'application/json' : f.path.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream';
    await scope.put(url, new Response(buf, { headers: { 'Content-Type': type, 'Content-Length': String(buf.byteLength) } }));
    await (await caches.open(VERIFIED_CACHE)).put(url, new Response(f.sha256));
    done += f.bytes;
    onProgress({ doneBytes: done, totalBytes: total, file: f.path });
  }
  return { ok: true };
}

/** Remove the model from the phone (all three WebLLM caches and our record). */
export async function removeModel(deps: DownloadDeps = {}): Promise<void> {
  const caches = deps.cachesImpl ?? globalThis.caches;
  for (const name of ['webllm/config', 'webllm/wasm', 'webllm/model', VERIFIED_CACHE]) await caches.delete(name);
}
