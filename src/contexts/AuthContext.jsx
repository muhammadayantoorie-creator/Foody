import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

// Helper: fetch role from public.users table (source of truth)
async function fetchUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data.role;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        // Prefer role from public.users table over user_metadata (source of truth)
        const dbRole = await fetchUserRole(sessionUser.id);
        setRole(dbRole ?? sessionUser.user_metadata?.role ?? 'Customer');
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        const dbRole = await fetchUserRole(sessionUser.id);
        setRole(dbRole ?? sessionUser.user_metadata?.role ?? 'Customer');
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign Up — creates auth user AND inserts a public profile row
  const signUp = async (email, password, userRole = 'Customer', fullName = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: userRole },
      },
    });
    if (error) throw error;

    // Insert profile row into public.users
    // Use upsert so re-registrations don't crash (e.g. email confirmation resend)
    if (data?.user) {
      const { error: profileError } = await supabase.from('users').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName || email.split('@')[0], // fallback to email prefix
        role: userRole,
      });
      // Log but don't throw — auth succeeded, profile insert is best-effort
      if (profileError) {
        console.warn('[AuthContext] Failed to create user profile:', profileError.message);
      }
    }

    return data;
  };

  // Sign In
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Forgot Password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  };

  const value = {
    signUp,
    signIn,
    signOut,
    resetPassword,
    user,
    role,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
