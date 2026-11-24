import { useI18n } from '../i18n';
import { Link } from '../lib/router';

export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="lg-bg" cx="0.5" cy="0.25" r="0.9"><stop offset="0" stopColor="#24357a" /><stop offset="1" stopColor="#0b1026" /></radialGradient>
        <filter id="lg-gl"><feGaussianBlur stdDeviation="1.6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lg-bg)" stroke="rgba(196,161,236,.45)" />
      <path d="M12 42 C 22 18, 42 18, 52 42" fill="none" stroke="#c4a1ec" strokeWidth="2.6" strokeLinecap="round" filter="url(#lg-gl)" />
      <circle cx="12" cy="42" r="3.2" fill="#c4a1ec" filter="url(#lg-gl)" />
      <circle cx="32" cy="24" r="3.8" fill="#f1e7fd" filter="url(#lg-gl)" />
      <circle cx="52" cy="42" r="3.2" fill="#c4a1ec" filter="url(#lg-gl)" />
    </svg>
  );
}

export function Wordmark() {
  const { lang } = useI18n();
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label={lang === 'ar' ? 'حتحور، الرئيسية' : 'Hathor, home'}>
      <Logo />
      <span className="flex flex-col leading-none">
        <span className="wordmark title-gradient text-[1.35rem] font-bold">{lang === 'ar' ? 'حتحور' : 'HATHOR'}</span>
        <span className="mt-1 text-[0.65rem] tracking-wide text-ink-3">{lang === 'ar' ? 'HATHOR' : 'حتحور'}</span>
      </span>
    </Link>
  );
}

export function AssistantGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="#e6d4fa" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#c4a1ec" strokeWidth="1.5" opacity="0.8" />
      <circle cx="12" cy="12" r="11.2" fill="none" stroke="#c4a1ec" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}
