// Manual review of verification requests. This screen is the one place a
// request becomes verified.
import { useState } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { loadRequests, reviewRequest } from '../lib/verification';
import { browserKV } from '../lib/reports';
import { Button, Glass, PageHeader } from '../components/ui';
import { VerifyStatusChip } from './Verify';

export function AdminVerifyPage() {
  const { t, lang } = useI18n();
  const [list, setList] = useState(() => loadRequests(browserKV()));
  const [notes, setNotes] = useState<Record<string, string>>({});
  const fmt = (iso: string) => new Date(iso).toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
  const decide = (id: string, d: 'verified' | 'rejected') => setList(reviewRequest(browserKV(), id, d, notes[id] ?? ''));

  return (
    <div>
      <PageHeader title={t('admin.vfy.title')} sub={t('admin.vfy.sub')} />
      {list.length === 0 ? <Glass className="p-8 text-center text-ink-3">{t('admin.vfy.empty')}</Glass> : (
        <ul className="space-y-4">
          {list.map((r) => (
            <li key={r.id}><Glass className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="chip">{t(`vfy.party.${r.party}` as StringKey)}</span>
                {r.status === 'rejected' ? <span className="chip text-danger">{t('admin.vfy.rejected')}</span> : <VerifyStatusChip status={r.status} />}
                <span className="ms-auto num text-ink-3">{fmt(r.createdAt)}</span>
              </div>
              <div className="mt-3 font-semibold"><bdi>{r.company}</bdi></div>
              <ul className="mt-2 space-y-1 text-sm">
                {r.docs.map((d) => <li key={d.type} className="flex flex-wrap justify-between gap-2"><span className="text-ink-2">{t(`vfy.doc.${d.type}` as StringKey)}</span><span className="num" dir="ltr">{d.number} · {d.fileName}</span></li>)}
              </ul>
              {r.status === 'pending' ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input className="field !w-auto flex-1" placeholder={t('admin.vfy.note')} aria-label={t('admin.vfy.note')} value={notes[r.id] ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} />
                  <Button onClick={() => decide(r.id, 'verified')}>{t('admin.vfy.approve')}</Button>
                  <Button variant="secondary" onClick={() => decide(r.id, 'rejected')}>{t('admin.vfy.reject')}</Button>
                </div>
              ) : r.reviewNote ? <p className="mt-3 text-sm text-ink-3">{r.reviewNote}</p> : null}
            </Glass></li>
          ))}
        </ul>
      )}
    </div>
  );
}
