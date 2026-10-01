import { staff } from '../../../../../lib/staff.mjs';
import { rpc } from '../../../../../lib/db-client.mjs';
import { UUID, IntakeError } from '../../../../../lib/domain.mjs';
import { noStore, requireOrigin, fail } from '../../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function POST(request, { params }) {
  try {
    requireOrigin(request);
    const actor = await staff(request),
      { id } = await params;
    if (!UUID.test(id)) throw new IntakeError('Invalid case.');
    if (!['publisher', 'admin'].includes(actor.role))
      throw new IntakeError('Publication access is required.', 403);
    await rpc('sf_publish_case', { p_actor: actor.id, p_id: id });
    return noStore({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
