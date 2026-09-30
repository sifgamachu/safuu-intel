import { publicCase } from '../../../../../lib/public-data';
import { UUID } from '../../../../../lib/domain.mjs';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: 'Case not found.' }, { status: 404 });
  try {
    const record = await publicCase(id);
    return Response.json(record || { error: 'Case not found.' }, {
      status: record ? 200 : 404,
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return Response.json(
      { error: 'Case data is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
