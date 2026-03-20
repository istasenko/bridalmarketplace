-- Add view and contact stats for seller analytics
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_count INTEGER NOT NULL DEFAULT 0;

-- Atomic increment function (avoids read-then-write race, handles null)
CREATE OR REPLACE FUNCTION increment_listing_stat(p_listing_id UUID, p_column TEXT)
RETURNS void AS $$
BEGIN
  IF p_column = 'view_count' THEN
    UPDATE listings SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_listing_id;
  ELSIF p_column = 'contact_count' THEN
    UPDATE listings SET contact_count = COALESCE(contact_count, 0) + 1 WHERE id = p_listing_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
