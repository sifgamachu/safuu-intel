// Child process for the local-only capacity test. Each process owns its sockets
// and starts its entire burst at the coordinator's shared timestamp.
import { randomUUID, randomBytes } from 'node:crypto';
import { signVisitor } from '../lib/privacy.mjs';
import assert from 'node:assert/strict';
import { Pool, fetch as loadFetch, buildConnector } from 'undici';
import net from 'node:net';

let base, items, transport;
process.on('message', async (message) => {
  if (message.type === 'init') {
    base = message.base;
    if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) throw new Error('Local targets only.');
    // Keep genuine simultaneous requests, with no client batching or retries.
    // Cold TCP bursts on a shared CI host can exceed the default 10s connect
    // timeout. The 75s end-to-end deadline still bounds every measured request.
    // Establish real sockets during untimed startup. This separates the shared
    // runner's TCP listen-backlog limit from simultaneous application requests.
    // The timed bursts still dispatch all HTTP requests together without retries.
    const sockets = [];
    const port = Number(new URL(base).port);
    for (let offset = 0; offset < message.count; offset += 128) {
      await Promise.all(
        Array.from(
          { length: Math.min(128, message.count - offset) },
          () =>
            new Promise((resolve, reject) => {
              const socket = net.createConnection({ host: '127.0.0.1', port });
              socket.setTimeout(30000, () => {
                socket.destroy();
                reject(new Error('Socket warm-up timed out.'));
              });
              socket.once('error', reject);
              socket.once('connect', () => {
                socket.setTimeout(0);
                sockets.push(socket);
                resolve();
              });
            }),
        ),
      );
    }
    const fallback = buildConnector({ timeout: 30000 });
    transport = new Pool(base, {
      connections: message.count,
      connectTimeout: 30000,
      keepAliveTimeout: 120000,
      keepAliveMaxTimeout: 120000,
      pipelining: 1,
      connect: (options, callback) => {
        while (sockets.length) {
          const socket = sockets.pop();
          if (!socket.destroyed) {
            // Connect listeners are installed after the connector returns.
            queueMicrotask(() => callback(null, socket));
            return socket;
          }
        }
        fallback(options, callback);
      },
    });
    items = Array.from({ length: message.count }, (_, i) => ({
      cookie: `sf_visitor=${signVisitor(randomUUID())}`,
      body: {
        request_id: randomUUID(),
        receipt_secret: randomBytes(32).toString('hex'),
        report: {
          full_name: `Synthetic Person ${message.offset + i}`,
          office: `Synthetic Office ${(message.offset + i) % 100}`,
          city: 'Load Test City',
          region: 'Load Test Region',
          corruption_type: 'bribery',
          language: 'en',
          incident_date_raw: 'Synthetic test only',
          description: `Synthetic load test incident ${message.offset + i}. No real person or event is described in this temporary local database.`,
        },
      },
    }));
    process.send({ type: 'ready' });
    return;
  }
  if (message.type === 'stop') {
    process.disconnect();
    process.exit(0);
  }
  if (message.type !== 'burst') return;
  await new Promise((r) => setTimeout(r, Math.max(0, message.startAt - Date.now())));
  const records = await Promise.all(
    items.map(async (item) => {
      const started = Date.now();
      let status = 0,
        error = null;
      try {
        const isRead = message.phase === 'read';
        const r = await loadFetch(base + (isRead ? '/api/public/summary' : '/api/reports'), {
          dispatcher: transport,
          signal: AbortSignal.timeout(75000),
          ...(isRead
            ? {}
            : {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Origin: base, Cookie: item.cookie },
                body: JSON.stringify(item.body),
              }),
        });
        status = r.status;
        const body = await r.json();
        if (isRead && r.ok) {
          assert.equal(typeof body.received, 'number');
          assert.ok(Array.isArray(body.cases));
        } else if (r.ok) {
          assert.equal(body.receipt.id, item.body.request_id);
          if (message.phase === 'retry') assert.equal(body.receipt.duplicate, true);
        }
        if (!r.ok) error = body.error || 'HTTP error';
      } catch (e) {
        error = e.cause?.code || e.code || e.name || 'Error';
      }
      return { started, ended: Date.now(), status, error };
    }),
  );
  process.send({ type: 'result', phase: message.phase, records });
});
