// Real queue/session/report SQL and worker code, isolated local database.
// Telegram's remote HTTP responses are controlled fixtures; no messages leave.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { localSupabase } from './local-supabase.mjs';
import { call } from './database.mjs';
import { seal, unseal, privateHash } from '../lib/privacy.mjs';
import { drain } from '../lib/worker.mjs';

let instance,
  originalFetch,
  nextUpdate = 1,
  mode = 'success';
const deliveries = [];
process.env.TIPPER_HASH_SALT = 'worker-delivery-test-only-secret-never-use-in-production';
process.env.TELEGRAM_BOT_TOKEN = 'LOCAL_PROVIDER_FIXTURE';
before(async () => {
  instance = await localSupabase(0);
  process.env.SUPABASE_URL = `http://127.0.0.1:${instance.server.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-service-key';
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).startsWith('https://api.telegram.org/')) {
      assert(String(url).endsWith('/sendMessage'));
      const body = JSON.parse(options.body);
      deliveries.push(body);
      if (mode === '429')
        return Response.json({ ok: false, parameters: { retry_after: 90 } }, { status: 429 });
      if (mode === 'failure') return Response.json({ ok: false }, { status: 503 });
      return Response.json({ ok: true, result: { message_id: deliveries.length } });
    }
    return originalFetch(url, options);
  };
});
after(async () => {
  globalThis.fetch = originalFetch;
  await instance?.close();
});
async function enqueue(chat, text, callback = null) {
  const owner = privateHash(String(chat), 'telegram-chat');
  const message = { chat: { id: chat, type: 'private' }, text };
  const update = {
    update_id: nextUpdate++,
    ...(callback ? { callback_query: { data: callback, message } } : { message }),
  };
  const args = {
    p_key: `telegram:${update.update_id}`,
    p_kind: 'telegram_update',
    p_partition: owner,
    p_sealed: seal(update),
  };
  const id = await call(instance.db, 'sf_enqueue_job', args);
  assert.equal(await call(instance.db, 'sf_enqueue_job', args), id);
  await drain({ budgetMs: 1000 });
  const session = (
    await instance.db.query('SELECT * FROM public.telegram_sessions WHERE tipper_hash=$1', [owner])
  ).rows[0];
  return { id, owner, session };
}
async function releaseFixtureRetries() {
  await instance.db.exec(
    "UPDATE public.job_queue SET available_at=now()-interval '1 second' WHERE status='retry'; DELETE FROM public.rate_buckets WHERE action IN ('telegram_chat','telegram_global');",
  );
}
test('a complete guided conversation saves once and delivers the real saved-report receipt', async () => {
  const chat = 7770001;
  await enqueue(chat, '/start');
  await enqueue(chat, '', 'lang:en');
  await enqueue(chat, 'Synthetic worker subject');
  await enqueue(chat, 'Synthetic worker test office');
  await enqueue(chat, 'unknown');
  const { session } = await enqueue(chat, 'Synthetic city, Synthetic region');
  await enqueue(chat, '', `type:bribery:${session.version}`);
  await enqueue(chat, 'Synthetic date');
  await enqueue(chat, 'Synthetic worker delivery test. No real incident or person is described.');
  await enqueue(chat, 'skip');
  await enqueue(chat, 'skip');
  await enqueue(chat, 'skip');
  const { id, session: finished } = await enqueue(chat, 'yes');
  assert.equal(finished.current_step, 0);
  const reports = (await instance.db.query('SELECT * FROM public.reports')).rows;
  assert.equal(reports.length, 1);
  assert.equal(reports[0].id, id);
  assert.equal(reports[0].status, 'pending');
  assert.equal(
    unseal(reports[0].sealed_payload).description,
    'Synthetic worker delivery test. No real incident or person is described.',
  );
  assert.equal(
    (await instance.db.query('SELECT count(*)::int AS n FROM public.evidence_ledger')).rows[0].n,
    1,
  );
  for (let i = 0; i < 20; i++) {
    await releaseFixtureRetries();
    await drain({ budgetMs: 1000 });
    if (
      !(
        await instance.db.query(
          "SELECT count(*)::int AS n FROM public.job_queue WHERE status='retry'",
        )
      ).rows[0].n
    )
      break;
  }
  assert(
    deliveries.some(
      (body) => body.text.includes(id) && body.text.includes('saved for human review'),
    ),
  );
  assert.equal(
    (
      await instance.db.query(
        "SELECT count(*)::int AS n FROM public.job_queue WHERE status <> 'done'",
      )
    ).rows[0].n,
    0,
  );
  assert.equal(
    (
      await instance.db.query(
        'SELECT count(*)::int AS n FROM public.job_queue WHERE sealed_payload IS NOT NULL',
      )
    ).rows[0].n,
    0,
  );
});
test('provider rate limiting preserves the reply, honors Retry-After, and does not consume retry attempts', async () => {
  const id = await call(instance.db, 'sf_enqueue_job', {
    p_key: `fixture:${randomUUID()}`,
    p_kind: 'telegram_send',
    p_partition: privateHash('rate-chat', 'telegram-chat'),
    p_sealed: seal({ chat_id: 7770002, text: 'Synthetic rate test' }),
  });
  mode = '429';
  const start = Date.now();
  await drain({ budgetMs: 1000 });
  let job = (await instance.db.query('SELECT * FROM public.job_queue WHERE id=$1', [id])).rows[0];
  assert.equal(job.status, 'retry');
  assert.equal(job.attempts, 0);
  assert.equal(job.last_error, 'provider_rate_limit');
  assert(Date.parse(job.available_at) >= start + 89000);
  assert(job.sealed_payload);
  mode = 'success';
  await releaseFixtureRetries();
  await drain({ budgetMs: 1000 });
  job = (await instance.db.query('SELECT * FROM public.job_queue WHERE id=$1', [id])).rows[0];
  assert.equal(job.status, 'done');
  assert.equal(job.sealed_payload, null);
});
test('a failed provider request remains durable and succeeds on retry without duplicating reports', async () => {
  const id = await call(instance.db, 'sf_enqueue_job', {
    p_key: `fixture:${randomUUID()}`,
    p_kind: 'telegram_send',
    p_partition: privateHash('failure-chat', 'telegram-chat'),
    p_sealed: seal({ chat_id: 7770003, text: 'Synthetic retry test' }),
  });
  mode = 'failure';
  await drain({ budgetMs: 1000 });
  let job = (await instance.db.query('SELECT * FROM public.job_queue WHERE id=$1', [id])).rows[0];
  assert.equal(job.status, 'retry');
  assert.equal(job.last_error, 'provider_unavailable');
  assert(job.sealed_payload);
  mode = 'success';
  await releaseFixtureRetries();
  await drain({ budgetMs: 1000 });
  job = (await instance.db.query('SELECT * FROM public.job_queue WHERE id=$1', [id])).rows[0];
  assert.equal(job.status, 'done');
  assert.equal(job.sealed_payload, null);
  assert.equal(
    (await instance.db.query('SELECT count(*)::int AS n FROM public.reports')).rows[0].n,
    1,
  );
});
