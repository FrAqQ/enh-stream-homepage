-- Drop the table if it exists (to handle potential recreation)
DROP TABLE IF EXISTS viewer_counts;

-- Create viewer_counts table
CREATE TABLE viewer_counts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    viewer_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE viewer_counts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own viewer count" ON viewer_counts;
DROP POLICY IF EXISTS "Users can update their own viewer count" ON viewer_counts;
DROP POLICY IF EXISTS "Users can insert their own viewer count" ON viewer_counts;

-- Create new policies
CREATE POLICY "Users can view their own viewer count"
    ON viewer_counts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own viewer count"
    ON viewer_counts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own viewer count"
    ON viewer_counts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS viewer_counts_user_id_idx ON viewer_counts(user_id);