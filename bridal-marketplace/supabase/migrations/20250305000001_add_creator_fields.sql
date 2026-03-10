-- Add creator/listing kind fields for hybrid reseller vs creator flow

ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_kind TEXT CHECK (listing_kind IN ('reselling', 'creator')) DEFAULT 'reselling';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS creator_listing_type TEXT CHECK (creator_listing_type IN ('handmade', 'vintage', 'craft_supplies'));
ALTER TABLE listings ADD COLUMN IF NOT EXISTS made_to_order BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;

-- Update condition check to allow 'new' for creator listings
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_condition_check;
ALTER TABLE listings ADD CONSTRAINT listings_condition_check
  CHECK (condition IN ('new', 'like new', 'gently used', 'used'));
