// Wording gate. Fails when a banned word shows up in UI strings (both
// languages), sample data, page metadata, the PWA manifest, or any code comment.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strings } from '../src/i18n/strings';
import * as sample from '../src/data/sample';
import { check, done } from './harness';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const BANNED: { name: string; re: RegExp }[] = [
  { name: 'safe', re: /safe/i },
  { name: 'free', re: /free/i },
  { name: 'only', re: /\bonly\b/i },
  { name: 'percent sign', re: /%/ },
  { name: '99', re: /99/ },
  { name: 'AI', re: /\bA\.?I\b/ },
  { name: 'ذكاء اصطناعي', re: /ذكاء\s*(ال)?اصطناعي/ },
  { name: 'فقط', re: /فقط/ },
  { name: 'مجاني', re: /مجان/ },
  { name: 'آمن', re: /آمن/ },
  { name: 'ضمان', re: /ضمان/ },
  { name: 'Lillah', re: /lillah/i },
  { name: 'live', re: /\blive\b/i },
  { name: 'profit', re: /profit/i },
  { name: 'guarantee', re: /guarantee/i },
  { name: 'audit', re: /audit/i },
  { name: 'launched', re: /launched/i },
];

function scan(where: string, text: string) {
  for (const b of BANNED) check(`${where} [${b.name}]`, !b.re.test(text), text.slice(0, 120));
}

// 1. UI strings, both languages.
for (const [k, v] of Object.entries(strings)) { scan(`ar:${k}`, v.ar); scan(`en:${k}`, v.en); }

// 2. Sample data, every string value.
function walk(path: string, v: unknown) {
  if (typeof v === 'string') scan(`sample:${path}`, v);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(`${path}[${i}]`, x));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(`${path}.${k}`, x);
}
for (const [k, v] of Object.entries(sample)) if (typeof v !== 'function') walk(k, v);

// 3. Page metadata and manifest.
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/<title>([^<]*)<\/title>|content="([^"]*)"/g)) scan('index.html', m[1] ?? m[2]);
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8'));
scan('manifest.name', manifest.name); scan('manifest.short_name', manifest.short_name); scan('manifest.description', manifest.description);

// 4. Code comments in every source file.
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (f === 'node_modules' || f === 'dist') return [];
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}
const sources = [...files(join(root, 'src')), ...files(join(root, 'tests')), ...files(join(root, 'scripts')), join(root, 'public/sw.js'), join(root, 'vite.config.ts'), join(root, 'index.html')]
  .filter((p) => /\.(tsx?|jsx?|mjs|py|css|html)$/.test(p));
let comments = 0;
for (const p of sources) {
  const src = readFileSync(p, 'utf8');
  const rel = relative(root, p);
  const found: string[] = [];
  for (const m of src.matchAll(/(?:^|[\s{(;,])\/\*([\s\S]*?)\*\//g)) found.push(m[1]);
  for (const m of src.matchAll(/(?:^|[\s;,{)])\/\/(.*)$/gm)) found.push(m[1]);
  for (const m of src.matchAll(/<!--([\s\S]*?)-->/g)) found.push(m[1]);
  if (p.endsWith('.py')) for (const m of src.matchAll(/(?:^|\s)#(.*)$/gm)) found.push(m[1]);
  if (p.endsWith('.py')) for (const m of src.matchAll(/"""([\s\S]*?)"""/g)) found.push(m[1]);
  for (const c of found) { comments++; scan(`comment ${rel}`, c); }
}
check('found code comments to scan', comments > 20, String(comments));

done('wording');
