import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // CRITICAL FIX 2: Check for existing session on app load
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          isAuthenticated: !!session?.user,
        });
        
        console.log('Initial session loaded:', session?.user ? 'authenticated' : 'not authenticated');
      } catch (error) {
        console.error('Session initialization error:', error);
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    getInitialSession();

    // CRITICAL FIX 3: Listen for auth state changes and persist to localStorage
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user ? 'user present' : 'no user');
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          isAuthenticated: !!session?.user,
        });

        // Persist user state to localStorage for consistency
        if (session?.user) {
          localStorage.setItem('supabase_user', JSON.stringify(session.user));
        } else {
          localStorage.removeItem('supabase_user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      // Clear any stored user data
      localStorage.removeItem('supabase_user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    ...authState,
    signOut,
  };
}