-- Profiles: links auth.users to app user data (browser or seller)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('browser', 'seller')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  zip TEXT,
  wedding_date DATE,
  style_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shops: seller-specific details (one per seller profile)
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_description TEXT,
  location TEXT NOT NULL,
  zip TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(seller_id)
);

-- Add seller_id to listings (nullable for backwards compat with existing rows)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_shops_seller_id ON shops(seller_id);

-- Trigger: create profile when user signs up (role/name from raw_user_meta_data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email, zip, wedding_date, style_ids)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'browser'),
    COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))),
    NEW.email,
    NEW.raw_user_meta_data->>'zip',
    (NEW.raw_user_meta_data->>'wedding_date')::date,
    COALESCE(
      (SELECT array_agg(x) FROM jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'style_ids', '[]'::jsonb)) AS x),
      '{}'::text[]
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS for profiles: users can read/write own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS for shops: sellers can read/write own shop
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own shop" ON shops
  FOR SELECT
  USING (
    seller_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Sellers can insert own shop" ON shops
  FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Sellers can update own shop" ON shops
  FOR UPDATE
  USING (
    seller_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );
