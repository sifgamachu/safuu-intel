import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createStaffAccess, staffCookie, setupCookie } from '../lib/staff.mjs';
process.env.TIPPER_HASH_SALT = 'test-only-staff-cookie-secret-never-use-in-production';
const credentials = { email: 'staff@example.invalid', password: 'synthetic-password' };
const request = (cookie = '') =>
  new Request('https://safuu.net/api/admin/session', { headers: { cookie } });
const cookieValue = (value) => value.split(';')[0];
function fixture() {
  const id = randomUUID(),
    tokens = new Map();
  const state = {
    active: true,
    allowed: true,
    factors: [],
    verifyCalls: 0,
    enrollCalls: 0,
    logoutCalls: 0,
  };
  const token = (aal) => {
    const value = `header.${Buffer.from(JSON.stringify({ sub: id, aal })).toString('base64url')}.${randomUUID()}`;
    tokens.set(value, true);
    return value;
  };
  const session = (aal) => ({
    access_token: token(aal),
    refresh_token: 'local-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  const access = createStaffAccess({
    invoke: async () => state.allowed,
    database: () => ({
      from: () => ({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle: async () => ({
          data: state.active ? { role: 'reviewer' } : null,
          error: null,
        }),
      }),
    }),
    auth: () => ({
      auth: {
        signInWithPassword: async (body) =>
          body.password === credentials.password
            ? { data: { user: { id }, session: session('aal1') }, error: null }
            : { data: null, error: { message: 'invalid' } },
        getUser: async (value) => ({
          data: { user: tokens.has(value) ? { id } : null },
          error: tokens.has(value) ? null : { message: 'invalid' },
        }),
        setSession: async () => ({ error: null }),
        admin: {
          signOut: async () => {
            state.logoutCalls++;
            return { error: null };
          },
        },
        mfa: {
          listFactors: async () => ({
            data: {
              all: [...state.factors],
              totp: state.factors.filter((f) => f.status === 'verified'),
            },
            error: null,
          }),
          enroll: async () => {
            state.enrollCalls++;
            const factor = {
              id: randomUUID(),
              status: 'unverified',
              friendly_name: 'Safuu review desk',
            };
            state.factors.push(factor);
            return {
              data: {
                id: factor.id,
                totp: {
                  secret: 'LOCALTESTSETUPKEY',
                  qr_code:
                    'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" /></svg>',
                },
              },
              error: null,
            };
          },
          unenroll: async ({ factorId }) => {
            state.factors = state.factors.filter((f) => f.id !== factorId);
            return { error: null };
          },
          challengeAndVerify: async ({ factorId, code }) => {
            state.verifyCalls++;
            const factor = state.factors.find((f) => f.id === factorId);
            if (!factor || code !== '123456') return { data: null, error: { message: 'bad code' } };
            factor.status = 'verified';
            return { data: session('aal2'), error: null };
          },
        },
      },
    }),
    env: () => ({ STAFF_REQUIRE_MFA: 'true' }),
  });
  return { id, state, session, access };
}
const status = (value) => (error) => error.status === value;
test('staff enrollment grants no review access until an authenticator code is verified', async () => {
  const f = fixture();
  await assert.rejects(() => f.access.login(credentials), status(403));
  const started = await f.access.startEnrollment(credentials);
  assert(started.setup.qr_code.includes('%23000'));
  const setup = cookieValue(setupCookie(request(), started.session));
  await assert.rejects(() => f.access.authenticate(request(setup)), status(401));
  await assert.rejects(
    () => f.access.authenticate(request(setup.replace('sf_staff_setup=', 'sf_staff='))),
    status(401),
  );
  await assert.rejects(
    () => f.access.finishEnrollment(request(setup), { code: '000000' }),
    status(401),
  );
  const verified = await f.access.finishEnrollment(request(setup), { code: '123456' });
  const review = staffCookie(request(), verified.session);
  assert(review.includes('HttpOnly; SameSite=Strict'));
  assert(review.includes('Secure'));
  assert.deepEqual(await f.access.authenticate(request(cookieValue(review))), {
    id: f.id,
    role: 'reviewer',
  });
  await f.access.logout(request(cookieValue(review)));
  assert.equal(f.state.logoutCalls, 1);
});
test('role changes, provider rejection, lower-assurance tokens, and expired setup fail closed', async () => {
  const f = fixture();
  f.state.active = false;
  await assert.rejects(() => f.access.startEnrollment(credentials), status(403));
  assert.equal(f.state.enrollCalls, 0);
  f.state.active = true;
  const started = await f.access.startEnrollment(credentials);
  const setup = cookieValue(setupCookie(request(), started.session));
  f.state.active = false;
  await assert.rejects(
    () => f.access.finishEnrollment(request(setup), { code: '123456' }),
    status(403),
  );
  assert.equal(f.state.verifyCalls, 0);
  f.state.active = true;
  const lower = cookieValue(staffCookie(request(), f.session('aal1')));
  await assert.rejects(() => f.access.authenticate(request(lower)), status(403));
  const forged = cookieValue(
    staffCookie(request(), {
      access_token: 'header.invalid.signature',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  await assert.rejects(() => f.access.authenticate(request(forged)), status(401));
  const expired = cookieValue(
    setupCookie(request(), { ...started.session, expires_at: Date.now() - 1 }),
  );
  await assert.rejects(
    () => f.access.finishEnrollment(request(expired), { code: '123456' }),
    status(401),
  );
  f.state.allowed = false;
  await assert.rejects(() => f.access.login(credentials), status(429));
});
test('setup can be cancelled or restarted without removing a verified authenticator', async () => {
  const f = fixture();
  const first = await f.access.startEnrollment(credentials);
  const second = await f.access.startEnrollment(credentials);
  assert.notEqual(first.session.factor_id, second.session.factor_id);
  assert.equal(f.state.factors.length, 1);
  const setup = cookieValue(setupCookie(request(), second.session));
  await f.access.finishEnrollment(request(setup), { code: '123456' });
  await f.access.cancelEnrollment(request(setup));
  assert.equal(f.state.factors.length, 1);
  assert.equal(f.state.factors[0].status, 'verified');
  await assert.rejects(() => f.access.startEnrollment(credentials), status(409));
  const login = await f.access.login({ ...credentials, code: '123456' });
  assert.equal(login.staff.id, f.id);
  const other = fixture();
  const pending = await other.access.startEnrollment(credentials);
  await other.access.cancelEnrollment(
    request(cookieValue(setupCookie(request(), pending.session))),
  );
  assert.equal(other.state.factors.length, 0);
});
