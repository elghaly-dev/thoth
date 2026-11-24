// Short voice notes in chat. Recording stops on its own at VOICE_MAX_SECONDS.
// The audio stays on this device as a local attachment in the preview.
// Voice is not transcribed, so text masking has nothing to read in it; any
// text sent with it is still masked.
import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { useI18n } from '../i18n';

export const VOICE_MAX_SECONDS = 60;
export type VoiceClip = { url: string; seconds: number; mime: string };

export function VoiceRecorder({ onDone }: { onDone: (clip: VoiceClip) => void }) {
  const { t } = useI18n();
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [secs, setSecs] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const started = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); rec?.stream.getTracks().forEach((x) => x.stop()); }, [rec]);

  const stop = () => { if (rec && rec.state !== 'inactive') rec.stop(); };
  const start = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setBlocked(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      r.onstop = () => {
        if (timer.current) clearInterval(timer.current);
        stream.getTracks().forEach((x) => x.stop());
        const seconds = Math.min(VOICE_MAX_SECONDS, Math.round((Date.now() - started.current) / 1000));
        const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' });
        setRec(null); setSecs(0);
        if (blob.size) onDone({ url: URL.createObjectURL(blob), seconds, mime: blob.type });
      };
      started.current = Date.now();
      r.start();
      setRec(r); setBlocked(false);
      timer.current = setInterval(() => {
        const s = Math.round((Date.now() - started.current) / 1000);
        setSecs(s);
        if (s >= VOICE_MAX_SECONDS && r.state !== 'inactive') r.stop();
      }, 250);
    } catch { setBlocked(true); }
  };

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={rec ? stop : start} aria-pressed={!!rec} title={`${t('msg.voice.record')} · ${t('msg.voice.max')}`}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${rec ? 'bg-danger/20 text-danger' : 'text-ink-2 hover:text-lilac-200'}`} aria-label={rec ? t('msg.voice.stop') : t('msg.voice.record')}>
        {rec ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
      </button>
      {rec && <span className="num absolute -top-6 start-0 whitespace-nowrap text-xs text-danger" aria-live="polite">{secs}s / {VOICE_MAX_SECONDS}s</span>}
      {blocked && <span role="alert" className="absolute -top-6 start-0 whitespace-nowrap text-xs text-warning">{t('msg.voice.blocked')}</span>}
    </span>
  );
}
