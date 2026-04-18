-- ═══════════════════════════════════════════════════════════════════════════
--  SAFUU INTEL — Postgres Schema (Supabase)
--  v1.0 · Anonymous anti-corruption intelligence platform
-- ═══════════════════════════════════════════════════════════════════════════
--
--  DESIGN PRINCIPLES:
--  1. Zero PII storage — no tipper names, phone numbers, or real Telegram IDs.
--     Tipper identity is hashed (SHA-256 of chat_id + random app-side salt)
--     BEFORE it ever reaches the database. The hash is one-way and useless
--     to anyone who obtains the DB.
--
--  2. Row Level Security is ON by default on every table. The only role that
--     can read report content is `service_role` (Vercel serverless functions).
--     The `anon` role (public site) gets read-only access to a narrow
--     transparency view with names masked below threshold.
--
--  3. Evidence ledger is append-only. Every report creates a cryptographic
--     hash linked to the previous entry (blockchain-style). Any tampering
--     breaks the chain and is detectable.
--
--  4. Progressive disclosure — a `person` accumulates reports. Names are
--     masked in public views until `report_count >= disclosure_threshold`.
--
--  5. Multilingual — language codes stored on every text column that holds
--     user-submitted content. 11 Ethiopian languages + English.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- gen_random_uuid, digest
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";    -- soundex, phonetic matching
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- trigram similarity (name dedup)

-- ─────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────
CREATE TYPE report_status AS ENUM (
  'pending',        -- just submitted, not yet verified
  'ai_flagged',     -- AI detected likely fake image or manipulated content
  'verified',       -- passed forensics, counted toward threshold
  'investigating',  -- case forwarded to FEACC or similar agency
  'disclosed',      -- threshold reached, name public
  'dismissed'       -- determined to be spam/false after review
);

CREATE TYPE corruption_type AS ENUM (
  'bribery',
  'embezzlement',
  'procurement_fraud',
  'tax_evasion',
  'nepotism',
  'abuse_of_power',
  'land_fraud',
  'extortion',
  'money_laundering',
  'electoral_fraud',
  'judicial_corruption',
  'police_misconduct',
  'other'
);

CREATE TYPE ethiopian_language AS ENUM (
  'en',  -- English
  'am',  -- Amharic (አማርኛ)
  'or',  -- Oromiffa (Afaan Oromoo)
  'ti',  -- Tigrinya (ትግርኛ)
  'so',  -- Somali
  'af',  -- Afar
  'si',  -- Sidaama
  'wo',  -- Wolaytta
  'ha',  -- Hadiyya
  'da',  -- Dawro
  'ga',  -- Gamo
  'be'   -- Bench
);

CREATE TYPE report_channel AS ENUM ('telegram', 'sms', 'web');

-- ─────────────────────────────────────────────────────────────────────────
-- persons: accused individuals (accumulation + progressive disclosure)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE persons (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name               text NOT NULL,              -- canonical name, stored
  name_soundex            text GENERATED ALWAYS AS (soundex(full_name)) STORED,
  office                  text NOT NULL,              -- e.g. "Ministry of Transport"
  position_title          text,                        -- e.g. "Procurement Director"
  city                    text NOT NULL,
  region                  text NOT NULL,               -- Ethiopian region / country subdivision
  country                 text NOT NULL DEFAULT 'Ethiopia',
  report_count            int  NOT NULL DEFAULT 0,
  verified_report_count   int  NOT NULL DEFAULT 0,
  disclosure_threshold    int  NOT NULL DEFAULT 15,
  disclosed_at            timestamptz,                 -- null until threshold hit
  referred_agency         text,                        -- 'FEACC', etc.
  referred_at             timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_persons_soundex      ON persons (name_soundex);
CREATE INDEX idx_persons_name_trgm    ON persons USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_persons_office       ON persons (office);
CREATE INDEX idx_persons_location     ON persons (country, region, city);
CREATE INDEX idx_persons_threshold    ON persons (report_count) WHERE disclosed_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- reports: individual tips, anonymous
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id            uuid REFERENCES persons(id) ON DELETE SET NULL,

  -- Anonymized tipper identity (SHA-256 of chat_id + app salt, never reversible)
  tipper_hash          text NOT NULL,
  channel              report_channel NOT NULL,
  language             ethiopian_language NOT NULL DEFAULT 'en',

  -- Incident details
  corruption_type      corruption_type NOT NULL,
  incident_date        date,
  city                 text,
  region               text,
  country              text DEFAULT 'Ethiopia',
  description          text NOT NULL,           -- the tip body (may be in any language)
  amount_etb           numeric,                  -- monetary amount if known, in Ethiopian Birr

  -- Free-form note in tipper's language
  note                 text,
  note_language        ethiopian_language,

  -- Evidence
  voice_note_url       text,                     -- Supabase Storage URL
  voice_transcript     text,                     -- Whisper output
  photo_urls           text[] DEFAULT '{}',      -- array of Supabase Storage URLs
  document_urls        text[] DEFAULT '{}',

  -- Forensics results
  ai_image_score       numeric,                  -- 0.0 (authentic) to 1.0 (AI-generated)
  exif_verified        boolean DEFAULT false,
  exif_date_match      boolean,                  -- incident_date matches photo EXIF date
  dedup_hash           text,                     -- SHA-256 of photo content, for dedup
  is_duplicate         boolean DEFAULT false,

  -- Status & workflow
  status               report_status NOT NULL DEFAULT 'pending',
  verified_at          timestamptz,
  verified_by          text,                     -- admin user email
  dismissed_reason     text,

  -- Evidence ledger (tamper-evident chain)
  ledger_prev_hash     text,
  ledger_hash          text NOT NULL,            -- SHA-256 of (prev_hash || report content)

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_person         ON reports (person_id);
CREATE INDEX idx_reports_tipper_hash    ON reports (tipper_hash);
CREATE INDEX idx_reports_status         ON reports (status);
CREATE INDEX idx_reports_type           ON reports (corruption_type);
CREATE INDEX idx_reports_location       ON reports (country, region, city);
CREATE INDEX idx_reports_dedup          ON reports (dedup_hash) WHERE dedup_hash IS NOT NULL;
CREATE INDEX idx_reports_created        ON reports (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- telegram_sessions: in-flight intake state (11-step flow)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE telegram_sessions (
  tipper_hash         text PRIMARY KEY,          -- same hash as reports.tipper_hash
  current_step        int  NOT NULL DEFAULT 0,
  language            ethiopian_language NOT NULL DEFAULT 'en',
  draft               jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_activity       timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_activity ON telegram_sessions (last_activity);

-- ─────────────────────────────────────────────────────────────────────────
-- subscribers: broadcast opt-ins (separate from reports — never linked)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE subscribers (
  chat_id            bigint PRIMARY KEY,          -- Telegram chat_id (opt-in, not report-linked)
  username           text,                         -- optional, opt-in
  region_pref        text NOT NULL DEFAULT 'all',  -- 'all' | country code | 'global'
  language           ethiopian_language NOT NULL DEFAULT 'en',
  active             boolean NOT NULL DEFAULT true,
  subscribed_at      timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at    timestamptz
);

CREATE INDEX idx_subscribers_active  ON subscribers (active, region_pref) WHERE active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- broadcasts: sent intelligence bulletins
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE broadcasts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL,                   -- 'threshold' | 'africa_news' | 'global_news' | 'digest'
  headline        text NOT NULL,
  body            text NOT NULL,
  region          text,
  url             text,
  recipients      int  NOT NULL DEFAULT 0,
  delivered       int  NOT NULL DEFAULT 0,
  failed          int  NOT NULL DEFAULT 0,
  sent_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_broadcasts_sent ON broadcasts (sent_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- evidence_ledger: append-only chain for tamper detection
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE evidence_ledger (
  seq            bigserial PRIMARY KEY,
  report_id      uuid NOT NULL REFERENCES reports(id) ON DELETE RESTRICT,
  prev_hash      text,
  content_hash   text NOT NULL,
  combined_hash  text NOT NULL,                    -- SHA-256(prev_hash || content_hash)
  sealed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_report ON evidence_ledger (report_id);

-- Append-only enforcement: block UPDATE and DELETE
CREATE OR REPLACE FUNCTION block_ledger_modification()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'evidence_ledger is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_no_update BEFORE UPDATE ON evidence_ledger
  FOR EACH ROW EXECUTE FUNCTION block_ledger_modification();
CREATE TRIGGER ledger_no_delete BEFORE DELETE ON evidence_ledger
  FOR EACH ROW EXECUTE FUNCTION block_ledger_modification();

-- ─────────────────────────────────────────────────────────────────────────
-- audit_log: every admin action
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id              bigserial PRIMARY KEY,
  actor_email     text NOT NULL,
  action          text NOT NULL,                   -- 'verify_report', 'disclose_person', etc.
  target_type     text NOT NULL,                   -- 'report' | 'person' | 'config'
  target_id       text NOT NULL,
  metadata        jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor    ON audit_log (actor_email, created_at DESC);
CREATE INDEX idx_audit_target   ON audit_log (target_type, target_id);
CREATE INDEX idx_audit_created  ON audit_log (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- Public views (RLS-safe, name-masked)
-- ─────────────────────────────────────────────────────────────────────────

-- Mask a name to first letter + length-matched dots
CREATE OR REPLACE FUNCTION mask_name(full_name text)
RETURNS text AS $$
  SELECT string_agg(
    CASE
      WHEN ord = 1 THEN substring(word, 1, 1) || repeat('•', greatest(length(word) - 1, 0))
      ELSE substring(word, 1, 1) || repeat('•', greatest(length(word) - 1, 0))
    END,
    ' '
  )
  FROM (
    SELECT word, row_number() OVER () AS ord
    FROM regexp_split_to_table(full_name, '\s+') AS word
  ) parts;
$$ LANGUAGE sql IMMUTABLE;

-- Public transparency view — masks names below threshold
CREATE OR REPLACE VIEW v_transparency_wall AS
SELECT
  id,
  CASE
    WHEN disclosed_at IS NOT NULL THEN full_name
    ELSE mask_name(full_name)
  END AS display_name,
  office,
  position_title,
  city,
  region,
  country,
  report_count,
  verified_report_count,
  disclosure_threshold,
  disclosed_at IS NOT NULL AS is_disclosed,
  referred_agency,
  referred_at,
  created_at
FROM persons
ORDER BY report_count DESC, created_at DESC;

-- Public live feed — anonymized recent tips
CREATE OR REPLACE VIEW v_live_feed AS
SELECT
  id,
  corruption_type,
  city,
  region,
  country,
  language,
  created_at,
  -- truncated description for preview
  LEFT(description, 120) AS preview
FROM reports
WHERE status IN ('verified', 'investigating', 'disclosed')
ORDER BY created_at DESC
LIMIT 50;

-- Public stats
CREATE OR REPLACE VIEW v_public_stats AS
SELECT
  (SELECT count(*) FROM reports)                                       AS total_reports,
  (SELECT count(*) FROM reports WHERE status = 'verified')             AS verified_reports,
  (SELECT count(*) FROM persons WHERE disclosed_at IS NOT NULL)        AS disclosed_persons,
  (SELECT count(*) FROM persons WHERE referred_agency IS NOT NULL)     AS referrals,
  (SELECT count(DISTINCT region) FROM reports)                         AS regions_reporting,
  (SELECT count(*) FROM subscribers WHERE active = true)               AS active_subscribers;

-- ─────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — lock everything down by default
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE persons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_ledger     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;

-- No anon role can read or write these tables directly.
-- The `anon` role only sees the public views above.
-- The `service_role` (used by Vercel serverless functions) bypasses RLS.

-- Explicit: no policies = no access for anon or authenticated.
-- Views use SECURITY INVOKER by default, so v_transparency_wall etc.
-- inherit the caller's permissions. We grant SELECT on views to anon:

GRANT SELECT ON v_transparency_wall TO anon, authenticated;
GRANT SELECT ON v_live_feed        TO anon, authenticated;
GRANT SELECT ON v_public_stats     TO anon, authenticated;

-- Underlying tables remain locked:
REVOKE ALL ON persons, reports, telegram_sessions, subscribers,
            broadcasts, evidence_ledger, audit_log
  FROM anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger: auto-update persons.report_count when reports change
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_person_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.person_id IS NOT NULL THEN
    UPDATE persons
      SET report_count = report_count + 1,
          verified_report_count = verified_report_count +
            CASE WHEN NEW.status = 'verified' THEN 1 ELSE 0 END,
          updated_at = now()
      WHERE id = NEW.person_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status
        AND NEW.person_id IS NOT NULL THEN
    UPDATE persons
      SET verified_report_count = (
            SELECT count(*) FROM reports
            WHERE person_id = NEW.person_id AND status = 'verified'
          ),
          updated_at = now()
      WHERE id = NEW.person_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_update_person_counts
AFTER INSERT OR UPDATE OF status ON reports
FOR EACH ROW EXECUTE FUNCTION update_person_counts();

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger: auto-disclose when verified_report_count hits threshold
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_disclosure_threshold()
RETURNS trigger AS $$
BEGIN
  IF NEW.verified_report_count >= NEW.disclosure_threshold
     AND NEW.disclosed_at IS NULL THEN
    NEW.disclosed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_persons_auto_disclose
BEFORE UPDATE OF verified_report_count ON persons
FOR EACH ROW EXECUTE FUNCTION check_disclosure_threshold();

-- ─────────────────────────────────────────────────────────────────────────
-- Done.
-- ─────────────────────────────────────────────────────────────────────────
