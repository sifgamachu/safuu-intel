import { staff } from '../../../../lib/staff.mjs';
import { serviceClient } from '../../../../lib/db-client.mjs';
import { unseal } from '../../../../lib/privacy.mjs';
import { noStore, fail } from '../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    await staff(request);
    const { data, error } = await serviceClient()
      .from('reports')
      .select('id,person_id,status,sealed_payload,created_at')
      .eq('status', 'pending')
      .order('created_at')
      .limit(25);
    if (error) throw new Error('Review queue unavailable.');
    return noStore({
      reports: data.map((r) => ({
        id: r.id,
        person_id: r.person_id,
        status: r.status,
        created_at: r.created_at,
        report: r.sealed_payload ? unseal(r.sealed_payload) : null,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}
