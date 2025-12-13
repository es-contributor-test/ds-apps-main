-- ====================
-- Supabase Schema Template for Contributors
-- ====================
-- 
-- This is a starting point for your own Supabase project.
-- Copy relevant sections and customize for your app.
--
-- Setup:
-- 1. Create free Supabase project at supabase.com
-- 2. Run this SQL in the SQL Editor
-- 3. Get your anon key and URL for your .env
--
-- ====================


-- ====================
-- 1. App Events Table (Generic)
-- ====================
-- Track user interactions in your app

CREATE TABLE IF NOT EXISTS app_events (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core fields
  event_name TEXT NOT NULL,           -- e.g., 'button_click', 'game_complete', 'form_submit'
  user_id TEXT,                       -- Anonymous or authenticated user ID
  session_id TEXT,                    -- Browser session
  
  -- Event data as flexible JSON
  properties JSONB DEFAULT '{}',      -- Any event-specific data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional: Extract common properties for faster queries
  -- variant TEXT GENERATED ALWAYS AS (properties->>'variant') STORED,
  -- score INTEGER GENERATED ALWAYS AS ((properties->>'score')::integer) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_events_name ON app_events(event_name);
CREATE INDEX IF NOT EXISTS idx_app_events_user ON app_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_events_created ON app_events(created_at DESC);

COMMENT ON TABLE app_events IS 'Generic event tracking for your app';


-- ====================
-- 2. Likes Table (Optional)
-- ====================
-- Simple anonymous likes/reactions

CREATE TABLE IF NOT EXISTS likes (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,            -- e.g., '/projects/my-app'
  user_fingerprint TEXT NOT NULL,     -- Anonymous identifier (hash of IP + UA)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(page_path, user_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_likes_path ON likes(page_path);

-- Function to get like count
CREATE OR REPLACE FUNCTION get_likes(p_path TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::integer FROM likes WHERE page_path = p_path;
$$ LANGUAGE sql STABLE;

-- Function to toggle like (returns new count)
CREATE OR REPLACE FUNCTION toggle_like(p_path TEXT, p_fingerprint TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM likes WHERE page_path = p_path AND user_fingerprint = p_fingerprint
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM likes WHERE page_path = p_path AND user_fingerprint = p_fingerprint;
  ELSE
    INSERT INTO likes (page_path, user_fingerprint) VALUES (p_path, p_fingerprint);
  END IF;
  
  RETURN get_likes(p_path);
END;
$$ LANGUAGE plpgsql;


-- ====================
-- 3. Stats View (Example)
-- ====================
-- Aggregate stats for your app

CREATE OR REPLACE VIEW v_app_stats AS
SELECT
  event_name,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM app_events
GROUP BY event_name;


-- ====================
-- 4. Row Level Security (RLS)
-- ====================
-- Enable RLS for production security

-- For app_events: Allow insert from anon, select for authenticated
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON app_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON app_events
  FOR SELECT TO authenticated USING (true);

-- For likes: Allow all operations from anon
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all likes operations" ON likes
  FOR ALL TO anon USING (true) WITH CHECK (true);


-- ====================
-- 5. API Access
-- ====================
-- Grant access to the anon role for API calls

GRANT SELECT, INSERT ON app_events TO anon;
GRANT SELECT, INSERT, DELETE ON likes TO anon;
GRANT USAGE ON SEQUENCE app_events_id_seq TO anon;
GRANT USAGE ON SEQUENCE likes_id_seq TO anon;
GRANT EXECUTE ON FUNCTION get_likes TO anon;
GRANT EXECUTE ON FUNCTION toggle_like TO anon;
