// Verified-business request (preview). The number is format-checked here and the
// device keeps its last 4 characters; review needs the Hathor server. The status
// is read from the device and never set to "verified" by this page.
import { useState } from 'react';
import { BadgeCheck, CircleHelp, Hourglass } from 'lucide-react';
import { useI18n, type StringKey } from '../i18n';
import { useStore } from '../lib/store';
import { DOCS, PARTIES, buildRequest, loadRequests, statusFor, submitRequest, type DocType, type DocUpload, type Party, type VerifyError } from '../lib/verification';
import { browserKV } from '../lib/reports';
import { Button, Glass, PageHeader } from '../components/ui';

export function VerifyStatusChip({ status }: { status: 'none' | 'pending' | 'verified' }) {
  const { t } = useI18n();
  const I = status === 'verified' ? BadgeCheck : status === 'pending' ? Hourglass : CircleHelp;
  return <span className={`chip ${status === 'verified' ? '!border-lilac-400 text-lilac-200' : 'text-ink-3'}`}><I className="h-3.5 w-3.5" aria-hidden="true" />{t(`vfy.status.${status}` as StringKey)}</span>;
}

export function VerifyPage() {
  const { t } = useI18n();
  const { toast } = useStore();
  const [party, setParty] = useState<Party>('india-buyer');
  const [company, setCompany] = useState('');
  const [vat, setVat] = useState(false);
  const [docs, setDocs] = useState<Partial<Record<DocType, DocUpload>>>({});
  const [errors, setErrors] = useState<VerifyError[]>([]);
  const [list, setList] = useState(() => loadRequests(browserKV()));
  const status = statusFor(list, party, { localVerified: import.meta.env.DEV });
  const label = 'mb-1.5 block text-sm text-ink-2';
  const setDoc = (type: DocType, patch: Partial<DocUpload>) => setDocs((d) => ({ ...d, [type]: { type, number: '', fileName: '', ...d[type], ...patch } }));
  const err = (field: string) => { const e = errors.find((x) => x.field === field); return e ? <span role="alert" className="mt-1 block text-xs text-danger">{t(`vfy.err.${e.code}` as StringKey)}</span> : null; };

  const submit = () => {
    const r = buildRequest(party, company, vat, Object.values(docs).filter((d): d is DocUpload => !!d && DOCS[party].some((a) => a.type === d.type)));
    if (!r.ok) { setErrors(r.errors); toast(t('rfq.errors')); return; }
    setErrors([]); setList(submitRequest(browserKV(), r.request)); toast(t('vfy.status.pending'));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('vfy.title')} sub={t('vfy.sub')}><VerifyStatusChip status={status} /></PageHeader>
      <Glass className="space-y-5 p-6 md:p-8">
        <p className="rounded-[14px] border border-warning/30 bg-warning/5 p-3 text-sm text-ink-2">{t('vfy.preview')}</p>
        <fieldset><legend className={label}>{t('vfy.party')}</legend>
          <div className="flex flex-wrap gap-2">{PARTIES.map((p) => <button key={p} type="button" aria-pressed={party === p} onClick={() => { setParty(p); setErrors([]); }} className={`chip h-11 !px-4 ${party === p ? '!border-lilac-400 !bg-lilac-400/25' : ''}`}>{t(`vfy.party.${p}` as StringKey)}</button>)}</div>
        </fieldset>
        <label className="block"><span className={label}>{t('vfy.company')}</span><input className="field" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />{err('company')}</label>
        {party !== 'india-buyer' && <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#c4a1ec]" checked={vat} onChange={() => setVat(!vat)} />{t('vfy.vat')}</label>}
        <p className="rounded-[14px] border border-lilac-400/20 bg-lilac-400/5 p-3 text-sm text-ink-2">{t('vfy.businessDocs')}</p>
        {DOCS[party].map((d) => (
          <div key={d.type} className="rounded-[14px] border border-lilac-400/15 p-4">
            <div className="mb-3 flex items-center justify-between gap-2"><span className="font-semibold">{t(`vfy.doc.${d.type}` as StringKey)}</span><span className="text-xs text-ink-3">{t(`vfy.need.${d.need}` as StringKey)}</span></div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block"><span className={label}>{t('vfy.number')}</span><input dir="ltr" className="field num" autoComplete="off" value={docs[d.type]?.number ?? ''} onChange={(e) => setDoc(d.type, { number: e.target.value })} /><span className="mt-1 block text-xs text-ink-3">{t('vfy.numberNote')}</span></label>
              <label className="block"><span className={label}>{t('vfy.file')}</span><input type="file" accept=".pdf,.png,.jpg,.jpeg" className="field !h-auto py-2" onChange={(e) => setDoc(d.type, { fileName: e.target.files?.[0]?.name ?? '' })} /></label>
            </div>
            {err(d.type)}
          </div>
        ))}
        <p className="text-xs text-ink-3">{t('vfy.manual')}</p>
        <p className="text-xs text-warning">{t('verify.notConnected')}</p>
        <div className="flex justify-end"><Button onClick={submit} disabled={status === 'pending'}>{t('vfy.submit')}</Button></div>
      </Glass>
    </div>
  );
}
