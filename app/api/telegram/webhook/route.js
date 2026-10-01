import { after } from 'next/server';
import { readJson, noStore, fail } from '../../../../lib/http.mjs';
import { constantEqual, privateHash, seal } from '../../../../lib/privacy.mjs';
import { rpc } from '../../../../lib/db-client.mjs';
import { drain } from '../../../../lib/worker.mjs';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return noStore({ error: 'Webhook unavailable' }, 503);
  if (!constantEqual(request.headers.get('x-telegram-bot-api-secret-token'), expected))
    return noStore({ error: 'Unauthorized' }, 401);
  try {
    const update = await readJson(request, 60000),
      message = update.message || update.callback_query?.message;
    if (!Number.isSafeInteger(update.update_id) || update.update_id < 0)
      return noStore({ error: 'Invalid update' }, 422);
    // Unsupported events are intentionally acknowledged; groups are never an intake channel.
    if (!message || message.chat?.type !== 'private' || !Number.isSafeInteger(message.chat.id))
      return noStore({ ok: true });
    const owner = privateHash(String(message.chat.id), 'telegram-chat');
    // Telegram retries on a 503. A 200 is issued only after a durable enqueue.
    await rpc('sf_enqueue_job', {
      p_key: `telegram:${update.update_id}`,
      p_kind: 'telegram_update',
      p_partition: owner,
      p_sealed: seal(update),
    });
    after(async () => {
      try {
        await drain({ budgetMs: 15000 });
      } catch (error) {
        console.error('webhook_worker_deferred', { code: error.code || error.name });
      }
    });
    return noStore({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
