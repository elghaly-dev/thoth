// Shared fetch helper for the Thoth model routes.
// A 401/403 from the server is a provider-auth failure: it stops here and
// is shown as a visible, non-retryable error. It never becomes a silent
// fallback and never keeps a spinner running.

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAuthErrorStatus(status: number): boolean {
  return status === 401 || status === 403;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Server returned ${res.status}`;
    try {
      const data: unknown = await res.json();
      if (data && typeof data === 'object' && typeof (data as { error?: unknown }).error === 'string') {
        message = (data as { error: string }).error;
      }
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}
