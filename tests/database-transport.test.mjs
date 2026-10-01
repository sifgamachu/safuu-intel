import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { rpc } from '../lib/db-client.mjs';
import { databaseTransport } from '../lib/database-transport.mjs';

test('a database burst reuses at most 32 connections and returns every RPC result', async () => {
  let active = 0,
    peak = 0,
    connections = 0,
    calls = 0;
  const server = http.createServer(async (req, res) => {
    assert.equal(req.headers.authorization, 'Bearer transport-test-only-key');
    assert.equal(req.url, '/rest/v1/rpc/sf_health');
    for await (const _ of req) {
    }
    calls++;
    peak = Math.max(peak, ++active);
    await new Promise((r) => setTimeout(r, 20));
    active--;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ database: 'available' }));
  });
  server.on('connection', () => connections++);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  process.env.SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'transport-test-only-key';
  try {
    const results = await Promise.all(Array.from({ length: 128 }, () => rpc('sf_health')));
    assert.equal(calls, 128);
    assert.ok(connections <= 32, `opened ${connections} connections`);
    assert.ok(peak <= 32, `handled ${peak} parallel requests`);
    assert.ok(peak > 1, 'the pool must support concurrent work');
    assert.ok(results.every((r) => r.database === 'available'));
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('bounded queue rejects excess work, expires waiting requests, and recovers without dispatching them', async () => {
  let received = 0,
    allowFirst;
  const blocked = new Promise((r) => {
    allowFirst = r;
  });
  const server = http.createServer(async (req, res) => {
    received++;
    if (received === 1) await blocked;
    res.setHeader('Content-Type', 'application/json');
    res.end('{}');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const transport = databaseTransport(origin, {
    concurrency: 1,
    queueLimit: 1,
    queueTimeoutMs: 40,
  });
  try {
    const first = transport.fetch(origin);
    const expired = assert.rejects(transport.fetch(origin), { code: 'database_busy' });
    await assert.rejects(transport.fetch(origin), { code: 'database_busy' });
    await expired;
    assert.equal(received, 1);
    allowFirst();
    await first;
    assert.equal((await transport.fetch(origin)).status, 200);
    assert.equal(received, 2);
    await assert.rejects(transport.fetch('https://example.com/'), /Unexpected database origin/);
  } finally {
    allowFirst();
    await transport.close();
    await new Promise((r) => server.close(r));
  }
});

test('a cancelled queued request frees its slot without sending a database request', async () => {
  let received = 0,
    allowFirst;
  const blocked = new Promise((r) => {
    allowFirst = r;
  });
  const server = http.createServer(async (req, res) => {
    if (++received === 1) await blocked;
    res.end('{}');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const transport = databaseTransport(origin, { concurrency: 1, queueLimit: 1 });
  try {
    const first = transport.fetch(origin);
    const controller = new AbortController();
    const cancelled = assert.rejects(transport.fetch(origin, { signal: controller.signal }), {
      name: 'AbortError',
    });
    controller.abort();
    await cancelled;
    const next = transport.fetch(origin);
    allowFirst();
    await first;
    await next;
    assert.equal(received, 2);
  } finally {
    allowFirst();
    await transport.close();
    await new Promise((r) => server.close(r));
  }
});
