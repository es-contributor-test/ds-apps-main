-- ====================
-- 1. PostHog Events Table
-- ====================
CREATE TABLE IF NOT EXISTS posthog_events (
  id BIGSERIAL PRIMARY KEY,

  -- Core PostHog fields
  uuid TEXT NOT NULL UNIQUE,
  event TEXT NOT NULL,
  distinct_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Full properties as JSONB
  properties JSONB,

  -- Extracted key properties for faster queries (computed from JSONB)
  variant TEXT GENERATED ALWAYS AS (properties->>'variant') STORED,
  feature_flag_response TEXT GENERATED ALWAYS AS (properties->>'$feature_flag_response') STORED,
  completion_time_seconds NUMERIC GENERATED ALWAYS AS ((properties->>'completion_time_seconds')::numeric) STORED,
  correct_words_count INTEGER GENERATED ALWAYS AS ((properties->>'correct_words_count')::integer) STORED,
  total_guesses_count INTEGER GENERATED ALWAYS AS ((properties->>'total_guesses_count')::integer) STORED,
  user_id TEXT GENERATED ALWAYS AS (properties->>'user_id') STORED,

  -- Metadata
  session_id TEXT,
  window_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_posthog_event UNIQUE (uuid)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_posthog_events_event ON posthog_events(event);
CREATE INDEX IF NOT EXISTS idx_posthog_events_distinct_id ON posthog_events(distinct_id);
CREATE INDEX IF NOT EXISTS idx_posthog_events_timestamp ON posthog_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_posthog_events_variant ON posthog_events(variant) WHERE variant IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posthog_events_feature_flag ON posthog_events(feature_flag_response) WHERE feature_flag_response IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posthog_events_user_id ON posthog_events(user_id) WHERE user_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_posthog_events_event_variant ON posthog_events(event, variant) WHERE variant IS NOT NULL;

COMMENT ON TABLE posthog_events IS 'Raw events from PostHog batch export';
COMMENT ON COLUMN posthog_events.variant IS 'Extracted from properties.variant (A or B)';
COMMENT ON COLUMN posthog_events.feature_flag_response IS 'Extracted from properties.$feature_flag_response (control or 4-words)';

----------------------------------
-- 2. Views for API Calls
----------------------------------


-- Regular views (no caching, always fresh, simplified queries)
CREATE OR REPLACE VIEW v_variant_stats AS
SELECT
  variant,
  feature_flag_response,
  COUNT(DISTINCT distinct_id) as unique_users,
  COUNT(*) as total_completions,
  AVG(completion_time_seconds) as avg_completion_time,
  MIN(completion_time_seconds) as min_completion_time,
  MAX(completion_time_seconds) as max_completion_time
FROM posthog_events
WHERE event = 'puzzle_completed'
  AND variant IS NOT NULL
  AND feature_flag_response IS NOT NULL
  AND session_id IS NOT NULL
GROUP BY variant, feature_flag_response;

CREATE OR REPLACE VIEW v_conversion_funnel AS
WITH started_events AS (
  SELECT 
    variant,
    'Started' as stage,
    COUNT(*) as event_count,
    COUNT(DISTINCT distinct_id) as unique_users,
    1 as stage_order
  FROM posthog_events
  WHERE event = 'puzzle_started' 
    AND variant IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
),
completed_events AS (
  SELECT 
    variant,
    'Completed' as stage,
    COUNT(*) as event_count,
    COUNT(DISTINCT distinct_id) as unique_users,
    2 as stage_order
  FROM posthog_events
  WHERE event = 'puzzle_completed' 
    AND variant IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
),
repeated_events AS (
  SELECT 
    variant,
    'Repeated' as stage,
    COUNT(*) as event_count,
    COUNT(DISTINCT distinct_id) as unique_users,
    3 as stage_order
  FROM posthog_events
  WHERE event = 'puzzle_repeated'
    AND variant IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
),
failed_events AS (
  SELECT 
    variant,
    'Failed' as stage,
    COUNT(*) as event_count,
    COUNT(DISTINCT distinct_id) as unique_users,
    4 as stage_order
  FROM posthog_events
  WHERE event = 'puzzle_failed'
    AND variant IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
)
SELECT variant, stage, event_count, unique_users, stage_order
FROM (
  SELECT * FROM started_events
  UNION ALL
  SELECT * FROM completed_events
  UNION ALL
  SELECT * FROM repeated_events
  UNION ALL
  SELECT * FROM failed_events
) funnel_stages
ORDER BY variant, stage_order;

-- Indexes for faster queries on posthog_events
CREATE INDEX IF NOT EXISTS idx_posthog_events_completed 
ON posthog_events(event, variant, session_id) 
WHERE event = 'puzzle_completed' AND variant IS NOT NULL AND session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posthog_events_started 
ON posthog_events(event, variant, session_id) 
WHERE event = 'puzzle_started' AND variant IS NOT NULL AND session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posthog_events_repeated 
ON posthog_events(event, variant, session_id) 
WHERE event = 'puzzle_repeated' AND variant IS NOT NULL AND session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posthog_events_failed
ON posthog_events(event, variant, session_id) 
WHERE event = 'puzzle_failed' AND variant IS NOT NULL AND session_id IS NOT NULL;

-- Index for faster aggregations (covers the GROUP BY in variant_stats)
CREATE INDEX IF NOT EXISTS idx_posthog_events_variant_flag 
ON posthog_events(variant, feature_flag_response) 
WHERE event = 'puzzle_completed' AND variant IS NOT NULL AND session_id IS NOT NULL;