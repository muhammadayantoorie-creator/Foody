-- Helper function to fetch user role without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.get_user_role(usr_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT raw_user_meta_data ->> 'role' FROM auth.users WHERE id = usr_id),
    'Customer'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- *** CRITICAL: Users must be able to INSERT their own profile row on signup ***
-- Without this, the upsert in signUp() is blocked by RLS and new users have no role in DB
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
ON users FOR SELECT 
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users"
ON users FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- ==========================================
-- RESTAURANTS TABLE POLICIES
-- ==========================================
-- Anyone can view active restaurants
CREATE POLICY "Anyone can view active restaurants" 
ON restaurants FOR SELECT 
USING (is_active = true);

-- Admins can view all restaurants and perform all actions
CREATE POLICY "Admins can manage restaurants" 
ON restaurants FOR ALL 
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- ==========================================
-- FOOD ITEMS TABLE POLICIES
-- ==========================================
-- Anyone can view available food items
CREATE POLICY "Anyone can view available food items" 
ON food_items FOR SELECT 
USING (is_available = true);

-- Admins can manage food items
CREATE POLICY "Admins can manage food items" 
ON food_items FOR ALL 
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- ==========================================
-- ORDERS TABLE POLICIES
-- ==========================================
-- NOTE: The orders table uses 'user_id' (not 'customer_id' or 'rider_id')

-- Customers can view their own orders (using correct column: user_id)
CREATE POLICY "Customers can view their own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Customers can create orders
CREATE POLICY "Customers can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Riders can view Pending/Preparing orders or their assigned ones
CREATE POLICY "Riders can view assigned orders" 
ON orders FOR SELECT 
USING (
  public.get_user_role(auth.uid()) = 'Delivery Rider'
  AND status IN ('Pending', 'Preparing', 'Out for Delivery')
);

-- Riders can update order status
CREATE POLICY "Riders can update order status" 
ON orders FOR UPDATE 
USING (
  public.get_user_role(auth.uid()) = 'Delivery Rider'
);

-- Admins can view and manage all orders
CREATE POLICY "Admins can manage all orders" 
ON orders FOR ALL 
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);

-- ==========================================
-- ADDITIONAL TABLE RLS (missing from original)
-- ==========================================
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Cart: users manage only their own cart
CREATE POLICY "Users manage own cart" ON cart FOR ALL USING (auth.uid() = user_id);

-- Order items: visible to the order owner and admins
CREATE POLICY "Users view own order items" ON order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  OR public.get_user_role(auth.uid()) = 'Admin'
);

-- Payments: visible to order owner and admins
CREATE POLICY "Users view own payments" ON payments FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
  OR public.get_user_role(auth.uid()) = 'Admin'
);

-- Reviews: public read, owner write
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users write own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delivery tracking: visible to order owner, riders, and admins
CREATE POLICY "Users view own tracking" ON delivery_tracking FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = delivery_tracking.order_id AND orders.user_id = auth.uid())
  OR auth.uid() = rider_id
  OR public.get_user_role(auth.uid()) = 'Admin'
);

-- Riders can update delivery tracking
CREATE POLICY "Riders update tracking" ON delivery_tracking FOR UPDATE
USING (auth.uid() = rider_id OR public.get_user_role(auth.uid()) = 'Admin');

-- ==========================================
-- APP SETTINGS TABLE POLICIES
-- ==========================================
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view app settings
CREATE POLICY "Anyone can view app settings" 
ON app_settings FOR SELECT 
USING (true);

-- Admins can update app settings
CREATE POLICY "Admins can update app settings" 
ON app_settings FOR UPDATE 
USING (
  public.get_user_role(auth.uid()) = 'Admin'
);
