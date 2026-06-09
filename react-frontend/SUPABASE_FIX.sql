-- =====================================================
-- SUPABASE FIX: Infinite Recursion + Schema Fix
-- 
-- Run this ENTIRE script in Supabase SQL Editor:
-- supabase.com → Your Project → SQL Editor → Paste & Run
--
-- This fixes: "infinite recursion detected in policy"
-- =====================================================

-- ── STEP 1: Create helper function (bypasses RLS recursion) ──────────────
-- This function reads user role WITHOUT triggering RLS policies,
-- solving the infinite recursion problem.
CREATE OR REPLACE FUNCTION public.get_user_role(usr_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT raw_user_meta_data ->> 'role' FROM auth.users WHERE id = usr_id),
    'Customer'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── STEP 2: Drop ALL existing policies to start fresh ───────────────────
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ── STEP 3: Enable RLS on all tables ────────────────────────────────────
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_settings ENABLE ROW LEVEL SECURITY;

-- ── STEP 4: USERS TABLE POLICIES ────────────────────────────────────────
-- Users see only their own profile
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "users_insert_own"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Admins can see all users (uses helper to avoid recursion)
CREATE POLICY "users_admin_all"
ON users FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin');

-- ── STEP 5: RESTAURANTS TABLE POLICIES ──────────────────────────────────
-- Anyone (including unauthenticated) can view active restaurants
CREATE POLICY "restaurants_public_select"
ON restaurants FOR SELECT
USING (is_active = true);

-- Admins can manage all restaurants
CREATE POLICY "restaurants_admin_all"
ON restaurants FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin');

-- ── STEP 6: FOOD ITEMS TABLE POLICIES ───────────────────────────────────
-- Anyone can view available food items (needed for the menu page)
CREATE POLICY "food_items_public_select"
ON food_items FOR SELECT
USING (is_available = true);

-- Admins can manage food items
CREATE POLICY "food_items_admin_all"
ON food_items FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin');

-- ── STEP 7: CART TABLE POLICIES ─────────────────────────────────────────
CREATE POLICY "cart_user_all"
ON cart FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ── STEP 8: ORDERS TABLE POLICIES ───────────────────────────────────────
CREATE POLICY "orders_customer_select"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "orders_customer_insert"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_customer_cancel"
ON orders FOR UPDATE
USING (auth.uid() = user_id AND status = 'Pending');

CREATE POLICY "orders_rider_select"
ON orders FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'Delivery Rider'
  AND status IN ('Pending', 'Preparing', 'Picked Up')
);

CREATE POLICY "orders_rider_update"
ON orders FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'Delivery Rider');

CREATE POLICY "orders_admin_all"
ON orders FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin');

-- ── STEP 9: ORDER ITEMS TABLE POLICIES ──────────────────────────────────
CREATE POLICY "order_items_customer_select"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
  OR public.get_user_role(auth.uid()) = 'Admin'
);

CREATE POLICY "order_items_customer_insert"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- ── STEP 10: PAYMENTS TABLE POLICIES ────────────────────────────────────
CREATE POLICY "payments_customer_select"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.user_id = auth.uid()
  )
  OR public.get_user_role(auth.uid()) = 'Admin'
);

CREATE POLICY "payments_customer_insert"
ON payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.user_id = auth.uid()
  )
);

-- ── STEP 11: REVIEWS TABLE POLICIES ─────────────────────────────────────
CREATE POLICY "reviews_public_read"
ON reviews FOR SELECT USING (true);

CREATE POLICY "reviews_user_insert"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ── STEP 12: DELIVERY TRACKING TABLE POLICIES ───────────────────────────
CREATE POLICY "tracking_select"
ON delivery_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = delivery_tracking.order_id
    AND orders.user_id = auth.uid()
  )
  OR auth.uid() = rider_id
  OR public.get_user_role(auth.uid()) = 'Admin'
);

CREATE POLICY "tracking_rider_insert"
ON delivery_tracking FOR INSERT
WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "tracking_rider_update"
ON delivery_tracking FOR UPDATE
USING (
  auth.uid() = rider_id
  OR public.get_user_role(auth.uid()) = 'Admin'
);

-- ── STEP 13: APP SETTINGS TABLE POLICIES ────────────────────────────────
CREATE POLICY "app_settings_public_read"
ON app_settings FOR SELECT USING (true);

CREATE POLICY "app_settings_admin_all"
ON app_settings FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin');

-- ── DONE ─────────────────────────────────────────────────────────────────
-- If this ran without errors, your Supabase RLS is now fixed.
-- The food items and restaurant pages should load correctly now.
SELECT 'RLS fix applied successfully! 🎉' AS status;
