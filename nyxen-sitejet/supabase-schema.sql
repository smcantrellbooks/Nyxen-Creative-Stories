-- Nyxen Creative Stories: Supabase Table Setup
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Conversations table (stores per-user conversation list)
CREATE TABLE IF NOT EXISTS conversations (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery table (stores per-user generated images)
CREATE TABLE IF NOT EXISTS gallery (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Snapshots table (stores per-user project snapshots)
CREATE TABLE IF NOT EXISTS snapshots (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles table (if not already created)
-- CREATE TABLE IF NOT EXISTS profiles (
--     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     tier TEXT DEFAULT 'Free',
--     points INTEGER DEFAULT 100
-- );

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can CRUD own conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own gallery" ON gallery
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own snapshots" ON snapshots
    FOR ALL USING (auth.uid() = user_id);
