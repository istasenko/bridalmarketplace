-- Allow any authenticated user to create a shop (unified buyer/seller).
-- When a shop is created, upgrade the profile to seller so listings RLS works.

-- Relax shops INSERT: any authenticated user can create their own shop
DROP POLICY IF EXISTS "Sellers can insert own shop" ON shops;
CREATE POLICY "Authenticated users can insert own shop" ON shops
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- Trigger: when a shop is created, set profile.role to 'seller'
CREATE OR REPLACE FUNCTION public.handle_shop_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'seller', updated_at = NOW()
  WHERE id = NEW.seller_id AND role != 'seller';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_shop_created ON shops;
CREATE TRIGGER on_shop_created
  AFTER INSERT ON shops
  FOR EACH ROW EXECUTE FUNCTION public.handle_shop_created();
