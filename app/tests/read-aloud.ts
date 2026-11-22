/**
 * Read-aloud uses only voices installed on the phone (localService) and never calls a server.
 * Run: npm run test:readaloud
 */
import { readFileSync } from 'node:fs';

let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => { checks++; if (!ok) fails.push(msg); };

const spoken: { voice: string | null; text: string }[] = [];
const voices = [
  { lang: 'hi-IN', name: 'Network Hindi', localService: false },
  { lang: 'ar-SA', name: 'Phone Arabic', localService: true },
  { lang: 'en-US', name: 'Network English', localService: false },
];
class Utterance { text: string; voice: { name: string } | null = null; lang = ''; rate = 1; onend: (() => void) | null = null; onerror: (() => void) | null = null; constructor(t: string) { this.text = t; } }
let fetched = 0;
Object.assign(globalThis, {
  window: { speechSynthesis: { getVoices: () => voices, cancel: () => {}, speak: (u: Utterance) => { spoken.push({ voice: u.voice?.name ?? null, text: u.text }); u.onend?.(); } } },
  SpeechSynthesisUtterance: Utterance,
  fetch: () => { fetched++; return Promise.reject(new Error('no network in read-aloud')); },
});

const { playTextToSpeech } = await import('../src/utils/audio');
const lang = (code: string, speechCode: string) => ({ code, speechCode } as never);

let ended = 0;
await playTextToSpeech('مرحبا', lang('ar', 'ar-SA'), undefined, () => ended++);
check(spoken.length === 1 && spoken[0].voice === 'Phone Arabic', 'Arabic is read with the phone\'s own Arabic voice');
await playTextToSpeech('नमस्ते', lang('hi', 'hi-IN'), undefined, () => ended++);
check(spoken.length === 1, 'a network-only Hindi voice is never used');
await playTextToSpeech('hello', lang('en', 'en-US'), undefined, () => ended++);
check(spoken.length === 1, 'a network-only English voice is never used');
check(ended === 3, 'every call ends (the caller is never left waiting)');
check(fetched === 0, 'read-aloud makes no network request');

const src = readFileSync(new URL('../src/utils/audio.ts', import.meta.url), 'utf8');
check(!src.includes('/api/tts') && !/postJson|postModel|fetch\(/.test(src), 'audio.ts has no /api/tts or other network call');
check(src.includes('pickOfflineVoice'), 'audio.ts picks voices with pickOfflineVoice');

if (fails.length) { console.log(`read-aloud: FAIL ${fails.length}/${checks}`); fails.forEach((m) => console.log('  FAIL | ' + m)); process.exit(1); }
console.log(`read-aloud: PASS ${checks}/${checks}`);
