import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createWorkerAuthorizer } from '../lib/worker-auth.mjs';

const token = `sfq_${'ab'.repeat(32)}`;
const hash = (value) => createHash('sha256').update(value).digest('hex');

test('worker rejects unauthenticated and forged calls, without fetching credentials for malformed input', async () => {
  let calls = 0;
  const authorize = createWorkerAuthorizer({
    legacySecret: () => undefined,
    readDigest: async () => {
      calls++;
      return hash(token);
    },
  });
  for (const value of [null, '', 'Bearer guessed', `Bearer ${token}\n`, `Basic ${token}`])
    assert.equal(await authorize(value), false);
  assert.equal(calls, 0);
  assert.equal(await authorize(`Bearer sfq_${'cd'.repeat(32)}`), false);
  assert.equal(await authorize(`Bearer ${token}`), true);
});

test('concurrent worker authorization shares one credential read; rotation takes effect after cache expiry', async () => {
  let time = 1000,
    calls = 0,
    current = hash(token);
  const authorize = createWorkerAuthorizer({
    legacySecret: () => undefined,
    now: () => time,
    readDigest: async () => {
      calls++;
      return current;
    },
  });
  assert(
    (await Promise.all(Array.from({ length: 20 }, () => authorize(`Bearer ${token}`)))).every(
      Boolean,
    ),
  );
  assert.equal(calls, 1);
  const rotated = `sfq_${'ef'.repeat(32)}`;
  current = hash(rotated);
  time += 60001;
  assert.equal(await authorize(`Bearer ${token}`), false);
  assert.equal(await authorize(`Bearer ${rotated}`), true);
  assert.equal(calls, 2);
});

test('credential outages fail closed and can recover; existing strong scheduler secrets still work', async () => {
  let broken = true;
  const authorize = createWorkerAuthorizer({
    legacySecret: () => 'legacy-scheduler-secret-at-least-32-characters',
    readDigest: async () => {
      if (broken) throw new Error('Unavailable');
      return hash(token);
    },
  });
  assert.equal(await authorize(`Bearer ${token}`), false);
  broken = false;
  assert.equal(await authorize(`Bearer ${token}`), true);
  assert.equal(await authorize('Bearer legacy-scheduler-secret-at-least-32-characters'), true);
  const short = createWorkerAuthorizer({
    legacySecret: () => 'weak',
    readDigest: async () => null,
  });
  assert.equal(await short('Bearer weak'), false);
});
