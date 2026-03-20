-- Allow anyone to read shop details (for buyer view of shop pages)
DROP POLICY IF EXISTS "Allow public read" ON shops;
CREATE POLICY "Allow public read"
  ON shops
  FOR SELECT
  TO anon
  USING (true);
