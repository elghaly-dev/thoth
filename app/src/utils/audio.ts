import { SupportedLanguage } from '../types';
import { pickOfflineVoice } from '../ondevice/speak';

/**
 * Read text aloud with a voice installed on this phone (localService) only.
 * No text is sent to a server: there is no server speech call, and a voice that
 * is not marked localService (which may send the text to a server) is never
 * used. With no offline voice for the language, nothing is spoken.
 * onError is kept in the signature for callers; it is not called.
 */
export async function playTextToSpeech(
  text: string,
  lang: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  _onError?: (err: Error) => void
): Promise<void> {
  stopAudio();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  const voice = pickOfflineVoice(window.speechSynthesis.getVoices(), lang.speechCode || lang.code);
  if (!voice) {
    onEnd?.();
    return;
  }
  onStart?.();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.95;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * True when the browser or the user blocked the microphone (Web Speech
 * `error` codes 'not-allowed' / 'service-not-allowed'). The caller shows
 * T('common.micBlocked') instead of failing silently.
 */
export function isMicBlockedError(err: unknown): boolean {
  return err === 'not-allowed' || err === 'service-not-allowed';
}

/**
 * Check if Web Speech Recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Create a speech recognition instance
 */
export function createSpeechRecognizer(
  speechCode: string,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (err: any) => void,
  onEnd: () => void
) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = speechCode;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    if (final) {
      onResult(final.trim(), true);
    } else if (interim) {
      onResult(interim.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
