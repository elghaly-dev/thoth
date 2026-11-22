import { RTL_LANGUAGES, SUPPORTED_LANGUAGES, type LanguageCode, type SupportedLanguage } from '../types';

/**
 * Persisted UI language. Only the language code (e.g. "ar") is stored,
 * under one localStorage key; nothing else, and never a key or token.
 * Order: ?lang= in the URL, then the saved choice, then Hindi (default).
 */
export const LANG_STORAGE_KEY = 'thoth.lang';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null; // storage blocked (private mode, sandboxed frame)
  }
}

function find(code: string | null | undefined): SupportedLanguage | undefined {
  return code ? SUPPORTED_LANGUAGES.find((l) => l.code === code) : undefined;
}

export function initialLanguage(search?: string, store: StorageLike | null = storage()): SupportedLanguage {
  let q: string | null = null;
  try {
    q = new URLSearchParams(search ?? (typeof window !== 'undefined' ? window.location.search : '')).get('lang');
  } catch {
    q = null;
  }
  let saved: string | null = null;
  try {
    saved = store ? store.getItem(LANG_STORAGE_KEY) : null;
  } catch {
    saved = null;
  }
  return find(q) || find(saved) || SUPPORTED_LANGUAGES[0];
}

export function saveLanguage(code: LanguageCode, store: StorageLike | null = storage()): void {
  if (!find(code) || !store) return;
  try {
    store.setItem(LANG_STORAGE_KEY, code);
  } catch {
    /* quota or blocked storage: the choice just lasts for this visit */
  }
}

export function dirFor(code: LanguageCode): 'rtl' | 'ltr' {
  return RTL_LANGUAGES.has(code) ? 'rtl' : 'ltr';
}
