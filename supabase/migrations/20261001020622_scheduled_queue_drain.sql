-- A private scheduler credential never enters Git or the Vercel environment.
-- Local PostgreSQL WASM tests still exercise the credential table/RPC; managed
-- Cron/Net/Vault setup only runs where all three extensions are available.
CREATE TABLE public.worker_credentials (
  name text PRIMARY KEY,
  token_digest text NOT NULL CHECK (token_digest ~ '^[a-f0-9]{64}$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.worker_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.worker_credentials FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.worker_credentials TO service_role;

CREATE FUNCTION public.sf_worker_credential_digest()
RETURNS text LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT token_digest FROM public.worker_credentials WHERE name = 'queue_drain';
$$;
REVOKE ALL ON FUNCTION public.sf_worker_credential_digest() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sf_worker_credential_digest() TO service_role;

DO $setup$
DECLARE
  token text;
  job_id bigint;
BEGIN
  IF (SELECT count(DISTINCT name) FROM pg_available_extensions
      WHERE name IN ('pg_cron', 'pg_net', 'supabase_vault')) <> 3 THEN
    RETURN;
  END IF;
  CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
  CREATE SCHEMA IF NOT EXISTS vault;
  CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

  SELECT decrypted_secret INTO token FROM vault.decrypted_secrets
    WHERE name = 'safuu_worker_bearer';
  IF token IS NULL THEN
    token := 'sfq_' || encode(extensions.gen_random_bytes(32), 'hex');
    PERFORM vault.create_secret(token, 'safuu_worker_bearer',
      'Safuu scheduled queue drain; never copy this credential to application logs.');
  END IF;
  INSERT INTO public.worker_credentials(name, token_digest)
    VALUES ('queue_drain', encode(sha256(convert_to(token, 'UTF8')), 'hex'))
    ON CONFLICT (name) DO UPDATE SET token_digest = excluded.token_digest, updated_at = now();

  CREATE SCHEMA IF NOT EXISTS safuu_ops;
  REVOKE ALL ON SCHEMA safuu_ops FROM PUBLIC, anon, authenticated;
  EXECUTE $function$
    CREATE FUNCTION safuu_ops.request_worker()
    RETURNS bigint LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $body$
      SELECT net.http_post(
        url := 'https://www.safuu.net/api/internal/worker',
        headers := jsonb_build_object('Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'safuu_worker_bearer')),
        body := '{}'::jsonb,
        timeout_milliseconds := 55000
      );
    $body$;
  $function$;
  REVOKE ALL ON FUNCTION safuu_ops.request_worker() FROM PUBLIC, anon, authenticated, service_role;

  job_id := cron.schedule('safuu-intake-drain', '* * * * *',
    'SELECT safuu_ops.request_worker();');
  PERFORM cron.alter_job(job_id, active := false);
  job_id := cron.schedule('safuu-queue-maintenance', '15 * * * *',
    'SELECT public.sf_queue_maintenance();');
  PERFORM cron.alter_job(job_id, active := false);
  -- Activate only after the new application route is live and a signed request
  -- succeeds. Cron is a quiet-period retry backstop, not national-capacity workers.
END;
$setup$;
