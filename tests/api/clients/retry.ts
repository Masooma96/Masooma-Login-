import { APIResponse } from '@playwright/test';

export interface RetryOptions {
  /** Total number of attempts, including the first one. */
  attempts?: number;
  /** Wait before the first retry; doubles on every further retry. */
  delayMs?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries a request only for TRANSIENT failures: a network error, a 5xx server error or 429 (rate limit).
 * A 4xx answer such as 404 or 403 is a real result and is returned immediately, so the retry
 * never hides a genuine bug. Use it for read-only (GET) calls only, because they are safe to repeat.
 */
export async function withRetry(
  send: () => Promise<APIResponse>,
  { attempts = 3, delayMs = 500 }: RetryOptions = {},
): Promise<APIResponse> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await send();
      const transient = response.status() >= 500 || response.status() === 429;
      if (!transient || attempt === attempts) return response;
    } catch (error) {
      lastError = error; // network problem such as a reset connection or timeout
      if (attempt === attempts) throw error;
    }
    await wait(delayMs * 2 ** (attempt - 1));
  }

  throw lastError;
}
