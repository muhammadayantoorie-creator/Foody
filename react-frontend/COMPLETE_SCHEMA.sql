-- =====================================================
-- COMPLETE SCHEMA FOR FOODDASH APP
-- This matches the React app code exactly.
-- Run this ENTIRE script in Supabase SQL Editor.
-- =====================================================

-- Drop all tables in correct order (dependent tables first)
DROP TABLE IF EXISTS delivery_tracking CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS food_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone_number TEXT,
    address TEXT,
    role TEXT CHECK (role IN ('Customer', 'Admin', 'Delivery Rider')) DEFAULT 'Customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. RESTAURANTS TABLE
-- =====================================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    rating NUMERIC(3,1) DEFAULT 4.0,
    delivery_time TEXT DEFAULT '30-45 mins',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. FOOD ITEMS (MENU) TABLE
-- =====================================================
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category TEXT,
    is_veg BOOLEAN DEFAULT false,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CART TABLE
-- =====================================================
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, food_item_id)
);

-- =====================================================
-- 5. ORDERS TABLE
-- Status values match what the app uses
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE RESTRICT,
    status TEXT CHECK (status IN ('Pending', 'Preparing', 'Picked Up', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
    total_amount NUMERIC(10,2) NOT NULL,
    delivery_address TEXT NOT NULL DEFAULT '',
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. ORDER ITEMS TABLE
-- Uses 'price' column (not 'price_at_time')
-- =====================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- =====================================================
-- 7. PAYMENTS TABLE
-- Uses 'status' column (not 'payment_status')
-- =====================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('Cash on Delivery', 'Card', 'JazzCash', 'EasyPaisa')),
    status TEXT CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')) DEFAULT 'Pending',
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. DELIVERY TRACKING TABLE
-- Uses 'status' column (not 'current_status')
-- =====================================================
CREATE TABLE delivery_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('Pending', 'Preparing', 'Picked Up', 'Delivered')) DEFAULT 'Preparing',
    location TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. APP SETTINGS TABLE
-- =====================================================
CREATE TABLE app_settings (
    id BIGINT PRIMARY KEY,
    app_name TEXT DEFAULT 'FoodDash',
    support_email TEXT DEFAULT 'support@fooddash.com',
    delivery_fee NUMERIC(10,2) DEFAULT 2.99,
    min_order NUMERIC(10,2) DEFAULT 10.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (id, app_name, support_email, delivery_fee, min_order)
VALUES (1, 'FoodDash', 'support@fooddash.com', 2.99, 10.00)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample Restaurants with real Unsplash images
INSERT INTO restaurants (id, name, description, address, city, rating, delivery_time, image_url, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'KFC', 'Finger Lickin'' Good crispy fried chicken', 'Gulberg III, Lahore', 'Lahore', 4.5, '30-40 mins', 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'McDonald''s', 'I''m Lovin'' It — burgers and more', 'DHA Phase 5, Lahore', 'Lahore', 4.2, '25-35 mins', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80', true),
  ('33333333-3333-3333-3333-333333333333', 'Savour Foods', 'Famous traditional Pulao Kabab', 'Blue Area, Islamabad', 'Islamabad', 4.8, '20-30 mins', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'Pizza Hut', 'World''s favourite pizza chain', 'Main Boulevard, Lahore', 'Lahore', 4.3, '35-45 mins', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true),
  ('55555555-5555-5555-5555-555555555555', 'Burger Lab', 'Gourmet smash burgers & shakes', 'Defence, Lahore', 'Lahore', 4.7, '20-30 mins', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', true);

-- Sample Food Items for KFC
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg, image_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Zinger Burger', 'Crispy chicken fillet with lettuce and mayo', 5.50, 'Burgers', false, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'),
  ('11111111-1111-1111-1111-111111111111', 'Hot Wings (6 pcs)', 'Spicy crispy chicken wings', 4.99, 'Chicken', false, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=400&q=80'),
  ('11111111-1111-1111-1111-111111111111', 'Regular Fries', 'Golden salted fries', 2.49, 'Sides', true, 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=400&q=80');

-- Sample Food Items for McDonald's
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg, image_url) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Big Mac', 'Double beef patty with special sauce', 6.50, 'Burgers', false, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=400&q=80'),
  ('22222222-2222-2222-2222-222222222222', 'McChicken', 'Crispy chicken patty sandwich', 5.00, 'Burgers', false, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=400&q=80'),
  ('22222222-2222-2222-2222-222222222222', 'McFlurry Oreo', 'Creamy vanilla ice cream with Oreo', 3.50, 'Desserts', true, 'https://images.unsplash.com/photo-1545345341-9f0d2aa2ba68?auto=format&fit=crop&w=400&q=80');

-- Sample Food Items for Pizza Hut
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg, image_url) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Pepperoni Pizza', 'Classic hand-tossed pepperoni pizza', 12.99, 'Pizza', false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'),
  ('44444444-4444-4444-4444-444444444444', 'Veggie Supreme', 'Loaded with fresh garden vegetables', 11.49, 'Pizza', true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80'),
  ('44444444-4444-4444-4444-444444444444', 'Garlic Bread', 'Toasted garlic herb breadsticks', 3.99, 'Sides', true, 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?auto=format&fit=crop&w=400&q=80');
