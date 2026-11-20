import { SupportedLanguage } from '../types';
import { postJson, ApiError, isAuthErrorStatus } from './api';

let currentAudio: HTMLAudioElement | null = null;
// The in-flight /api/tts request; stopAudio() aborts it so a reply that
// arrives after Stop, a tab change or an unmount is never played.
let ttsController: AbortController | null = null;

/**
 * Play audio from base64 WAV or fallback to browser Web Speech API.
 * On a provider auth failure (401/403) the error is surfaced via onError
 * and NOT hidden behind the browser fallback — the model did not answer.
 */
export async function playTextToSpeech(
  text: string,
  lang: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: Error) => void
): Promise<void> {
  // Stop existing audio
  stopAudio();

  const ctrl = new AbortController();
  ttsController = ctrl;

  onStart?.();

  try {
    // 1. Try Gemini TTS backend first
    const data = await postJson<{ audioData?: string }>(
      '/api/tts',
      {
        text: text.slice(0, 450), // keep within single utterance
        voiceName: lang.code === 'en' ? 'Puck' : 'Kore',
      },
      ctrl.signal
    );
    if (ctrl.signal.aborted) return;
    ttsController = null;

    if (data.audioData) {
      const audio = new Audio(`data:audio/wav;base64,${data.audioData}`);
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        fallbackSpeechSynthesis(text, lang, onEnd);
      };
      await audio.play();
      return;
    }
  } catch (err) {
    // Stopped (Stop, tab change, unmount): play nothing, not even the fallback.
    if (ctrl.signal.aborted) return;
    ttsController = null;
    // Auth failure: surface it visibly instead of silently falling back
    // to local speech and pretending the provider answered.
    if (err instanceof ApiError && isAuthErrorStatus(err.status)) {
      onError?.(err);
      onEnd?.();
      return;
    }
    console.warn('Backend TTS failed, using browser synthesis', err);
  }

  // 2. Fallback to Browser SpeechSynthesis
  fallbackSpeechSynthesis(text, lang, onEnd);
}

function fallbackSpeechSynthesis(
  text: string,
  lang: SupportedLanguage,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang.speechCode || 'en-US';
  utterance.rate = 0.95;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  // Try to find a matching voice if available
  const voices = window.speechSynthesis.getVoices();
  // Prefer an exact locale match (e.g. zh-CN over zh-TW / zh-HK), then
  // fall back to any voice for the base language.
  const wanted = (lang.speechCode || '').toLowerCase().replace('_', '-');
  const matchedVoice =
    voices.find((v) => v.lang.toLowerCase().replace('_', '-') === wanted) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.code));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopAudio() {
  if (ttsController) {
    ttsController.abort();
    ttsController = null;
  }
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
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
