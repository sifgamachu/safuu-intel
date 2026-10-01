import { staff } from '../../../../lib/staff.mjs';
import { serviceClient } from '../../../../lib/db-client.mjs';
import { noStore, fail } from '../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    await staff(request);
    const { data, error } = await serviceClient()
      .from('persons')
      .select(
        'id,full_name,office,city,verified_report_count,disclosure_threshold,coordination_hold,publication_approved_at',
      )
      .gt('verified_report_count', 0)
      .is('publication_approved_at', null)
      .order('verified_report_count', { ascending: false })
      .limit(50);
    if (error) throw new Error('Case review unavailable.');
    return noStore({ cases: data });
  } catch (error) {
    return fail(error);
  }
}
