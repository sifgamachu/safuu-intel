import { randomUUID, randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { localSupabase } from '../tests/local-supabase.mjs';
import { signVisitor } from '../lib/privacy.mjs';
import assert from 'node:assert/strict';
import net from 'node:net';
const count = Number(process.env.LOAD_CONCURRENCY || 2000);
if (!Number.isInteger(count) || count < 1 || count > 5000)
  throw new Error('LOAD_CONCURRENCY must be 1–5000.');
// Production URLs are deliberately unsupported. This script creates synthetic tips.
const probe = net.createServer();
await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
process.env.TIPPER_HASH_SALT = 'load-test-only-secret-never-use-in-production-2026';
const database = await localSupabase(0);
const next = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      SUPABASE_URL: `http://127.0.0.1:${database.server.address().port}`,
      SUPABASE_SERVICE_ROLE_KEY: 'local-test-service-key',
      NEXT_TELEMETRY_DISABLED: '1',
      TURNSTILE_SECRET_KEY: '',
      TURNSTILE_SITE_KEY: '',
    },
  },
);
const appExited = new Promise((resolve) => next.once('exit', resolve));
let logs = '';
next.stdout.on('data', (d) => {
  logs += d;
});
next.stderr.on('data', (d) => {
  logs += d;
});
async function waitReady() {
  for (let i = 0; i < 100; i++) {
    if (next.exitCode !== null) throw new Error('Test app exited: ' + logs.slice(-1000));
    try {
      const r = await fetch(base + '/api/health');
      if (r.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Next server did not become ready. ' + logs.slice(-1000));
}
function percentile(values, p) {
  return Math.round(
    [...values].sort((a, b) => a - b)[
      Math.min(values.length - 1, Math.ceil(values.length * p) - 1)
    ],
  );
}
async function burst(label, run) {
  const began = performance.now();
  let failures = 0;
  const latencies = [];
  const codes = {};
  await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const start = performance.now();
      try {
        const status = await run(i);
        codes[status] = (codes[status] || 0) + 1;
        if (status < 200 || status >= 300) failures++;
      } catch {
        failures++;
      }
      latencies.push(performance.now() - start);
    }),
  );
  const elapsed = performance.now() - began;
  return {
    label,
    concurrent_clients: count,
    requests: count,
    failures,
    http_statuses: codes,
    elapsed_ms: Math.round(elapsed),
    requests_per_second: Math.round(count / (elapsed / 1000)),
    latency_ms: {
      p50: percentile(latencies, 0.5),
      p95: percentile(latencies, 0.95),
      p99: percentile(latencies, 0.99),
    },
  };
}
try {
  await waitReady();
  await fetch(base + '/api/public/summary');
  await fetch(base + '/');
  const reads = await burst('Warm public summary HTTP', async () => {
    const r = await fetch(base + '/api/public/summary');
    await r.arrayBuffer();
    return r.status;
  });
  const requests = Array.from({ length: count }, (_, i) => ({
    cookie: `sf_visitor=${signVisitor(randomUUID())}`,
    body: {
      request_id: randomUUID(),
      receipt_secret: randomBytes(32).toString('hex'),
      report: {
        full_name: `Synthetic Person ${i}`,
        office: `Synthetic Office ${i % 100}`,
        city: 'Load Test City',
        region: 'Load Test Region',
        corruption_type: 'bribery',
        language: 'en',
        incident_date_raw: 'Synthetic test only',
        description: `Synthetic load test incident ${i}. No real person or event is described in this temporary local database.`,
      },
    },
  }));
  const receipts = [];
  let firstError = null;
  const writes = await burst('Transactional report HTTP', async (i) => {
    const item = requests[i];
    const r = await fetch(base + '/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base, Cookie: item.cookie },
      body: JSON.stringify(item.body),
    });
    const body = await r.json();
    if (r.ok) receipts[i] = body.receipt;
    else if (!firstError) firstError = { status: r.status, message: body.error };
    return r.status;
  });
  const retry = await burst('Identical report retry HTTP', async (i) => {
    const item = requests[i];
    const r = await fetch(base + '/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base, Cookie: item.cookie },
      body: JSON.stringify(item.body),
    });
    const body = await r.json();
    if (r.ok) {
      assert.equal(body.receipt.id, item.body.request_id);
      assert.equal(body.receipt.duplicate, true);
    }
    return r.status;
  });
  const {
    rows: [effects],
  } = await database.db.query(`SELECT (SELECT count(*)::int FROM public.reports) AS reports,
    (SELECT count(*)::int FROM public.evidence_ledger) AS ledger_entries,
    (SELECT sum(count)::int FROM public.intake_metrics) AS metric_reports,
    (SELECT count(*)::int FROM public.reports WHERE person_id IS NULL) AS orphan_reports,
    (SELECT count(*)::int FROM public.persons WHERE disclosed_at IS NOT NULL) AS public_names`);
  const {
    rows: [chains],
  } = await database.db
    .query(`WITH links AS (SELECT *,lag(combined_hash,1,repeat('0',64)) OVER(PARTITION BY chain_id ORDER BY seq) AS expected_prev FROM public.evidence_ledger)
    SELECT count(*)::int AS broken FROM links WHERE prev_hash<>expected_prev OR combined_hash<>encode(sha256(convert_to(prev_hash||content_hash||report_id::text,'UTF8')),'hex')`);
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      application: 'Next production build on loopback',
      database: 'PostgreSQL WASM / PGlite, one local process',
      database_role: 'service_role',
      network: 'loopback only',
      files: 'none',
      telegram: 'not exercised',
      production_capacity: 'not established by this test',
    },
    results: [reads, writes, retry],
    first_error: firstError,
    effects,
    broken_ledger_links: chains.broken,
  };
  console.log(JSON.stringify(report, null, 2));
  if (process.env.LOAD_REPORT_PATH)
    await writeFile(process.env.LOAD_REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  assert.equal(reads.failures, 0);
  assert.equal(writes.failures, 0);
  assert.equal(retry.failures, 0);
  assert.equal(effects.reports, count);
  assert.equal(effects.ledger_entries, count);
  assert.equal(effects.metric_reports, count);
  assert.equal(effects.orphan_reports, 0);
  assert.equal(effects.public_names, 0);
  assert.equal(chains.broken, 0);
} finally {
  if (next.exitCode === null) next.kill('SIGTERM');
  await appExited;
  await database.close();
}
