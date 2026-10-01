import { staffAccess, staffCookie, clearStaffCookie } from '../../../../lib/staff.mjs';
import { readJson, requireOrigin, noStore, fail } from '../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    return noStore({ staff: await staffAccess.authenticate(request) });
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request) {
  try {
    requireOrigin(request);
    const { staff, session } = await staffAccess.login(await readJson(request, 2000));
    return noStore({ staff }, 200, { 'Set-Cookie': staffCookie(request, session) });
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(request) {
  try {
    requireOrigin(request);
    await staffAccess.logout(request);
    return noStore({ ok: true }, 200, { 'Set-Cookie': clearStaffCookie() });
  } catch (error) {
    return fail(error);
  }
}
