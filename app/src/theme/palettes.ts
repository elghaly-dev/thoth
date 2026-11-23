/**
 * Thoth's light palettes. Design only: each palette sets Tailwind's own colour
 * variables (--color-slate-*, --color-emerald-*, ...) so every existing
 * component takes the new look without any change to its logic.
 *
 * Mapping (the app was written for a dark screen, so the neutral scale is
 * turned over):
 *  - slate 950/900 are the page and card colours; slate 50..500 are text,
 *    from ink to the muted tone; 600..800 are hairlines and soft fills.
 *  - white is the ink colour; black is the page colour.
 *  - warm-family colour variables (a legacy of the original design) take the palette's first accent;
 *    cool accents (emerald, green, teal, cyan, sky, blue, indigo, violet,
 *    purple, fuchsia) take the second; rose, red and pink take the
 *    palette's warning colour. Shades 50..500 are the deep accent (text,
 *    and fills that carry page-colour text); 600..950 are soft tints that
 *    carry ink text.
 * Every pair the app uses is checked for WCAG AA in tests/palettes.ts.
 */

export type PaletteId = 'navy-lilac' | 'pearl-sage' | 'sand-rose' | 'sky-silver' | 'cream-teal' | 'mist-grey';

export interface Palette {
  id: PaletteId;
  paper: string; // page
  surface: string; // cards
  ink: string; // main text
  muted: string; // secondary text (AA on paper and surface)
  hair: string; // hairline borders
  a: string; // first accent, deep (AA text)
  b: string; // second accent, deep (AA text)
  warn: string; // warning colour, deep (AA text)
}

export const PALETTES: Palette[] = [
  { id: 'navy-lilac', paper: '#0B1020', surface: '#121A33', ink: '#F1ECFA', muted: '#B4B0C8', hair: '#3E3670', a: '#C4A1EC', b: '#B3B8F5', warn: '#F5A3B6' },
  { id: 'pearl-sage', paper: '#F5F6F2', surface: '#FFFFFF', ink: '#1C2420', muted: '#515C55', hair: '#C2CFBF', a: '#425F49', b: '#4B4F8C', warn: '#9B2C3C' },
  { id: 'sand-rose', paper: '#F8F0E8', surface: '#FFFAF5', ink: '#2A1D1B', muted: '#66524D', hair: '#DFBFB3', a: '#88404D', b: '#5A4B8C', warn: '#9B2C2C' },
  { id: 'sky-silver', paper: '#F2F5F9', surface: '#FFFFFF', ink: '#17202B', muted: '#4E5A67', hair: '#C2CDD9', a: '#2C5A83', b: '#4F5A66', warn: '#9B2C3C' },
  { id: 'cream-teal', paper: '#FAF5EA', surface: '#FFFCF3', ink: '#1C2422', muted: '#525C58', hair: '#BCD5CE', a: '#1B645E', b: '#4B4F8C', warn: '#9B2C3C' },
  { id: 'mist-grey', paper: '#F1F1F0', surface: '#FBFBFA', ink: '#1D1E20', muted: '#53565B', hair: '#CBCBC6', a: '#474C55', b: '#55507A', warn: '#9B2C3C' },
];

export const DEFAULT_PALETTE: PaletteId = 'navy-lilac';
export const paletteById = (id: string | null | undefined): Palette =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0];

// ---- colour arithmetic (sRGB, enough for mixing and for the AA check) ----
const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
/** a mixed with b: t = share of b (0..1). */
export const mix = (a: string, b: string, t: number) => {
  const x = hex(a), y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (h: string) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const NEUTRALS = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
const WARM = ['amber', 'orange', 'yellow'];
const COOL = ['emerald', 'green', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'lime'];
const WARN = ['rose', 'red', 'pink'];

/** The neutral scale for a palette (shade -> colour). */
export function neutralScale(p: Palette): Record<number, string> {
  return {
    50: p.ink,
    100: p.ink,
    200: mix(p.ink, p.muted, 0.3),
    300: mix(p.ink, p.muted, 0.6),
    400: p.muted,
    500: p.muted,
    600: mix(p.muted, p.paper, 0.4),
    700: p.hair,
    800: mix(p.paper, p.ink, 0.07),
    900: p.surface,
    950: p.paper,
  };
}

/** An accent scale: 50..500 deep (text), 600..950 soft tints over the page. */
export function accentScale(p: Palette, deep: string): Record<number, string> {
  return {
    50: mix(deep, p.ink, 0.45),
    100: mix(deep, p.ink, 0.35),
    200: mix(deep, p.ink, 0.2),
    300: deep,
    400: deep,
    500: deep,
    600: mix(p.paper, deep, 0.26),
    700: mix(p.paper, deep, 0.2),
    800: mix(p.paper, deep, 0.13),
    900: mix(p.paper, deep, 0.08),
    950: mix(p.paper, deep, 0.05),
  };
}

/** Every CSS custom property a palette sets. */
export function paletteVars(p: Palette): Record<string, string> {
  const out: Record<string, string> = {
    '--color-white': p.ink,
    '--color-black': p.paper,
    '--thoth-paper': p.paper,
    '--thoth-surface': p.surface,
    '--thoth-ink': p.ink,
    '--thoth-hair': p.hair,
    '--thoth-accent': p.a,
    '--thoth-shadow': `0 1px 2px ${mix(p.paper, p.ink, 0.06)}, 0 12px 32px -12px ${mix(p.paper, p.ink, 0.16)}`,
  };
  const n = neutralScale(p);
  const sets: [string[], Record<number, string>][] = [
    [NEUTRALS, n],
    [WARM, accentScale(p, p.a)],
    [COOL, accentScale(p, p.b)],
    [WARN, accentScale(p, p.warn)],
  ];
  for (const [families, scale] of sets) {
    for (const f of families) for (const s of SHADES) out[`--color-${f}-${s}`] = scale[s];
  }
  return out;
}
