#!/usr/bin/env node
// Builds public/licences.txt: the notices the open models and open-source
// packages we ship require (Apache-2.0, OFL-1.1, MIT, ISC). Shown in the app
// under "Licences". Thoth's own code is proprietary and is not listed.
// Run: node scripts/gen-licences.mjs        (write)
//      node scripts/gen-licences.mjs --check (fail if the file is out of date)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkgDir = (name) => path.join(APP, 'node_modules', name);
const licenceFile = (name) => {
  const f = fs.readdirSync(pkgDir(name)).find((x) => /^licen[cs]e(\.md|\.txt)?$/i.test(x));
  if (!f) throw new Error('no licence file in ' + name);
  return fs.readFileSync(path.join(pkgDir(name), f), 'utf8').trim();
};
const version = (name) => JSON.parse(fs.readFileSync(path.join(pkgDir(name), 'package.json'), 'utf8')).version;

const MODELS = [
  {
    title: 'Qwen2.5-0.5B-Instruct (on-device model for الغالي)',
    licence: 'Apache-2.0',
    notice: 'Copyright 2024 Alibaba Cloud (Qwen team). MLC build mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC, revision 32ff081f.',
  },
];
const PACKAGES = ['@mlc-ai/web-llm', '@fontsource/plus-jakarta-sans', '@fontsource/noto-sans-arabic', '@fontsource/playfair-display', '@fontsource/amiri', 'react', 'react-dom', 'lucide-react', 'motion'];

const sep = '\n\n' + '='.repeat(72) + '\n\n';
let out = 'Licences\n\nThoth uses these open models and open-source packages. Their licences ask for the notices below.\n';
for (const m of MODELS) out += sep + `${m.title}\nLicence: ${m.licence}\n${m.notice}\nThe full Apache License 2.0 text is included below with @mlc-ai/web-llm.`;
for (const p of PACKAGES) {
  const meta = JSON.parse(fs.readFileSync(path.join(pkgDir(p), 'package.json'), 'utf8'));
  out += sep + `${p} ${version(p)}\nLicence: ${meta.license}\n\n${licenceFile(p)}`;
}
out += '\n';

const target = path.join(APP, 'public', 'licences.txt');
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (cur !== out) {
    console.error('public/licences.txt is out of date: run node scripts/gen-licences.mjs');
    process.exit(1);
  }
  console.log('licences: up to date');
} else {
  fs.writeFileSync(target, out);
  console.log(`licences: wrote ${out.length} bytes`);
}
