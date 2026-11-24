import { createContext, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent, type ReactNode, type AnchorHTMLAttributes } from 'react';

// A small history router: path matching with :params and a Link component.
type RouterCtx = { path: string; search: URLSearchParams; navigate: (to: string) => void };
const Ctx = createContext<RouterCtx | null>(null);

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

function currentPath() {
  const p = window.location.pathname;
  return (base && p.startsWith(base) ? p.slice(base.length) : p) || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState(() => ({ path: currentPath(), search: window.location.search }));

  useEffect(() => {
    const on = () => setLoc({ path: currentPath(), search: window.location.search });
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', base + to);
    setLoc({ path: currentPath(), search: window.location.search });
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(() => ({ path: loc.path, search: new URLSearchParams(loc.search), navigate }), [loc, navigate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRouter() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRouter outside RouterProvider');
  return v;
}

export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { navigate } = useRouter();
  return (
    <a
      href={base + to}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    />
  );
}
