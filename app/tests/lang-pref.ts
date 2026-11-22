/**
 * Language choice persistence + RTL (item 1). Uses an in-memory storage
 * stub, so it runs in Node without a browser.
 * - ?lang= wins, then the saved manual choice, then the device language
 *   (navigator.languages or Accept-Language), then English;
 * - an unknown code (URL or saved) is ignored;
 * - saveLanguage stores only the language code under one key;
 * - blocked storage never throws;
 * - ar is RTL, every other language LTR.
 * Run: npm run test:langpref
 */
import { initialLanguage, saveLanguage, dirFor, detectLanguage, localizeHtmlShell, LANG_STORAGE_KEY } from '../src/utils/lang-pref';
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

// Device detection on first load (no saved choice).
check(initialLanguage('', mem(), ['ar-EG', 'en-US']).code === 'ar', 'phone set to ar-EG opens in Arabic');
check(initialLanguage('', mem(), ['fr-FR', 'zh-Hans-CN']).code === 'zh', 'first supported device language wins (zh-Hans-CN -> zh)');
check(initialLanguage('', mem(), ['hi-IN']).code === 'hi', 'hi-IN -> Hindi');
check(initialLanguage('', mem(), ['en-GB']).code === 'en', 'en-GB -> English');
check(initialLanguage('', mem(), ['AR_sa']).code === 'ar', 'case and underscore tolerant');
check(initialLanguage('', mem(), ['fr-FR', 'de']).code === 'en', 'unsupported device languages fall back to English');
check(initialLanguage('', mem(), []).code === 'en', 'no device language -> English');
check(initialLanguage('', mem(), null).code === 'en', 'no navigator -> English');
check(initialLanguage('', mem(), 'fr;q=1, ar-EG;q=0.9, en;q=0.8').code === 'ar', 'Accept-Language header form is q-ordered');
check(initialLanguage('', mem(), 'en;q=0.2, ta;q=0.9').code === 'ta', 'Accept-Language picks the highest q');
check(detectLanguage('*, ar;q=0') === undefined, 'wildcard and q=0 are ignored');
const fresh = mem();
initialLanguage('', fresh, ['ar']);
check(fresh.m.size === 0, 'detection never writes storage');

// A manual pick is saved and overrides detection afterwards.
const s = mem();
check(initialLanguage('', s, []).code === 'en', 'default is English');
saveLanguage('hi', s);
check(initialLanguage('', s, ['ar-EG']).code === 'hi', 'saved manual pick overrides device language');
check(initialLanguage('?lang=ar', s, ['en']).code === 'ar', '?lang= overrides saved pick and device');
saveLanguage('ar', s);
check(s.m.get(LANG_STORAGE_KEY) === 'ar' && s.m.size === 1, 'saveLanguage stores only the code under one key');
check(initialLanguage('', s, ['en-US']).code === 'ar', 'saved Arabic is restored on the next visit');
check(initialLanguage('?lang=zh', s).code === 'zh', '?lang= wins over the saved choice');
check(initialLanguage('?lang=xx', s).code === 'ar', 'unknown ?lang= is ignored');
saveLanguage('xx' as never, s);
check(s.m.get(LANG_STORAGE_KEY) === 'ar', 'unknown code is never saved');
const junk = mem();
junk.setItem(LANG_STORAGE_KEY, '<script>');
check(initialLanguage('', junk, ['ar']).code === 'ar', 'junk saved value is ignored; device language used');
check(initialLanguage('', junk, []).code === 'en', 'junk saved value, no device language -> English');
const blocked = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
};
let threw = false;
try {
  check(initialLanguage('', blocked, ['ar']).code === 'ar', 'blocked storage -> device language');
  saveLanguage('ar', blocked);
} catch {
  threw = true;
}
check(!threw, 'blocked storage never throws');
check(initialLanguage('', null, []).code === 'en', 'no storage, no device language -> English');
for (const { code } of SUPPORTED_LANGUAGES) {
  check(dirFor(code) === (code === 'ar' ? 'rtl' : 'ltr'), `dir for ${code}`);
}

// Server shell: <html lang/dir> from Accept-Language.
const shell = '<!doctype html>\n<html lang="en" dir="ltr"><head></head></html>';
check(localizeHtmlShell(shell, 'ar-EG,ar;q=0.9').includes('<html lang="ar" dir="rtl">'), 'server shell: Arabic -> lang=ar dir=rtl');
check(localizeHtmlShell(shell, 'zh-CN').includes('<html lang="zh-CN" dir="ltr">'), 'server shell: zh -> zh-CN');
check(localizeHtmlShell(shell, 'fr-FR').includes('<html lang="en" dir="ltr">'), 'server shell: unsupported -> English');
check(localizeHtmlShell(shell, undefined).includes('<html lang="en" dir="ltr">'), 'server shell: no header -> English');
check(localizeHtmlShell(shell, '"><script>x</script>').includes('<html lang="en" dir="ltr">') && !localizeHtmlShell(shell, '"><script>').includes('<script>'), 'server shell: header text is never echoed');

if (fails.length) {
  console.log(`lang-pref: FAIL ${fails.length}/${checks}`);
  for (const f of fails) console.log('  FAIL | ' + f);
  process.exit(1);
}
console.log(`lang-pref: PASS ${checks}/${checks}`);
