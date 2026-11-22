/**
 * Which on-device model Thoth uses. One line: switch to '1.5b' later to offer
 * the larger "better quality" download (its manifest must be ready first).
 */
export const ACTIVE_MODEL: '0.5b' | '1.5b' = '0.5b';

/** Where the model library for each model lives under the model host (path only; hash in the manifest). */
export const MODEL_LIB_PATH = {
  '0.5b': 'webllm-libs/v0_2_87/base/Qwen2-0.5B-Instruct-q4f16_1_cs1k-webgpu.wasm',
} as const;
