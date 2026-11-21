/**
 * Can this phone run the on-device model? It needs WebGPU with 16-bit
 * float shaders (the q4f16 build). Anything else: the cloud option stays.
 */
export type GpuCheck = { ok: true } | { ok: false; reason: 'no-webgpu' | 'no-adapter' | 'no-f16' };

export async function checkWebGpu(nav: { gpu?: { requestAdapter(): Promise<{ features: { has(f: string): boolean } } | null> } } = globalThis.navigator as never): Promise<GpuCheck> {
  if (!nav || !nav.gpu) return { ok: false, reason: 'no-webgpu' };
  let adapter = null;
  try {
    adapter = await nav.gpu.requestAdapter();
  } catch {
    adapter = null;
  }
  if (!adapter) return { ok: false, reason: 'no-adapter' };
  if (!adapter.features.has('shader-f16')) return { ok: false, reason: 'no-f16' };
  return { ok: true };
}
