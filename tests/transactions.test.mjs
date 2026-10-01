import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testDatabase, call } from './database.mjs';
import { submissionArgs } from '../lib/intake-service.mjs';
import { privateHash, seal } from '../lib/privacy.mjs';
process.env.TIPPER_HASH_SALT = 'test-only-secret-never-use-in-production-2026';
let db;
before(async () => {
  db = await testDatabase();
});
after(async () => {
  await db?.close();
});
const SAMPLE = {
  full_name: 'Test Person',
  office: 'Test district office',
  city: 'Test City',
  region: 'Test Region',
  corruption_type: 'bribery',
  language: 'en',
  incident_date_raw: 'March 2026',
  description: 'A public employee demanded a payment to process a routine application.',
};
const make = (tag, patch = {}) =>
  submissionArgs(randomUUID(), privateHash(tag, 'owner'), 'ab'.repeat(32), { ...SAMPLE, ...patch });
test('receipt, person, ledger, and counters commit atomically; retries are idempotent', async () => {
  const args = make('atomic');
  const first = await call(db, 'sf_submit_report', args);
  assert.equal(first.status, 'pending');
  assert.equal(first.duplicate, false);
  assert.equal((await call(db, 'sf_submit_report', args)).duplicate, true);
  assert.equal(
    (
      await db.query('SELECT count(*)::int AS n FROM public.evidence_ledger WHERE report_id=$1', [
        args.p_id,
      ])
    ).rows[0].n,
    1,
  );
  assert.equal(
    await call(db, 'sf_receipt', { p_id: args.p_id, p_receipt_hash: '00'.repeat(32) }),
    null,
  );
  assert.equal(
    (await call(db, 'sf_receipt', { p_id: args.p_id, p_receipt_hash: args.p_receipt_hash })).id,
    args.p_id,
  );
  await assert.rejects(
    () => call(db, 'sf_submit_report', { ...args, p_receipt_hash: '00'.repeat(32) }),
    /request_conflict/,
  );
  await assert.rejects(
    () => call(db, 'sf_submit_report', { ...args, p_id: randomUUID() }),
    /already_received/,
  );
  const broken = make('rollback', { office: 'Rollback office' });
  broken.p_evidence = [randomUUID()];
  await assert.rejects(() => call(db, 'sf_submit_report', broken), /evidence_missing/);
  assert.equal(
    (
      await db.query('SELECT count(*)::int AS n FROM public.persons WHERE office=$1', [
        'Rollback office',
      ])
    ).rows[0].n,
    0,
  );
  await db.exec(
    "CREATE FUNCTION public.test_break_ledger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test_ledger_failure'; END $$; CREATE TRIGGER test_failure BEFORE INSERT ON public.evidence_ledger FOR EACH ROW EXECUTE FUNCTION public.test_break_ledger();",
  );
  const rollback = make('ledger rollback', { office: 'Ledger rollback office' });
  await assert.rejects(() => call(db, 'sf_submit_report', rollback), /test_ledger_failure/);
  assert.equal(
    (await db.query('SELECT count(*)::int AS n FROM public.reports WHERE id=$1', [rollback.p_id]))
      .rows[0].n,
    0,
  );
  assert.equal(
    (
      await db.query('SELECT count(*)::int AS n FROM public.persons WHERE office=$1', [
        'Ledger rollback office',
      ])
    ).rows[0].n,
    0,
  );
  await db.exec(
    'DROP TRIGGER test_failure ON public.evidence_ledger; DROP FUNCTION public.test_break_ledger();',
  );
});
test('rate limits and attachment ownership are enforced inside the transaction', async () => {
  for (let i = 0; i < 5; i++)
    await call(
      db,
      'sf_submit_report',
      make('daily', { description: SAMPLE.description + ` Instance ${i}.` }),
    );
  await assert.rejects(
    () =>
      call(
        db,
        'sf_submit_report',
        make('daily', { description: SAMPLE.description + ' Instance 6.' }),
      ),
    /rate_limited/,
  );
  const args = make('attachment'),
    evidence = randomUUID();
  await db.query(
    "INSERT INTO public.report_evidence(id,owner_hash,object_path,kind,content_type,byte_size,uploaded_at) VALUES($1,$2,$3,'document','application/pdf',100,now())",
    [evidence, args.p_owner, `${args.p_owner}/${evidence}`],
  );
  await assert.rejects(
    () => call(db, 'sf_submit_report', { ...make('wrong owner'), p_evidence: [evidence] }),
    /evidence_missing/,
  );
  await call(db, 'sf_submit_report', { ...args, p_evidence: [evidence] });
  await assert.rejects(
    () =>
      call(db, 'sf_submit_report', {
        ...make('attachment'),
        p_fingerprint: '12'.repeat(32),
        p_evidence: [evidence],
      }),
    /evidence_missing/,
  );
});
test('clients cannot read private rows or execute server RPCs', async () => {
  await db.exec('SET ROLE anon');
  try {
    await assert.rejects(() => db.query('SELECT * FROM public.reports'), /permission denied/);
    await assert.rejects(() => db.query('SELECT public.sf_public_snapshot()'), /permission denied/);
    await assert.rejects(() => call(db, 'sf_worker_credential_digest'), /permission denied/);
    await assert.rejects(
      () => db.query('SELECT * FROM public.worker_credentials'),
      /permission denied/,
    );
    await assert.rejects(() => db.query('SELECT * FROM public.v_live_feed'), /permission denied/);
  } finally {
    await db.exec('RESET ROLE');
  }
  const flags = await db.query(
    "SELECT bool_and(relrowsecurity) AS enabled FROM pg_class WHERE relname IN ('reports','persons','report_evidence','staff_members','job_queue','worker_credentials')",
  );
  assert(flags.rows[0].enabled);
});

test('the production service role can execute intake after extension relocation', async () => {
  await db.exec(
    "INSERT INTO public.worker_credentials(name,token_digest) VALUES ('queue_drain',repeat('a',64));",
  );
  await db.exec('SET ROLE service_role');
  try {
    const args = make('service role', { office: 'Service role office' });
    assert.equal((await call(db, 'sf_submit_report', args)).status, 'pending');
    assert.equal((await call(db, 'sf_health')).database, 'available');
    assert.equal(await call(db, 'sf_worker_credential_digest'), 'a'.repeat(64));
  } finally {
    await db.exec('RESET ROLE');
  }
});
test('human publication counts distinct identities and respects staff roles', async () => {
  const reviewer = randomUUID(),
    publisher = randomUUID();
  await db.query('INSERT INTO auth.users(id) VALUES($1),($2)', [reviewer, publisher]);
  await db.query(
    "INSERT INTO public.staff_members(user_id,role) VALUES($1,'reviewer'),($2,'publisher')",
    [reviewer, publisher],
  );
  const a = make('review A', { office: 'Publication office' }),
    b = make('review A', {
      office: 'Publication office',
      description: SAMPLE.description + ' Separate event.',
    });
  await call(db, 'sf_submit_report', a);
  await call(db, 'sf_submit_report', b);
  const {
    rows: [person],
  } = await db.query('SELECT person_id FROM public.reports WHERE id=$1', [a.p_id]);
  await db.query('UPDATE public.persons SET disclosure_threshold=2 WHERE id=$1', [
    person.person_id,
  ]);
  for (const id of [a.p_id, b.p_id])
    await call(db, 'sf_review_report', {
      p_actor: reviewer,
      p_id: id,
      p_decision: 'verified',
      p_reason: 'Evidence reviewed independently in this test.',
    });
  assert.equal(
    (
      await db.query('SELECT verified_report_count,disclosed_at FROM public.persons WHERE id=$1', [
        person.person_id,
      ])
    ).rows[0].verified_report_count,
    1,
  );
  await assert.rejects(
    () => call(db, 'sf_publish_case', { p_actor: publisher, p_id: person.person_id }),
    /publication_not_ready/,
  );
  assert.equal(await call(db, 'sf_public_case', { p_id: person.person_id }), null);
  const c = make('review B', { office: 'Publication office' });
  await call(db, 'sf_submit_report', c);
  await call(db, 'sf_review_report', {
    p_actor: reviewer,
    p_id: c.p_id,
    p_decision: 'verified',
    p_reason: 'Independent second identity reviewed.',
  });
  await assert.rejects(
    () => call(db, 'sf_publish_case', { p_actor: reviewer, p_id: person.person_id }),
    /not_authorized/,
  );
  await call(db, 'sf_publish_case', { p_actor: publisher, p_id: person.person_id });
  const publicCase = await call(db, 'sf_public_case', { p_id: person.person_id });
  assert.equal(publicCase.verified_report_count, 2);
  assert(!('description' in publicCase));
  const snapshot = await call(db, 'sf_public_snapshot');
  assert.equal(snapshot.published, 1);
  assert(!JSON.stringify(snapshot).includes('demanded a payment'));
  await call(db, 'sf_review_report', {
    p_actor: reviewer,
    p_id: c.p_id,
    p_decision: 'dismissed',
    p_reason: 'Independent review withdrew verification.',
  });
  assert.equal(await call(db, 'sf_public_case', { p_id: person.person_id }), null);
});
test('queue deduplication, per-chat ordering, leases, and atomic session commits', async () => {
  const owner = privateHash('queue', 'owner'),
    jobArgs = {
      p_key: 'telegram:123',
      p_kind: 'telegram_update',
      p_partition: owner,
      p_sealed: seal({ message: { chat: { id: 123 } } }),
    };
  const id = await call(db, 'sf_enqueue_job', jobArgs);
  assert.equal(await call(db, 'sf_enqueue_job', jobArgs), id);
  await call(db, 'sf_enqueue_job', { ...jobArgs, p_key: 'telegram:124' });
  let jobs = (await db.query("SELECT * FROM public.sf_claim_jobs('telegram_update',8)")).rows;
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].id, id);
  assert.equal(
    (await db.query("SELECT * FROM public.sf_claim_jobs('telegram_update',8)")).rows.length,
    0,
  );
  const args = {
    p_job: id,
    p_lease: jobs[0].lease_token,
    p_owner: owner,
    p_version: 0,
    p_step: 1,
    p_language: 'en',
    p_draft: seal({ office: 'Draft' }),
    p_replies: [{ sealed: seal({ chat_id: 123, text: 'Next prompt' }) }],
  };
  await assert.rejects(
    () => call(db, 'sf_commit_intake', { ...args, p_version: 9 }),
    /stale_session/,
  );
  assert.equal(
    (
      await db.query(
        'SELECT count(*)::int AS n FROM public.telegram_sessions WHERE tipper_hash=$1',
        [owner],
      )
    ).rows[0].n,
    0,
  );
  await call(db, 'sf_commit_intake', args);
  await assert.rejects(() => call(db, 'sf_commit_intake', args), /lease_lost/);
  assert.equal(
    (await db.query('SELECT version FROM public.telegram_sessions WHERE tipper_hash=$1', [owner]))
      .rows[0].version,
    1,
  );
  jobs = (await db.query("SELECT * FROM public.sf_claim_jobs('telegram_update',8)")).rows;
  assert.equal(jobs.length, 1);
  assert.equal(await call(db, 'sf_finish_job', { p_id: jobs[0].id, p_lease: randomUUID() }), false);
  assert(await call(db, 'sf_finish_job', { p_id: jobs[0].id, p_lease: jobs[0].lease_token }));
});
