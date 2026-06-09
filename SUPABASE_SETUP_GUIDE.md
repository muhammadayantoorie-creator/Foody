# 🚀 Supabase Setup Guide for FoodDash

## Step 1: Get Your Credentials

1. Go to [supabase.com](https://supabase.com) and log in.
2. Open your project: **tjcvaqrrfbbpguehmsbk**
3. Go to **Settings → API**
4. Copy:
   - **Project URL**: `https://tjcvaqrrfbbpguehmsbk.supabase.co`
   - **anon / public** key (the long `eyJ...` JWT key — NOT the `sb_publishable_` key)

## Step 2: Update .env File

Open `react-frontend/.env` and make sure it looks like:

```
VITE_SUPABASE_URL=https://tjcvaqrrfbbpguehmsbk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **IMPORTANT**: The anon key MUST start with `eyJ` (JWT format), NOT `sb_publishable_`.

## Step 3: Run the Complete Schema SQL

Go to your Supabase Dashboard → **SQL Editor** → **New Query**.

Copy and paste the ENTIRE contents of `COMPLETE_SCHEMA.sql` (in this folder) and click **Run**.

## Step 4: Run the RLS Policies

After the schema runs successfully, create another **New Query** and paste the contents of `COMPLETE_RLS.sql`.

## Step 5: Restart the Dev Server

```
npm run dev
```

---

## Troubleshooting

### "Supabase not connected" / blank page
- Check your `.env` file has the correct `VITE_SUPABASE_ANON_KEY` (should be the long `eyJ...` JWT)
- Make sure the dev server was restarted after updating `.env`

### "Cannot read properties of null"
- The tables may not have been created. Run the SQL schema again.

### RLS permission errors  
- Run the RLS policies SQL script.
- Make sure email confirmation is disabled in Supabase Auth settings for local testing.

### Orders failing to save
- Check that `order_items` has a `price` column (not `price_at_time`)
- Check that `payments` has a `status` column (not `payment_status`)
