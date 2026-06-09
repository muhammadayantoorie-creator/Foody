-- Helper function to fetch user role without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.get_user_role(usr_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT raw_user_meta_data ->> 'role' FROM auth.users WHERE id = usr_id),
    'Customer'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

CREATE POLICY "Admins can manage all users"
ON users FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- =====================================================
-- RESTAURANTS TABLE POLICIES
-- =====================================================
-- Anyone (even unauthenticated) can view active restaurants for the dashboard
CREATE POLICY "Anyone can view active restaurants"
ON restaurants FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage restaurants"
ON restaurants FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- =====================================================
-- FOOD ITEMS TABLE POLICIES
-- =====================================================
CREATE POLICY "Anyone can view available food items"
ON food_items FOR SELECT
USING (is_available = true);

CREATE POLICY "Admins can manage food items"
ON food_items FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- =====================================================
-- CART TABLE POLICIES
-- =====================================================
CREATE POLICY "Users manage own cart"
ON cart FOR ALL
USING (auth.uid() = user_id);

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================
CREATE POLICY "Customers can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can cancel own pending orders"
ON orders FOR UPDATE
USING (auth.uid() = user_id AND status = 'Pending');

CREATE POLICY "Riders can view pending and active orders"
ON orders FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'Delivery Rider'
  AND status IN ('Pending', 'Preparing', 'Picked Up')
);

CREATE POLICY "Riders can update order status"
ON orders FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'Delivery Rider'
);

CREATE POLICY "Admins can manage all orders"
ON orders FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- =====================================================
-- ORDER ITEMS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
  OR public.get_user_role(auth.uid()) = 'Admin'
);

CREATE POLICY "Customers can insert order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users view own payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.user_id = auth.uid()
  )
  OR public.get_user_role(auth.uid()) = 'Admin'
);

CREATE POLICY "Customers can insert payments"
ON payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.user_id = auth.uid()
  )
);

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Users write own reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- DELIVERY TRACKING TABLE POLICIES
-- =====================================================
CREATE POLICY "Users view own tracking"
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

CREATE POLICY "Riders can insert tracking"
ON delivery_tracking FOR INSERT
WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders update tracking"
ON delivery_tracking FOR UPDATE
USING (
  auth.uid() = rider_id
  OR public.get_user_role(auth.uid()) = 'Admin'
);

-- =====================================================
-- APP SETTINGS TABLE POLICIES
-- =====================================================
CREATE POLICY "Anyone can view app settings"
ON app_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update app settings"
ON app_settings FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);
