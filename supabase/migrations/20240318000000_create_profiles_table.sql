
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    plan TEXT DEFAULT 'Free',
    follower_plan TEXT DEFAULT 'None',
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Trigger can insert user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Trigger can insert user profiles"
    ON public.profiles
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (is_admin = true);

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
DECLARE
    profile_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = NEW.id
    ) INTO profile_exists;
    
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (id, email, plan)
        VALUES (NEW.id, NEW.email, 'Free');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO service_role;

-- Backfill existing users
INSERT INTO public.profiles (id, email, plan)
SELECT id, email, 'Free'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set specific user as admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'tino@strasser.exchange';

