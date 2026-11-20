import type { LanguageCode } from '../types';
import { tx, type StringKey } from '../i18n';
import { ApiError, isAuthErrorStatus } from './api';

/**
 * Text for an error shown in the UI. English (and every language without its
 * own table) keeps the exact message as before. In Chinese the message is
 * localized; for a provider-auth stop the server's original detail is kept
 * in brackets so the cause (e.g. a missing key) stays visible.
 */
export function errorText(lang: LanguageCode, err: unknown, fallbackKey: StringKey): string {
  if (lang !== 'zh') return err instanceof Error ? err.message : tx(lang, fallbackKey);
  if (err instanceof ApiError) {
    if (isAuthErrorStatus(err.status)) return `${tx(lang, 'err.auth')}（${err.message}）`;
    if (err.status === 429) return tx(lang, 'err.rateLimit');
  }
  return tx(lang, fallbackKey);
}
