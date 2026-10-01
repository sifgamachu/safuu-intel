import { createClient } from '@supabase/supabase-js';
let client, configuration;
export function serviceClient() {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Database configuration is missing.');
  if (!client || configuration !== `${url}:${key}`) {
    configuration = `${url}:${key}`;
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init = {}) =>
          fetch(input, {
            ...init,
            signal: init.signal
              ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
              : AbortSignal.timeout(15000),
          }),
      },
    });
  }
  return client;
}
export async function rpc(name, args = {}, client = serviceClient()) {
  const { data, error } = await client.rpc(name, args);
  if (error) {
    const known = [
      'rate_limited',
      'already_received',
      'request_conflict',
      'stale_session',
      'lease_lost',
      'evidence_missing',
      'publication_not_ready',
      'not_authorized',
    ];
    const code = known.find((code) => error.message?.includes(code)) || 'database_unavailable';
    const err = new Error(code);
    err.code = code;
    throw err;
  }
  return data;
}
