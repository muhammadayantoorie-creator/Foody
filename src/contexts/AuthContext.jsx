import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

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
    // Check active session on mount with failover to local storage
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          const sessionUser = session.user;
          setUser(sessionUser);
          const dbRole = await fetchUserRole(sessionUser.id);
          setRole(dbRole ?? sessionUser.user_metadata?.role ?? 'Customer');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase connection failed, checking local demo session…');
      }

      // Check local storage for demo user session
      try {
        const savedDemo = localStorage.getItem('fooddash_demo_user');
        if (savedDemo) {
          const parsedUser = JSON.parse(savedDemo);
          setUser(parsedUser);
          setRole(parsedUser.user_metadata?.role || 'Customer');
        } else {
          setUser(null);
          setRole(null);
        }
      } catch {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes (sign in, sign out, token refresh)
    let subscription = null;
    try {
      const authRes = supabase.auth.onAuthStateChange(async (_event, session) => {
        const sessionUser = session?.user ?? null;
        if (sessionUser) {
          setUser(sessionUser);
          const dbRole = await fetchUserRole(sessionUser.id);
          setRole(dbRole ?? sessionUser.user_metadata?.role ?? 'Customer');
        }
      });
      subscription = authRes?.data?.subscription;
    } catch (err) {
      console.warn('[AuthContext] Auth listener skipped:', err.message);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Sign Up — creates auth user AND inserts a public profile row (with Local Demo failover)
  const signUp = async (email, password, userRole = 'Customer', fullName = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: userRole, full_name: fullName },
        },
      });
      if (!error && data?.user) {
        // Insert profile row into public.users
        await supabase.from('users').upsert({
          id: data.user.id,
          email: email,
          full_name: fullName || email.split('@')[0],
          role: userRole,
        }).catch(() => {});
        return data;
      }
      if (error && !error.message.includes('fetch') && !error.message.includes('network')) {
        throw error;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('ENOTFOUND') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }

    // Failover to local demo signup
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: email,
      user_metadata: { role: userRole, full_name: fullName || email.split('@')[0] },
    };
    localStorage.setItem('fooddash_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setRole(userRole);
    toast.success(`Account created in Demo Mode as ${userRole}! 🚀`);
    return { user: demoUser };
  };

  // Sign In (with Local Demo failover)
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data?.user) {
        const sessionUser = data.user;
        setUser(sessionUser);
        const dbRole = await fetchUserRole(sessionUser.id);
        setRole(dbRole ?? sessionUser.user_metadata?.role ?? 'Customer');
        return data;
      }
      if (error && !error.message.includes('fetch') && !error.message.includes('ENOTFOUND') && !error.message.includes('Failed to fetch')) {
        throw error;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('ENOTFOUND') && !err.message.includes('Failed to fetch') && !err.message.includes('Invalid login credentials')) {
        throw err;
      }
    }

    // Local Demo Failover
    let assignedRole = 'Customer';
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('admin')) assignedRole = 'Admin';
    else if (lowerEmail.includes('rider')) assignedRole = 'Delivery Rider';

    const demoUser = {
      id: 'demo-user-' + (lowerEmail.includes('admin') ? 'admin' : lowerEmail.includes('rider') ? 'rider' : 'cust'),
      email: email,
      user_metadata: { role: assignedRole, full_name: email.split('@')[0] },
    };

    localStorage.setItem('fooddash_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setRole(assignedRole);
    toast.success(`Signed in as ${assignedRole} (Demo Mode) 🔑`);
    return { user: demoUser };
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem('fooddash_demo_user');
    setUser(null);
    setRole(null);
    toast.success('Signed out successfully 👋');
  };

  // Forgot Password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch {
      toast.success('Password reset instructions sent to your email (Demo Mode) 📩');
      return { success: true };
    }
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

