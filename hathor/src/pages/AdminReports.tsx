// Review queue for reports. Reads the same queue the «بلّغ» dialog writes to.
// Every note and quoted message is already masked when it is stored.
import { Flag, Info } from 'lucide-react';
import { useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { useStore } from '../lib/store';
import { Link } from '../lib/router';
import { reportsEndpoint, type Report, type ReportStatus } from '../lib/reports';
import { Button, Glass, MaskedText, PageHeader } from '../components/ui';

const STATUSES: ReportStatus[] = ['pending', 'reviewed', 'dismissed'];

function targetLink(r: Report): string | null {
  if (r.target.kind === 'supplier') return `/supplier/${r.target.id}`;
  if (r.target.kind === 'product') return `/product/${r.target.id}`;
  if (r.target.kind === 'thread') return `/messages/${r.target.id}`;
  if (r.target.kind === 'message' && r.target.threadId) return `/messages/${r.target.threadId}`;
  return null;
}

export function AdminReportsPage() {
  const { t, lang } = useI18n();
  const { reports, setReportState } = useStore();
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending');
  const list = reports.filter((r) => filter === 'all' || r.status === filter);
  const fmt = (iso: string) => new Date(iso).toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div>
      <PageHeader title={t('admin.reports.title')} sub={t('admin.reports.sub')} />
      {!reportsEndpoint() && <p className="mb-6 flex items-start gap-2 rounded-[14px] border border-lilac-400/20 bg-lilac-400/5 p-4 text-sm text-ink-2"><Info className="h-4 w-4 shrink-0 text-lilac-400" />{t('report.notConnected')}</p>}
      <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label={t('admin.reports.filter')}>
        {(['all', ...STATUSES] as const).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={`chip ${filter === s ? '!border-lilac-400 !bg-lilac-400/15 text-lilac-200' : 'hover:border-lilac-400'}`}>
            {s === 'all' ? t('admin.reports.all') : t(`admin.reports.s.${s}` as StringKey)}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Glass className="p-8 text-center text-ink-3">{t('admin.reports.empty')}</Glass>
      ) : (
        <ul className="space-y-4">
          {list.map((r) => {
            const to = targetLink(r);
            return (
              <li key={r.id}>
                <Glass className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="chip"><Flag className="h-3 w-3 text-lilac-400" />{t(`admin.reports.k.${r.target.kind}` as StringKey)}</span>
                    <span className="chip">{t(`admin.reports.s.${r.status}` as StringKey)}</span>
                    <span className="text-ink-3">{r.sent ? t('admin.reports.sent') : t('admin.reports.unsent')}</span>
                    <span className="ms-auto num text-ink-3">{fmt(r.createdAt)}</span>
                  </div>
                  <div className="mt-3 font-semibold"><bdi>{r.target.label}</bdi></div>
                  <div className="mt-1 text-sm"><span className="text-ink-3">{t('admin.reports.reason')}: </span><span className="text-lilac-200">{t(`report.r.${r.reason}` as StringKey)}</span></div>
                  {r.target.quote && <blockquote className="mt-3 rounded-[12px] border-s-2 border-lilac-400/50 bg-night-800/50 px-3 py-2 text-sm text-ink-2"><span className="block text-xs text-ink-3">{t('admin.reports.quote')}</span><MaskedText text={r.target.quote} /></blockquote>}
                  {r.note && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-2"><span className="block text-xs text-ink-3">{t('report.note')}</span><MaskedText text={r.note} /></p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {to && <Link to={to} className="chip hover:border-lilac-400">{t('admin.reports.open')}</Link>}
                    {r.status === 'pending' ? (
                      <>
                        <Button onClick={() => setReportState(r.id, 'reviewed')}>{t('admin.reports.markReviewed')}</Button>
                        <Button variant="secondary" onClick={() => setReportState(r.id, 'dismissed')}>{t('admin.reports.dismiss')}</Button>
                      </>
                    ) : (
                      <Button variant="secondary" onClick={() => setReportState(r.id, 'pending')}>{t('admin.reports.reopen')}</Button>
                    )}
                  </div>
                </Glass>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
