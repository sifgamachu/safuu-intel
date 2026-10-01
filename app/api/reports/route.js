import { visitor, noStore, readJson, requireOrigin, fail } from '../../../lib/http.mjs';
import {
  submissionArgs,
  confirmEvidence,
  submit,
  verifyChallenge,
} from '../../../lib/intake-service.mjs';
import { IntakeError } from '../../../lib/domain.mjs';
import { readiness, antiSpamState } from '../../../lib/readiness.mjs';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    if (antiSpamState() === 'configuration_incomplete')
      throw new Error('Anti-spam configuration incomplete.');
    const identity = visitor(request);
    const capabilities = await readiness.reporting();
    if (capabilities.review_team === 'unconfirmed')
      throw new Error('Reporting database unavailable.');
    return noStore(
      { ready: true, turnstile_site_key: process.env.TURNSTILE_SITE_KEY || null, ...capabilities },
      200,
      { 'Set-Cookie': identity.cookie },
    );
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request) {
  try {
    requireOrigin(request);
    const identity = visitor(request);
    if (identity.fresh)
      return noStore({ error: 'Reload the form to establish a private session.' }, 403);
    const body = await readJson(request, 30000);
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new IntakeError('Invalid report request.');
    const args = submissionArgs(body.request_id, identity.hash, body.receipt_secret, body.report);
    await verifyChallenge(body.challenge_token, request);
    await confirmEvidence(args.p_evidence, identity.hash);
    const receipt = await submit(args);
    return noStore({ receipt }, receipt.duplicate ? 200 : 201);
  } catch (error) {
    return fail(error, { save: true });
  }
}
