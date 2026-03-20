-- Create listing-photos storage bucket (required for image uploads).
-- The original migration had this commented out; without it, uploads fail with "Bucket not found".
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read so uploaded images can be displayed on listing pages
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listing-photos');
