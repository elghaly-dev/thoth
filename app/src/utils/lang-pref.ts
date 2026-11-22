import { RTL_LANGUAGES, SUPPORTED_LANGUAGES, type LanguageCode, type SupportedLanguage } from '../types';

/**
 * Persisted UI language. Only the language code (e.g. "ar") is stored,
 * under one localStorage key; nothing else, and never a key or token.
 * Order: ?lang= in the URL, then the saved (manual) choice, then the
 * device language (navigator.languages / navigator.language), then English.
 * Only a manual pick in the switcher is saved, so detection never pins a
 * language: a phone set to Arabic opens in Arabic until the user picks
 * another language, and that pick then wins on every later visit.
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

export const FALLBACK_LANGUAGE: LanguageCode = 'en';

function navigatorLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  const list = Array.isArray(navigator.languages) ? navigator.languages : [];
  return list.length ? list : navigator.language ? [navigator.language] : [];
}

/**
 * First supported language in the device's preference list. Tags are
 * matched on their primary subtag ("ar-EG" -> ar, "en-GB" -> en,
 * "zh-Hans-CN" -> zh). Accepts navigator.languages or an Accept-Language
 * header value ("ar-EG,ar;q=0.9,en;q=0.8", q-ordered).
 */
export function detectLanguage(prefs: readonly string[] | string | null | undefined): SupportedLanguage | undefined {
  let tags: string[];
  if (typeof prefs === 'string') {
    tags = prefs
      .split(',')
      .map((part, i) => {
        const [tag, ...params] = part.trim().split(';');
        const q = params.map((x) => x.trim()).find((x) => x.startsWith('q='));
        const weight = q ? Number(q.slice(2)) : 1;
        return { tag: tag.trim(), weight: Number.isFinite(weight) ? weight : 0, i };
      })
      .filter((x) => x.tag && x.tag !== '*' && x.weight > 0)
      .sort((a, b) => b.weight - a.weight || a.i - b.i)
      .map((x) => x.tag);
  } else {
    tags = Array.isArray(prefs) ? prefs.filter((x): x is string => typeof x === 'string') : [];
  }
  for (const tag of tags) {
    const primary = tag.toLowerCase().split(/[-_]/)[0];
    const hit = find(primary);
    if (hit) return hit;
  }
  return undefined;
}

export function initialLanguage(
  search?: string,
  store: StorageLike | null = storage(),
  devicePrefs: readonly string[] | string | null = navigatorLanguages()
): SupportedLanguage {
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
  return find(q) || find(saved) || detectLanguage(devicePrefs) || find(FALLBACK_LANGUAGE) || SUPPORTED_LANGUAGES[0];
}

/** Call only for a manual pick in the language switcher. */
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

/**
 * Server side: set <html lang> and dir on the SPA shell from the
 * Accept-Language header, so the first paint already has the right
 * direction. The client then applies ?lang= / the saved pick on mount.
 */
export function localizeHtmlShell(html: string, acceptLanguage: string | undefined): string {
  const code = (detectLanguage(acceptLanguage) || find(FALLBACK_LANGUAGE) || SUPPORTED_LANGUAGES[0]).code;
  const lang = code === 'zh' ? 'zh-CN' : code;
  return html.replace(/<html\b[^>]*>/i, `<html lang="${lang}" dir="${dirFor(code)}">`);
}
