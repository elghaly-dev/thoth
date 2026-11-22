import type { LanguageCode } from '../types';
import { tx, type StringKey } from '../i18n';
import { ApiError, isAuthErrorStatus } from './api';

/**
 * Text for an error shown in the UI. English keeps the exact message. Every
 * other language gets its own string; Chinese also keeps the provider's
 * detail in brackets for an auth stop.
 */
export function errorText(lang: LanguageCode, err: unknown, fallbackKey: StringKey): string {
  if (lang === 'en') return err instanceof Error ? err.message : tx(lang, fallbackKey);
  if (err instanceof ApiError) {
    // zh keeps the provider's detail in brackets (as before); other languages
    // show only their own text, never a raw English message.
    if (isAuthErrorStatus(err.status)) return lang === 'zh' ? `${tx(lang, 'err.auth')}（${err.message}）` : tx(lang, 'err.auth');
    if (err.status === 429) return tx(lang, 'err.rateLimit');
  }
  return tx(lang, fallbackKey);
}
