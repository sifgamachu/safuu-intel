import { IntakeError, UUID, validateReport, canonicalReport } from './domain.mjs';
import { seal, privateHash } from './privacy.mjs';
import { rpc, serviceClient } from './db-client.mjs';
import { antiSpamState } from './readiness.mjs';

export function submissionArgs(id, owner, secret, input, channel = 'web') {
  if (
    typeof id !== 'string' ||
    !UUID.test(id) ||
    typeof secret !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(secret)
  )
    throw new IntakeError('Invalid tracking code.');
  id = id.toLowerCase();
  secret = secret.toLowerCase();
  const draft = validateReport(input);
  const identity = [
    draft.full_name.toLocaleLowerCase(),
    draft.office.toLocaleLowerCase(),
    draft.city.toLocaleLowerCase(),
  ];
  if (draft.full_name.toLocaleLowerCase() === 'unknown') identity.push(id);
  return {
    p_id: id,
    p_owner: owner,
    p_receipt_hash: privateHash(`${id}:${secret}`, 'receipt'),
    p_fingerprint: privateHash(`${owner}:${canonicalReport(draft)}`, 'duplicate'),
    p_case_key: privateHash(JSON.stringify(identity), 'case'),
    p_case: {
      full_name: draft.full_name,
      office: draft.office,
      position_title: draft.position_title,
      city: draft.city,
      region: draft.region,
      language: draft.language,
      corruption_type: draft.corruption_type,
    },
    p_sealed: seal(draft),
    p_channel: channel,
    p_evidence: draft.evidence_ids,
  };
}

// Files upload directly to a private bucket; this request only reads metadata.
export async function confirmEvidence(ids, owner, client = serviceClient()) {
  if (!ids.length) return;
  const { data, error } = await client
    .from('report_evidence')
    .select('id,object_path,byte_size,content_type,report_id,uploaded_at')
    .in('id', ids)
    .eq('owner_hash', owner);
  if (error) throw new Error('Evidence database unavailable.');
  if (data.length !== ids.length)
    throw new IntakeError('An attachment is unavailable. Upload it again.');
  await Promise.all(
    data.map(async (file) => {
      if (file.report_id || file.uploaded_at) return; // RPC checks ownership and prevents re-attachment.
      const { data: info, error: missing } = await client.storage
        .from('evidence')
        .info(file.object_path);
      if (missing || info?.size !== file.byte_size || info?.contentType !== file.content_type)
        throw new IntakeError('An attachment has not finished uploading. Please retry.');
      const { error: updateError } = await client
        .from('report_evidence')
        .update({ uploaded_at: new Date().toISOString() })
        .eq('id', file.id)
        .eq('owner_hash', owner)
        .is('report_id', null);
      if (updateError) throw new Error('Evidence confirmation unavailable.');
    }),
  );
}

export async function verifyChallenge(token, request) {
  if (antiSpamState() === 'configuration_incomplete')
    throw new IntakeError('Reporting is temporarily unavailable.', 503);
  if (!process.env.TURNSTILE_SECRET_KEY) return;
  if (typeof token !== 'string' || token.length > 2048)
    throw new IntakeError('Complete the anti-spam check.', 403);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }),
    signal: AbortSignal.timeout(8000),
  });
  const result = await response.json();
  const expectedHost =
    process.env.TURNSTILE_HOSTNAME ||
    new URL(request.headers.get('origin') || request.url).hostname;
  if (!result.success || result.hostname !== expectedHost || result.action !== 'report')
    throw new IntakeError('Complete the anti-spam check again.', 403);
}

export async function submit(args, client = serviceClient()) {
  return rpc('sf_submit_report', args, client);
}
