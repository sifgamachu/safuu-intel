import { rpc } from '../../../lib/db-client.mjs';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const health = await rpc('sf_health');
    const workerRecent =
      health.worker_last_seen && Date.now() - new Date(health.worker_last_seen).getTime() < 90000;
    return Response.json(
      {
        database: health.database,
        checked_at: health.checked_at,
        telegram: workerRecent ? 'worker_active' : 'worker_unconfirmed',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { database: 'unavailable', telegram: 'unconfirmed', checked_at: new Date().toISOString() },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
