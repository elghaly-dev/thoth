/**
 * Accessibility basics on the tab components (static check of the JSX):
 * - every <input>/<textarea>/<select> has a label (aria-label,
 *   aria-labelledby, a <label htmlFor> matching its id, or a wrapping <label>);
 * - every icon-only <button> has an aria-label;
 * - no low-contrast slate-500/600 text on the dark theme (slate-500 on
 *   slate-900 is 3.75:1, under WCAG AA 4.5:1), except decorative
 *   aria-hidden separators;
 * - no physical left/right spacing or position classes (RTL uses logical
 *   ms/me/ps/pe/start/end classes).
 * Run: npm run test:a11y
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'src');
const files = [...fs.readdirSync(path.join(SRC, 'components')).map((f) => path.join(SRC, 'components', f)), path.join(SRC, 'App.tsx')].filter((f) => f.endsWith('.tsx'));
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };
const lineOf = (s: string, i: number) => s.slice(0, i).split('\n').length;

for (const file of files) {
  const s = fs.readFileSync(file, 'utf8');
  const rel = path.relative(SRC, file);
  for (const m of s.matchAll(/<(input|textarea|select|button)\b((?:=>|[^>])*?)\/?>/g)) {
    const [, tag, attrs] = m;
    const at = `${rel}:${lineOf(s, m.index!)}`;
    if (tag === 'button') {
      if (/aria-label=/.test(attrs)) { check(true, ''); continue; }
      const end = s.indexOf('</button>', m.index! + m[0].length);
      const inner = s.slice(m.index! + m[0].length, end).replace(/<[^>]+>/g, '').replace(/\{`[^`]*`\}/g, '');
      check(/\{tx\(|\{t\(|\{[a-zA-Z]|[\p{L}]{2,}/u.test(inner), `${at} icon-only <button> needs aria-label`);
      continue;
    }
    if (/type="hidden"/.test(attrs)) continue;
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    const before = s.slice(Math.max(0, m.index! - 400), m.index!);
    const ok = /aria-label(ledby)?=/.test(attrs)
      || (id !== undefined && s.includes(`htmlFor="${id}"`))
      || before.lastIndexOf('<label') > before.lastIndexOf('</label>');
    check(ok, `${at} <${tag}> has no label`);
  }
  for (const m of s.matchAll(/<[^>]*\btext-slate-[56]00\b[^>]*>/g)) {
    check(/aria-hidden="true"/.test(m[0]), `${rel}:${lineOf(s, m.index!)} low-contrast text-slate-500/600`);
  }
  check(!/\bplaceholder-slate-[56]00\b/.test(s), `${rel}: low-contrast placeholder`);
  for (const m of s.matchAll(/(?<=["'`\s])(?:-?m[lr]|p[lr]|left|right|rounded-[tb][lr]|text-left|text-right)-?[0-9a-z[]*/g)) {
    if (/^(text-left|text-right)$/.test(m[0]) || /^(-?m[lr]|p[lr]|left|right|rounded-[tb][lr])-/.test(m[0])) {
      check(false, `${rel}:${lineOf(s, m.index!)} physical class "${m[0]}" (use logical start/end)`);
    }
  }
}

if (fails.length) {
  console.log(`a11y-labels: FAIL ${fails.length}/${checks}`);
  for (const f of fails) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`a11y-labels: PASS ${checks}/${checks}`);
