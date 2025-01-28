-- Create stream_stats table
CREATE TABLE IF NOT EXISTS public.stream_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    stream_url TEXT NOT NULL,
    viewer_count INTEGER NOT NULL,
    chatter_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.stream_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own stream stats" 
    ON public.stream_stats FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stream stats" 
    ON public.stream_stats FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX stream_stats_user_id_idx ON stream_stats(user_id);
CREATE INDEX stream_stats_created_at_idx ON stream_stats(created_at);