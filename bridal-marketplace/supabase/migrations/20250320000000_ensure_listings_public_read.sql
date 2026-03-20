-- Ensure listings can be read by anonymous users (required for viewing listing detail pages).
-- If this policy was missing, newly created listings would 404 when viewed.
DROP POLICY IF EXISTS "Allow public read" ON listings;
CREATE POLICY "Allow public read"
  ON listings
  FOR SELECT
  TO anon
  USING (true);
