// Landing pages (index.html, 404.html) on GitHub Pages: a strict CSP meta with no inline
// script and the inline <style> allowed only by its sha256. Fails when a style edit leaves
// the hash behind. Run: node tools/check-landing-csp.mjs   (add --write to refresh the hash)
import fs from 'node:fs';
import crypto from 'node:crypto';

const write = process.argv.includes('--write');
const fails = [];
for (const f of ['index.html', '404.html']) {
  let html = fs.readFileSync(f, 'utf8');
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const hashes = styles.map((s) => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`);
  const csp = `default-src 'none'; style-src ${hashes.join(' ') || "'none'"}; img-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'`;
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
  const re = /<meta http-equiv="Content-Security-Policy" content="[^"]*">/;
  if (write) {
    html = re.test(html) ? html.replace(re, meta) : html.replace(/<meta charset="[^"]*">/i, (m) => `${m}\n  ${meta}`);
    fs.writeFileSync(f, html);
  }
  if (!html.includes(meta)) fails.push(`${f}: CSP meta missing or its style hash is stale`);
  if (/<script\b/i.test(html)) fails.push(`${f}: inline or external script on a landing page`);
  if (/\sstyle="/i.test(html) || /\son[a-z]+="/i.test(html)) fails.push(`${f}: inline style or event attribute`);
}
if (fails.length) { fails.forEach((m) => console.log('FAIL ' + m)); process.exit(1); }
console.log('landing CSP: PASS (index.html, 404.html)');
