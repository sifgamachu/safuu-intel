// ─────────────────────────────────────────────────────────────────────────
//  Supabase client (server-side only — uses service_role key)
//  Lazy-initialized so Next.js build-time page-data collection doesn't
//  throw when env vars aren't yet available.
// ─────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

let _client = null;

function getClient() {
  if (_client) return _client;

  const url        = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Vercel env vars'
    );
  }

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Proxy defers method access until the real client is actually used.
// At build-time (no env vars), importing this module is a no-op.
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
