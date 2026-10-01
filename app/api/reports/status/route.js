import { noStore, requireOrigin, readJson, fail } from '../../../../lib/http.mjs';
import { privateHash } from '../../../../lib/privacy.mjs';
import { IntakeError, UUID } from '../../../../lib/domain.mjs';
import { rpc } from '../../../../lib/db-client.mjs';
export const runtime = 'nodejs';
export async function POST(request) {
  try {
    requireOrigin(request);
    const body = await readJson(request, 1000);
    if (
      !UUID.test(body.id) ||
      typeof body.secret !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(body.secret)
    )
      throw new IntakeError('Enter a valid private tracking code.');
    const receipt = await rpc('sf_receipt', {
      p_id: body.id,
      p_receipt_hash: privateHash(`${body.id}:${body.secret}`, 'receipt'),
    });
    return receipt
      ? noStore({ receipt })
      : noStore({ error: 'No receipt matches that tracking code.' }, 404);
  } catch (error) {
    return fail(error);
  }
}
