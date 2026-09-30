import { createClient } from '@supabase/supabase-js';
import { serviceClient } from './db-client.mjs';
import { unseal, seal } from './privacy.mjs';
import { IntakeError } from './domain.mjs';
export function authClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function staff(request) {
  let session;
  try {
    const cookie = request.headers
      .get('cookie')
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('sf_staff='))
      ?.slice(9);
    session = unseal(cookie);
  } catch {
    throw new IntakeError('Sign in to the review desk.', 401);
  }
  if (!Number.isFinite(session.expires_at) || session.expires_at < Date.now())
    throw new IntakeError('Your session expired. Sign in again.', 401);
  const { data, error } = await authClient().auth.getUser(session.access_token);
  if (error || !data.user) throw new IntakeError('Sign in again.', 401);
  const { data: member, error: lookup } = await serviceClient()
    .from('staff_members')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('active', true)
    .maybeSingle();
  if (lookup) throw new Error('Staff directory unavailable.');
  if (!member) throw new IntakeError('Review access has not been granted.', 403);
  return { id: data.user.id, role: member.role };
}
export function staffCookie(request, session) {
  return `sf_staff=${seal({ access_token: session.access_token, expires_at: session.expires_at * 1000 })}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
