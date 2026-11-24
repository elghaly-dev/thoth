import { useId } from 'react';
import { NamedIcon } from './Icon';

// Product image placeholder: a lit studio backdrop in the navy and lilac
// palette, with a soft pattern and the category glyph. Used until suppliers
// upload real photos.
export function ProductArt({ icon, hue, pattern, label, className = '' }: {
  icon: string; hue: number; pattern: 'dots' | 'waves' | 'grid' | 'rings'; label: string; className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const tint = `hsl(${hue} 70% 72%)`;
  return (
    <div role="img" aria-label={label} className={`relative overflow-hidden bg-night-800 ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id={`bg${id}`} cx="0.5" cy="0.35" r="0.8">
            <stop offset="0" stopColor={`hsl(${hue} 45% 30%)`} stopOpacity="0.75" />
            <stop offset="0.55" stopColor="#151b45" />
            <stop offset="1" stopColor="#0a0f26" />
          </radialGradient>
          <linearGradient id={`fl${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#c4a1ec" stopOpacity="0" />
            <stop offset="1" stopColor="#c4a1ec" stopOpacity="0.18" />
          </linearGradient>
          <pattern id={`p${id}`} width="22" height="22" patternUnits="userSpaceOnUse">
            {pattern === 'dots' && <circle cx="11" cy="11" r="1.3" fill={tint} opacity="0.28" />}
            {pattern === 'grid' && <path d="M22 0H0V22" fill="none" stroke={tint} strokeOpacity="0.16" />}
            {pattern === 'waves' && <path d="M0 14 Q 5.5 6 11 14 T 22 14" fill="none" stroke={tint} strokeOpacity="0.22" />}
            {pattern === 'rings' && <circle cx="11" cy="11" r="7" fill="none" stroke={tint} strokeOpacity="0.16" />}
          </pattern>
          <filter id={`gl${id}`} x="-0.2" y="-0.2" width="1.4" height="1.4">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <rect width="400" height="300" fill={`url(#bg${id})`} />
        <rect width="400" height="300" fill={`url(#p${id})`} />
        <ellipse cx="200" cy="248" rx="130" ry="18" fill="#000" opacity="0.35" />
        <path d="M20 250 C 120 190, 280 190, 380 250" fill="none" stroke="#d9c6f7" strokeWidth="6" opacity="0.25" filter={`url(#gl${id})`} />
        <path d="M20 250 C 120 190, 280 190, 380 250" fill="none" stroke="#d9c6f7" strokeWidth="1.5" opacity="0.7" />
        <circle cx="200" cy="205" r="4" fill="#e6d4fa" />
        <rect y="180" width="400" height="120" fill={`url(#fl${id})`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full blur-2xl" style={{ background: `hsl(${hue} 70% 65% / 0.28)` }} />
          <NamedIcon name={icon} className="relative h-16 w-16 text-lilac-200 drop-shadow-[0_0_14px_rgba(196,161,236,0.55)]" strokeWidth={1.25} />
        </div>
      </div>
    </div>
  );
}
