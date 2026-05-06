-- Phase 2: Storage Setup

-- 1. Create the rental-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-images', 'rental-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Public Access for the bucket
-- Allow anyone to view files in the rental-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'rental-images' );

-- Note: No public INSERT, UPDATE, or DELETE policies are added.
-- File uploads will be handled server-side via API routes using the SUPABASE_SERVICE_ROLE_KEY.
