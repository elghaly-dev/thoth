import { SupportedLanguage } from '../types';

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play audio from base64 WAV or fallback to browser Web Speech API
 */
export async function playTextToSpeech(
  text: string,
  lang: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  // Stop existing audio
  stopAudio();

  onStart?.();

  try {
    // 1. Try Gemini TTS backend first
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.slice(0, 450), // keep within single utterance
        voiceName: lang.code === 'en' ? 'Puck' : 'Kore',
      }),
    });

    if (res.ok) {
      const data = await res.json();
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
    }
  } catch (err) {
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
  const matchedVoice = voices.find(
    (v) => v.lang.startsWith(lang.code) || v.lang === lang.speechCode
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopAudio() {
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
