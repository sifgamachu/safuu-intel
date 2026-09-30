import { randomUUID } from 'node:crypto';
import { IntakeError } from './domain.mjs';
import { visitorId, signVisitor, privateHash } from './privacy.mjs';
export function noStore(body, status = 200, extra = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
  });
}
export async function readJson(request, maxBytes = 20000) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new IntakeError('Send JSON content.', 415);
  if (Number(request.headers.get('content-length')) > maxBytes)
    throw new IntakeError('Request is too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new IntakeError('Request body is required.');
  let size = 0,
    chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new IntakeError('Request is too large.', 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new IntakeError('Invalid JSON.');
  }
}
export function requireOrigin(request) {
  // Next may construct an internal localhost URL behind its HTTP proxy. Compare
  // the browser's Origin with Host, which browsers cannot override, rather than
  // trusting arbitrary X-Forwarded-Host values. JSON writes also require CORS.
  const origin = request.headers.get('origin'),
    host = request.headers.get('host') || new URL(request.url).host;
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {}
  if (
    !parsed ||
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.origin !== origin ||
    parsed.host !== host ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new IntakeError('Open this form on Safuu to submit.', 403);
}
export function visitor(request) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('sf_visitor='))
    ?.slice(11);
  const existing = visitorId(cookie),
    id = existing || randomUUID();
  return {
    hash: privateHash(id, 'web-visitor'),
    fresh: !existing,
    cookie: `sf_visitor=${signVisitor(id)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`,
  };
}
export function fail(error) {
  if (error instanceof IntakeError) return noStore({ error: error.message }, error.status);
  if (error.code === 'rate_limited')
    return noStore(
      { error: 'Please wait before submitting another request. Your draft is still here.' },
      429,
      { 'Retry-After': '60' },
    );
  if (error.code === 'already_received')
    return noStore(
      { error: 'This report has already been received. Use your original tracking code.' },
      409,
    );
  if (error.code === 'request_conflict')
    return noStore(
      { error: 'This tracking code belongs to a different submission. Start a new report.' },
      409,
    );
  if (error.code === 'not_authorized')
    return noStore({ error: 'Staff authorization is required.' }, 403);
  if (error.code === 'publication_not_ready')
    return noStore({ error: 'This case has not met the publication requirements.' }, 409);
  if (error.code === 'evidence_missing')
    return noStore(
      { error: 'Evidence is not ready. Please check the attachments and retry.' },
      422,
    );
  console.error('safuu_request_failed', { code: error.code || error.name || 'unknown' });
  return noStore(
    {
      error:
        'We could not confirm a save. Keep this page open and retry; you will not create another copy.',
    },
    503,
    { 'Retry-After': '5' },
  );
}
