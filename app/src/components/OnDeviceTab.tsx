import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Download, Languages, Lightbulb, Square, Trash2, Volume2 } from 'lucide-react';
import type { LanguageCode } from '../types';
import { dt } from '../ondevice/strings';
import { formatBytes, isReady, MANIFEST, totalBytes } from '../ondevice/manifest';
import { allVerified, downloadAndVerify, removeModel } from '../ondevice/download';
import { createWebLlmEngine, type Engine } from '../ondevice/engine';
import type { GpuCheck } from '../ondevice/webgpu';
import {
  DEVICE_LANGS,
  explainPrompt,
  LANG_NATIVE,
  LANG_SPEECH,
  translatePrompt,
  type DeviceLang,
} from '../ondevice/prompts';
import { speakOffline } from '../ondevice/speak';

type Phase =
  | 'checking'
  | 'unsupported'
  | 'pending'
  | 'need-download'
  | 'downloading'
  | 'downloaded'
  | 'starting'
  | 'ready';

interface Props {
  lang: LanguageCode;
  gpu: GpuCheck | null;
}

/** الغالي on this phone: download once, then translate and explain offline. */
export function OnDeviceTab({ lang, gpu }: Props) {
  const size = formatBytes(totalBytes());
  const [phase, setPhase] = useState<Phase>('checking');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(0);
  const [startPct, setStartPct] = useState(0);
  const [text, setText] = useState('');
  const [from, setFrom] = useState<DeviceLang | 'auto'>('auto');
  const [into, setInto] = useState<DeviceLang>(lang === 'zh' ? 'zh' : lang === 'en' ? 'en' : 'hi');
  const [output, setOutput] = useState('');
  const [outLang, setOutLang] = useState<DeviceLang>('hi');
  const [busy, setBusy] = useState(false);
  const engine = useRef<Engine | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!gpu) return;
      if (!gpu.ok) return live && setPhase('unsupported');
      if (!isReady()) return live && setPhase('pending');
      const have = await allVerified(MANIFEST).catch(() => false);
      if (live) setPhase(have ? 'downloaded' : 'need-download');
    })();
    return () => {
      live = false;
    };
  }, [gpu]);

  useEffect(
    () => () => {
      abort.current?.abort();
      void engine.current?.unload();
    },
    [],
  );

  async function download() {
    setNote('');
    setPhase('downloading');
    const ctl = new AbortController();
    abort.current = ctl;
    const r = await downloadAndVerify(MANIFEST, (p) => setDone(p.doneBytes), ctl.signal);
    abort.current = null;
    if (r.ok) return setPhase('downloaded');
    setPhase('need-download');
    if (r.reason === 'hash' || r.reason === 'size') setNote(dt(lang, 'failHash'));
    else if (r.reason !== 'aborted') setNote(dt(lang, 'failNet'));
  }

  async function start() {
    setNote('');
    setPhase('starting');
    try {
      engine.current = await createWebLlmEngine((f) => setStartPct(Math.round(f * 100)));
      setPhase('ready');
    } catch {
      setPhase('downloaded');
      setNote(dt(lang, 'failStart'));
    }
  }

  async function run(kind: 'translate' | 'explain') {
    if (!engine.current || !text.trim()) return;
    setBusy(true);
    setOutput('');
    const ctl = new AbortController();
    abort.current = ctl;
    const target = into;
    const turns = kind === 'translate' ? translatePrompt(text, from, target) : explainPrompt(text, target);
    try {
      await engine.current.generate(turns, setOutput, ctl.signal);
      setOutLang(target);
    } finally {
      abort.current = null;
      setBusy(false);
    }
  }

  async function remove() {
    await engine.current?.unload();
    engine.current = null;
    await removeModel();
    setDone(0);
    setPhase('need-download');
    setNote(dt(lang, 'removed'));
  }

  function read() {
    if (!speakOffline(output, LANG_SPEECH[outLang])) setNote(dt(lang, 'noVoice'));
  }

  const btn =
    'inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const select =
    'min-h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <section aria-labelledby="ondevice-title" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <header className="space-y-1">
        <h2 id="ondevice-title" className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <Cpu className="w-5 h-5 text-emerald-300" aria-hidden="true" />
          {dt(lang, 'title')}
        </h2>
        <p className="text-sm text-slate-400 max-w-prose">{dt(lang, 'intro')}</p>
      </header>

      {phase === 'unsupported' && <p className="text-sm text-violet-300">{dt(lang, 'noGpu')}</p>}
      {phase === 'pending' && <p className="text-sm text-violet-300">{dt(lang, 'notYet')}</p>}

      {phase === 'need-download' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">{dt(lang, 'needDownload', { size })}</p>
          <button type="button" onClick={download} className={`${btn} bg-emerald-600 hover:bg-emerald-700 text-white`}>
            <Download className="w-4 h-4" aria-hidden="true" />
            {dt(lang, 'downloadBtn', { size })}
          </button>
        </div>
      )}

      {phase === 'downloading' && (
        <div className="space-y-3" role="status" aria-live="polite">
          <p className="text-sm text-slate-300">
            {dt(lang, 'downloading', { done: formatBytes(done), total: size })}
          </p>
          <progress className="w-full" max={totalBytes()} value={done} />
          <button type="button" onClick={() => abort.current?.abort()} className={`${btn} bg-slate-800 hover:bg-slate-700 text-slate-100`}>
            <Square className="w-4 h-4" aria-hidden="true" />
            {dt(lang, 'stop')}
          </button>
        </div>
      )}

      {phase === 'downloaded' && (
        <button type="button" onClick={start} className={`${btn} bg-emerald-600 hover:bg-emerald-700 text-white`}>
          <Cpu className="w-4 h-4" aria-hidden="true" />
          {dt(lang, 'start')}
        </button>
      )}

      {phase === 'starting' && (
        <p className="text-sm text-slate-300" role="status" aria-live="polite">
          {dt(lang, 'loading', { pct: String(startPct) })}
        </p>
      )}

      {phase === 'ready' && (
        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">{dt(lang, 'input')}</span>
            <textarea
              id="ondevice-input"
              dir="auto"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={dt(lang, 'input')}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              {dt(lang, 'from')}
              <select id="ondevice-from" className={select} value={from} onChange={(e) => setFrom(e.target.value as DeviceLang | 'auto')}>
                <option value="auto">{dt(lang, 'detect')}</option>
                {DEVICE_LANGS.map((l) => (
                  <option key={l} value={l}>
                    {LANG_NATIVE[l]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              {dt(lang, 'into')}
              <select id="ondevice-into" className={select} value={into} onChange={(e) => setInto(e.target.value as DeviceLang)}>
                {DEVICE_LANGS.map((l) => (
                  <option key={l} value={l}>
                    {LANG_NATIVE[l]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" disabled={busy || !text.trim()} onClick={() => run('translate')} className={`${btn} bg-cyan-600 hover:bg-cyan-700 text-white`}>
              <Languages className="w-4 h-4" aria-hidden="true" />
              {dt(lang, 'translate')}
            </button>
            <button type="button" disabled={busy || !text.trim()} onClick={() => run('explain')} className={`${btn} bg-indigo-600 hover:bg-indigo-700 text-white`}>
              <Lightbulb className="w-4 h-4" aria-hidden="true" />
              {dt(lang, 'explain')}
            </button>
            {busy && (
              <button type="button" onClick={() => abort.current?.abort()} className={`${btn} bg-slate-800 hover:bg-slate-700 text-slate-100`}>
                <Square className="w-4 h-4" aria-hidden="true" />
                {dt(lang, 'stop')}
              </button>
            )}
          </div>
          {(busy || output) && (
            <div className="space-y-2">
              <div
                dir="auto"
                lang={LANG_SPEECH[outLang]}
                aria-live="polite"
                className="whitespace-pre-wrap rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-100 min-h-16"
              >
                {output || dt(lang, 'working')}
              </div>
              {output && !busy && (
                <>
                  <button type="button" onClick={read} className={`${btn} bg-slate-800 hover:bg-slate-700 text-slate-100`}>
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    {dt(lang, 'readAloud')}
                  </button>
                  <p className="text-xs text-slate-400">{dt(lang, 'checkTerms')}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {note && (
        <p className="text-sm text-violet-300" role="status">
          {note}
        </p>
      )}

      {(phase === 'downloaded' || phase === 'ready') && (
        <button type="button" onClick={remove} className={`${btn} bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300`}>
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          {dt(lang, 'remove', { size })}
        </button>
      )}
    </section>
  );
}
