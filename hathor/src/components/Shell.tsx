import { AnimatePresence, motion } from 'motion/react';
import { FileText, Handshake, Home, LayoutGrid, MessageSquare, Search, UserRound, WifiOff, Languages } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { AssistantGlyph, Logo, Wordmark } from './Brand';
import { CommandPalette } from './CommandPalette';
import { AssistantPanel } from './AssistantPanel';

const NAV = [
  { to: '/catalog', key: 'nav.catalog', icon: LayoutGrid },
  { to: '/rfq/R-2041', key: 'nav.requests', icon: FileText },
  { to: '/deal/D-1042', key: 'nav.deals', icon: Handshake },
  { to: '/messages', key: 'nav.messages', icon: MessageSquare },
] as const;

function isActive(path: string, to: string) {
  const root = '/' + to.split('/')[1];
  return path === to || path.startsWith(root + '/') || path === root;
}

export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className={`inline-flex h-11 items-center gap-1.5 rounded-[12px] border border-lilac-400/30 px-3 text-sm text-lilac-200 hover:border-lilac-400 hover:bg-lilac-400/10 ${className}`}
      aria-label={t('lang.label')}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span lang={lang === 'ar' ? 'en' : 'ar'}>{t('lang.switch')}</span>
    </button>
  );
}

function AccountMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { path } = useRouter();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={t('nav.account')}
        className="grid h-11 w-11 place-items-center rounded-full border border-lilac-400/40 bg-gradient-to-br from-night-700 to-night-900 text-lilac-200 hover:shadow-glow">
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
            className="glass absolute end-0 top-14 z-40 w-60 p-2">
            {([
              ['/dashboard', 'nav.dashboard'], ['/dashboard/supplier', 'nav.supplierDashboard'], ['/register', 'nav.register'], ['/pricing', 'nav.pricing'],
            ] as const).map(([to, k]) => (
              <Link key={to} to={to} className="block rounded-lg px-3 py-2.5 text-sm text-ink-1 hover:bg-lilac-400/10 hover:text-lilac-200">{t(k)}</Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header() {
  const { t, lang } = useI18n();
  const { path } = useRouter();
  const { setPaletteOpen, openAssistant } = useStore();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className="sticky top-0 z-30 border-b border-lilac-400/15 bg-night-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-4 px-4 md:px-6 lg:px-8">
        <Wordmark />
        <button type="button" onClick={() => setPaletteOpen(true)}
          className="ms-4 hidden h-11 flex-1 items-center gap-3 rounded-[12px] border border-lilac-400/25 bg-input/80 px-4 text-sm text-ink-3 hover:border-lilac-400/60 lg:flex lg:max-w-md">
          <Search className="h-4 w-4 text-lilac-400" aria-hidden="true" />
          <span className="flex-1 text-start">{t('search.placeholder')}</span>
          <kbd className="num rounded-md border border-lilac-400/30 px-1.5 py-0.5 text-[0.7rem] text-lilac-200" dir="ltr">{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
        </button>
        <nav className="ms-auto hidden items-center gap-1 lg:flex" aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main'}>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} aria-current={isActive(path, n.to) ? 'page' : undefined}
              className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${isActive(path, n.to) ? 'text-lilac-200' : 'text-ink-2 hover:text-lilac-200'}`}>
              {t(n.key)}
              {isActive(path, n.to) && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded bg-lilac-400 shadow-[0_0_10px_#c4a1ec]" />}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 lg:ms-2">
          <button type="button" onClick={() => setPaletteOpen(true)} className="grid h-11 w-11 place-items-center rounded-[12px] border border-lilac-400/30 text-lilac-200 lg:hidden" aria-label={t('nav.search')}>
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => openAssistant()} className="hidden h-11 items-center gap-2 rounded-[12px] border border-lilac-400/40 bg-lilac-400/10 px-3 text-sm font-semibold text-lilac-200 hover:shadow-glow md:inline-flex">
            <AssistantGlyph /> <span lang="ar">الغالي</span>
          </button>
          <LangSwitch />
          <div className="hidden lg:block"><AccountMenu /></div>
        </div>
      </div>
    </header>
  );
}

function TabBar() {
  const { t } = useI18n();
  const { path } = useRouter();
  const items = [{ to: '/', key: 'nav.home', icon: Home } as const, ...NAV];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-lilac-400/20 bg-night-900/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="tabs">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((n) => {
          const active = n.to === '/' ? path === '/' : isActive(path, n.to);
          const I = n.icon;
          return (
            <li key={n.to}>
              <Link to={n.to} aria-current={active ? 'page' : undefined} className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] ${active ? 'text-lilac-200' : 'text-ink-3'}`}>
                {active && <motion.span layoutId="tab-glow" className="absolute top-0 h-[3px] w-10 rounded-b bg-lilac-400 shadow-[0_0_12px_#c4a1ec]" />}
                <I className="h-5 w-5" aria-hidden="true" />
                {t(n.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-lilac-400/15 pb-28 pt-10 lg:pb-12">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <div>
            <div className="text-sm text-ink-1">{t('footer.rights')}</div>
            <div className="text-xs text-ink-3">{t('sample.note')}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-ink-2">
          <Link to="/pricing" className="hover:text-lilac-200">{t('nav.pricing')}</Link>
          <Link to="/register" className="hover:text-lilac-200">{t('nav.register')}</Link>
          <Link to="/dashboard" className="hover:text-lilac-200">{t('nav.dashboard')}</Link>
          <Link to="/dashboard/supplier" className="hover:text-lilac-200">{t('nav.supplierDashboard')}</Link>
        </div>
      </div>
    </footer>
  );
}

function OfflineBanner() {
  const { t } = useI18n();
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return <div role="status" className="flex items-center justify-center gap-2 bg-warning/15 py-2 text-sm text-warning"><WifiOff className="h-4 w-4" aria-hidden="true" />{t('offline.banner')}</div>;
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-auto lg:end-6 lg:start-auto lg:top-20 lg:items-end">
      <AnimatePresence>
        {toasts.map((x) => (
          <motion.div key={x.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass pointer-events-auto px-4 py-3 text-sm text-ink-1">
            {x.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { path } = useRouter();
  const { setPaletteOpen, openAssistant, assistantOpen } = useStore();

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
      else if (e.key === '/' && !inField) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [setPaletteOpen]);

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-lilac-400 focus:px-4 focus:py-2 focus:text-on-lilac">{t('nav.skip')}</a>
      <OfflineBanner />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[1240px] px-4 pt-6 md:px-6 lg:px-8 lg:pt-10">
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <TabBar />
      {!assistantOpen && (
        <motion.button key="fab" type="button" onClick={() => openAssistant()} whileTap={{ scale: 0.94 }} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`fixed end-4 z-30 h-14 ${path.startsWith('/messages') ? 'hidden lg:flex' : 'flex'} ${path.startsWith('/product/') ? 'bottom-40' : 'bottom-24'} items-center gap-2 rounded-full border border-lilac-300/60 bg-gradient-to-br from-night-700 to-night-900 ps-3 pe-4 text-sm font-semibold text-lilac-100 shadow-[0_0_0_4px_rgba(196,161,236,0.12),0_0_30px_rgba(159,127,209,0.55)] lg:bottom-8 lg:end-8`}
          aria-label={t('assistant.ask')}>
          <AssistantGlyph className="h-7 w-7" /> <span lang="ar">الغالي</span>
        </motion.button>
      )}
      <CommandPalette />
      <AssistantPanel />
      <Toasts />
    </div>
  );
}
