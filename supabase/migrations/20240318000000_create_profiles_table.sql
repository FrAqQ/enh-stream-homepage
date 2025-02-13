
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    plan TEXT DEFAULT 'Free',
    follower_plan TEXT DEFAULT 'None',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Trigger can insert user profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    TO authenticated, anon
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Trigger can insert user profiles"
    ON public.profiles
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Create a trigger to set updated_at on row update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, plan)
    VALUES (NEW.id, NEW.email, 'Free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Backfill existing users
INSERT INTO public.profiles (id, email, plan)
SELECT id, email, 'Free'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
