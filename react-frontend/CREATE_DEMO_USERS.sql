-- =====================================================
-- CREATE DEMO USERS FOR FOODDASH APP
-- Run this in Supabase SQL Editor
-- This uses Supabase's admin auth function to create
-- users AND their profiles in one go.
-- =====================================================

-- Create Customer Demo Account
DO $$
DECLARE
  customer_id UUID;
  rider_id UUID;
  admin_id UUID;
BEGIN

  -- ── Create Customer ──────────────────────────────
  customer_id := (
    SELECT id FROM auth.users WHERE email = 'customer@fooddash.com' LIMIT 1
  );

  IF customer_id IS NULL THEN
    customer_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, role, aud
    ) VALUES (
      customer_id,
      '00000000-0000-0000-0000-000000000000',
      'customer@fooddash.com',
      crypt('Demo@1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"Customer","full_name":"Alex Customer"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  -- Insert/update customer profile
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (customer_id, 'customer@fooddash.com', 'Alex Customer', 'Customer')
  ON CONFLICT (id) DO UPDATE SET role = 'Customer', full_name = 'Alex Customer';

  -- ── Create Delivery Rider ─────────────────────────
  rider_id := (
    SELECT id FROM auth.users WHERE email = 'rider@fooddash.com' LIMIT 1
  );

  IF rider_id IS NULL THEN
    rider_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, role, aud
    ) VALUES (
      rider_id,
      '00000000-0000-0000-0000-000000000000',
      'rider@fooddash.com',
      crypt('Demo@1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"Delivery Rider","full_name":"Sam Rider"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  -- Insert/update rider profile
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (rider_id, 'rider@fooddash.com', 'Sam Rider', 'Delivery Rider')
  ON CONFLICT (id) DO UPDATE SET role = 'Delivery Rider', full_name = 'Sam Rider';

  -- ── Create Admin ──────────────────────────────────
  admin_id := (
    SELECT id FROM auth.users WHERE email = 'admin@fooddash.com' LIMIT 1
  );

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, role, aud
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@fooddash.com',
      crypt('Demo@1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"Admin","full_name":"Admin User"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  -- Insert/update admin profile
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (admin_id, 'admin@fooddash.com', 'Admin User', 'Admin')
  ON CONFLICT (id) DO UPDATE SET role = 'Admin', full_name = 'Admin User';

  RAISE NOTICE '✅ Demo users created successfully!';
  RAISE NOTICE '  Customer: customer@fooddash.com / Demo@1234';
  RAISE NOTICE '  Rider:    rider@fooddash.com / Demo@1234';
  RAISE NOTICE '  Admin:    admin@fooddash.com / Demo@1234';

END $$;
