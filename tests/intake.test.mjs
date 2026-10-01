import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { validateReport, validateEvidence, escapeHtml } from '../lib/domain.mjs';
import {
  seal,
  unseal,
  privateHash,
  constantEqual,
  visitorId,
  signVisitor,
} from '../lib/privacy.mjs';
import { requireOrigin, readJson, visitor } from '../lib/http.mjs';
import { submissionArgs } from '../lib/intake-service.mjs';
import { evolve } from '../lib/telegram-intake.mjs';
process.env.TIPPER_HASH_SALT = 'test-only-secret-never-use-in-production-2026';
export const SAMPLE = {
  full_name: 'Test Person',
  office: 'Test district office',
  city: 'Test City',
  region: 'Test Region',
  corruption_type: 'bribery',
  language: 'en',
  incident_date_raw: 'March 2026',
  description: 'A public employee demanded a payment to process a routine application.',
};
test('validation bounds and optional unknown names', () => {
  assert.equal(validateReport({ ...SAMPLE, amount_etb: '125.50' }).amount_etb, 125.5);
  assert.equal(validateReport({ ...SAMPLE, full_name: '' }).full_name, 'Unknown');
  for (const patch of [
    { description: 'short' },
    { description: 'a'.repeat(5001) },
    { office: {} },
    { full_name: {} },
    { amount_etb: [] },
    { amount_etb: -1 },
    { corruption_type: 'invalid' },
    { evidence_ids: ['invalid'] },
    { evidence_ids: [[randomUUID()]] },
  ])
    assert.throws(() => validateReport({ ...SAMPLE, ...patch }));
  assert.throws(() => validateEvidence({ type: 'text/html', size: 100 }));
  assert.throws(() => validateEvidence({ type: 'image/jpeg', size: 10485761 }));
  assert.equal(validateEvidence({ type: 'application/pdf', size: 120 }).kind, 'document');
});
test('private envelopes authenticate ciphertext and cookies', () => {
  const payload = { description: 'Private details', chat_id: 123456 };
  const encrypted = seal(payload);
  assert(!encrypted.includes('Private'));
  assert.deepEqual(unseal(encrypted), payload);
  const parts = encrypted.split('.');
  parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1);
  assert.throws(() => unseal(parts.join('.')));
  assert(!constantEqual('secret', 'different'));
  assert(constantEqual('same', 'same'));
  const id = randomUUID();
  assert.equal(visitorId(signVisitor(id)), id);
  assert.equal(visitorId(`${id}.forged`), null);
  assert.notEqual(privateHash('123', 'telegram-chat'), privateHash('123', 'web-visitor'));
});
test('bounded JSON bodies and same-origin writes', async () => {
  assert.throws(() =>
    requireOrigin(
      new Request('https://safuu.net/api/reports', { headers: { origin: 'https://evil.test' } }),
    ),
  );
  requireOrigin(
    new Request('https://safuu.net/api/reports', { headers: { origin: 'https://safuu.net' } }),
  );
  requireOrigin(
    new Request('http://localhost:3100/api/reports', {
      headers: { origin: 'http://127.0.0.1:3100', host: '127.0.0.1:3100' },
    }),
  );
  assert.throws(() =>
    requireOrigin(
      new Request('http://localhost:3100/api/reports', {
        headers: { origin: 'https://evil.test', host: 'safuu.net' },
      }),
    ),
  );
  await assert.rejects(() =>
    readJson(
      new Request('https://safuu.net', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'x'.repeat(100),
      }),
      50,
    ),
  );
  await assert.rejects(() =>
    readJson(
      new Request('https://safuu.net', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '{}',
      }),
    ),
  );
  const initial = visitor(new Request('https://safuu.net'));
  assert(initial.fresh);
  assert(initial.cookie.includes('HttpOnly; SameSite=Strict'));
  assert(initial.cookie.includes('Secure'));
});
test('all JSON write routes reject non-object bodies with a validation error', async () => {
  for (const body of ['null', '[]', 'true', '12', '"text"']) {
    await assert.rejects(
      () =>
        readJson(
          new Request('https://safuu.net/api/reports/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }),
        ),
      (error) => error.status === 422,
    );
  }
});
test('request fingerprints are stable while ciphertext remains randomized', () => {
  const id = randomUUID(),
    owner = privateHash('test', 'owner'),
    key = 'ab'.repeat(32);
  const a = submissionArgs(id, owner, key, SAMPLE),
    b = submissionArgs(id, owner, key, { ...SAMPLE });
  assert.equal(a.p_fingerprint, b.p_fingerprint);
  assert.equal(
    submissionArgs(id.toUpperCase(), owner, key.toUpperCase(), SAMPLE).p_receipt_hash,
    a.p_receipt_hash,
  );
  assert.notEqual(a.p_sealed, b.p_sealed);
  assert.notEqual(
    submissionArgs(randomUUID(), owner, key, { ...SAMPLE, full_name: '' }).p_case_key,
    submissionArgs(randomUUID(), owner, key, { ...SAMPLE, full_name: '' }).p_case_key,
  );
});
function message(text) {
  return { message: { chat: { id: 1, type: 'private' }, text } };
}
test('Telegram state machine blocks stale buttons, preserves dates, and escapes summaries', () => {
  const session = { current_step: 7, version: 4, language: 'en', draft: { ...SAMPLE } };
  assert.equal(
    evolve(session, { callback_query: { message: { chat: { id: 1 } }, data: 'skip:8:4' } }).state
      .step,
    7,
  );
  assert.equal(
    evolve(session, { callback_query: { message: { chat: { id: 1 } }, data: 'type:bribery:4' } })
      .state.step,
    7,
  );
  assert.equal(evolve(session, message('too short')).state.step, 7);
  assert.equal(evolve({ ...session, current_step: 8 }, message('one million')).state.step, 8);
  const n = evolve(
    { ...session, current_step: 10, draft: { ...SAMPLE, full_name: '<b>Person</b>' } },
    message('skip'),
  );
  assert(n.replies[0].text.includes('&lt;b&gt;Person&lt;/b&gt;'));
  assert.equal(n.state.step, 11);
  const submitted = evolve({ ...session, current_step: 11 }, message('yes'), null, randomUUID());
  assert.equal(submitted.submission.incident_date_raw, 'March 2026');
  assert.equal(submitted.state.step, 0);
  assert.equal(escapeHtml('<>&"'), '&lt;&gt;&amp;&quot;');
});
