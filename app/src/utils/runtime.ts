// Runtime mode for Thoth model calls.
// - "server": npm run dev / a hosted Node proxy. The Gemini key stays
//   on the server. Client code never sees it.
// - "static": GitHub Pages (or any static host). The exporter pastes
//   their own Gemini key. It is kept only in this page's memory (a module
//   variable): never in localStorage, sessionStorage, cookies, the URL,
//   the repo or the bundle. Reloading or closing the tab forgets it. It is
//   sent only to Google.

export type RuntimeMode = 'unknown' | 'server' | 'static';

export interface RuntimeState {
  mode: RuntimeMode;
  serverHasKey: boolean;
  userKeyPresent: boolean;
  rejected: boolean;
}

// In-memory only. Never written to any browser storage.
let memoryKey = '';

type Listener = (state: RuntimeState) => void;
const listeners = new Set<Listener>();

function readUserKey(): string {
  return memoryKey;
}

let state: RuntimeState = {
  mode: 'unknown',
  serverHasKey: false,
  userKeyPresent: readUserKey().length > 0,
  rejected: false,
};

export function getRuntime(): RuntimeState {
  return state;
}

export function subscribeRuntime(fn: Listener): () => void {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}

function emit(): void {
  for (const fn of listeners) fn(state);
}

export function getUserKey(): string {
  return readUserKey().trim();
}

export function setUserKey(key: string): void {
  const trimmed = key.trim();
  memoryKey = trimmed;
  state = { ...state, userKeyPresent: trimmed.length > 0, rejected: false };
  emit();
}

export function clearUserKey(): void {
  setUserKey('');
}

/** Drop a refused key and mark the runtime so the UI can show key.invalid. */
export function rejectUserKey(): void {
  memoryKey = '';
  state = { ...state, userKeyPresent: false, rejected: true };
  emit();
}

export function hasUsableModelAccess(): boolean {
  if (state.mode === 'server' && state.serverHasKey) return true;
  return getUserKey().length > 0;
}

interface HealthResponse {
  ok?: boolean;
  proxy?: boolean;
  hasKey?: boolean;
}

// The Pages build (base /use/) has no Node proxy: skip the /api/health probe,
// which could only 404 there and log a console error on every load.
const STATIC_BUILD = (import.meta.env?.BASE_URL ?? '/') === '/use/';

export async function detectRuntime(): Promise<RuntimeState> {
  if (STATIC_BUILD) {
    state = {
      mode: 'static',
      serverHasKey: false,
      userKeyPresent: readUserKey().length > 0,
      rejected: state.rejected && readUserKey().length === 0,
    };
    emit();
    return state;
  }
  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as HealthResponse;
      if (data && data.ok === true && data.proxy === true) {
        state = {
          mode: 'server',
          serverHasKey: data.hasKey === true,
          userKeyPresent: readUserKey().length > 0,
          rejected: state.rejected && readUserKey().length === 0,
        };
        emit();
        return state;
      }
    }
  } catch {
    // No proxy (static host, or network failure). Fall through.
  }
  state = {
    mode: 'static',
    serverHasKey: false,
    userKeyPresent: readUserKey().length > 0,
    rejected: state.rejected && readUserKey().length === 0,
  };
  emit();
  return state;
}
