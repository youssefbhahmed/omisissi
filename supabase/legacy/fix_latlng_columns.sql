-- Add separate lat/lng columns to profiles for easy JS access
-- (The PostGIS 'location' column is still used by the RPC function for distance math)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lat FLOAT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lng FLOAT;
