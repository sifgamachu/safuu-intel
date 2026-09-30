-- Keep extension helpers outside the exposed API schema. Existing generated
-- expressions and index operator classes retain their object dependencies.
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION fuzzystrmatch SET SCHEMA extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- Supabase's event trigger runs administratively, never through a public RPC.
DO $$ BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
NOTIFY pgrst, 'reload schema';
