import { staff } from '../../../../../lib/staff.mjs';
import { serviceClient } from '../../../../../lib/db-client.mjs';
import { UUID, IntakeError } from '../../../../../lib/domain.mjs';
import { noStore, fail } from '../../../../../lib/http.mjs';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
  try {
    const actor = await staff(request),
      { id } = await params;
    if (!UUID.test(id)) throw new IntakeError('Invalid evidence.');
    const client = serviceClient(),
      { data, error } = await client
        .from('report_evidence')
        .select('object_path,report_id')
        .eq('id', id)
        .maybeSingle();
    if (error) throw new Error('Evidence unavailable.');
    if (!data?.report_id) throw new IntakeError('Evidence not found.', 404);
    const { error: auditError } = await client
      .from('audit_log')
      .insert({
        actor_email: actor.id,
        action: 'read_evidence',
        target_type: 'report',
        target_id: data.report_id,
        metadata: { evidence_id: id },
      });
    if (auditError) throw new Error('Audit unavailable.');
    const { data: download, error: signing } = await client.storage
      .from('evidence')
      .createSignedUrl(data.object_path, 60, { download: true });
    if (signing) throw new Error('Evidence unavailable.');
    return noStore({ download_url: download.signedUrl, expires_in: 60 });
  } catch (error) {
    return fail(error);
  }
}
