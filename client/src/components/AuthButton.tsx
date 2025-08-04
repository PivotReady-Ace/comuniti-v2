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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return subscription.unsubscribe;
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      // Clear local storage
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