-- Create listings table for EverAfter marketplace
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('like new', 'gently used', 'used')),
  category_id TEXT NOT NULL,
  style_ids TEXT[] NOT NULL DEFAULT '{}',
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  quantity INTEGER DEFAULT 1,
  delivery_option TEXT NOT NULL CHECK (delivery_option IN ('pickup_only', 'ship_only', 'both')) DEFAULT 'both',
  seller_name TEXT NOT NULL,
  seller_location TEXT NOT NULL,
  seller_zip TEXT NOT NULL,
  seller_lat NUMERIC,
  seller_lng NUMERIC,
  seller_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (allow anon insert for now; can restrict when auth is added)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON listings
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read" ON listings
  FOR SELECT TO anon
  USING (true);

-- Create storage bucket for listing photos (run in Supabase Dashboard SQL or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);
-- CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'listing-photos');
-- CREATE POLICY "Allow anonymous upload" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'listing-photos');
