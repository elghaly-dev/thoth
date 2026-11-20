/**
 * Mic denied must not fail silently (Instinct REJECT on 6ad12a16).
 * - isMicBlockedError: 'not-allowed' / 'service-not-allowed' -> true; others false.
 * - createSpeechRecognizer passes the Web Speech error code to onError, so a
 *   fake recognizer that fires onerror({error:'not-allowed'}) reaches it.
 * - Voice and Translator tabs: the recognizer's error callback sets
 *   speechError to tx(lang, 'common.micBlocked') when the mic is blocked.
 * - common.micBlocked exists in EN, ZH and the 7 Indian tables.
 * Run: npm run test:mic
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMicBlockedError, createSpeechRecognizer } from '../src/utils/audio';
import { tx } from '../src/i18n';
import type { LanguageCode } from '../src/types';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };

for (const e of ['not-allowed', 'service-not-allowed']) check(isMicBlockedError(e), `${e} is a blocked mic`);
for (const e of ['no-speech', 'audio-capture', 'network', 'aborted', undefined, null, { error: 'not-allowed' }]) {
  check(!isMicBlockedError(e), `${JSON.stringify(e)} is not treated as a blocked mic`);
}

// Fake browser recognizer: start() fires onerror({error:'not-allowed'}) then onend.
class FakeRecognition {
  continuous = false; interimResults = false; lang = '';
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start() { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); }
  stop() {}
}
(globalThis as unknown as { window: unknown }).window = { SpeechRecognition: FakeRecognition };
let got: unknown = 'none';
let ended = false;
const rec = createSpeechRecognizer('en-US', () => {}, (err) => { got = err; }, () => { ended = true; });
check(rec !== null, 'recognizer created with a fake SpeechRecognition');
rec?.start();
check(got === 'not-allowed' && isMicBlockedError(got), `onError receives the code 'not-allowed' (got ${JSON.stringify(got)})`);
check(ended, 'onEnd still fires (listening state is reset)');

// Both tabs wire the blocked-mic message into their error box.
for (const f of ['VoiceAssistantTab.tsx', 'LiveTranslatorTab.tsx']) {
  const src = fs.readFileSync(path.join(APP, 'src', 'components', f), 'utf8');
  check(/if \(isMicBlockedError\(err\)\) setSpeechError\(tx\(lang, 'common\.micBlocked'\)\);/.test(src), `${f}: blocked mic sets speechError to common.micBlocked`);
  check(/\{speechError &&/.test(src) || /speechError \?/.test(src), `${f}: speechError is rendered`);
}

// The message exists, in every UI language, and is not the English text outside en.
const en = tx('en', 'common.micBlocked');
check(/Microphone access is blocked/.test(en), 'EN text');
for (const l of ['zh', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'pa'] as LanguageCode[]) {
  const v = tx(l, 'common.micBlocked');
  check(!!v && v !== en, `${l}: common.micBlocked translated [VERIFY]`);
}

if (fails.length) { console.log(`mic-blocked: FAIL ${fails.length}/${checks}`); for (const m of fails) console.log('  FAIL | ' + m); process.exit(1); }
console.log(`mic-blocked: PASS ${checks}/${checks}`);
