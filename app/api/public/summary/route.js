import { publicSnapshot } from '../../../../lib/public-data';
export const runtime = 'nodejs';
export async function GET() {
  try {
    return Response.json(await publicSnapshot(), {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json(
      { error: 'Public statistics are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '5' } },
    );
  }
}
