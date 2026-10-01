import { rpc } from '../../../lib/db-client.mjs';
import { readiness, antiSpamState } from '../../../lib/readiness.mjs';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const [health, capabilities, telegram] = await Promise.all([
      rpc('sf_health'),
      readiness.reporting(),
      readiness.telegram(),
    ]);
    const workerRecent =
      health.worker_last_seen && Date.now() - new Date(health.worker_last_seen).getTime() < 90000;
    return Response.json(
      {
        database: health.database,
        checked_at: health.checked_at,
        telegram,
        telegram_worker: workerRecent ? 'worker_active' : 'worker_unconfirmed',
        ...capabilities,
        anti_spam: antiSpamState(),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      {
        database: 'unavailable',
        telegram: 'unconfirmed',
        telegram_worker: 'worker_unconfirmed',
        review_team: 'unconfirmed',
        evidence: 'unconfirmed',
        anti_spam: antiSpamState(),
        checked_at: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
