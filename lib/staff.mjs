import { createClient } from '@supabase/supabase-js';
import { serviceClient, rpc } from './db-client.mjs';
import { unseal, seal, privateHash } from './privacy.mjs';
import { IntakeError } from './domain.mjs';
export function authClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init = {}) =>
        fetch(input, {
          ...init,
          signal: init.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
            : AbortSignal.timeout(15000),
        }),
    },
  });
}
function readCookie(request, name, scope, now) {
  let session;
  try {
    const cookie = request.headers
      .get('cookie')
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    session = unseal(cookie);
  } catch {
    throw new IntakeError('Sign in to the review desk.', 401);
  }
  if (
    session.scope !== scope ||
    !Number.isFinite(session.expires_at) ||
    session.expires_at <= now()
  )
    throw new IntakeError('Your session expired. Sign in again.', 401);
  return session;
}

// Only decode after Auth has verified the token or returned a successful login.
// Unverified claims never grant review access.
function assurance(token, userId, required) {
  let claims;
  try {
    claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    throw new IntakeError('Sign in again.', 401);
  }
  if (claims.sub !== userId || (required && claims.aal !== 'aal2'))
    throw new IntakeError('Sign in with your authenticator to access the review desk.', 403);
}

export function createStaffAccess({
  auth = authClient,
  database = serviceClient,
  invoke = rpc,
  env = () => process.env,
  now = Date.now,
} = {}) {
  async function member(userId) {
    const { data, error } = await database()
      .from('staff_members')
      .select('role')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();
    if (error) throw new Error('Staff directory unavailable.');
    if (!data) throw new IntakeError('Review access has not been granted.', 403);
    return { id: userId, role: data.role };
  }
  async function limit(subject, action = 'staff_login') {
    if (
      !(await invoke('sf_take_rate', {
        p_action: action,
        p_subject: privateHash(subject, action),
        p_limit: 8,
        p_window: 900,
      }))
    )
      throw new IntakeError('Wait before trying to sign in again.', 429);
  }
  async function password(body) {
    if (
      !body ||
      typeof body.email !== 'string' ||
      !body.email.trim() ||
      body.email.length > 254 ||
      typeof body.password !== 'string' ||
      !body.password ||
      body.password.length > 300
    )
      throw new IntakeError('Enter your credentials.');
    await limit(body.email.trim().toLowerCase());
    const client = auth();
    const { data, error } = await client.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });
    if (error || !data?.user || !data.session)
      throw new IntakeError('Credentials could not be verified.', 401);
    const staff = await member(data.user.id);
    return { client, staff, session: data.session };
  }
  async function factors(client) {
    const { data, error } = await client.auth.mfa.listFactors();
    if (error || !data) throw new IntakeError('Authenticator check unavailable.', 503);
    return data;
  }
  async function verify(client, factorId, code, userId) {
    if (typeof code !== 'string' || !/^\d{6}$/.test(code))
      throw new IntakeError('Enter your six-digit authenticator code.');
    const { data, error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
    if (error || !data?.access_token)
      throw new IntakeError('Authenticator code could not be verified.', 401);
    assurance(data.access_token, userId, true);
    return { ...data, expires_at: Math.floor(now() / 1000) + data.expires_in };
  }
  async function login(body) {
    const { client, staff, session } = await password(body);
    const factor = (await factors(client)).totp?.find((f) => f.status === 'verified');
    if (!factor && env().STAFF_REQUIRE_MFA !== 'false')
      throw new IntakeError('Set up your authenticator before signing in.', 403);
    const verified = factor ? await verify(client, factor.id, body.code, staff.id) : session;
    assurance(verified.access_token, staff.id, env().STAFF_REQUIRE_MFA !== 'false');
    return { staff, session: verified };
  }
  async function authenticate(request) {
    const session = readCookie(request, 'sf_staff', 'review', now);
    const { data, error } = await auth().auth.getUser(session.access_token);
    if (error || !data?.user) throw new IntakeError('Sign in again.', 401);
    assurance(session.access_token, data.user.id, env().STAFF_REQUIRE_MFA !== 'false');
    return member(data.user.id);
  }
  async function startEnrollment(body) {
    const { client, staff, session } = await password(body);
    const list = await factors(client);
    if (list.totp?.some((f) => f.status === 'verified'))
      throw new IntakeError('Your authenticator is already set up. Sign in with its code.', 409);
    for (const factor of list.all || []) {
      if (factor.status === 'unverified' && factor.friendly_name === 'Safuu review desk') {
        const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw new IntakeError('Authenticator setup unavailable. Please retry.', 503);
      }
    }
    const { data, error } = await client.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Safuu review desk',
      issuer: 'Safuu',
    });
    if (error || !data?.totp?.secret || !data.totp.qr_code)
      throw new IntakeError('Authenticator setup unavailable. Please retry.', 503);
    return {
      setup: {
        qr_code: data.totp.qr_code.startsWith('data:image/svg+xml;utf-8,')
          ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.totp.qr_code.slice('data:image/svg+xml;utf-8,'.length))}`
          : data.totp.qr_code,
        secret: data.totp.secret,
      },
      session: {
        scope: 'authenticator',
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        factor_id: data.id,
        expires_at: Math.min(session.expires_at * 1000, now() + 600000),
      },
      staff,
    };
  }
  async function setupSession(request) {
    const session = readCookie(request, 'sf_staff_setup', 'authenticator', now);
    const client = auth();
    const { data, error } = await client.auth.getUser(session.access_token);
    if (error || !data?.user)
      throw new IntakeError('Authenticator setup expired. Start again.', 401);
    const staff = await member(data.user.id);
    const { error: restore } = await client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (restore) throw new IntakeError('Authenticator setup expired. Start again.', 401);
    return { client, staff, session };
  }
  async function finishEnrollment(request, body) {
    const { client, staff, session } = await setupSession(request);
    await limit(staff.id, 'staff_enrollment');
    const verified = await verify(client, session.factor_id, body.code, staff.id);
    return { staff, session: verified };
  }
  async function cancelEnrollment(request) {
    const { client, session } = await setupSession(request);
    const factor = (await factors(client)).all?.find((f) => f.id === session.factor_id);
    if (factor?.status === 'unverified') {
      const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
      if (error)
        throw new IntakeError('Authenticator cancellation unavailable. Please retry.', 503);
    }
    // A lost verification response must never turn cancellation into MFA removal.
    await client.auth.admin.signOut(session.access_token, 'local');
  }
  async function logout(request) {
    let session;
    try {
      session = readCookie(request, 'sf_staff', 'review', now);
    } catch {
      return;
    }
    const { error } = await auth().auth.admin.signOut(session.access_token, 'local');
    if (error && ![401, 403, 404].includes(error.status))
      throw new IntakeError('Sign-out could not be confirmed. Please retry.', 503);
  }
  return { authenticate, login, startEnrollment, finishEnrollment, cancelEnrollment, logout };
}

export const staffAccess = createStaffAccess();
export const staff = (request) => staffAccess.authenticate(request);
export function staffCookie(request, session) {
  const expires = session.expires_at * 1000;
  if (!Number.isFinite(expires) || !session.access_token) throw new Error('Invalid staff session.');
  const age = Math.max(0, Math.min(3600, Math.floor((expires - Date.now()) / 1000)));
  return `sf_staff=${seal({ scope: 'review', access_token: session.access_token, expires_at: expires })}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export function setupCookie(request, session) {
  return `sf_staff_setup=${seal(session)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=600${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export function clearStaffCookie(name = 'sf_staff') {
  return `${name}=; HttpOnly; SameSite=Strict; Path=${name === 'sf_staff_setup' ? '/api/admin' : '/'}; Max-Age=0`;
}
