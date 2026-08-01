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
  ('11111111-1111-1111-1111-111111111111', 'Pearl Continental (PC) Hotel', 'Royal 5-star Mughlai fine dining & buffet', 'Shahrah-e-Quaid-e-Azam, Mall Road', 'Lahore', 4.9, '25-35 mins', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Kolachi Seaside Restaurant', 'Waterfront BBQ & Karahi at Do Darya', 'Phase 8, Do Darya, Clifton', 'Karachi', 4.9, '20-30 mins', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', true),
  ('33333333-3333-3333-3333-333333333333', 'Monal Mount View', 'Iconic Margalla hilltop BBQ & Shinwari', 'Pir Sohawa Road', 'Islamabad', 4.9, '25-35 mins', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'Cheezious Pakistan', 'Famous Crown Crust Pizza & Gourmet Burgers', 'F-7 Markaz', 'Islamabad', 4.9, '15-25 mins', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', true),
  ('55555555-5555-5555-5555-555555555555', 'Student Biryani', 'Legendary authentic Karachi Dum Biryani', 'Saddar', 'Karachi', 4.8, '15-20 mins', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', true),
  ('66666666-6666-6666-6666-666666666666', 'Savour Foods', 'Iconic Chicken Pulao Kabab & Zarda', 'Blue Area', 'Islamabad', 4.9, '15-25 mins', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', true),
  ('77777777-7777-7777-7777-777777777777', 'Butt Karahi', 'Authentic Lakshmi Chowk Desi Ghee Mutton Karahi', 'Lakshmi Chowk, McLeod Rd', 'Lahore', 4.9, '20-30 mins', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', true);

-- Sample Food Items for Cheezious
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg, image_url) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Crown Crust Pizza', 'Molten cheese stuffed crown crust with chicken tikka & veggies', 6.50, 'Crown Crust & Pizza', false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'),
  ('44444444-4444-4444-4444-444444444444', 'Cheezious Bargarh', 'Crispy double fried zinger chicken with jalapeno cheese sauce', 3.50, 'Burgers', false, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80');

-- Sample Food Items for Student Biryani
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg, image_url) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Special Chicken Dum Biryani', 'Spicy Karachi style biryani with double chicken piece, raita & salad', 2.50, 'Biryani & Pulao', false, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80');

-- Sample Food Items for Butt Karahi
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg, image_url) VALUES
  ('77777777-7777-7777-7777-777777777777', 'Desi Ghee Mutton Karahi (Full)', 'Fresh mutton cooked in pure organic Desi Ghee with green chilies & ginger', 8.99, 'Desi Karahi', false, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80');
