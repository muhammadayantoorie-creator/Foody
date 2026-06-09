import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Missing Supabase credentials!\n' +
    'Make sure your react-frontend/.env file contains:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJ... (the anon/public JWT key)\n\n' +
    'Find your keys at: https://supabase.com → Settings → API'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'fooddash-app',
      },
    },
  }
);

// Connection health check (runs once on app load)
supabase
  .from('restaurants')
  .select('id', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('⚠️ Supabase connection issue:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  });
