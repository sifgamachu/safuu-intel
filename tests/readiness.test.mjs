import test from 'node:test';
import assert from 'node:assert/strict';
import { createReadiness, antiSpamState } from '../lib/readiness.mjs';
import { verifyChallenge } from '../lib/intake-service.mjs';

const POLICY = {
  public: false,
  file_size_limit: 10485760,
  allowed_mime_types: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp4',
  ],
};
function database({ staff = 0, bucket = POLICY, error = null } = {}) {
  return {
    from: () => ({ select: () => ({ eq: async () => ({ count: staff, error }) }) }),
    storage: { getBucket: async () => ({ data: bucket, error }) },
  };
}
const ENV = {
  TELEGRAM_BOT_TOKEN: 'local-test-token',
  TELEGRAM_WEBHOOK_SECRET: 'local-test-secret',
};
function telegram({
  url = 'https://www.safuu.net/api/telegram/webhook',
  username = 'SafuuIntelBot',
  error = false,
  allowed = ['message', 'callback_query'],
  lastError,
} = {}) {
  return async (endpoint) =>
    Response.json({
      ok: !error,
      result: endpoint.endsWith('getMe')
        ? { is_bot: true, username }
        : { url, allowed_updates: allowed, last_error_date: lastError },
    });
}
test('readiness distinguishes a healthy private bucket from staff setup and storage gaps', async () => {
  assert.deepEqual(await createReadiness({ client: () => database() }).reporting(), {
    review_team: 'not_configured',
    evidence: 'private_storage_verified',
  });
  assert.equal(
    (await createReadiness({ client: () => database({ staff: 1 }) }).reporting()).review_team,
    'configured',
  );
  for (const bucket of [
    { ...POLICY, public: true },
    { ...POLICY, file_size_limit: 20000000 },
    { ...POLICY, allowed_mime_types: ['text/html'] },
  ])
    assert.equal(
      (await createReadiness({ client: () => database({ bucket }) }).reporting()).evidence,
      'configuration_incomplete',
    );
  assert.deepEqual(
    await createReadiness({
      client: () => database({ error: { message: 'Unavailable' } }),
    }).reporting(),
    { review_team: 'unconfirmed', evidence: 'unconfirmed' },
  );
});
test('Telegram checks validate bot identity, destination, supported updates, and provider errors', async () => {
  const check = async (options, vars = ENV) =>
    createReadiness({
      client: () => database(),
      env: () => vars,
      fetcher: telegram(options),
    }).telegram();
  assert.equal(await check({}), 'configuration_verified');
  assert.equal(
    await check({ url: 'https://safuu-intel.vercel.app/api/telegram/webhook' }),
    'configuration_verified',
  );
  assert.equal(
    await check(
      { url: 'https://staging.example/api/telegram/webhook' },
      { ...ENV, TELEGRAM_WEBHOOK_URL: 'https://staging.example/api/telegram/webhook' },
    ),
    'configuration_verified',
  );
  assert.equal(
    await check(
      {},
      { ...ENV, TELEGRAM_WEBHOOK_URL: 'https://staging.example/api/telegram/webhook' },
    ),
    'configuration_incomplete',
  );
  assert.equal(await check({}, {}), 'not_configured');
  assert.equal(await check({ url: 'https://old.example/api/webhook' }), 'configuration_incomplete');
  assert.equal(await check({ username: 'WrongBot' }), 'configuration_incomplete');
  assert.equal(await check({ allowed: ['message'] }), 'configuration_incomplete');
  assert.equal(await check({ error: true }), 'unconfirmed');
  assert.equal(await check({ lastError: Math.floor(Date.now() / 1000) }), 'provider_error');
});
test('concurrent health checks share reads; cache expiry discovers configuration changes', async () => {
  let reads = 0,
    clock = 0,
    staff = 0;
  const check = createReadiness({
    now: () => clock,
    client: () => {
      reads++;
      return database({ staff });
    },
  });
  const values = await Promise.all(Array.from({ length: 50 }, () => check.reporting()));
  assert(values.every((v) => v.review_team === 'not_configured'));
  assert.equal(reads, 1);
  staff = 1;
  clock = 29999;
  assert.equal((await check.reporting()).review_team, 'not_configured');
  clock = 30000;
  assert.equal((await check.reporting()).review_team, 'configured');
  assert.equal(reads, 2);
});
test('partially configured anti-spam cannot be bypassed with a direct report POST', async () => {
  assert.equal(antiSpamState({}), 'rate_limits_only');
  assert.equal(
    antiSpamState({ TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret' }),
    'challenge_enabled',
  );
  process.env.TURNSTILE_SITE_KEY = 'local-test-site';
  delete process.env.TURNSTILE_SECRET_KEY;
  try {
    await assert.rejects(
      () => verifyChallenge(null, new Request('https://safuu.net/api/reports')),
      (error) => error.status === 503,
    );
  } finally {
    delete process.env.TURNSTILE_SITE_KEY;
  }
});
