import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { browserKV, buildReport, hasReported, loadReports, reportsEndpoint, setReportStatus, submitReport, type BuildError, type Report, type ReportReason, type ReportStatus, type ReportTarget } from './reports';

export type AssistantContext = { kind: 'product' | 'rfq' | 'deal' | 'thread' | 'page'; id?: string; label: string } | null;
export type Toast = { id: number; text: string };

type Store = {
  saved: Set<string>;
  toggleSaved: (id: string) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  assistantOpen: boolean;
  openAssistant: (ctx?: AssistantContext, prompt?: string) => void;
  closeAssistant: () => void;
  assistantCtx: AssistantContext;
  setAssistantCtx: (c: AssistantContext) => void;
  assistantPrompt: string | null;
  clearPrompt: () => void;
  toasts: Toast[];
  toast: (text: string) => void;
  reports: Report[];
  isReported: (t: Pick<ReportTarget, 'kind' | 'id'>) => boolean;
  fileReport: (t: ReportTarget, reason: ReportReason | null, note: string) => Promise<{ ok: true; report: Report } | { ok: false; error: BuildError }>;
  setReportState: (id: string, status: ReportStatus) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(() => new Set(['medjool-premium']));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantCtx, setAssistantCtx] = useState<AssistantContext>(null);
  const [assistantPrompt, setPrompt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reports, setReports] = useState<Report[]>(() => loadReports(browserKV()));

  const isReported = useCallback((t: Pick<ReportTarget, 'kind' | 'id'>) => hasReported(reports, t), [reports]);
  const fileReport = useCallback(async (t: ReportTarget, reason: ReportReason | null, note: string) => {
    const b = buildReport(t, reason, note);
    if (!b.ok) return b;
    const kv = browserKV();
    const post = typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : undefined;
    const stored = await submitReport(b.report, kv, reportsEndpoint(), post);
    if (kv) setReports(loadReports(kv)); else setReports((prev) => [stored, ...prev]);
    return { ok: true as const, report: stored };
  }, []);
  const setReportState = useCallback((id: string, status: ReportStatus) => {
    const kv = browserKV();
    if (kv) setReports(setReportStatus(kv, id, status));
    else setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const openAssistant = useCallback((ctx?: AssistantContext, prompt?: string) => {
    if (ctx !== undefined) setAssistantCtx(ctx);
    setPrompt(prompt ?? null);
    setAssistantOpen(true);
  }, []);

  const value = useMemo<Store>(() => ({
    saved, toggleSaved, paletteOpen, setPaletteOpen, assistantOpen, openAssistant,
    closeAssistant: () => setAssistantOpen(false), assistantCtx, setAssistantCtx,
    assistantPrompt, clearPrompt: () => setPrompt(null), toasts, toast,
    reports, isReported, fileReport, setReportState,
  }), [saved, toggleSaved, paletteOpen, assistantOpen, openAssistant, assistantCtx, assistantPrompt, toasts, toast, reports, isReported, fileReport, setReportState]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
