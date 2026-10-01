import { createHash } from 'node:crypto';
import { constantEqual } from './privacy.mjs';
import { rpc } from './db-client.mjs';

// Cron keeps the bearer credential in Supabase Vault. The application only reads
// its digest through a service-only RPC, so no new Vercel secret is required.
export function createWorkerAuthorizer({
  readDigest = () => rpc('sf_worker_credential_digest'),
  legacySecret = () => process.env.CRON_SECRET,
  now = Date.now,
} = {}) {
  let cached,
    expires = 0,
    pending;
  async function digest() {
    if (cached && now() < expires) return cached;
    if (!pending) {
      pending = Promise.resolve()
        .then(readDigest)
        .then((value) => {
          if (typeof value !== 'string' || value.length !== 64 || !/^[a-f0-9]{64}$/.test(value))
            throw new Error('Worker credential unavailable.');
          cached = value;
          expires = now() + 60000;
          return value;
        })
        .finally(() => {
          pending = null;
        });
    }
    return pending;
  }
  return async function authorized(header) {
    const key = legacySecret();
    if (key && key.length >= 32 && constantEqual(header, `Bearer ${key}`)) return true;
    if (
      typeof header !== 'string' ||
      header.length !== 75 ||
      !/^Bearer sfq_[a-f0-9]{64}$/.test(header)
    )
      return false;
    try {
      const candidate = createHash('sha256').update(header.slice(7)).digest('hex');
      return constantEqual(candidate, await digest());
    } catch {
      return false;
    }
  };
}

export const authorizeWorker = createWorkerAuthorizer();
