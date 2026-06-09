-- Drop tables if they exist to prevent errors on recreation
DROP TABLE IF EXISTS delivery_tracking CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS food_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Will map to auth.users.id
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    role TEXT CHECK (role IN ('Customer', 'Admin', 'Delivery Rider')) DEFAULT 'Customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Restaurants Table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    rating NUMERIC(3,1) DEFAULT 0.0,
    delivery_time TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Food Items (Menu) Table
CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category TEXT, -- e.g., 'Pizza', 'Burger', 'Desi'
    is_veg BOOLEAN DEFAULT false,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Cart Table (Simple cart implementation)
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, food_item_id) -- Prevents duplicate entries for the same item
);

-- 5. Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE RESTRICT,
    status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
    total_amount NUMERIC(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    food_item_id INTEGER REFERENCES food_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price_at_time NUMERIC(10,2) NOT NULL -- Store price in case it changes later
);

-- 7. Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('Cash on Delivery', 'Credit Card', 'Debit Card', 'JazzCash', 'EasyPaisa')),
    payment_status TEXT CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')) DEFAULT 'Pending',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. Delivery Tracking Table
CREATE TABLE delivery_tracking (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    rider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_status TEXT CHECK (current_status IN ('Waiting for Rider', 'Rider Assigned', 'At Restaurant', 'Picked Up', 'On the Way', 'Arrived', 'Delivered')),
    location_lat NUMERIC(10,6), -- Latitude
    location_lng NUMERIC(10,6), -- Longitude
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);


-- ==========================================
-- SAMPLE DATA (MOCK DATA)
-- ==========================================

-- Note: In a real app, users are created via Supabase Auth. 
-- For this sample, we use placeholder UUIDs to simulate existing auth records.
-- Replace these UUIDs with actual auth.users IDs when testing relationships.

-- Create a dummy user (Customer)
INSERT INTO users (id, email, full_name, phone_number, address, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'customer@test.com', 'Ali Khan', '03001234567', 'DHA Phase 5, Lahore', 'Customer');

-- Create a dummy user (Delivery Rider)
INSERT INTO users (id, email, full_name, phone_number, role) 
VALUES ('00000000-0000-0000-0000-000000000002', 'rider@test.com', 'Ahmed Raza', '03009876543', 'Delivery Rider');

-- Sample Restaurants
INSERT INTO restaurants (name, description, address, city, rating, delivery_time, image_url) VALUES
('KFC', 'Finger Lickin Good', 'Gulberg III', 'Lahore', 4.5, '30-40 mins', 'https://example.com/kfc.jpg'),
('McDonalds', 'I''m lovin it', 'DHA Phase 5', 'Lahore', 4.2, '25-35 mins', 'https://example.com/mcd.jpg'),
('Savour Foods', 'Famous Pulao Kabab', 'Blue Area', 'Islamabad', 4.8, '20-30 mins', 'https://example.com/savour.jpg');

-- Sample Food Items
INSERT INTO food_items (restaurant_id, name, description, price, category, is_veg) VALUES
(1, 'Zinger Burger', 'Crispy chicken fillet with mayo and lettuce', 550.00, 'Burgers', false),
(1, 'Fries', 'Regular salted fries', 250.00, 'Sides', true),
(2, 'Big Mac', 'Double beef patty burger', 650.00, 'Burgers', false),
(3, 'Chicken Pulao', 'Traditional rice with chicken piece and kabab', 450.00, 'Desi', false);

-- Sample Order
INSERT INTO orders (user_id, restaurant_id, status, total_amount, delivery_address) VALUES
('00000000-0000-0000-0000-000000000001', 1, 'Out for Delivery', 800.00, 'DHA Phase 5, Lahore');

-- Sample Order Items
INSERT INTO order_items (order_id, food_item_id, quantity, price_at_time) VALUES
(1, 1, 1, 550.00), -- 1 Zinger
(1, 2, 1, 250.00); -- 1 Fries

-- Sample Payment
INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES
(1, 800.00, 'Cash on Delivery', 'Pending');

-- Sample Delivery Tracking
INSERT INTO delivery_tracking (order_id, rider_id, current_status) VALUES
(1, '00000000-0000-0000-0000-000000000002', 'On the Way');

-- 10. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
    id INT8 PRIMARY KEY,
    app_name TEXT,
    support_email TEXT,
    delivery_fee NUMERIC(10,2),
    min_order NUMERIC(10,2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert default app settings
INSERT INTO app_settings (id, app_name, support_email, delivery_fee, min_order) 
VALUES (1, 'Foodie Express', 'support@foodieexpress.com', 50.00, 200.00)
ON CONFLICT (id) DO NOTHING;
