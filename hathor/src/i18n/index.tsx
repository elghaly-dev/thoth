import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { strings, type Lang, type StringKey } from './strings';

export type { Lang, StringKey };

const STORAGE_KEY = 'hathor.lang';

export function translate(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = strings[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'ar';
  const q = new URLSearchParams(window.location.search).get('lang');
  if (q === 'ar' || q === 'en') return q;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'ar' || saved === 'en') return saved;
  const nav = (navigator.language || 'ar').toLowerCase();
  return nav.startsWith('en') ? 'en' : 'ar';
}

type Ctx = {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = lang === 'ar' ? 'حتحور · Hathor' : 'Hathor · حتحور';
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* storage may be blocked */ }
  }, []);

  const t = useCallback((key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, dir, setLang, t }) as Ctx, [lang, dir, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(LangContext);
  if (!v) throw new Error('useI18n outside LangProvider');
  return v;
}
