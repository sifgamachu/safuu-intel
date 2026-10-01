import { writeFile } from 'node:fs/promises';
import { spawn, fork } from 'node:child_process';
import { localSupabase } from '../tests/local-supabase.mjs';
import { nativeDatabase } from '../tests/native-database.mjs';
import assert from 'node:assert/strict';
import net from 'node:net';

const count = Number(process.env.LOAD_CONCURRENCY || 20000);
if (!Number.isInteger(count) || count < 1 || count > 20000)
  throw new Error('LOAD_CONCURRENCY must be 1–20000.');
const instances = Number(process.env.LOAD_INSTANCES || Math.ceil(count / 5000));
if (!Number.isInteger(instances) || instances < 1 || instances > 8 || instances > count)
  throw new Error('LOAD_INSTANCES must be 1–8 and no greater than the client count.');
if (Math.ceil(count / instances) > 5000)
  throw new Error(
    'Use enough LOAD_INSTANCES to keep each client process at or below 5000 sockets.',
  );

// Synthetic reports only enter a new local database. Remote URLs are unsupported.
process.env.TIPPER_HASH_SALT = 'load-test-only-secret-never-use-in-production-2026';
const native = process.env.LOAD_POSTGRES_BIN
  ? await nativeDatabase(process.env.LOAD_POSTGRES_BIN)
  : null;
const database = await localSupabase(0, native ? { db: native.db } : {});
const servers = [],
  clients = [];
let logs = '';
function messageFrom(child, type) {
  return new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message.type === type) {
        cleanup();
        resolve(message);
      }
    };
    const onExit = () => {
      cleanup();
      reject(new Error('Load client exited unexpectedly.'));
    };
    const cleanup = () => {
      child.off('message', onMessage);
      child.off('exit', onExit);
    };
    child.on('message', onMessage);
    child.once('exit', onExit);
  });
}
async function availablePort() {
  const probe = net.createServer();
  await new Promise((r) => probe.listen(0, '127.0.0.1', r));
  const port = probe.address().port;
  await new Promise((r) => probe.close(r));
  return port;
}
async function server() {
  const port = await availablePort(),
    base = `http://127.0.0.1:${port}`;
  const next = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '-p',
      String(port),
      '-H',
      '127.0.0.1',
      '--keepAliveTimeout',
      '120000',
    ],
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
  const exited = new Promise((r) => next.once('exit', r));
  servers.push({ next, exited });
  next.stdout.on('data', (d) => {
    logs = (logs + d).slice(-8000);
  });
  next.stderr.on('data', (d) => {
    logs = (logs + d).slice(-8000);
  });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (next.exitCode !== null) throw new Error('Test app exited: ' + logs.slice(-1000));
    try {
      const r = await fetch(base + '/api/health', { signal: AbortSignal.timeout(1000) });
      await r.arrayBuffer();
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!ready) throw new Error('Next server did not become ready. ' + logs.slice(-1000));
  for (const path of ['/api/public/summary', '/']) {
    const r = await fetch(base + path);
    await r.arrayBuffer();
  }
  return base;
}
function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
}
async function burst(phase, label) {
  const startAt = Date.now() + 1000;
  const pending = clients.map(({ child }) => messageFrom(child, 'result'));
  for (const { child } of clients) child.send({ type: 'burst', phase, startAt });
  const records = (await Promise.all(pending)).flatMap((r) => r.records);
  const statuses = {},
    errors = {},
    events = [];
  let failures = 0;
  for (const r of records) {
    statuses[r.status] = (statuses[r.status] || 0) + 1;
    if (r.error || r.status < 200 || r.status >= 300) {
      failures++;
      const error = r.error || 'HTTP error';
      errors[error] = (errors[error] || 0) + 1;
    }
    events.push([r.started, 1], [r.ended, -1]);
  }
  // Completion events precede start events within a millisecond, avoiding an
  // inflated overlap estimate. This measures outstanding client requests,
  // including transport dispatch; it does not count database connections.
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let active = 0,
    peak = 0;
  for (const [, delta] of events) {
    active += delta;
    peak = Math.max(peak, active);
  }
  const began = Math.min(...records.map((r) => r.started));
  const ended = Math.max(...records.map((r) => r.ended));
  const times = records.map((r) => r.ended - r.started).sort((a, b) => a - b);
  const result = {
    label,
    concurrent_clients: count,
    peak_outstanding_requests: peak,
    requests: records.length,
    launch_span_ms: Math.max(...records.map((r) => r.started)) - began,
    failures,
    http_statuses: statuses,
    errors,
    elapsed_ms: ended - began,
    requests_per_second: Math.round(count / ((ended - began) / 1000)),
    latency_ms: {
      p50: percentile(times, 0.5),
      p95: percentile(times, 0.95),
      p99: percentile(times, 0.99),
    },
  };
  console.log(JSON.stringify(result));
  return result;
}
try {
  let offset = 0;
  for (let i = 0; i < instances; i++) {
    const base = await server(),
      size = Math.floor(count / instances) + (i < count % instances ? 1 : 0);
    const child = fork(new URL('./load-client.mjs', import.meta.url), [], {
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    const exited = new Promise((r) => child.once('exit', r));
    clients.push({ child, exited });
    const ready = messageFrom(child, 'ready');
    child.send({ type: 'init', base, count: size, offset });
    await ready;
    offset += size;
  }
  const reads = await burst('read', 'Warm public summary HTTP');
  const writes = await burst('write', 'Transactional report HTTP');
  const retry = await burst('retry', 'Identical report retry HTTP');
  const {
    rows: [effects],
  } = await database.db.query(`SELECT
    (SELECT count(*)::int FROM public.reports) AS reports,
    (SELECT count(*)::int FROM public.evidence_ledger) AS ledger_entries,
    (SELECT sum(count)::int FROM public.intake_metrics) AS metric_reports,
    (SELECT count(*)::int FROM public.reports WHERE person_id IS NULL) AS orphan_reports,
    (SELECT count(*)::int FROM public.persons WHERE disclosed_at IS NOT NULL) AS public_names`);
  const {
    rows: [chains],
  } = await database.db.query(`WITH links AS
    (SELECT *,lag(combined_hash,1,repeat('0',64)) OVER(PARTITION BY chain_id ORDER BY seq) AS expected_prev FROM public.evidence_ledger)
    SELECT count(*)::int AS broken FROM links WHERE prev_hash<>expected_prev OR combined_hash<>encode(sha256(convert_to(prev_hash||content_hash||report_id::text,'UTF8')),'hex')`);
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      application: 'Next production build on loopback',
      application_instances: instances,
      client_processes: instances,
      client_connect_timeout_ms: 30000,
      client_request_timeout_ms: 75000,
      client_and_server_keep_alive_ms: 120000,
      client_tcp_connections:
        'Pre-established in bounded untimed startup; timed HTTP requests start together, without automatic retries.',
      database: native
        ? 'Native PostgreSQL, temporary isolated cluster, 24 pooled connections'
        : 'PostgreSQL WASM / PGlite, one local process',
      database_settings: native?.settings || null,
      database_role: 'service_role',
      network: 'loopback only',
      files: 'none',
      telegram: 'not exercised',
      production_capacity: 'not established by this test',
      concurrency_definition:
        'All clients start together; peak outstanding counts client requests awaiting completion, including transport dispatch.',
    },
    results: [reads, writes, retry],
    effects,
    broken_ledger_links: chains.broken,
  };
  console.log(JSON.stringify(report, null, 2));
  if (process.env.LOAD_REPORT_PATH)
    await writeFile(process.env.LOAD_REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  for (const r of report.results) assert.equal(r.failures, 0, r.label + ' failed');
  for (const key of ['reports', 'ledger_entries', 'metric_reports'])
    assert.equal(effects[key], count, key);
  assert.equal(effects.orphan_reports, 0);
  assert.equal(effects.public_names, 0);
  assert.equal(chains.broken, 0);
} finally {
  for (const { child } of clients) if (child.exitCode === null) child.kill('SIGTERM');
  await Promise.all(clients.map(({ exited }) => exited));
  for (const { next } of servers) if (next.exitCode === null) next.kill('SIGTERM');
  await Promise.all(servers.map(({ exited }) => exited));
  await database.close();
}
