/**
 * The on-device engine: WebLLM in a Web Worker, loading only files that
 * download.ts has already verified against the pinned sha256 values.
 * WebLLM is imported on demand, so the page does not load it unless the
 * user starts the on-device Faithful Servant.
 */
import { allVerified } from './download';
import { fileUrl, hexToSri, isReady, MANIFEST, type ModelManifest } from './manifest';
import type { Turn } from './prompts';

export interface Engine {
  generate(turns: Turn[], onDelta: (soFar: string) => void, signal?: AbortSignal): Promise<string>;
  unload(): Promise<void>;
}

export class NotReadyError extends Error {}

export async function createWebLlmEngine(
  onProgress: (fraction: number) => void,
  m: ModelManifest = MANIFEST,
): Promise<Engine> {
  if (!isReady(m) || !m.modelLib) throw new NotReadyError('manifest not ready');
  // WebLLM would download anything missing by itself; refuse unless every
  // file is already on the phone and verified.
  if (!(await allVerified(m))) throw new NotReadyError('model not downloaded');
  const sri = (path: string) => {
    const f = m.files.find((x) => x.path === path);
    return f ? hexToSri(f.sha256) : undefined;
  };
  const tokenizer: Record<string, string> = {};
  for (const name of ['tokenizer.json', 'tokenizer.model']) {
    const s = sri(name);
    if (s) tokenizer[name] = s;
  }
  const webllm = await import('@mlc-ai/web-llm');
  const worker = new Worker(new URL('./llm.worker.ts', import.meta.url), { type: 'module' });
  const engine = await webllm.CreateWebWorkerMLCEngine(worker, m.modelId, {
    appConfig: {
      cacheBackend: 'cache',
      model_list: [
        {
          model: m.base,
          model_id: m.modelId,
          model_lib: fileUrl(m, m.modelLib),
          low_resource_required: true,
          required_features: ['shader-f16'],
          integrity: { config: sri('mlc-chat-config.json'), model_lib: hexToSri(m.modelLib.sha256), tokenizer, onFailure: 'error' },
        },
      ],
    },
    initProgressCallback: (r: { progress: number }) => onProgress(r.progress),
  });
  return {
    async generate(turns, onDelta, signal) {
      const stream = await engine.chat.completions.create({ messages: turns, stream: true, temperature: 0.2, max_tokens: 768 });
      let out = '';
      for await (const chunk of stream) {
        if (signal?.aborted) {
          engine.interruptGenerate();
          break;
        }
        out += chunk.choices[0]?.delta?.content ?? '';
        onDelta(out);
      }
      return out.trim();
    },
    async unload() {
      await engine.unload();
      worker.terminate();
    },
  };
}
