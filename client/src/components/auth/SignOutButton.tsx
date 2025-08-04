import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function SignOutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '', 
  showIcon = true,
  children 
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local storage data
      localStorage.removeItem('ambassadorUser');
      localStorage.removeItem('ambassadorBusinesses');
      
      // Redirect to home page
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to home as a fallback
      setLocation('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          {showIcon && <LogOut className="w-4 h-4 mr-2 animate-spin" />}
          Signing out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="w-4 h-4 mr-2" />}
          {children || 'Sign Out'}
        </>
      )}
    </Button>
  );
}