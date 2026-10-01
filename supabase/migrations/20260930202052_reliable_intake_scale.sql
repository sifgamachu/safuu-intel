-- Reliable intake v2. Additive to 001_schema.sql; no report/evidence deletion.
-- Only service_role may call these RPCs. Public responses are built by the server.
-- Publication is a human decision. A receipt proves storage, not the allegation.

ALTER TABLE public.persons ADD COLUMN case_key text;
ALTER TABLE public.persons ADD COLUMN publication_approved_at timestamptz;
ALTER TABLE public.persons ADD COLUMN coordination_hold boolean NOT NULL DEFAULT false;
ALTER TABLE public.persons ALTER COLUMN disclosure_threshold SET DEFAULT 100;
CREATE UNIQUE INDEX persons_case_key_unique ON public.persons(case_key) WHERE case_key IS NOT NULL;
CREATE INDEX persons_published_idx ON public.persons(disclosed_at DESC, id)
  WHERE disclosed_at IS NOT NULL AND publication_approved_at IS NOT NULL;
DROP TRIGGER trg_persons_auto_disclose ON public.persons;

ALTER TABLE public.reports ADD COLUMN sealed_payload text;
ALTER TABLE public.reports ADD COLUMN receipt_hash text;
ALTER TABLE public.reports ADD COLUMN fingerprint text;
ALTER TABLE public.reports ADD COLUMN ledger_shard smallint NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX reports_fingerprint_unique ON public.reports(fingerprint) WHERE fingerprint IS NOT NULL;
CREATE INDEX reports_review_queue_idx ON public.reports(created_at, id) WHERE status = 'pending';
ALTER TABLE public.evidence_ledger ADD COLUMN chain_id smallint NOT NULL DEFAULT 0;
CREATE INDEX evidence_ledger_chain_idx ON public.evidence_ledger(chain_id, seq);
ALTER TABLE public.telegram_sessions ADD COLUMN version bigint NOT NULL DEFAULT 0;
ALTER TABLE public.telegram_sessions ADD COLUMN sealed_draft text;

CREATE TABLE public.ledger_heads (
  shard smallint PRIMARY KEY CHECK (shard BETWEEN 1 AND 256),
  hash text NOT NULL DEFAULT repeat('0', 64),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.ledger_heads(shard) SELECT generate_series(1,256);

CREATE TABLE public.report_evidence (
  id uuid PRIMARY KEY,
  owner_hash text NOT NULL,
  object_path text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('photo','document','voice')),
  content_type text NOT NULL,
  byte_size integer NOT NULL CHECK (byte_size BETWEEN 4 AND 10485760),
  report_id uuid REFERENCES public.reports(id) ON DELETE RESTRICT,
  content_hash text,
  uploaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX report_evidence_report_idx ON public.report_evidence(report_id);
CREATE INDEX report_evidence_unattached_idx ON public.report_evidence(created_at) WHERE report_id IS NULL;

CREATE TABLE public.rate_buckets (
  action text NOT NULL,
  subject text NOT NULL,
  bucket bigint NOT NULL,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY(action, subject, bucket)
);
CREATE INDEX rate_buckets_expiry_idx ON public.rate_buckets(expires_at);

CREATE TABLE public.intake_metrics (
  shard smallint NOT NULL,
  month date NOT NULL,
  region text NOT NULL,
  category text NOT NULL,
  status text NOT NULL,
  count bigint NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY(shard, month, region, category, status)
);
CREATE INDEX intake_metrics_month_idx ON public.intake_metrics(month DESC);

CREATE TABLE public.job_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence bigserial UNIQUE,
  external_key text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('telegram_update','telegram_send')),
  partition_key text NOT NULL,
  sealed_payload text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','retry','done','dead')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  lease_token uuid,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days'
);
CREATE INDEX job_queue_ready_idx ON public.job_queue(kind, available_at, sequence)
  WHERE status IN ('queued','retry');
CREATE INDEX job_queue_leases_idx ON public.job_queue(lease_until) WHERE status = 'processing';
CREATE UNIQUE INDEX job_queue_partition_lease ON public.job_queue(kind, partition_key) WHERE status = 'processing';
CREATE INDEX job_queue_expiry_idx ON public.job_queue(expires_at);
CREATE TABLE public.worker_heartbeats (id text PRIMARY KEY, last_seen timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.staff_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('reviewer','publisher','admin')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Replace exposed definer views. Only approved cases can be returned publicly.
CREATE OR REPLACE VIEW public.v_transparency_wall WITH (security_invoker = true) AS
SELECT id, full_name AS display_name, office, position_title, city, region, country,
  report_count, verified_report_count, disclosure_threshold,
  true AS is_disclosed, referred_agency, referred_at, created_at
FROM public.persons
WHERE disclosed_at IS NOT NULL AND publication_approved_at IS NOT NULL AND NOT coordination_hold
ORDER BY disclosed_at DESC;
ALTER VIEW public.v_live_feed SET (security_invoker = true);
ALTER VIEW public.v_public_stats SET (security_invoker = true);
REVOKE ALL ON public.v_transparency_wall, public.v_live_feed, public.v_public_stats FROM anon, authenticated;

-- Count incoming reports without re-scanning all reports at ingestion time.
CREATE OR REPLACE FUNCTION public.update_person_counts()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.person_id IS NOT NULL THEN
    UPDATE public.persons SET report_count = report_count + 1, updated_at = now() WHERE id = NEW.person_id;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION public.sf_metric_delta(p_shard smallint, p_created timestamptz, p_region text,
  p_category text, p_status text, p_delta integer)
RETURNS void LANGUAGE sql SET search_path = '' AS $$
  INSERT INTO public.intake_metrics(shard,month,region,category,status,count)
  VALUES(p_shard, date_trunc('month',p_created AT TIME ZONE 'UTC')::date,
    coalesce(p_region,'Unknown'),p_category,p_status,greatest(p_delta,0))
  ON CONFLICT(shard,month,region,category,status) DO UPDATE
    SET count = public.intake_metrics.count + p_delta;
$$;
CREATE FUNCTION public.sf_update_metrics() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.sf_metric_delta(NEW.ledger_shard,NEW.created_at,NEW.region,NEW.corruption_type::text,NEW.status::text,1);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.sf_metric_delta(OLD.ledger_shard,OLD.created_at,OLD.region,OLD.corruption_type::text,OLD.status::text,-1);
    PERFORM public.sf_metric_delta(NEW.ledger_shard,NEW.created_at,NEW.region,NEW.corruption_type::text,NEW.status::text,1);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER reports_metric_delta AFTER INSERT OR UPDATE OF status ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.sf_update_metrics();
INSERT INTO public.intake_metrics(shard,month,region,category,status,count)
SELECT ledger_shard,date_trunc('month',created_at AT TIME ZONE 'UTC')::date,coalesce(region,'Unknown'),
  corruption_type::text,status::text,count(*) FROM public.reports GROUP BY 1,2,3,4,5;

CREATE FUNCTION public.sf_take_rate(p_action text,p_subject text,p_limit integer,p_window integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE n integer; b bigint;
BEGIN
  IF p_limit < 1 OR p_window < 1 OR length(p_subject) > 128 THEN RAISE EXCEPTION 'invalid_rate'; END IF;
  b := floor(extract(epoch FROM clock_timestamp()) / p_window)::bigint;
  INSERT INTO public.rate_buckets(action,subject,bucket,count,expires_at)
    VALUES(p_action,p_subject,b,1,now() + make_interval(secs => p_window * 2))
  ON CONFLICT(action,subject,bucket) DO UPDATE SET count = public.rate_buckets.count + 1
    WHERE public.rate_buckets.count < p_limit RETURNING count INTO n;
  RETURN n IS NOT NULL;
END $$;

CREATE FUNCTION public.sf_submit_report(p_id uuid,p_owner text,p_receipt_hash text,p_fingerprint text,
  p_case_key text,p_case jsonb,p_sealed text,p_channel public.report_channel,p_evidence uuid[] DEFAULT '{}')
RETURNS jsonb LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE old public.reports; pid uuid; s smallint; prev text; content text; combined text; n integer;
BEGIN
  -- Lock the request key before rate checks so retries never consume another slot.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text,17));
  SELECT * INTO old FROM public.reports WHERE id = p_id;
  IF FOUND THEN
    IF old.tipper_hash <> p_owner OR old.receipt_hash <> p_receipt_hash OR old.fingerprint <> p_fingerprint THEN
      RAISE EXCEPTION 'request_conflict';
    END IF;
    RETURN jsonb_build_object('id',old.id,'status',old.status,'ledger_hash',old.ledger_hash,'saved_at',old.created_at,'duplicate',true);
  END IF;
  IF EXISTS(SELECT 1 FROM public.reports WHERE fingerprint = p_fingerprint) THEN RAISE EXCEPTION 'already_received'; END IF;
  IF length(p_owner) <> 64 OR length(p_receipt_hash) <> 64 OR length(p_fingerprint) <> 64
     OR length(p_case_key) <> 64 OR length(p_sealed) > 40000 OR left(p_sealed,3) <> 'v1.'
     OR jsonb_typeof(p_case) <> 'object' OR coalesce(length(p_case->>'office'),0) < 2
     OR coalesce(length(p_case->>'city'),0) < 2 OR cardinality(p_evidence) > 4 THEN
    RAISE EXCEPTION 'invalid_report';
  END IF;
  IF NOT public.sf_take_rate('report',p_owner,5,86400) THEN RAISE EXCEPTION 'rate_limited'; END IF;
  PERFORM id FROM public.report_evidence WHERE id = ANY(p_evidence) ORDER BY id FOR UPDATE;
  SELECT count(*) INTO n FROM public.report_evidence WHERE id = ANY(p_evidence)
    AND owner_hash = p_owner AND report_id IS NULL AND uploaded_at IS NOT NULL
    AND created_at > now() - interval '24 hours';
  IF n <> cardinality(p_evidence) THEN RAISE EXCEPTION 'evidence_missing'; END IF;
  -- Each shard has a head lock. Independent cases do not wait on a global ledger row.
  s := (get_byte(decode(replace(p_id::text,'-',''),'hex'),0) + 1)::smallint;
  SELECT hash INTO prev FROM public.ledger_heads WHERE shard=s FOR UPDATE;
  content := encode(sha256(convert_to(p_sealed,'UTF8')),'hex');
  combined := encode(sha256(convert_to(prev || content || p_id::text,'UTF8')),'hex');
  INSERT INTO public.persons(full_name,office,position_title,city,region,case_key)
    VALUES(p_case->>'full_name',p_case->>'office',p_case->>'position_title',p_case->>'city',p_case->>'region',p_case_key)
  ON CONFLICT(case_key) WHERE case_key IS NOT NULL DO UPDATE SET updated_at=now()
    RETURNING id INTO pid;
  INSERT INTO public.reports(id,person_id,tipper_hash,channel,language,corruption_type,city,region,
    description,sealed_payload,receipt_hash,fingerprint,ledger_shard,ledger_prev_hash,ledger_hash)
    VALUES(p_id,pid,p_owner,p_channel,(p_case->>'language')::public.ethiopian_language,
      (p_case->>'corruption_type')::public.corruption_type,p_case->>'city',p_case->>'region',
      '[Encrypted report]',p_sealed,p_receipt_hash,p_fingerprint,s,prev,combined);
  UPDATE public.report_evidence SET report_id=p_id WHERE id=ANY(p_evidence);
  INSERT INTO public.evidence_ledger(report_id,prev_hash,content_hash,combined_hash,chain_id)
    VALUES(p_id,prev,content,combined,s);
  UPDATE public.ledger_heads SET hash=combined,updated_at=now() WHERE shard=s;
  RETURN jsonb_build_object('id',p_id,'status','pending','ledger_hash',combined,'saved_at',now(),'duplicate',false);
END $$;

CREATE FUNCTION public.sf_receipt(p_id uuid,p_receipt_hash text) RETURNS jsonb
LANGUAGE sql SET search_path = '' AS $$
  SELECT jsonb_build_object('id',id,'status',status,'saved_at',created_at,'ledger_hash',ledger_hash)
    FROM public.reports WHERE id=p_id AND receipt_hash=p_receipt_hash;
$$;

CREATE FUNCTION public.sf_enqueue_job(p_key text,p_kind text,p_partition text,p_sealed text)
RETURNS uuid LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE jid uuid;
BEGIN
  IF length(p_key) > 160 OR length(p_partition) <> 64 OR length(p_sealed) > 120000 THEN RAISE EXCEPTION 'invalid_job'; END IF;
  INSERT INTO public.job_queue(external_key,kind,partition_key,sealed_payload)
    VALUES(p_key,p_kind,p_partition,p_sealed) ON CONFLICT(external_key) DO NOTHING RETURNING id INTO jid;
  IF jid IS NULL THEN SELECT id INTO jid FROM public.job_queue WHERE external_key=p_key; END IF;
  RETURN jid;
END $$;

CREATE FUNCTION public.sf_claim_jobs(p_kind text,p_limit integer DEFAULT 8)
RETURNS SETOF public.job_queue LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE item public.job_queue; claimed public.job_queue; n integer := 0;
BEGIN
  -- Expired leases become retryable; different worker instances use SKIP LOCKED.
  UPDATE public.job_queue SET status=CASE WHEN attempts >= 8 THEN 'dead' ELSE 'retry' END,
    lease_token=NULL,lease_until=NULL,available_at=now(),last_error='lease_expired'
    WHERE status='processing' AND lease_until < now();
  FOR item IN SELECT q.* FROM public.job_queue q
    WHERE q.kind=p_kind AND q.status IN ('queued','retry') AND q.available_at <= now()
      AND NOT EXISTS(SELECT 1 FROM public.job_queue a WHERE a.kind=q.kind AND a.partition_key=q.partition_key AND a.status='processing')
      AND NOT EXISTS(SELECT 1 FROM public.job_queue earlier WHERE earlier.kind=q.kind AND earlier.partition_key=q.partition_key
        AND earlier.status IN ('queued','retry','processing') AND earlier.sequence < q.sequence)
    ORDER BY q.sequence FOR UPDATE SKIP LOCKED LIMIT least(greatest(p_limit,1),64) * 4
  LOOP
    BEGIN
      UPDATE public.job_queue SET status='processing',attempts=attempts+1,
        lease_token=gen_random_uuid(),lease_until=now()+interval '60 seconds'
        WHERE id=item.id RETURNING * INTO claimed;
      RETURN NEXT claimed;
      n:=n+1;
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
    EXIT WHEN n >= least(greatest(p_limit,1),64);
  END LOOP;
END $$;

CREATE FUNCTION public.sf_finish_job(p_id uuid,p_lease uuid,p_error text DEFAULT NULL,
  p_delay integer DEFAULT 0,p_throttled boolean DEFAULT false) RETURNS boolean
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE n integer;
BEGIN
  UPDATE public.job_queue SET
    status=CASE WHEN p_error IS NULL THEN 'done' WHEN attempts >= 8 AND NOT p_throttled THEN 'dead' ELSE 'retry' END,
    attempts=attempts-CASE WHEN p_throttled THEN 1 ELSE 0 END,
    available_at=now()+make_interval(secs=>least(greatest(p_delay,0),3600)),
    lease_until=NULL,lease_token=NULL,last_error=left(p_error,80),
    sealed_payload=CASE WHEN p_error IS NULL THEN NULL ELSE sealed_payload END
  WHERE id=p_id AND lease_token=p_lease AND status='processing' AND lease_until > now();
  GET DIAGNOSTICS n=ROW_COUNT;
  RETURN n=1;
END $$;

CREATE FUNCTION public.sf_commit_intake(p_job uuid,p_lease uuid,p_owner text,p_version bigint,
  p_step integer,p_language public.ethiopian_language,p_draft text,p_replies jsonb,p_submission jsonb DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE current_version bigint; reply jsonb; ordinal integer:=0;
BEGIN
  PERFORM id FROM public.job_queue WHERE id=p_job AND lease_token=p_lease AND status='processing'
    AND lease_until > now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'lease_lost'; END IF;
  INSERT INTO public.telegram_sessions(tipper_hash) VALUES(p_owner) ON CONFLICT DO NOTHING;
  SELECT version INTO current_version FROM public.telegram_sessions WHERE tipper_hash=p_owner FOR UPDATE;
  IF current_version <> p_version THEN RAISE EXCEPTION 'stale_session'; END IF;
  IF p_submission IS NOT NULL THEN
    PERFORM public.sf_submit_report(p_job,p_owner,p_submission->>'receipt_hash',p_submission->>'fingerprint',
      p_submission->>'case_key',p_submission->'case',p_submission->>'sealed','telegram',
      ARRAY(SELECT jsonb_array_elements_text(p_submission->'evidence')::uuid));
  END IF;
  UPDATE public.telegram_sessions SET current_step=p_step,language=p_language,
    draft='{}',sealed_draft=p_draft,version=version+1,last_activity=now() WHERE tipper_hash=p_owner;
  FOR reply IN SELECT value FROM jsonb_array_elements(p_replies) LOOP
    ordinal:=ordinal+1;
    PERFORM public.sf_enqueue_job(p_job::text || ':reply:' || ordinal,'telegram_send',p_owner,reply->>'sealed');
  END LOOP;
  PERFORM public.sf_finish_job(p_job,p_lease);
END $$;

CREATE FUNCTION public.sf_public_snapshot() RETURNS jsonb LANGUAGE sql SET search_path = '' AS $$
  WITH totals AS (
    SELECT coalesce(sum(count),0) AS received,
      coalesce(sum(count) FILTER (WHERE status IN ('verified','investigating','disclosed')),0) AS reviewed
    FROM public.intake_metrics
  ), published AS (
    SELECT id,full_name AS display_name,office,position_title,city,region,verified_report_count,
      disclosed_at,referred_agency FROM public.persons
    WHERE publication_approved_at IS NOT NULL AND disclosed_at IS NOT NULL AND NOT coordination_hold
    ORDER BY disclosed_at DESC,id LIMIT 50
  ), month_counts AS (
    SELECT month,sum(count) AS count FROM public.intake_metrics GROUP BY month ORDER BY month DESC LIMIT 12
  )
  SELECT jsonb_build_object('received',totals.received,'reviewed',totals.reviewed,
    'published',(SELECT count(*) FROM public.persons WHERE publication_approved_at IS NOT NULL AND disclosed_at IS NOT NULL AND NOT coordination_hold),
    'cases',coalesce((SELECT jsonb_agg(to_jsonb(published)) FROM published),'[]'::jsonb),
    'months',coalesce((SELECT jsonb_agg(to_jsonb(month_counts)) FROM month_counts),'[]'::jsonb),
    'updated_at',now()) FROM totals;
$$;
CREATE FUNCTION public.sf_public_case(p_id uuid) RETURNS jsonb LANGUAGE sql SET search_path = '' AS $$
  SELECT jsonb_build_object('id',id,'display_name',full_name,'office',office,'position_title',position_title,
    'city',city,'region',region,'verified_report_count',verified_report_count,'disclosed_at',disclosed_at,
    'referred_agency',referred_agency)
  FROM public.persons WHERE id=p_id AND publication_approved_at IS NOT NULL AND disclosed_at IS NOT NULL AND NOT coordination_hold;
$$;

CREATE FUNCTION public.sf_review_report(p_actor uuid,p_id uuid,p_decision text,p_reason text) RETURNS void
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE target public.reports; person_id uuid;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.staff_members WHERE user_id=p_actor AND active) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  IF p_decision NOT IN ('verified','dismissed') OR length(p_reason) < 10 OR length(p_reason) > 2000 THEN RAISE EXCEPTION 'invalid_review'; END IF;
  SELECT r.person_id INTO person_id FROM public.reports r WHERE id=p_id;
  PERFORM id FROM public.persons WHERE id=person_id FOR UPDATE;
  SELECT * INTO target FROM public.reports WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'report_missing'; END IF;
  UPDATE public.reports SET status=p_decision::public.report_status,verified_at=CASE WHEN p_decision='verified' THEN now() ELSE NULL END,
    verified_by=p_actor::text,dismissed_reason=CASE WHEN p_decision='dismissed' THEN p_reason ELSE NULL END,updated_at=now() WHERE id=p_id;
  UPDATE public.persons SET verified_report_count=(SELECT count(DISTINCT tipper_hash) FROM public.reports
    WHERE reports.person_id=target.person_id AND status IN ('verified','investigating','disclosed')),updated_at=now()
    WHERE id=target.person_id;
  -- An approval ceases to publish if later reviews fall below its threshold.
  UPDATE public.persons SET disclosed_at=NULL,publication_approved_at=NULL
    WHERE id=target.person_id AND verified_report_count < disclosure_threshold;
  INSERT INTO public.audit_log(actor_email,action,target_type,target_id,metadata)
    VALUES(p_actor::text,'review_'||p_decision,'report',p_id::text,jsonb_build_object('reason',p_reason));
END $$;
CREATE FUNCTION public.sf_publish_case(p_actor uuid,p_id uuid) RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE person public.persons;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.staff_members WHERE user_id=p_actor AND active AND role IN ('publisher','admin')) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  SELECT * INTO person FROM public.persons WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR person.coordination_hold OR lower(person.full_name)='unknown'
    OR person.verified_report_count < person.disclosure_threshold THEN RAISE EXCEPTION 'publication_not_ready'; END IF;
  UPDATE public.persons SET publication_approved_at=now(),disclosed_at=now() WHERE id=p_id;
  INSERT INTO public.audit_log(actor_email,action,target_type,target_id)
    VALUES(p_actor::text,'publish_case','person',p_id::text);
END $$;

CREATE FUNCTION public.sf_health() RETURNS jsonb LANGUAGE sql SET search_path = '' AS $$
  SELECT jsonb_build_object('database','available','checked_at',now(),
    'worker_last_seen',(SELECT max(last_seen) FROM public.worker_heartbeats),
    'queued',(SELECT count(*) FROM public.job_queue WHERE status IN ('queued','retry','processing')),
    'dead_letters',(SELECT count(*) FROM public.job_queue WHERE status='dead'));
$$;
CREATE FUNCTION public.sf_queue_maintenance() RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  DELETE FROM public.rate_buckets WHERE expires_at < now();
  DELETE FROM public.telegram_sessions WHERE last_activity < now()-interval '24 hours';
  -- Retain deduplication keys for 7 days, but erase raw update ciphertext after 24h.
  UPDATE public.job_queue SET sealed_payload=NULL,status='dead',lease_until=NULL,lease_token=NULL,last_error='expired'
    WHERE sealed_payload IS NOT NULL AND created_at < now()-interval '24 hours' AND status <> 'processing';
  DELETE FROM public.job_queue WHERE expires_at < now() AND status IN ('done','dead');
END $$;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('evidence','evidence',false,10485760,ARRAY['image/jpeg','image/png','application/pdf','audio/ogg','audio/mpeg','audio/mp4'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;

ALTER TABLE public.ledger_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ledger_heads,public.report_evidence,public.rate_buckets,public.intake_metrics,
  public.job_queue,public.worker_heartbeats,public.staff_members FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.ledger_heads,public.report_evidence,public.rate_buckets,public.intake_metrics,
  public.job_queue,public.worker_heartbeats,public.staff_members TO service_role;
GRANT ALL ON public.persons,public.reports,public.evidence_ledger,public.telegram_sessions,
  public.audit_log,public.subscribers TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- PostgreSQL grants EXECUTE to PUBLIC by default: explicitly remove it for every server RPC.
DO $$ DECLARE f record; BEGIN
  FOR f IN SELECT oid::regprocedure AS signature FROM pg_proc
    WHERE pronamespace='public'::regnamespace AND proname LIKE 'sf\_%' ESCAPE '\'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.signature);
  END LOOP;
END $$;
-- Pin search paths for legacy trigger/helper functions as well.
ALTER FUNCTION public.block_ledger_modification() SET search_path = '';
ALTER FUNCTION public.check_disclosure_threshold() SET search_path = '';
ALTER FUNCTION public.mask_name(text) SET search_path = '';
NOTIFY pgrst, 'reload schema';
