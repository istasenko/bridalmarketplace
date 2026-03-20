-- Replace anonymous insert with authenticated seller-only insert
DROP POLICY IF EXISTS "Allow anonymous insert" ON listings;

CREATE POLICY "Authenticated sellers can insert listings" ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );
