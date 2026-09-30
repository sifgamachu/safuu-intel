import { constantEqual } from '../../../../lib/privacy.mjs';
import { drain } from '../../../../lib/worker.mjs';
import { noStore } from '../../../../lib/http.mjs';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request) {
  const key = process.env.CRON_SECRET;
  if (!key || !constantEqual(request.headers.get('authorization'), `Bearer ${key}`))
    return noStore({ error: 'Unauthorized' }, 401);
  try {
    return noStore(await drain({ budgetMs: 20000 }));
  } catch {
    return noStore({ error: 'Worker unavailable' }, 503);
  }
}
