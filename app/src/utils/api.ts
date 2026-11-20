// Shared fetch helper for the Thoth model routes.
// A 401/403 from the server is a provider-auth failure: it stops here and
// is shown as a visible, non-retryable error. It never becomes a silent
// fallback and never keeps a spinner running.
//
// On a static host (GitHub Pages) there is no proxy. postModel then uses
// the exporter's own Gemini key (sessionStorage, this tab only) and talks
// to Google directly. The key is never placed in a URL or in the bundle.

import { detectRuntime, getRuntime, getUserKey, rejectUserKey } from './runtime';
import {
  browserChat,
  browserImportGuide,
  browserPitch,
  browserTranslate,
} from './gemini-browser';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAuthErrorStatus(status: number): boolean {
  return status === 401 || status === 403;
}

export async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    let message = `Server returned ${res.status}`;
    try {
      const data: unknown = await res.json();
      if (data && typeof data === 'object' && typeof (data as { error?: unknown }).error === 'string') {
        message = (data as { error: string }).error;
      }
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

function requireUserKey(): string {
  const key = getUserKey();
  if (!key) {
    throw new ApiError(
      401,
      'Add your Gemini API key to talk with Thoth. It stays in this browser tab and is sent only to Google.',
    );
  }
  return key;
}

function useServerProxy(): boolean {
  const rt = getRuntime();
  return rt.mode === 'server' && rt.serverHasKey;
}

export async function postModel<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  if (getRuntime().mode === 'unknown') {
    await detectRuntime();
  }

  try {
    if (useServerProxy()) {
      return await postJson<T>(path, body, signal);
    }

    const key = requireUserKey();

    switch (path) {
    case '/api/chat': {
      const b = body as {
        messages: Array<{ role: string; content: string }>;
        userLanguage: string;
      };
      return (await browserChat(key, b.messages, b.userLanguage, signal)) as T;
    }
    case '/api/pitch': {
      const b = body as {
        product: string;
        quantity: string;
        price: string;
        shippingOrigin: string;
        exporterLanguage: string;
      };
      return (await browserPitch(key, b, signal)) as T;
    }
    case '/api/translate': {
      const b = body as {
        text: string;
        sourceLang: string;
        targetLang: string;
        speakerRole: string;
      };
      return (await browserTranslate(key, b, signal)) as T;
    }
    case '/api/import-guide': {
      const b = body as { query: string; userLanguage: string };
      return (await browserImportGuide(key, b.query, b.userLanguage, signal)) as T;
    }
    default:
      throw new Error(`No static-mode handler for ${path}`);
    }
  } catch (err) {
    if (
      !useServerProxy() &&
      err instanceof ApiError &&
      isAuthErrorStatus(err.status)
    ) {
      rejectUserKey();
    }
    throw err;
  }
}
