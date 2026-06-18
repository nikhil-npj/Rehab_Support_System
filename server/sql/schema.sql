-- SQL Schema for RehabTrack Database

-- Profiles table storing patient and physiotherapist profile information linked to Supabase Auth Users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'physio')),
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles:
-- 1. Users can read their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Note: Since profile creation is handled via our backend running with the Service Role key, 
-- backend inserts will bypass RLS.
