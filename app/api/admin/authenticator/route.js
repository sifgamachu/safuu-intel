import { staffAccess, staffCookie, setupCookie, clearStaffCookie } from '../../../../lib/staff.mjs';
import { readJson, requireOrigin, noStore, fail } from '../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function POST(request) {
  try {
    requireOrigin(request);
    const { setup, session } = await staffAccess.startEnrollment(await readJson(request, 2000));
    return noStore({ setup }, 200, { 'Set-Cookie': setupCookie(request, session) });
  } catch (error) {
    return fail(error);
  }
}
export async function PUT(request) {
  try {
    requireOrigin(request);
    const { staff, session } = await staffAccess.finishEnrollment(
      request,
      await readJson(request, 1000),
    );
    const response = noStore({ staff }, 200, { 'Set-Cookie': staffCookie(request, session) });
    response.headers.append('Set-Cookie', clearStaffCookie('sf_staff_setup'));
    return response;
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(request) {
  try {
    requireOrigin(request);
    await staffAccess.cancelEnrollment(request);
    return noStore({ ok: true }, 200, { 'Set-Cookie': clearStaffCookie('sf_staff_setup') });
  } catch (error) {
    return fail(error);
  }
}
