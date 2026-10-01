// Child process for the local-only capacity test. Each process owns its sockets
// and starts its entire burst at the coordinator's shared timestamp.
import { randomUUID, randomBytes } from 'node:crypto';
import { signVisitor } from '../lib/privacy.mjs';
import assert from 'node:assert/strict';

let base, items;
process.on('message', async (message) => {
  if (message.type === 'init') {
    base = message.base;
    if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) throw new Error('Local targets only.');
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
        const r = await fetch(base + (isRead ? '/api/public/summary' : '/api/reports'), {
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
