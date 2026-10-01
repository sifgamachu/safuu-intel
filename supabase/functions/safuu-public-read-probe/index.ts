// Temporary operator-only verification. Keep disabled after a measured run.
const ENABLED = false;
const TARGET = 'https://www.safuu.net/api/public/summary';
const reply = (value, status = 200) =>
  Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
async function rpc(name, body = {}) {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error('Database unavailable');
  return r.json();
}
const percentile = (values, p) =>
  Math.round(
    [...values].sort((a, b) => a - b)[
      Math.min(values.length - 1, Math.ceil(values.length * p) - 1)
    ],
  );
Deno.serve(async (request) => {
  if (!ENABLED) return reply({ status: 'probe_disabled' }, 410);
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const authorization = request.headers.get('authorization');
  if (
    !authorization ||
    authorization.length !== 75 ||
    !/^Bearer sfq_[a-f0-9]{64}$/.test(authorization)
  )
    return reply({ error: 'Unauthorized' }, 401);
  try {
    const bytes = new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(authorization.slice(7))),
    );
    const actual = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
    const expected = await rpc('sf_worker_credential_digest');
    if (typeof expected !== 'string' || expected.length !== 64)
      return reply({ error: 'Unauthorized' }, 401);
    let different = 0;
    for (let i = 0; i < 64; i++) different |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
    if (different) return reply({ error: 'Unauthorized' }, 401);
    if (
      !(await rpc('sf_take_rate', {
        p_action: 'public_read_probe',
        p_subject: 'operator',
        p_limit: 1,
        p_window: 3600,
      }))
    )
      return reply({ error: 'Probe already ran this hour' }, 429);

    for (let i = 0; i < 3; i++) {
      const r = await fetch(TARGET, { signal: AbortSignal.timeout(10000) });
      await r.arrayBuffer();
      if (r.status !== 200) return reply({ error: 'Public endpoint is unavailable' }, 503);
    }
    const count = 2000,
      times = [],
      statuses = {},
      cache = {},
      errors = {};
    let failures = 0;
    const started = performance.now();
    await Promise.all(
      Array.from({ length: count }, async () => {
        const began = performance.now();
        try {
          const r = await fetch(TARGET, { signal: AbortSignal.timeout(35000) });
          statuses[r.status] = (statuses[r.status] || 0) + 1;
          const state = r.headers.get('x-vercel-cache') || 'unspecified';
          cache[state] = (cache[state] || 0) + 1;
          const data = await r.json();
          if (r.status !== 200 || typeof data.received !== 'number' || !Array.isArray(data.cases))
            failures++;
        } catch (e) {
          failures++;
          errors[e.name || 'Error'] = (errors[e.name || 'Error'] || 0) + 1;
        }
        times.push(performance.now() - began);
      }),
    );
    const elapsed = performance.now() - started;
    return reply({
      scope: 'One native-HTTP read-only burst from Supabase Edge; no report submissions or files',
      source_region: Deno.env.get('SB_REGION') || 'unspecified',
      simultaneous_requests: count,
      failures,
      http_statuses: statuses,
      edge_cache: cache,
      client_errors: errors,
      elapsed_ms: Math.round(elapsed),
      requests_per_second: Math.round(count / (elapsed / 1000)),
      latency_ms: {
        p50: percentile(times, 0.5),
        p95: percentile(times, 0.95),
        p99: percentile(times, 0.99),
      },
      checked_at: new Date().toISOString(),
    });
  } catch {
    return reply({ error: 'Probe unavailable' }, 503);
  }
});
