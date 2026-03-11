-- Phase 4 Extensions: Storage Bucket for Dish Images
-- This script creates a public storage bucket for cooks to upload food photos.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Storage Security Policies

-- Policy: Anyone can view dish images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'dish-images');

-- Policy: Cooks can upload images
CREATE POLICY "Cooks can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'dish-images' 
    AND auth.role() = 'authenticated'
);

-- Policy: Cooks can update their own uploaded images
CREATE POLICY "Cooks can update their own images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'dish-images' 
    AND auth.role() = 'authenticated'
);

-- Policy: Cooks can delete their own uploaded images
CREATE POLICY "Cooks can delete their own images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'dish-images' 
    AND auth.role() = 'authenticated'
);
