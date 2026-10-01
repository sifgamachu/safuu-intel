// Temporary production transport verification. Disable after the owned fixtures
// are removed. This allowlist must never include a real report or evidence ID.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
const ENABLED = false;
const OWNER = 'ac07521c4e143df4614a4c9a94ccc26ec4463d92ef2ba3b75213499a02a8de1f';
const IDS = [
  'f738a2ea-083f-45d6-8f99-07f06305a42c',
  '3dfe3c59-61f7-46c2-a29a-7b81856d2de2',
  'f09fb4cc-c060-4c63-ada1-1bfd0073f2fa',
  '19df99af-d52a-436d-af9c-9d52b2ec3a18',
];
Deno.serve(async (request) => {
  const response = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  if (!ENABLED || request.method !== 'POST') return response({ error: 'Disabled' }, 404);
  try {
    const client = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const header = request.headers.get('authorization') || '';
    if (!/^Bearer sfq_[a-f0-9]{64}$/.test(header)) return response({ error: 'Unauthorized' }, 401);
    const digest = Array.from(
      new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(header.slice(7))),
      ),
    )
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('');
    const { data: expected, error: authError } = await client.rpc('sf_worker_credential_digest');
    if (authError || digest !== expected) return response({ error: 'Unauthorized' }, 401);
    const { action } = await request.json();
    if (!['check', 'cleanup'].includes(action))
      return response({ error: 'Invalid operation' }, 422);
    const { data: files, error } = await client
      .from('report_evidence')
      .select('id,object_path,owner_hash,byte_size,content_type,report_id')
      .in('id', IDS);
    if (
      error ||
      files.length !== IDS.length ||
      files.some(
        (f) => f.owner_hash !== OWNER || f.report_id || f.object_path !== `${OWNER}/${f.id}`,
      )
    )
      return response({ error: 'Fixture ownership check failed' }, 409);
    if (action === 'cleanup') {
      const { error: removal } = await client.storage
        .from('evidence')
        .remove(files.map((f) => f.object_path));
      if (removal) return response({ error: 'Fixture cleanup failed' }, 503);
      const { error: release } = await client
        .from('report_evidence')
        .delete()
        .in('id', IDS)
        .eq('owner_hash', OWNER)
        .is('report_id', null);
      if (release) return response({ error: 'Reservation cleanup failed' }, 503);
      return response({
        removed_synthetic_files: files.length,
        removed_synthetic_reservations: files.length,
      });
    }
    const { data: bucket, error: bucketError } = await client.storage.getBucket('evidence');
    const checks = [];
    for (const file of files) {
      const { data: info, error: metadataError } = await client.storage
        .from('evidence')
        .info(file.object_path);
      const { data: blob, error: readError } = await client.storage
        .from('evidence')
        .download(file.object_path);
      const { data: signed, error: signingError } = await client.storage
        .from('evidence')
        .createSignedUrl(file.object_path, 60, { download: true });
      const download = signed && !signingError ? await fetch(signed.signedUrl) : null;
      checks.push({
        type: file.content_type,
        metadata_matches:
          !metadataError && info.size === file.byte_size && info.contentType === file.content_type,
        service_download_matches: !readError && blob?.size === file.byte_size,
        signed_download_60s_matches:
          download?.status === 200 && (await download.arrayBuffer()).byteLength === file.byte_size,
      });
    }
    return response({ private_bucket: !bucketError && bucket.public === false, checks });
  } catch {
    return response({ error: 'Audit unavailable' }, 503);
  }
});
