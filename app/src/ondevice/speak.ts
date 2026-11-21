/**
 * Read-aloud with the phone's own offline voices only. A voice that is not
 * marked localService may send the text to a server, so it is never used.
 */
export interface VoiceLike {
  lang: string;
  name: string;
  localService: boolean;
}

export function pickOfflineVoice<V extends VoiceLike>(voices: V[], bcp47: string): V | null {
  const want = bcp47.toLowerCase();
  const base = want.split('-')[0];
  const local = voices.filter((v) => v.localService);
  return (
    local.find((v) => v.lang.toLowerCase().replace('_', '-') === want) ??
    local.find((v) => v.lang.toLowerCase().replace('_', '-').split('-')[0] === base) ??
    null
  );
}

/** Speak `text`; returns false when the phone has no offline voice for the language. */
export function speakOffline(text: string, bcp47: string, synth: SpeechSynthesis | undefined = globalThis.speechSynthesis): boolean {
  if (!synth) return false;
  const voice = pickOfflineVoice(synth.getVoices() as unknown as SpeechSynthesisVoice[], bcp47);
  if (!voice) return false;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  synth.speak(u);
  return true;
}
