import { authClient, staffCookie, staff } from '../../../../lib/staff.mjs';
import { readJson, requireOrigin, noStore, fail } from '../../../../lib/http.mjs';
import { privateHash } from '../../../../lib/privacy.mjs';
import { rpc, serviceClient } from '../../../../lib/db-client.mjs';
import { IntakeError } from '../../../../lib/domain.mjs';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    return noStore({ staff: await staff(request) });
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request) {
  try {
    requireOrigin(request);
    const body = await readJson(request, 2000);
    if (
      typeof body.email !== 'string' ||
      body.email.length > 254 ||
      typeof body.password !== 'string' ||
      body.password.length > 300
    )
      throw new IntakeError('Enter your credentials.');
    if (
      !(await rpc('sf_take_rate', {
        p_action: 'staff_login',
        p_subject: privateHash(body.email.toLowerCase(), 'login'),
        p_limit: 8,
        p_window: 900,
      }))
    )
      throw new IntakeError('Wait before trying to sign in again.', 429);
    const client = authClient(),
      { data, error } = await client.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
    if (error) throw new IntakeError('Credentials could not be verified.', 401);
    const { data: member, error: lookup } = await serviceClient()
      .from('staff_members')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('active', true)
      .maybeSingle();
    if (lookup) throw new Error('Staff directory unavailable.');
    if (!member) throw new IntakeError('Review access has not been granted.', 403);
    const { data: factors, error: factorError } = await client.auth.mfa.listFactors();
    if (factorError) throw new IntakeError('Authenticator check unavailable.', 503);
    const factor = factors.totp?.find((f) => f.status === 'verified');
    if (!factor && process.env.STAFF_REQUIRE_MFA !== 'false')
      throw new IntakeError(
        'Enroll an authenticator with your administrator before signing in.',
        403,
      );
    let session = data.session;
    if (factor) {
      if (typeof body.code !== 'string' || !/^\d{6}$/.test(body.code))
        throw new IntakeError('Enter your six-digit authenticator code.');
      const { data: verified, error: mfaError } = await client.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: body.code,
      });
      if (mfaError) throw new IntakeError('Authenticator code could not be verified.', 401);
      session = { ...verified, expires_at: Math.floor(Date.now() / 1000) + verified.expires_in };
    }
    return noStore({ staff: { id: data.user.id, role: member.role } }, 200, {
      'Set-Cookie': staffCookie(request, session),
    });
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(request) {
  try {
    requireOrigin(request);
    return noStore({ ok: true }, 200, {
      'Set-Cookie': 'sf_staff=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
    });
  } catch (error) {
    return fail(error);
  }
}
