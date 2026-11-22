import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Server-side helpers for the /api proxy gate (items 2-4).
 * - Session cookie: issued only after the proxy secret is presented on
 *   POST /api/session. The cookie holds a signed, expiring token
 *   (HMAC-SHA256 keyed by the secret), never the secret itself.
 * - Cookie flags: Secure, HttpOnly, SameSite=Strict, Path=/api.
 * - Origin: state-changing /api requests must carry an Origin header
 *   for this host; a missing or foreign Origin is refused.
 * - Log redaction: secrets, keys and tokens are scrubbed from anything
 *   the server logs.
 */

export const SESSION_COOKIE = 'thoth-session';
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/api',
  maxAge: SESSION_TTL_SECONDS * 1000,
};

/** Constant-time string comparison (length leak only). */
export function secretsEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  if (x.length !== y.length || x.length === 0) return false;
  return timingSafeEqual(x, y);
}

function sign(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(`thoth-session.${payload}`).digest('base64url');
}

/** A signed session token "v1.<expiresAtSeconds>.<sig>". Never contains the secret. */
export function issueSessionToken(secret: string, nowMs = Date.now()): string {
  const exp = Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(secret, payload)}`;
}

export function verifySessionToken(secret: string, token: string | null | undefined, nowMs = Date.now()): boolean {
  if (!secret || typeof token !== 'string') return false;
  const m = /^(v1\.(\d{1,12}))\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!m) return false;
  const exp = Number(m[2]);
  if (!Number.isFinite(exp) || exp * 1000 <= nowMs) return false;
  return secretsEqual(m[3], sign(secret, m[1]));
}

export type OriginVerdict = 'ok' | 'missing' | 'foreign';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Origin check for /api. A browser always sends Origin on a cross-site
 * request and on any same-origin POST, so a POST without Origin is not a
 * page of this site and is refused. Same-origin GETs (the health probe)
 * may omit Origin; when present it must still match.
 */
export function checkOrigin(method: string, origin: string | undefined, host: string | undefined): OriginVerdict {
  if (typeof origin !== 'string' || origin.length === 0 || origin === 'null') {
    if (origin === 'null') return 'foreign';
    return READ_ONLY_METHODS.has(method.toUpperCase()) ? 'ok' : 'missing';
  }
  try {
    const u = new URL(origin);
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !host || u.host !== host) return 'foreign';
    return 'ok';
  } catch {
    return 'foreign';
  }
}

/** Parse one cookie value from a Cookie header. */
export function readCookie(header: string | undefined, name: string): string | null {
  for (const part of (header || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}

const REDACTED = '[REDACTED]';

/**
 * Scrub secrets and tokens from a log line: the configured secret values,
 * Google API keys (AIza...), Bearer tokens, session tokens, the proxy
 * header and cookie values, and key=/token= query or JSON fields.
 */
export function redact(input: unknown, secrets: string[] = []): string {
  let s: string;
  if (input instanceof Error) s = `${input.name}: ${input.message}`;
  else if (typeof input === 'string') s = input;
  else {
    try {
      s = JSON.stringify(input) ?? String(input);
    } catch {
      s = String(input);
    }
  }
  for (const secret of secrets) {
    if (secret && secret.length >= 4) s = s.split(secret).join(REDACTED);
  }
  return s
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, REDACTED)
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, `$1 ${REDACTED}`)
    .replace(/v1\.\d{1,12}\.[A-Za-z0-9_-]{43}/g, REDACTED)
    .replace(/((?:thoth-session|thoth-proxy)\s*=\s*)[^;\s,"']+/gi, `$1${REDACTED}`)
    .replace(/(x-thoth-proxy-secret|x-goog-api-key|authorization|cookie)(["']?\s*[:=]\s*["']?)[^"',;\s}]+/gi, `$1$2${REDACTED}`)
    .replace(/([?&"'\s](?:key|api_key|apikey|token|access_token|secret|password)["']?\s*[=:]\s*["']?)[^&"',\s}]+/gi, `$1${REDACTED}`);
}
