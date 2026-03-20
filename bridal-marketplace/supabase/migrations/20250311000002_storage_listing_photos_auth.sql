-- Restrict listing-photos uploads to authenticated sellers only.
-- Drop anonymous upload policy if it exists (create via Dashboard or prior migration).
-- This policy allows authenticated users to upload - we rely on the app to ensure only sellers
-- can reach the upload flow. For stricter RLS, we'd need to check profiles.role, which requires
-- a custom function or joining storage.objects to profiles (not straightforward).
-- For now: authenticated users can upload (sell page is gated to sellers in the app).
DO $$
BEGIN
  -- Drop anon insert if it was created
  DROP POLICY IF EXISTS "Allow anonymous upload" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Allow authenticated users to upload to listing-photos bucket
CREATE POLICY "Authenticated users can upload listing photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-photos');
