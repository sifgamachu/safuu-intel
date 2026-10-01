-- Reviewed totals include closed/dismissed reports as well as verified reports.
-- Publication still counts verified identities only. Existing grants are preserved.
CREATE OR REPLACE FUNCTION public.sf_public_snapshot() RETURNS jsonb LANGUAGE sql SET search_path = '' AS $$
  WITH totals AS (
    SELECT coalesce(sum(count),0) AS received,
      coalesce(sum(count) FILTER (WHERE status IN ('verified','dismissed','investigating','disclosed')),0) AS reviewed
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
