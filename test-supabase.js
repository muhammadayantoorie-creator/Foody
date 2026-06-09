import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load .env manually since dotenv might not be installed, or parse it
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('Testing with Url:', supabaseUrl);
console.log('Testing with Key prefix:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) : 'none');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    // 1. Test Auth signIn
    console.log('\n--- 1. Testing Auth ---');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'customer@fooddash.com',
      password: 'Demo@1234'
    });
    if (authError) {
      console.log('❌ Auth failed:', authError.message);
    } else {
      console.log('✅ Auth succeeded! User ID:', authData.user.id);
    }

    // 2. Fetch Restaurants
    console.log('\n--- 2. Fetching Restaurants ---');
    const { data: rests, error: restError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restError) {
      console.log('❌ Failed to fetch restaurants:', restError.message);
    } else {
      console.log(`✅ Found ${rests.length} restaurants:`);
      rests.forEach(r => {
        console.log(`  - [${r.id}] ${r.name} (${r.cuisine || 'No cuisine'}, active: ${r.is_active})`);
      });
    }

    // 3. Fetch Food Items
    console.log('\n--- 3. Fetching Food Items ---');
    const { data: food, error: foodError } = await supabase
      .from('food_items')
      .select('*');
    
    if (foodError) {
      console.log('❌ Failed to fetch food items:', foodError.message);
    } else {
      console.log(`✅ Found ${food.length} food items:`);
      food.forEach(f => {
        console.log(`  - [${f.id}] ${f.name} (restaurant_id: ${f.restaurant_id}, price: ${f.price}, available: ${f.is_available})`);
      });
    }

    // 4. Check policy or users table
    console.log('\n--- 4. Fetching Users ---');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*');
    if (userError) {
      console.log('❌ Failed to fetch users:', userError.message);
    } else {
      console.log(`✅ Found ${users.length} users in public.users:`);
      users.forEach(u => console.log(`  - [${u.id}] ${u.email} (${u.role})`));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

run();
