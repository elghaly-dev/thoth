// Minimal test harness: counts checks and exits non-zero on any failure.
let passed = 0;
const failures: string[] = [];

export function check(name: string, ok: boolean, detail = '') {
  if (ok) passed++;
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

export function done(suite: string) {
  if (failures.length) {
    console.error(`${suite}: ${failures.length} failed, ${passed} passed`);
    for (const f of failures) console.error('  ✗ ' + f);
    process.exit(1);
  }
  console.log(`${suite}: ${passed}/${passed} passed`);
}
