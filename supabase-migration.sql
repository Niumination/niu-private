-- Niu Private - Supabase Database Setup
-- Run this SQL in your Supabase SQL editor

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sha TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable full-text search
ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(name, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(array_to_string(tags, ' '), '')
    )
  ) STORED;

-- Create indexes
CREATE INDEX IF NOT EXISTS documents_search_idx ON documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);

-- Row Level Security (optional - for multi-user setup later)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (via API key)
CREATE POLICY "Allow all for service role" ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
