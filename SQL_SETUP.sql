-- Run all of this in Supabase SQL Editor

-- Messages table (agent chat history)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT,
  role TEXT,
  content TEXT,
  display TEXT,
  who TEXT,
  ts BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Campaign context (Google Drive sync cache)
CREATE TABLE IF NOT EXISTS campaign_context (
  id TEXT PRIMARY KEY,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE campaign_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON campaign_context FOR ALL USING (true) WITH CHECK (true);

-- Platform settings (Facebook/Instagram credentials)
CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY,
  credentials TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON platform_settings FOR ALL USING (true) WITH CHECK (true);

-- Scheduled posts
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT,
  caption TEXT,
  image_b64 TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON scheduled_posts FOR ALL USING (true) WITH CHECK (true);

-- Supabase Storage: create bucket named 'posts' (public) manually in dashboard
