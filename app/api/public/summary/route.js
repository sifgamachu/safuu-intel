import { publicSnapshot } from '../../../../lib/public-data';
import { readiness } from '../../../../lib/readiness.mjs';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const [snapshot, capabilities] = await Promise.all([publicSnapshot(), readiness.reporting()]);
    return Response.json(
      { ...snapshot, review_team: capabilities.review_team },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    );
  } catch {
    return Response.json(
      { error: 'Public statistics are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '5' } },
    );
  }
}
