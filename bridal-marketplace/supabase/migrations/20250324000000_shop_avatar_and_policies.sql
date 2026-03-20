-- Add avatar and shop policies to shops table.
ALTER TABLE shops ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS shop_policies TEXT;
