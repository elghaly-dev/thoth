import { useCallback, useEffect, useRef } from 'react';

/**
 * One in-flight request per component.
 * - `begin()` aborts the previous request and returns a signal plus
 *   `isCurrent()`, which is false once a newer request started, the
 *   request was aborted, or the component unmounted.
 * - On unmount the in-flight request is aborted, so no state is set on
 *   an unmounted component and no reply arrives for a closed tab.
 */
export function useRequestGuard() {
  const ctrlRef = useRef<AbortController | null>(null);
  const genRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      ctrlRef.current?.abort();
      ctrlRef.current = null;
    };
  }, []);

  const begin = useCallback(() => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const gen = ++genRef.current;
    return {
      signal: ctrl.signal,
      isCurrent: () => mountedRef.current && gen === genRef.current && !ctrl.signal.aborted,
    };
  }, []);

  return { begin, mountedRef };
}

/** True for the error fetch throws when its AbortSignal fires. */
export function isAbortError(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as { name?: unknown }).name === 'AbortError';
}
