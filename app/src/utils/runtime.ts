// Runtime mode for Thoth model calls.
// - "server": npm run dev / a hosted Node proxy. The Gemini key stays
//   on the server. Client code never sees it.
// - "static": GitHub Pages (or any static host). The exporter pastes
//   their own Gemini key, which is kept in sessionStorage for this tab
//   only and is sent only to Google. It is never written to the repo,
//   localStorage, or Thoth's servers.

export type RuntimeMode = 'unknown' | 'server' | 'static';

export interface RuntimeState {
  mode: RuntimeMode;
  serverHasKey: boolean;
  userKeyPresent: boolean;
  rejected: boolean;
}

const STORAGE_KEY = 'thoth.geminiKey';

type Listener = (state: RuntimeState) => void;
const listeners = new Set<Listener>();

function readUserKey(): string {
  if (typeof sessionStorage === 'undefined') return '';
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
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
  if (typeof sessionStorage !== 'undefined') {
    try {
      if (trimmed) sessionStorage.setItem(STORAGE_KEY, trimmed);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private mode can throw; the in-memory flag still updates.
    }
  }
  state = { ...state, userKeyPresent: trimmed.length > 0, rejected: false };
  emit();
}

export function clearUserKey(): void {
  setUserKey('');
}

/** Drop a refused key and mark the runtime so the UI can show key.invalid. */
export function rejectUserKey(): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private mode can throw; the in-memory flag still updates.
    }
  }
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

export async function detectRuntime(): Promise<RuntimeState> {
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
