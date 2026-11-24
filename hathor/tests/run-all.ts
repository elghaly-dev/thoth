// Runs every Hathor test suite in order and stops at the first failure.
import { execFileSync } from 'node:child_process';

const suites = ['wording', 'i18n-parity', 'mask', 'fees', 'number-lock'];
for (const s of suites) {
  execFileSync(process.execPath, ['--import', 'tsx', `tests/${s}.ts`], { stdio: 'inherit' });
}
console.log(`all ${suites.length} suites passed`);
