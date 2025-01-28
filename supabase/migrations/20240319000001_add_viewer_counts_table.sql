-- Create viewer_counts table
CREATE TABLE IF NOT EXISTS viewer_counts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    viewer_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE viewer_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own viewer count"
    ON viewer_counts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own viewer count"
    ON viewer_counts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own viewer count"
    ON viewer_counts FOR INSERT
    WITH CHECK (auth.uid() = user_id);