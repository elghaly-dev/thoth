/**
 * Language choice persistence + RTL (item 1). Uses an in-memory storage
 * stub, so it runs in Node without a browser.
 * - ?lang= wins, then the saved choice, then Hindi (the default);
 * - an unknown code (URL or saved) is ignored;
 * - saveLanguage stores only the language code under one key;
 * - blocked storage never throws;
 * - ar is RTL, every other language LTR.
 * Run: npm run test:langpref
 */
import { initialLanguage, saveLanguage, dirFor, LANG_STORAGE_KEY } from '../src/utils/lang-pref';
import { SUPPORTED_LANGUAGES } from '../src/types';

let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks++;
  if (!ok) fails.push(msg);
};

function mem() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, String(v)), m };
}

const s = mem();
check(initialLanguage('', s).code === 'hi', 'default is Hindi');
saveLanguage('ar', s);
check(s.m.get(LANG_STORAGE_KEY) === 'ar' && s.m.size === 1, 'saveLanguage stores only the code under one key');
check(initialLanguage('', s).code === 'ar', 'saved Arabic is restored on the next visit');
check(initialLanguage('?lang=zh', s).code === 'zh', '?lang= wins over the saved choice');
check(initialLanguage('?lang=xx', s).code === 'ar', 'unknown ?lang= is ignored');
saveLanguage('xx' as never, s);
check(s.m.get(LANG_STORAGE_KEY) === 'ar', 'unknown code is never saved');
const junk = mem();
junk.setItem(LANG_STORAGE_KEY, '<script>');
check(initialLanguage('', junk).code === 'hi', 'junk saved value falls back to Hindi');
const blocked = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
};
let threw = false;
try {
  check(initialLanguage('', blocked).code === 'hi', 'blocked storage -> Hindi');
  saveLanguage('ar', blocked);
} catch {
  threw = true;
}
check(!threw, 'blocked storage never throws');
check(initialLanguage('', null).code === 'hi', 'no storage -> Hindi');
for (const { code } of SUPPORTED_LANGUAGES) {
  check(dirFor(code) === (code === 'ar' ? 'rtl' : 'ltr'), `dir for ${code}`);
}

if (fails.length) {
  console.log(`lang-pref: FAIL ${fails.length}/${checks}`);
  for (const f of fails) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`lang-pref: PASS ${checks}/${checks}`);
