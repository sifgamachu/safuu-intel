import { randomUUID, createHash } from 'node:crypto';
import { validateEvidence, MAX_EVIDENCE_BYTES } from './domain.mjs';
import { serviceClient } from './db-client.mjs';
export async function telegramEvidence(message, owner, jobId) {
  const source = message?.photo?.at(-1) || message?.document || message?.voice || message?.audio;
  if (!source) return null;
  const type = message.photo ? 'image/jpeg' : source.mime_type;
  const file = validateEvidence({ type, size: source.file_size });
  const client = serviceClient();
  const { data: reserved, error: lookupError } = await client
    .from('report_evidence')
    .select('id,uploaded_at,object_path')
    .eq('object_path', `${owner}/${jobId}`)
    .maybeSingle();
  if (lookupError) throw new Error('Evidence lookup failed.');
  if (reserved?.uploaded_at) return reserved.id;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const response = await fetch(`https://api.telegram.org/bot${token}/getFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: source.file_id }),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!result.ok || !result.result?.file_path) throw new Error('Attachment unavailable.');
  const download = await fetch(
    `https://api.telegram.org/file/bot${token}/${result.result.file_path}`,
    { signal: AbortSignal.timeout(15000) },
  );
  if (!download.ok || Number(download.headers.get('content-length')) > MAX_EVIDENCE_BYTES)
    throw new Error('Attachment unavailable.');
  const reader = download.body.getReader(),
    chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_EVIDENCE_BYTES) {
      await reader.cancel();
      throw new Error('Attachment too large.');
    }
    chunks.push(value);
  }
  const bytes = Buffer.concat(chunks);
  if (bytes.length !== file.size) throw new Error('Attachment size mismatch.');
  const id = reserved?.id || randomUUID(),
    path = `${owner}/${jobId}`;
  if (!reserved) {
    const { error } = await client
      .from('report_evidence')
      .insert({
        id,
        owner_hash: owner,
        object_path: path,
        kind: file.kind,
        byte_size: file.size,
        content_type: file.type,
      });
    if (error) throw new Error('Evidence reservation failed.');
  }
  const { error: uploadError } = await client.storage
    .from('evidence')
    .upload(path, bytes, { contentType: file.type, upsert: false });
  // A previous attempt may have uploaded and crashed before confirming metadata.
  if (uploadError) {
    const { data: info, error } = await client.storage.from('evidence').info(path);
    if (error || info.size !== file.size || info.contentType !== file.type)
      throw new Error('Evidence save failed.');
  }
  const { error } = await client
    .from('report_evidence')
    .update({
      uploaded_at: new Date().toISOString(),
      content_hash: createHash('sha256').update(bytes).digest('hex'),
    })
    .eq('id', id);
  if (error) throw new Error('Evidence confirmation failed.');
  return id;
}
