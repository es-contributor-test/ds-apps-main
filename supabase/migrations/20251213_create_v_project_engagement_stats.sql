-- Standard engagement stats view for all projects
-- Auto-discovers projects from /projects/{id} hub pages
-- Convention: hub at /projects/{id}, app at /{id}/
CREATE OR REPLACE VIEW public.v_project_engagement_stats AS
WITH discovered_projects AS (
  -- Extract project IDs from hub page visits: /projects/{project-id}
  SELECT DISTINCT 
    SPLIT_PART(properties->>'$pathname', '/', 3) AS project_id
  FROM public.posthog_batch_events
  WHERE event = '$pageview'
    AND (properties->>'$pathname') LIKE '/projects/%'
    AND SPLIT_PART(properties->>'$pathname', '/', 3) != ''
),
project_stats AS (
  SELECT 
    dp.project_id,
    COUNT(*) AS total_views,
    COUNT(*) FILTER (WHERE pbe.timestamp > NOW() - INTERVAL '30 days') AS views_30d,
    COUNT(DISTINCT pbe.distinct_id) AS unique_visitors
  FROM discovered_projects dp
  JOIN public.posthog_batch_events pbe ON (
    -- Match hub pages: /projects/{id}/*
    (pbe.properties->>'$pathname') LIKE '/projects/' || dp.project_id || '%'
    OR
    -- Match app pages: /{id}/*
    (pbe.properties->>'$pathname') LIKE '/' || dp.project_id || '/%'
    OR
    (pbe.properties->>'$pathname') = '/' || dp.project_id || '/'
  )
  WHERE pbe.event = '$pageview'
  GROUP BY dp.project_id
),
ranked AS (
  SELECT 
    project_id,
    total_views,
    views_30d,
    unique_visitors,
    RANK() OVER (ORDER BY total_views DESC) AS rank,
    COUNT(*) OVER () AS total_projects
  FROM project_stats
)
SELECT 
  project_id,
  total_views,
  views_30d,
  unique_visitors,
  rank,
  total_projects
FROM ranked
ORDER BY rank;

COMMENT ON VIEW public.v_project_engagement_stats IS 'Standard engagement metrics per project: total views, 30-day views, unique visitors, and rank';

-- RPC function to get stats for a specific project
CREATE OR REPLACE FUNCTION public.project_engagement_stats(p_project_id TEXT)
RETURNS TABLE(
  total_views BIGINT,
  views_30d BIGINT,
  unique_visitors BIGINT,
  rank BIGINT,
  total_projects BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT total_views, views_30d, unique_visitors, rank, total_projects
  FROM v_project_engagement_stats
  WHERE project_id = p_project_id;
$$;

COMMENT ON FUNCTION public.project_engagement_stats(TEXT) IS 'Get engagement stats for a specific project by ID';
