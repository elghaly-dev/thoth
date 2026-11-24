import { AlertOctagon, FileText, Lock, MessageSquare, Scale, ShieldAlert, Upload } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useI18n, type StringKey } from '../i18n';
import { useStore } from '../lib/store';
import { DEAL, SUPPLIERS, byId } from '../data/sample';
import { fmtDate, fmtMoney, fmtNumber } from '../lib/format';
import { Dot } from '../components/GlowLine';
import { Button, ButtonLink, Glass, Num, PageHeader, SampleBadge } from '../components/ui';

export function DealPage() {
  const { t, lang } = useI18n();
  const { setAssistantCtx, openAssistant } = useStore();
  const s = byId(SUPPLIERS, DEAL.supplierId)!;
  useEffect(() => setAssistantCtx({ kind: 'deal', id: DEAL.id, label: `${DEAL.id}` }), [setAssistantCtx]);
  const total = DEAL.unitPrice * DEAL.quantity;
  const doneCount = DEAL.nodes.filter((n) => n.state === 'done').length;

  return (
    <div>
      <PageHeader title={`${t('deal.title')} · ${DEAL.id}`} sub={DEAL.title[lang]}><SampleBadge /></PageHeader>

      <div className="mb-6 flex items-start gap-3 rounded-[18px] border border-danger/40 bg-danger/10 p-4 text-sm text-ink-1">
        <ShieldAlert className="h-5 w-5 shrink-0 text-danger" aria-hidden="true" /><span>{t('pay.outside')}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Glass className="p-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Fact k={t('product.qty')} v={<><Num>{fmtNumber(DEAL.quantity, lang)}</Num> {DEAL.unit[lang]}</>} />
              <Fact k={t('product.unitPrice')} v={<Num>{fmtMoney(DEAL.unitPrice, DEAL.currency, lang)}</Num>} />
              <Fact k={t('deal.total')} v={<span className="text-xl text-lilac-200"><Num>{fmtMoney(total, DEAL.currency, lang)}</Num></span>} />
              <Fact k={t('rfq.incoterm')} v={<Num>{DEAL.incoterm}</Num>} />
              <Fact k={t('deal.ports')} v={<>{DEAL.from[lang]} → {DEAL.to[lang]}</>} />
              <Fact k={t('deal.buyer')} v={<bdi>{DEAL.buyer[lang]}</bdi>} />
              <Fact k={t('deal.supplier')} v={<bdi>{s.name[lang]}</bdi>} />
            </div>
            <p className="mt-5 flex items-center gap-2 border-t border-lilac-400/10 pt-4 text-xs text-ink-3"><Lock className="h-3.5 w-3.5 text-lilac-400" />{t('deal.locked')}</p>
          </Glass>

          <Glass className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl">{t('deal.timeline')}</h2><span className="num text-sm text-ink-3"><Num>{doneCount} / {DEAL.nodes.length}</Num></span></div>
            <ol className="relative">
              <span className="absolute bottom-3 start-[9px] top-3 w-[3px] rounded-full bg-lilac-400/15" aria-hidden="true" />
              <span className="absolute start-[9px] top-3 w-[3px] rounded-full bg-gradient-to-b from-lilac-200 to-lilac-400 shadow-[0_0_14px_rgba(196,161,236,0.8)]" style={{ height: `calc(${(doneCount / (DEAL.nodes.length - 1)) * 100}% - 12px)` }} aria-hidden="true" />
              {DEAL.nodes.map((n) => (
                <li key={n.key} className="relative flex gap-5 pb-6 last:pb-0" aria-current={n.state === 'now' ? 'step' : undefined}>
                  <Dot state={n.state} pulse />
                  <div className={`-mt-1 flex-1 ${n.state === 'now' ? 'rounded-[14px] border border-lilac-400/40 bg-lilac-400/5 p-4' : ''}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`font-semibold ${n.state === 'next' ? 'text-ink-2' : 'text-ink-1'}`}>{t(n.key as StringKey)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${n.state === 'done' ? 'bg-lilac-400/20 text-lilac-200' : n.state === 'now' ? 'bg-warning/15 text-warning' : 'text-ink-3'}`}>{t(`deal.state.${n.state}` as StringKey)}</span>
                      {n.date && <span className="num text-xs text-ink-3">{fmtDate(n.date, lang)}</span>}
                      {n.who && <span className="text-xs text-ink-3">{t('deal.by', { who: n.who[lang] })}</span>}
                    </div>
                    {n.doc && <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-lilac-400/20 px-2.5 py-1.5 text-xs"><FileText className="h-3.5 w-3.5 text-lilac-400" /><bdi dir="ltr">{n.doc.name}</bdi><span className="num text-ink-3" dir="ltr">#{n.doc.hash}</span></div>}
                    {n.key === 'deal.n3' && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-info">{t('escrow.notConnected')}</p>
                        <Button disabled>{t('deal.fund')}</Button>
                      </div>
                    )}
                    {n.key === 'deal.n9' && <Button variant="secondary" className="mt-2" disabled>{t('deal.confirmReceipt')}</Button>}
                  </div>
                </li>
              ))}
            </ol>
          </Glass>
        </div>

        <aside className="space-y-4">
          <Glass className="space-y-2 p-5">
            <ButtonLink to="/messages/t1" variant="secondary" className="w-full !justify-start"><MessageSquare className="h-4 w-4" />{t('deal.messages')}</ButtonLink>
            <ButtonLink to="/deal/D-1042" variant="secondary" className="w-full !justify-start"><Upload className="h-4 w-4" />{t('deal.documents')}</ButtonLink>
            <Button variant="secondary" className="w-full !justify-start" onClick={() => openAssistant(undefined, 'escrow')}><Scale className="h-4 w-4" />{t('assistant.s.escrow')}</Button>
          </Glass>
          <Glass className="p-5">
            <div className="flex items-center gap-2 font-semibold text-danger"><AlertOctagon className="h-4 w-4" />{t('deal.dispute')}</div>
            <p className="mt-2 text-sm text-ink-2">{t('deal.dispute.d')}</p>
          </Glass>
        </aside>
      </div>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: ReactNode }) {
  return <div><div className="text-xs text-ink-3">{k}</div><div className="mt-1 font-semibold">{v}</div></div>;
}
