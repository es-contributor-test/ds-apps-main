-- Geo aggregation view for AB simulator completions map
-- Groups completions by city with lat/lon and variant breakdown
CREATE OR REPLACE VIEW public.v_ab_completions_geo AS
SELECT 
  properties->>'$geoip_city_name' as city,
  properties->>'$geoip_country_name' as country,
  properties->>'$geoip_country_code' as country_code,
  (properties->>'$geoip_latitude')::float as lat,
  (properties->>'$geoip_longitude')::float as lon,
  properties->>'variant' as variant,
  COUNT(*) as completions,
  ROUND(AVG((properties->>'completion_time_ms')::numeric))::int as avg_time_ms
FROM posthog_batch_events
WHERE event = 'puzzle_completed'
  AND properties->>'$geoip_latitude' IS NOT NULL
  AND properties->>'variant' IS NOT NULL
GROUP BY 
  properties->>'$geoip_city_name',
  properties->>'$geoip_country_name',
  properties->>'$geoip_country_code',
  properties->>'$geoip_latitude',
  properties->>'$geoip_longitude',
  properties->>'variant'
ORDER BY completions DESC;

COMMENT ON VIEW public.v_ab_completions_geo IS 'Geo-aggregated AB simulator completions for map visualization';

-- RPC function to get geo data for map
CREATE OR REPLACE FUNCTION public.ab_completions_geo()
RETURNS TABLE(
  city TEXT,
  country TEXT,
  country_code TEXT,
  lat FLOAT,
  lon FLOAT,
  variant TEXT,
  completions BIGINT,
  avg_time_ms INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT city, country, country_code, lat, lon, variant, completions, avg_time_ms
  FROM v_ab_completions_geo;
$$;

COMMENT ON FUNCTION public.ab_completions_geo() IS 'Get geo-aggregated completion data for map visualization';
