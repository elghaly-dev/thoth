// Reports («بلّغ»): reasons, the note rule for «Other», contact masking before
// storage, the review queue, duplicate detection and the optional server POST.
import { readFileSync } from 'node:fs';
import { strings } from '../src/i18n/strings';
import { MASK_TOKEN } from '../src/lib/mask';
import {
  REPORT_REASONS, STORAGE_KEY, NOTE_MAX, buildReport, hasReported, loadReports, setReportStatus, submitReport,
  type KV, type ReportTarget,
} from '../src/lib/reports';
import { check, done } from './harness';

function memKV(): KV & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; } };
}

const product: ReportTarget = { kind: 'product', id: 'medjool-premium', label: 'Medjool dates' };
const now = new Date('2026-11-24T15:00:00Z');

// Reasons and their strings.
check('four reasons', REPORT_REASONS.join() === 'scam,prohibited,abuse,other');
for (const r of REPORT_REASONS) {
  check(`label for ${r}`, `report.r.${r}` in strings);
  check(`description for ${r}`, `report.r.${r}.d` in strings);
}
for (const k of ['report.action', 'report.listing', 'report.supplier', 'report.thread', 'report.message']) check(`string ${k}`, k in strings);
check('button says بلّغ', strings['report.action'].ar === 'بلّغ' && strings['report.action'].en === 'Report');

// Validation.
const noReason = buildReport(product, null, '', now);
check('a reason is needed', !noReason.ok && noReason.error === 'reason');
const otherEmpty = buildReport(product, 'other', '   ', now);
check('«Other» needs a note', !otherEmpty.ok && otherEmpty.error === 'noteRequired');
const otherOk = buildReport(product, 'other', 'Photos are copied from another listing', now);
check('«Other» with a note works', otherOk.ok);
const scam = buildReport(product, 'scam', '', now);
check('scam with no note works', scam.ok && scam.report.status === 'pending' && scam.report.note === '');
check('bad target refused', !buildReport({ kind: 'product', id: '', label: 'x' }, 'scam', '', now).ok);

// Masking: contacts never reach storage in the clear.
const leaky = buildReport(product, 'scam', 'He asked me to pay on WhatsApp +971 50 123 4567 or mail sales@example.com', now);
check('note phone masked', leaky.ok && !leaky.report.note.includes('4567'));
check('note email masked', leaky.ok && !leaky.report.note.includes('example.com'));
check('note handle masked', leaky.ok && !/whatsapp/i.test(leaky.report.note));
check('mask token present', leaky.ok && leaky.report.note.includes(MASK_TOKEN));
const msg = buildReport(
  { kind: 'message', id: 't3/m2', label: 'Supplier', threadId: 't3', quote: 'Pay to IBAN AE07 0331 2345 6789 0123 456 now, wa.me/971501234567' },
  'scam', '', now,
);
check('quoted message masked (IBAN)', msg.ok && !msg.report.target.quote!.includes('0331'));
check('quoted message masked (link)', msg.ok && !msg.report.target.quote!.includes('wa.me'));
check('thread id kept for a message report', msg.ok && msg.report.target.threadId === 't3');
const trade = buildReport(product, 'prohibited', 'Listed at USD 9.2 for 6,000 kg, HS 0804.10', now);
check('trade numbers kept in note', trade.ok && trade.report.note.includes('6,000') && trade.report.note.includes('0804.10'));
const long = buildReport(product, 'abuse', 'x'.repeat(NOTE_MAX + 50), now);
check('note is capped', long.ok && long.report.note.length === NOTE_MAX);

// Queue.
(async () => {
  const kv = memKV();
  if (!scam.ok || !otherOk.ok) throw new Error('setup');
  const stored = await submitReport(scam.report, kv, undefined);
  check('stored without a server, marked not sent', stored.sent === false);
  check('queue has one report', loadReports(kv).length === 1);
  check('stored under the hathor.reports key', STORAGE_KEY === 'hathor.reports' && typeof kv.data[STORAGE_KEY] === 'string');
  check('stored report has no raw contact', !kv.data[STORAGE_KEY].includes('4567'));
  check('reported target detected', hasReported(loadReports(kv), product));
  check('other target not flagged', !hasReported(loadReports(kv), { kind: 'supplier', id: 'medjool-premium' }));

  // Server POST.
  let posted: { url: string; body: string } | null = null;
  const ok = await submitReport(otherOk.report, kv, 'https://reports.example/api', async (url, init) => { posted = { url, body: init.body }; return { ok: true }; });
  check('POST used when a server is set', posted !== null && (posted as { url: string }).url === 'https://reports.example/api');
  check('POST body is the masked report', posted !== null && JSON.parse((posted as { body: string }).body).id === otherOk.report.id);
  check('marked sent on 2xx', ok.sent === true);
  const failed = await submitReport({ ...otherOk.report, id: 'r-fail' }, kv, 'https://reports.example/api', async () => { throw new Error('offline'); });
  check('kept locally when the server fails', failed.sent === false && loadReports(kv).some((r) => r.id === 'r-fail'));
  check('newest first', loadReports(kv)[0].id === 'r-fail');

  // Review states.
  const after = setReportStatus(kv, scam.report.id, 'reviewed');
  check('status change saved', after.find((r) => r.id === scam.report.id)?.status === 'reviewed' && loadReports(kv).find((r) => r.id === scam.report.id)?.status === 'reviewed');
  setReportStatus(kv, scam.report.id, 'dismissed');
  check('dismiss saved', loadReports(kv).find((r) => r.id === scam.report.id)?.status === 'dismissed');

  // Broken storage never throws.
  const bad = memKV(); bad.setItem(STORAGE_KEY, '{not json');
  check('broken storage reads as empty', loadReports(bad).length === 0);
  check('no storage reads as empty', loadReports(null).length === 0);

  // Wiring: the button is on listings, supplier pages and in chat.
  const src = (p: string) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
  check('product page has the button', /<ReportButton[^>]*kind: 'product'/.test(src('pages/Product.tsx')));
  check('supplier page has the button', /<ReportButton[^>]*kind: 'supplier'/.test(src('pages/Supplier.tsx')));
  check('chat header has the button', /<ReportButton[^>]*kind: 'thread'/.test(src('pages/Messages.tsx')));
  check('each received message has the button', /<ReportButton[^>]*kind: 'message'/.test(src('pages/Messages.tsx')));
  check('review screen routed in dev builds', /import\.meta\.env\.DEV && path === '\/admin\/reports'/.test(src('App.tsx')));
  check('review screen not routed for every visitor', !/if \(path === '\/admin\/reports'\)/.test(src('App.tsx')));

  // Done screen: the team-review headline shows when the server took the report; otherwise "Saved on this device".
  const dlg = src('components/Report.tsx');
  check('done screen branches on sent.server', /sent\.server \? \([\s\S]*'report\.done\.t'[\s\S]*'report\.done\.d'[\s\S]*\) : \([\s\S]*'report\.saved\.t'/.test(dlg));
  check('unsent report names the reason', dlg.includes("reportsEndpoint() ? 'report.sendFailed' : 'report.notConnected'"));
  check('saved headline says device', strings['report.saved.t'].en === 'Saved on this device');
  check('unsent text does not promise a later send', !/until it is|حتى يتصل/.test(strings['report.notConnected'].en + strings['report.notConnected'].ar));

  done('reports');
})();
