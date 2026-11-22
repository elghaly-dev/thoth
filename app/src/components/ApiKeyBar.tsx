import React, { useEffect, useState } from 'react';
import {
  clearUserKey,
  detectRuntime,
  getRuntime,
  getUserKey,
  setUserKey,
  subscribeRuntime,
  type RuntimeState,
} from '../utils/runtime';
import { tx, type StringKey } from '../i18n';
import type { LanguageCode } from '../types';

const KEY_HELP_URL = 'https://aistudio.google.com/apikey';

interface ApiKeyBarProps {
  lang: LanguageCode;
}

export const ApiKeyBar: React.FC<ApiKeyBarProps> = ({ lang }) => {
  const [runtime, setRuntime] = useState<RuntimeState>(getRuntime);
  const [draft, setDraft] = useState('');
  const [messageKey, setMessageKey] = useState<StringKey | null>(null);

  useEffect(() => {
    const unsub = subscribeRuntime(setRuntime);
    void detectRuntime();
    return unsub;
  }, []);

  if (runtime.mode === 'unknown') {
    return null;
  }

  if (runtime.mode === 'server' && runtime.serverHasKey) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
      >
        {tx(lang, 'key.serverReady')}
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) {
      setMessageKey('key.needed');
      return;
    }
    if (!/^[\x21-\x7E]{20,200}$/.test(value)) {
      setMessageKey('key.invalid');
      return;
    }
    setUserKey(value);
    setDraft('');
    setMessageKey('key.saved');
  };

  const handleClear = () => {
    clearUserKey();
    setDraft('');
    setMessageKey(null);
  };

  return (
    <section
      aria-label={tx(lang, 'key.title')}
      className="rounded-2xl border border-amber-800/50 bg-amber-950/30 px-4 py-4 text-sm text-slate-100 space-y-3"
    >
      <div>
        <h2 className="font-semibold text-amber-200">{tx(lang, 'key.title')}</h2>
        <p className="mt-1 text-slate-300 leading-relaxed">{tx(lang, 'key.body')}</p>
        <p className="mt-1 text-slate-400">
          <a
            href={KEY_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 underline underline-offset-2 hover:text-amber-200"
          >
            {tx(lang, 'key.whereToGet')}
          </a>
        </p>
        <p className="mt-1 text-xs text-slate-400">{tx(lang, 'key.staysInTab')}</p>
      </div>

      {runtime.userKeyPresent ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-emerald-300">{tx(lang, 'key.saved')}</p>
          <button
            type="button"
            onClick={handleClear}
            className="min-h-11 px-3 py-2 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            {tx(lang, 'key.clear')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <label className="flex-1 text-xs text-slate-300">
            {tx(lang, 'key.label')}
            <input
              type="password"
              name="gemini-key"
              autoComplete="new-password"
              data-1p-ignore
              data-lpignore="true"
              spellCheck={false}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={tx(lang, 'key.placeholder')}
              className="mt-1 w-full min-h-11 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </label>
          <button
            type="submit"
            className="min-h-11 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
          >
            {tx(lang, 'key.save')}
          </button>
        </form>
      )}

      {runtime.rejected && (
        <p role="status" className="text-amber-200">
          {tx(lang, 'key.invalid')}
        </p>
      )}
      {messageKey && !runtime.userKeyPresent && !runtime.rejected && messageKey !== 'key.saved' && (
        <p role="status" className="text-amber-200">
          {tx(lang, messageKey)}
        </p>
      )}
      {/* getUserKey is read only to assert presence after save; the value is never rendered. */}
      {runtime.userKeyPresent && getUserKey().length === 0 ? (
        <p role="status" className="text-amber-200">
          {tx(lang, 'key.needed')}
        </p>
      ) : null}
    </section>
  );
};
