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
      // Step 5: Log localStorage before logout cleanup
      console.log(`📊 LOCALSTORAGE SNAPSHOT [Before Logout]:`, {
        keys: Object.keys(localStorage),
        values: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {} as Record<string, string | null>)
      });
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        // CRITICAL FIX: Clear ALL localStorage data on logout to prevent data contamination
        console.log('🧹 Clearing all localStorage data on logout');
        localStorage.removeItem('supabase_user');
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('ambassadorUser');
        localStorage.removeItem('ambassadorOnboarding');
        localStorage.removeItem('ambassadorBusinesses');
        
        // Clear any user-scoped keys that might exist
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('onboarding_') || key.startsWith('ambassador_') || key.startsWith('user_')) {
            localStorage.removeItem(key);
          }
        });
        
        // Step 5: Log localStorage after logout cleanup
        console.log(`📊 LOCALSTORAGE SNAPSHOT [After Logout]:`, {
          keys: Object.keys(localStorage),
          values: Object.keys(localStorage).reduce((acc, key) => {
            acc[key] = localStorage.getItem(key);
            return acc;
          }, {} as Record<string, string | null>)
        });
        
        console.log('✅ Sign out successful - all user data cleared');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    ...authState,
    signOut,
  };
}