/**
 * Every palette meets WCAG AA (4.5:1) for the text/background pairs the app uses.
 * Backgrounds with opacity (e.g. bg-slate-900/60, bg-emerald-500/10) are blended over
 * the page colour first, as the browser does.
 * Run: npm run test:palettes
 */
import { PALETTES, paletteVars, mix, contrast } from '../src/theme/palettes';

let checks = 0;
const fails: string[] = [];
const AA = 4.5;

for (const p of PALETTES) {
  const v = paletteVars(p);
  const c = (name: string) => {
    const val = v[`--color-${name}`];
    if (!val) throw new Error(`no colour ${name}`);
    return val;
  };
  const over = (name: string, alpha: number, under = p.paper) => mix(under, c(name), alpha);

  // Backgrounds the app puts text on.
  const backgrounds: Record<string, string> = {
    page: p.paper,
    card: p.surface,
    'slate-900/60': over('slate-900', 0.6),
    'slate-900/90': over('slate-900', 0.9),
    'slate-800': c('slate-800'),
    'slate-800/60': over('slate-800', 0.6),
    'slate-950/60 on card': mix(p.surface, c('slate-950'), 0.6),
  };
  for (const fam of ['emerald', 'amber', 'cyan', 'indigo', 'rose', 'teal', 'purple']) {
    backgrounds[`${fam}-500/10`] = over(`${fam}-500`, 0.1);
    backgrounds[`${fam}-500/20`] = over(`${fam}-500`, 0.2);
    backgrounds[`${fam}-950/40`] = over(`${fam}-950`, 0.4);
    backgrounds[`${fam}-900/30`] = over(`${fam}-900`, 0.3);
  }

  // Text colours used on those backgrounds.
  const texts = ['white', 'slate-100', 'slate-200', 'slate-300', 'slate-400', 'slate-500'];
  for (const fam of ['emerald', 'amber', 'cyan', 'indigo', 'rose', 'teal', 'purple', 'orange']) {
    for (const s of [200, 300, 400]) texts.push(`${fam}-${s}`);
  }
  for (const t of texts) {
    for (const [bn, bg] of Object.entries(backgrounds)) {
      checks++;
      const r = contrast(c(t), bg);
      if (r < AA) fails.push(`${p.id}: text-${t} on ${bn} = ${r.toFixed(2)}`);
    }
  }

  // Filled buttons: ink (text-white) on soft tints, page colour (text-slate-950) on deep fills.
  for (const fam of ['emerald', 'amber', 'cyan', 'indigo', 'rose', 'teal', 'purple', 'orange']) {
    for (const s of [600, 700, 800]) {
      checks++;
      const r = contrast(c('white'), c(`${fam}-${s}`));
      if (r < AA) fails.push(`${p.id}: text-white on bg-${fam}-${s} = ${r.toFixed(2)}`);
    }
    for (const s of [400, 500]) {
      checks++;
      const r = contrast(c('slate-950'), c(`${fam}-${s}`));
      if (r < AA) fails.push(`${p.id}: text-slate-950 on bg-${fam}-${s} = ${r.toFixed(2)}`);
    }
  }
  // The theme-picker tile: ink and muted on the tile's own page colour.
  checks++;
  if (contrast(p.muted, p.surface) < AA) fails.push(`${p.id}: muted on card`);
}

if (fails.length) {
  console.log(`palettes: FAIL ${fails.length}/${checks}`);
  fails.slice(0, 40).forEach((m) => console.log('  FAIL | ' + m));
  process.exit(1);
}
console.log(`palettes: PASS ${checks}/${checks} (WCAG AA 4.5:1, ${PALETTES.length} palettes)`);

// Hover states: under the palettes, shades 400/500 are deep accents, so a button with ink text
// (text-white) must never hover to them. Scan every component's class strings.
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const offenders: string[] = [];
  for (const f of walk(new URL('../src', import.meta.url).pathname).filter((x) => x.endsWith('.tsx'))) {
    const src = fs.readFileSync(f, 'utf8');
    // Each class string on its own: a static className="...", or each quoted branch inside a className={`...`}.
    const segments: string[] = [];
    for (const m of src.matchAll(/className="([^"]*)"/g)) segments.push(m[1]);
    for (const m of src.matchAll(/className=\{`([^`]*)`\}/g)) {
      const t = m[1];
      segments.push(t.replace(/\$\{[^}]*\}/g, ' '));
      for (const q of t.matchAll(/'([^']*)'/g)) segments.push(q[1]);
    }
    for (const c of segments) {
      // Opaque hover to a deep shade (a translucent hover such as /20 stays light).
      if (/(^|\s)text-white(\s|$)/.test(c) && /hover:bg-[a-z]+-(400|500)(?![\w/])/.test(c)) offenders.push(path.basename(f) + ': ' + c.trim().slice(0, 60));
    }
  }
  if (offenders.length) {
    console.log(`palettes: FAIL ink text hovering to a deep accent in ${offenders.join(', ')}`);
    process.exit(1);
  }
  console.log('palettes: no ink-text button hovers to a deep accent');
}
