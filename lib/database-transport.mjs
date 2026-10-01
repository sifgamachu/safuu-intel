import { Pool, fetch as pooledFetch } from 'undici';

// Bound both work and waiting clients. Queue time is measured separately from
// database execution: a queued request has not started a database transaction.
// Receipts still require the existing atomic commit; overload never returns a
// successful save. These limits apply per application instance, not globally.
export function databaseTransport(
  origin,
  { concurrency = 32, queueLimit = 5000, queueTimeoutMs = 45000, requestTimeoutMs = 15000 } = {},
) {
  for (const [name, value] of Object.entries({ concurrency, queueTimeoutMs, requestTimeoutMs }))
    if (!Number.isSafeInteger(value) || value < 1) throw new Error(`Invalid ${name}.`);
  if (!Number.isSafeInteger(queueLimit) || queueLimit < 0) throw new Error('Invalid queueLimit.');
  const pool = new Pool(origin, { connections: concurrency, pipelining: 1 });
  const waiting = new Set();
  let active = 0;
  const busy = () => Object.assign(new Error('database_busy'), { code: 'database_busy' });
  function release() {
    const next = waiting.values().next().value;
    if (next) {
      waiting.delete(next);
      next.admit();
    } else active--;
  }
  function acquire(signal) {
    if (signal?.aborted) return Promise.reject(signal.reason);
    if (active < concurrency) {
      active++;
      return Promise.resolve();
    }
    if (waiting.size >= queueLimit) return Promise.reject(busy());
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
      };
      const item = {
        admit: () => {
          cleanup();
          resolve();
        },
      };
      const abort = () => {
        if (waiting.delete(item)) {
          cleanup();
          reject(signal.reason);
        }
      };
      const timer = setTimeout(() => {
        if (waiting.delete(item)) {
          cleanup();
          reject(busy());
        }
      }, queueTimeoutMs);
      waiting.add(item);
      signal?.addEventListener('abort', abort, { once: true });
    });
  }
  return {
    async fetch(input, init = {}) {
      if (
        new URL(typeof input === 'string' || input instanceof URL ? input : input.url).origin !==
        origin
      )
        throw new Error('Unexpected database origin.');
      const signal = init.signal || input?.signal;
      await acquire(signal);
      try {
        const timeout = AbortSignal.timeout(requestTimeoutMs);
        const response = await pooledFetch(input, {
          ...init,
          dispatcher: pool,
          redirect: 'error',
          signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        });
        // SDK endpoints return JSON/HEAD responses. Consume the body before
        // releasing a slot so a slow response cannot create extra work.
        const body = await response.arrayBuffer();
        return new Response([204, 205, 304].includes(response.status) ? null : body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } finally {
        release();
      }
    },
    close: () => pool.close(),
  };
}
