import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { LogOut, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      }
    };

    getInitialSession();

    // Listen for auth changes with error handling
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return subscription.unsubscribe;
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      return () => {};
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Clear user state and local storage
      setUser(null);
      localStorage.removeItem('ambassadorUser');
      
      // Redirect to home
      setLocation('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setLocation('/auth/sign-in');
  };

  if (user) {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
      >
        {isLoading ? (
          <>
            <LogOut className="w-4 h-4 mr-2 animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      size="sm"
      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
    >
      <User className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}