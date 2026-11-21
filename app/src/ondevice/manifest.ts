/**
 * The on-device Faithful Servant model, pinned file by file.
 *
 * Every file the phone downloads is listed here with its exact size and
 * sha256. Files come from one host only (models.elghaly.dev, also the only
 * extra entry in the page CSP's connect-src). A file whose bytes do not hash
 * to the pinned value is never stored or used.
 */
import raw from './model-manifest.json';

export const MODEL_HOST = 'https://models.elghaly.dev';

export interface ModelFile {
  /** Path relative to `base` (weights, tokenizer, config) or to the host (model library). */
  path: string;
  bytes: number;
  /** Lower-case hex sha256 of the file's bytes. */
  sha256: string;
}

export interface ModelManifest {
  schema: 1;
  status: 'pending' | 'ready';
  note?: string;
  modelId: string;
  name: string;
  licence: string;
  host: string;
  /** Folder of the model files; must end in /resolve/main/ (WebLLM's URL rule). */
  base: string;
  /** The compiled WebAssembly model library, a path under the host. */
  modelLib: ModelFile | null;
  files: ModelFile[];
}

export const MANIFEST = raw as ModelManifest;

const HEX64 = /^[0-9a-f]{64}$/;

/** Every problem with a manifest; an empty list means it can be used. */
export function manifestProblems(m: ModelManifest): string[] {
  const p: string[] = [];
  if (m.schema !== 1) p.push('schema must be 1');
  if (m.host !== MODEL_HOST) p.push(`host must be ${MODEL_HOST}`);
  if (!m.base.startsWith(MODEL_HOST + '/')) p.push('base must be on the model host');
  if (!m.base.endsWith('/resolve/main/')) p.push('base must end with /resolve/main/');
  if (m.licence !== 'Apache-2.0') p.push('licence must be Apache-2.0');
  if (m.status === 'pending') return p;
  if (m.status !== 'ready') p.push('status must be pending or ready');
  const all = [...(m.modelLib ? [m.modelLib] : []), ...m.files];
  if (!m.modelLib) p.push('modelLib is required when ready');
  else if (!m.modelLib.path.endsWith('.wasm')) p.push('modelLib must be a .wasm file');
  for (const n of ['mlc-chat-config.json', 'tensor-cache.json', 'tokenizer.json']) {
    if (!m.files.some((f) => f.path === n)) p.push(`files must include ${n}`);
  }
  const seen = new Set<string>();
  for (const f of all) {
    if (!f.path || f.path.startsWith('/') || f.path.includes('..') || f.path.includes('?') || f.path.includes('#')) p.push(`bad path: ${f.path}`);
    if (seen.has(f.path)) p.push(`duplicate path: ${f.path}`);
    seen.add(f.path);
    if (!HEX64.test(f.sha256)) p.push(`bad sha256 for ${f.path}`);
    if (!Number.isInteger(f.bytes) || f.bytes <= 0) p.push(`bad size for ${f.path}`);
  }
  return p;
}

export function isReady(m: ModelManifest = MANIFEST): boolean {
  return m.status === 'ready' && manifestProblems(m).length === 0;
}

export function totalBytes(m: ModelManifest = MANIFEST): number {
  return (m.modelLib ? m.modelLib.bytes : 0) + m.files.reduce((s, f) => s + f.bytes, 0);
}

export function fileUrl(m: ModelManifest, f: ModelFile): string {
  return f === m.modelLib ? new URL(f.path, m.host + '/').href : new URL(f.path, m.base).href;
}

/** The WebLLM cache each file belongs in, so WebLLM finds our verified copy. */
export function cacheScopeFor(m: ModelManifest, f: ModelFile): 'webllm/config' | 'webllm/wasm' | 'webllm/model' {
  if (f === m.modelLib) return 'webllm/wasm';
  if (f.path === 'mlc-chat-config.json') return 'webllm/config';
  return 'webllm/model';
}

/** Hex sha256 as an SRI string ("sha256-BASE64") for WebLLM's own checks. */
export function hexToSri(hex: string): string {
  const bytes = new Uint8Array(hex.match(/../g)!.map((h) => parseInt(h, 16)));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return 'sha256-' + btoa(bin);
}

/** Human size such as "1.2 GB" or "850 MB" (decimal units, as phones show them). */
export function formatBytes(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' GB';
  return Math.max(1, Math.round(n / 1e6)) + ' MB';
}
