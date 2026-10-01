import { randomUUID } from 'node:crypto';
import { visitor, requireOrigin, readJson, fail, noStore } from '../../../../lib/http.mjs';
import { IntakeError, validateEvidence } from '../../../../lib/domain.mjs';
import { rpc, serviceClient } from '../../../../lib/db-client.mjs';
export const runtime = 'nodejs';
export async function POST(request) {
  try {
    requireOrigin(request);
    const owner = visitor(request);
    if (owner.fresh) throw new IntakeError('Reload the report form.', 403);
    const file = validateEvidence(await readJson(request, 1000));
    if (
      !(await rpc('sf_take_rate', {
        p_action: 'upload',
        p_subject: owner.hash,
        p_limit: 20,
        p_window: 86400,
      }))
    ) {
      const error = new Error('rate_limited');
      error.code = 'rate_limited';
      throw error;
    }
    const id = randomUUID(),
      object_path = `${owner.hash}/${id}`;
    const client = serviceClient();
    const { error } = await client
      .from('report_evidence')
      .insert({
        id,
        owner_hash: owner.hash,
        object_path,
        kind: file.kind,
        byte_size: file.size,
        content_type: file.type,
      });
    if (error) throw new Error('Evidence reservation failed.');
    const { data, error: signing } = await client.storage
      .from('evidence')
      .createSignedUploadUrl(object_path, { upsert: false });
    if (signing) throw new Error('Evidence upload unavailable.');
    return noStore({ id, upload_url: data.signedUrl });
  } catch (error) {
    return fail(error);
  }
}
