import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Building2, FileText, Handshake, Home, Languages, LayoutDashboard, LayoutGrid, MessageSquare, Package, PlusCircle, Receipt, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { PRODUCTS, SUPPLIERS } from '../data/sample';
import { AssistantGlyph } from './Brand';

const item = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-ink-1 data-[selected=true]:bg-lilac-400/15 data-[selected=true]:text-lilac-100';
const group = '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-lilac-400';

export function CommandPalette() {
  const { t, lang, setLang, dir } = useI18n();
  const { navigate } = useRouter();
  const { paletteOpen, setPaletteOpen, openAssistant } = useStore();
  const [q, setQ] = useState('');

  useEffect(() => { if (!paletteOpen) setQ(''); }, [paletteOpen]);

  const run = (fn: () => void) => { setPaletteOpen(false); fn(); };
  const go = (to: string) => run(() => navigate(to));

  const pages = [
    { to: '/', k: 'nav.home', icon: Home },
    { to: '/catalog', k: 'nav.catalog', icon: LayoutGrid },
    { to: '/rfq/R-2041', k: 'compare.title', icon: FileText },
    { to: '/deal/D-1042', k: 'deal.title', icon: Handshake },
    { to: '/messages', k: 'nav.messages', icon: MessageSquare },
    { to: '/dashboard', k: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/dashboard/supplier', k: 'nav.supplierDashboard', icon: Building2 },
    { to: '/register', k: 'nav.register', icon: UserPlus },
    { to: '/pricing', k: 'nav.pricing', icon: Receipt },
  ] as const;

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-night-950/70 backdrop-blur-sm sm:pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setPaletteOpen(false)}>
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass h-full w-full overflow-hidden sm:h-auto sm:max-w-[640px]" onMouseDown={(e) => e.stopPropagation()}>
            <Command label={t('nav.search')} dir={dir} loop className="flex h-full flex-col" onKeyDown={(e) => { if (e.key === 'Escape') setPaletteOpen(false); }}>
              <div className="flex items-center gap-3 border-b border-lilac-400/20 px-4">
                <Search className="h-5 w-5 text-lilac-400" aria-hidden="true" />
                <Command.Input autoFocus value={q} onValueChange={setQ} placeholder={t('cmd.placeholder')} className="h-14 flex-1 bg-transparent text-base text-ink-1 outline-none placeholder:text-ink-3" />
                <kbd className="num rounded-md border border-lilac-400/30 px-1.5 py-0.5 text-[0.7rem] text-ink-3">Esc</kbd>
              </div>
              <Command.List className="max-h-none flex-1 overflow-y-auto p-2 sm:max-h-[420px]">
                <Command.Empty className="px-3 py-8 text-center text-sm text-ink-3">{t('cmd.empty')}</Command.Empty>
                <Command.Group heading={t('cmd.actions')} className={group}>
                  <Command.Item className={item} onSelect={() => go('/rfq/new')}><PlusCircle className="h-4 w-4 text-lilac-400" />{t('rfq.new')}</Command.Item>
                  <Command.Item className={item} onSelect={() => run(() => openAssistant())}><AssistantGlyph className="h-4 w-4" />{t('assistant.ask')}</Command.Item>
                  <Command.Item className={item} onSelect={() => run(() => setLang(lang === 'ar' ? 'en' : 'ar'))}><Languages className="h-4 w-4 text-lilac-400" />{t('lang.switch')}</Command.Item>
                </Command.Group>
                <Command.Group heading={t('cmd.goto')} className={group}>
                  {pages.map((p) => { const I = p.icon; return (
                    <Command.Item key={p.to} value={`${t(p.k)} ${p.to}`} className={item} onSelect={() => go(p.to)}><I className="h-4 w-4 text-lilac-400" />{t(p.k)}</Command.Item>
                  ); })}
                </Command.Group>
                <Command.Group heading={t('cmd.products')} className={group}>
                  {PRODUCTS.map((p) => (
                    <Command.Item key={p.id} value={`${p.title.ar} ${p.title.en} ${p.hs}`} className={item} onSelect={() => go(`/product/${p.id}`)}>
                      <Package className="h-4 w-4 text-lilac-400" /><span className="flex-1 truncate"><bdi>{p.title[lang]}</bdi></span><span className="num text-xs text-ink-3" dir="ltr">HS {p.hs}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading={t('cmd.suppliers')} className={group}>
                  {SUPPLIERS.map((s) => (
                    <Command.Item key={s.id} value={`${s.name.ar} ${s.name.en}`} className={item} onSelect={() => go(`/supplier/${s.id}`)}>
                      <Building2 className="h-4 w-4 text-lilac-400" /><span className="flex-1"><bdi>{s.name[lang]}</bdi></span><ArrowUpRight className="h-4 w-4 text-ink-3 rtl:-scale-x-100" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
              <div className="border-t border-lilac-400/15 px-4 py-2.5 text-xs text-ink-3">{t('cmd.hint')}</div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
