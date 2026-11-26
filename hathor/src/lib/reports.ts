// Reports («بلّغ»). A user can report a supplier, a product listing, a
// conversation or one message. Each report goes into a review queue for the
// Hathor team. Contact details in the note or in a quoted message are masked
// before the report is stored, so a report never carries a phone, email,
// handle, link or payment detail in the clear.
//
// Storage: when VITE_HATHOR_REPORTS_URL is set, reports are sent there with a
// POST. Until a review server exists, every report is also kept in a local
// queue (localStorage key below) that the /admin/reports screen reads.
import { maskContacts } from './mask';

export const REPORT_REASONS = ['scam', 'prohibited', 'abuse', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export type ReportTargetKind = 'supplier' | 'product' | 'thread' | 'message';
export type ReportTarget = {
  kind: ReportTargetKind;
  id: string;
  label: string;
  // For a message report: the thread it belongs to and the message text.
  threadId?: string;
  quote?: string;
};

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export type Report = {
  id: string;
  target: ReportTarget;
  reason: ReportReason;
  note: string;
  createdAt: string;
  status: ReportStatus;
  sent: boolean;
};

export const NOTE_MAX = 1000;
export const STORAGE_KEY = 'hathor.reports';

export type KV = { getItem(k: string): string | null; setItem(k: string, v: string): void };
export type Poster = (url: string, init: { method: 'POST'; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean }>;

export type BuildError = 'reason' | 'noteRequired' | 'target';

export function isReason(v: unknown): v is ReportReason {
  return typeof v === 'string' && (REPORT_REASONS as readonly string[]).includes(v);
}

const mask = (s: string) => maskContacts(s).text;

export function buildReport(
  target: ReportTarget,
  reason: ReportReason | null,
  note: string,
  now: Date = new Date(),
  rand: () => number = Math.random,
): { ok: true; report: Report } | { ok: false; error: BuildError } {
  if (!target || !target.id || !target.kind) return { ok: false, error: 'target' };
  if (!isReason(reason)) return { ok: false, error: 'reason' };
  const clean = mask(note.trim()).slice(0, NOTE_MAX);
  if (reason === 'other' && !clean) return { ok: false, error: 'noteRequired' };
  const maskedTarget: ReportTarget = {
    kind: target.kind,
    id: target.id,
    label: mask(target.label),
    ...(target.threadId ? { threadId: target.threadId } : {}),
    ...(target.quote ? { quote: mask(target.quote).slice(0, NOTE_MAX) } : {}),
  };
  const id = `r-${now.getTime().toString(36)}-${Math.floor(rand() * 1e9).toString(36)}`;
  return { ok: true, report: { id, target: maskedTarget, reason, note: clean, createdAt: now.toISOString(), status: 'pending', sent: false } };
}

export function targetKey(t: Pick<ReportTarget, 'kind' | 'id'>): string {
  return `${t.kind}:${t.id}`;
}

const KINDS: readonly string[] = ['supplier', 'product', 'thread', 'message'];
const STATUSES: readonly string[] = ['pending', 'reviewed', 'dismissed'];
// A stored entry must have the shape the review screen renders; anything else
// (a hand-edited entry, an older build's data) is left out.
function isStoredReport(r: unknown): r is Report {
  const x = r as Partial<Report> | null;
  return !!x && typeof x.id === 'string' && isReason(x.reason) && STATUSES.includes(x.status as string)
    && typeof x.createdAt === 'string' && !Number.isNaN(Date.parse(x.createdAt))
    && !!x.target && KINDS.includes(x.target.kind) && typeof x.target.id === 'string' && typeof x.target.label === 'string'
    && typeof x.note === 'string' && typeof x.sent === 'boolean';
}

export function loadReports(kv: KV | null): Report[] {
  if (!kv) return [];
  try {
    const raw = kv.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(isStoredReport) : [];
  } catch {
    return [];
  }
}

export function saveReports(kv: KV | null, list: Report[]): void {
  if (!kv) return;
  try { kv.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* storage may be blocked */ }
}

export function hasReported(list: Report[], t: Pick<ReportTarget, 'kind' | 'id'>): boolean {
  const k = targetKey(t);
  return list.some((r) => targetKey(r.target) === k);
}

// Adds a report to the queue and, when a review server is set, sends it.
export async function submitReport(report: Report, kv: KV | null, endpoint: string | undefined, post?: Poster): Promise<Report> {
  let sent = false;
  if (endpoint && post) {
    try {
      const res = await post(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report) });
      sent = !!res.ok;
    } catch { sent = false; }
  }
  const stored = { ...report, sent };
  const list = loadReports(kv).filter((r) => r.id !== report.id);
  saveReports(kv, [stored, ...list]);
  return stored;
}

export function setReportStatus(kv: KV | null, id: string, status: ReportStatus): Report[] {
  const list = loadReports(kv).map((r) => (r.id === id ? { ...r, status } : r));
  saveReports(kv, list);
  return list;
}

export function reportsEndpoint(): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const v = env?.VITE_HATHOR_REPORTS_URL;
  return v && v.trim() ? v.trim() : undefined;
}

export function browserKV(): KV | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}
