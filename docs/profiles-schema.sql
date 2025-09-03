-- Create profiles table for user profile data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    role TEXT,
    location TEXT,
    public_slug TEXT UNIQUE,
    hourly_rate_ai_min DECIMAL(10,2),
    hourly_rate_ai_max DECIMAL(10,2),
    experience_years INTEGER,
    skills JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    visibility_settings JSONB DEFAULT '{
        "bio": true,
        "skills": true,
        "experience": true,
        "socialLinks": true,
        "hourlyRate": true,
        "projects": true,
        "feedback": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_email ON public.profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_profiles_public_slug ON public.profiles(public_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

-- Public profiles can be read by anyone
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (is_public = true);
