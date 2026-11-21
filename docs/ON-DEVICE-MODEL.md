# On-device Faithful Servant (Thoth)

Translate and explain trade messages in Hindi, Arabic, Chinese and English on
the phone itself. No server, no key, nothing the user types leaves the phone.
The bring-your-own-key cloud tabs stay as an option. The on-device tab opens
first on phones with WebGPU and 16-bit float shaders.

## Model

- Qwen2.5-1.5B-Instruct, MLC build `q4f16_1` (Apache-2.0), run by
  `@mlc-ai/web-llm` 0.2.87 (pinned exactly) in a Web Worker.
- Downloaded only after the user taps the button, which shows the total size.
  Wi-Fi is recommended. After that it works with no internet.
- Read-aloud uses the phone's own **offline** voices only (`localService`).

## Where the files live

One host: `https://models.elghaly.dev` (Cloudflare R2, custom domain). It is the
only host added to the page CSP (`connect-src`). The CSP also gains
`'wasm-unsafe-eval'`, which lets the page compile WebAssembly; it does not allow
`eval()` or `new Function()` (WebLLM 0.2.87 uses neither; a test checks).

Layout expected by the code (versioned, immutable; a new upload is `v2/`):

```
https://models.elghaly.dev/qwen2.5-1.5b-instruct-q4f16_1-mlc/v1/resolve/main/
    mlc-chat-config.json
    tensor-cache.json
    tokenizer.json            (and tokenizer_config.json etc. if the build has them)
    params_shard_0.bin … params_shard_N.bin
https://models.elghaly.dev/<model library path>.wasm
```

The folder must end in `/resolve/main/`: WebLLM appends that suffix to any
model URL that lacks it.

R2 CORS rule: methods `GET`, `HEAD`; allowed origins = the Thoth and Ra site
origins only; no credentials; expose `Content-Length`.

## The manifest (`app/src/ondevice/model-manifest.json`)

Grok Bot sends this after uploading; it replaces the `pending` file:

```json
{
  "schema": 1,
  "status": "ready",
  "modelId": "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  "name": "Qwen2.5-1.5B-Instruct",
  "licence": "Apache-2.0",
  "host": "https://models.elghaly.dev",
  "base": "https://models.elghaly.dev/qwen2.5-1.5b-instruct-q4f16_1-mlc/v1/resolve/main/",
  "modelLib": { "path": "<path under the host>.wasm", "bytes": 0, "sha256": "<64 hex>" },
  "files": [ { "path": "mlc-chat-config.json", "bytes": 0, "sha256": "<64 hex>" } ]
}
```

Every file the code downloads must be listed with its exact byte size and
lower-case hex sha256. `tests/ondevice.ts` rejects a manifest with another host,
a base outside the host or without `/resolve/main/`, another licence, a bad
hash, a `..` path, a duplicate, or a missing `mlc-chat-config.json`,
`tensor-cache.json` or `tokenizer.json`.

## How a download is checked

1. Each file is fetched from the host with no cookies and no shared HTTP cache.
2. Its size and sha256 must match the manifest, or it is discarded and the
   download stops with a message.
3. Matching files go into the Cache Storage WebLLM reads from
   (`webllm/config`, `webllm/wasm`, `webllm/model`, keyed by URL), and a record
   of the verified hash goes into `thoth/verified-model`.
4. The model starts only when every file is verified, so WebLLM never
   downloads anything itself. WebLLM's own checks also run on the config,
   the model library and the tokenizer.
5. "Remove from this phone" deletes all four caches.

## Status

Until the manifest is `ready`, the tab says the on-device Faithful Servant is
being prepared and points to the bring-your-own-key option. CI tests the
manifest rules, the download checks (fake network and storage), the prompts,
the WebGPU check, the offline-voice choice, the strings (Hindi, Chinese,
English; no banned words) and the CSP with a mock model; a real phone test
needs the uploaded files.
