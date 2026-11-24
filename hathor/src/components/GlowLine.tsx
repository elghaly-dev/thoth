import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { useI18n } from '../i18n';

export type GlowNode = { label: string; caption?: string; state: 'done' | 'now' | 'next' };

// The signature element: a glowing lilac curve with nodes. Horizontal from lg,
// vertical list on small screens. The path layer mirrors in RTL; labels do not.
export function GlowLine({ nodes, pulse = false, compact = false }: { nodes: GlowNode[]; pulse?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const { dir } = useI18n();
  const n = nodes.length;
  const W = 1000;
  const H = compact ? 90 : 140;
  const xs = nodes.map((_, i) => (n === 1 ? W / 2 : 40 + (i * (W - 80)) / (n - 1)));
  const d = `M 0 ${H * 0.86} C ${W * 0.28} ${H * 0.02}, ${W * 0.72} ${H * 0.02}, ${W} ${H * 0.86}`;

  return (
    <div className="w-full">
      <div className="relative hidden lg:block" style={{ aspectRatio: `${W} / ${H + 56}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-x-0 top-0 w-full overflow-visible" style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : undefined }} aria-hidden="true">
          <defs>
            <filter id="glowline" x="-0.1" y="-1" width="1.2" height="3">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="glowline-g" x1="0" x2="1">
              <stop offset="0" stopColor="#9f7fd1" stopOpacity="0.2" />
              <stop offset="0.5" stopColor="#d9c6f7" />
              <stop offset="1" stopColor="#9f7fd1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d={d} fill="none" stroke="rgba(196,161,236,0.16)" strokeWidth="12" strokeLinecap="round" />
          <motion.path
            d={d} fill="none" stroke="url(#glowline-g)" strokeWidth="3" strokeLinecap="round" filter="url(#glowline)"
            initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <ol className="absolute inset-0">
          {nodes.map((node, i) => {
            const x = dir === 'rtl' ? W - xs[i] : xs[i];
            const y = curveY(xs[i], H);
            return (
              <li key={i} className="absolute flex -translate-x-1/2 flex-col items-center text-center" style={{ left: `${(x / W) * 100}%`, top: `${(y / (H + 56)) * 100}%`, width: `${Math.min(180, 900 / n)}px`, marginTop: '-9px' }} aria-current={node.state === 'now' ? 'step' : undefined}>
                <Dot state={node.state} pulse={pulse && !reduce} />
                <span className={`mt-3 text-sm font-semibold ${node.state === 'next' ? 'text-ink-2' : 'text-lilac-200'}`}>{node.label}</span>
                {node.caption && !compact && <span className="mt-0.5 text-xs leading-snug text-ink-3">{node.caption}</span>}
              </li>
            );
          })}
        </ol>
      </div>
      <ol className="relative space-y-4 ps-2 lg:hidden">
        <span className="absolute inset-y-2 start-[17px] w-[3px] rounded-full bg-gradient-to-b from-lilac-300 via-lilac-400 to-lilac-500/30 shadow-[0_0_12px_rgba(196,161,236,0.7)]" aria-hidden="true" />
        {nodes.map((node, i) => (
          <li key={i} className="relative flex items-start gap-4" aria-current={node.state === 'now' ? 'step' : undefined}>
            <Dot state={node.state} pulse={pulse && !reduce} />
            <div className="-mt-0.5">
              <div className={`text-sm font-semibold ${node.state === 'next' ? 'text-ink-2' : 'text-lilac-200'}`}>{node.label}</div>
              {node.caption && !compact && <div className="text-xs text-ink-3">{node.caption}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function curveY(x: number, H: number): number {
  // Cubic bezier y for the curve above, solved by sampling t.
  const p0 = { x: 0, y: H * 0.86 }, p1 = { x: 280, y: H * 0.02 }, p2 = { x: 720, y: H * 0.02 }, p3 = { x: 1000, y: H * 0.86 };
  let best = 0, bestErr = Infinity;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const bx = (1 - t) ** 3 * p0.x + 3 * (1 - t) ** 2 * t * p1.x + 3 * (1 - t) * t ** 2 * p2.x + t ** 3 * p3.x;
    const err = Math.abs(bx - x);
    if (err < bestErr) { bestErr = err; best = t; }
  }
  const t = best;
  return (1 - t) ** 3 * p0.y + 3 * (1 - t) ** 2 * t * p1.y + 3 * (1 - t) * t ** 2 * p2.y + t ** 3 * p3.y;
}

export function Dot({ state, pulse }: { state: 'done' | 'now' | 'next'; pulse?: boolean }) {
  if (state === 'done')
    return (
      <span className="relative z-10 grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full bg-lilac-400 text-on-lilac shadow-[0_0_12px_rgba(196,161,236,0.7)]">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </span>
    );
  if (state === 'now')
    return (
      <span className="relative z-10 grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border-2 border-lilac-200 bg-card-solid shadow-node">
        <span className={`h-2 w-2 rounded-full bg-lilac-200 ${pulse ? 'animate-pulse-node' : ''}`} />
      </span>
    );
  return <span className="relative z-10 h-[20px] w-[20px] shrink-0 rounded-full border-2 border-lilac-400/70 bg-card-solid" />;
}

// A tiny single-row version for dashboards.
export function MiniLine({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="flex flex-1 items-center gap-1">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${i < current ? 'bg-lilac-400' : i === current ? 'bg-lilac-200 shadow-node' : 'border border-lilac-400/60'}`} />
          {i < total - 1 && <span className={`h-[2px] flex-1 rounded ${i < current ? 'bg-lilac-400/80' : 'bg-lilac-400/20'}`} />}
        </span>
      ))}
    </div>
  );
}
