import { staff } from '../../../../../lib/staff.mjs';
import { rpc } from '../../../../../lib/db-client.mjs';
import { UUID, IntakeError } from '../../../../../lib/domain.mjs';
import { noStore, readJson, requireOrigin, fail } from '../../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function POST(request, { params }) {
  try {
    requireOrigin(request);
    const actor = await staff(request),
      { id } = await params,
      // 2,000 characters can exceed 4 KB in Ethiopic or escaped JSON text.
      body = await readJson(request, 16000);
    if (
      !UUID.test(id) ||
      !['verified', 'dismissed'].includes(body.decision) ||
      typeof body.reason !== 'string' ||
      body.reason.trim().length < 10 ||
      body.reason.length > 2000
    )
      throw new IntakeError('Choose a decision and explain it in 10–2,000 characters.');
    await rpc('sf_review_report', {
      p_actor: actor.id,
      p_id: id,
      p_decision: body.decision,
      p_reason: body.reason.trim(),
    });
    return noStore({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
