import { motion } from 'motion/react';
import { AlertTriangle, BadgeCheck, CircleHelp, Crown, EyeOff, FlaskRound, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Link } from '../lib/router';
import { MASK_TOKEN } from '../lib/mask';
import type { VerifyLevel } from '../data/sample';
import { fmtDate } from '../lib/format';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-lilac-400 text-on-lilac font-semibold hover:bg-lilac-300 hover:shadow-glow',
  secondary: 'border border-border-strong text-lilac-200 hover:border-lilac-400 hover:bg-lilac-400/10',
  quiet: 'text-ink-2 hover:text-lilac-200 hover:underline underline-offset-4',
  danger: 'bg-danger text-on-lilac font-semibold',
};
const BASE = 'inline-flex select-none items-center justify-center gap-2 rounded-[12px] px-5 text-[0.95rem] transition-[background,box-shadow,border-color,color] duration-150 disabled:cursor-not-allowed disabled:opacity-50';

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} className={`${BASE} ${size === 'lg' ? 'h-[52px] px-6' : 'h-11'} ${VARIANTS[variant]} ${className}`} {...(rest as object)}>
      {children}
    </motion.button>
  );
}

export function ButtonLink({ to, variant = 'primary', size = 'md', className = '', children }: { to: string; variant?: Variant; size?: 'md' | 'lg'; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className={`${BASE} ${size === 'lg' ? 'h-[52px] px-6' : 'h-11'} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Glass({ className = '', hover = false, children, as: As = 'div' }: { className?: string; hover?: boolean; children: ReactNode; as?: 'div' | 'section' | 'article' | 'aside' }) {
  return <As className={`glass ${hover ? 'glass-hover' : ''} ${className}`}>{children}</As>;
}

export function SectionTitle({ title, kicker, action }: { title: string; kicker?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && <div className="mb-1 text-xs font-semibold tracking-wide text-lilac-400">{kicker}</div>}
        <h2 className="title-gradient text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function SampleBadge({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-info/40 bg-info/10 px-2 py-0.5 text-[0.72rem] font-semibold text-info ${className}`}>
      <FlaskRound className="h-3 w-3" aria-hidden="true" /> {t('sample.badge')}
    </span>
  );
}

export function EstimateTag() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning" title={t('estimate.broker')}>
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> {t('estimate.label')}
    </span>
  );
}

export function ScamCheckTag({ check }: { check: 'clear' | 'unknown' | 'dangerous' }) {
  const { t } = useI18n();
  if (check === 'clear') return <span className="inline-flex items-center gap-1 text-[0.72rem] text-success"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{t('check.clear')}</span>;
  if (check === 'unknown') return <span className="inline-flex items-center gap-1 text-[0.72rem] text-warning"><ShieldQuestion className="h-3.5 w-3.5" aria-hidden="true" />{t('check.unknown')}</span>;
  return <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-danger"><ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />{t('check.dangerous')}</span>;
}

const LEVEL_KEYS = ['verify.pending', 'verify.documents', 'verify.partner', 'verify.site'] as const;

export function VerifiedBadge({ level, date, short = false }: { level: VerifyLevel; date?: string; short?: boolean }) {
  const { t, lang } = useI18n();
  if (level === 0) return <span className="inline-flex items-center gap-1 text-xs text-ink-3"><CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />{t('verify.pending')}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <BadgeCheck className="h-4 w-4 text-lilac-400" aria-hidden="true" />
      <span className="font-semibold text-lilac-200">{t(LEVEL_KEYS[level])}</span>
      {!short && date && <span className="num text-ink-3">· {fmtDate(date, lang, { month: 'short', year: 'numeric' })}</span>}
    </span>
  );
}

export function PremiumBadge({ short = false }: { short?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-lilac-300 to-lilac-500 px-2 py-0.5 text-[0.7rem] font-bold text-on-lilac shadow-[0_0_14px_rgba(196,161,236,0.45)]">
      <Crown className="h-3 w-3" aria-hidden="true" /> {short ? t('supplier.premiumShort') : t('supplier.premium')}
    </span>
  );
}

// Renders text with masked contact details shown as a chip.
export function MaskedText({ text }: { text: string }) {
  const { t } = useI18n();
  const parts = text.split(MASK_TOKEN);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-flex items-center gap-1 rounded-md border border-lilac-400/40 bg-lilac-400/15 px-1.5 py-0.5 align-middle text-[0.72rem] font-semibold text-lilac-200">
              <EyeOff className="h-3 w-3" aria-hidden="true" /> {t('chat.hidden')}
            </span>
          )}
        </span>
      ))}
    </>
  );
}

export function Num({ children }: { children: ReactNode }) {
  return <bdi dir="ltr" className="num">{children}</bdi>;
}

export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}>
      {children}
    </motion.div>
  );
}

export function Rise({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } } }}>
      {children}
    </motion.div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="title-gradient text-[clamp(2rem,1.5rem+2vw,3rem)] leading-tight">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-ink-2">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
