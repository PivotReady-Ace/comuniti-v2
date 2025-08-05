import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { loadOnboardingDataForUser } from '@/lib/onboardingState';

interface OnboardingData {
  platforms?: string[];
  followerCount?: number;
  email?: string;
}

interface UserData {
  id?: string;
  email?: string;
  fullName?: string;
  country?: string;
  profileImage?: string | null;
  platforms?: string[];
  followerCount?: number;
  createdAt?: string;
}

// Helper function to create user-scoped localStorage keys
const getUserScopedKey = (baseKey: string, userId?: string): string => {
  if (!userId) return baseKey; // Fallback to non-scoped key if no user
  return `${baseKey}_${userId}`;
};

export function useOnboardingState() {
  const [, setLocation] = useLocation();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isCheckingExistingAmbassador, setIsCheckingExistingAmbassador] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load stored onboarding data on mount with user scoping
  useEffect(() => {
    const loadUserScopedData = async () => {
      try {
        // Get current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          // Load data only for the current authenticated user
          const { onboardingData: loadedOnboardingData, userData: loadedUserData } = loadOnboardingDataForUser(userId);
          
          setOnboardingData(loadedOnboardingData);
          setUserData(loadedUserData);
        } else {
          // No user - don't load any data to prevent contamination
          console.log('⚠️ No authenticated user - not loading any cached data');
          setOnboardingData(null);
          setUserData(null);
        }
        
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading user-scoped data:', error);
        setIsDataLoaded(true);
      }
    };

    loadUserScopedData();
  }, []);

  // Check if user already has an ambassador profile
  useEffect(() => {
    const checkExistingAmbassador = async () => {
      try {
        console.log('🔍 Checking for existing ambassador profile...');
        setIsCheckingExistingAmbassador(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('📌 No authenticated session found, skipping ambassador check');
          setIsCheckingExistingAmbassador(false);
          return;
        }

        console.log('👤 Authenticated user found, checking for existing ambassador');
        
        // Check if ambassador already exists
        const response = await fetch('/api/ambassadors');
        
        if (response.ok) {
          const ambassadors = await response.json();
          const existingAmbassador = ambassadors.find((ambassador: any) => 
            ambassador.name && userData?.fullName && 
            ambassador.name.toLowerCase() === userData.fullName.toLowerCase()
          );

          if (existingAmbassador) {
            console.log('✅ Existing ambassador found, redirecting to dashboard');
            setLocation('/dashboard');
            return;
          } else {
            console.log('📋 No existing ambassador found, continuing onboarding');
          }
        }
      } catch (error) {
        console.error('❌ Error checking existing ambassador:', error);
      } finally {
        setIsCheckingExistingAmbassador(false);
      }
    };

    // Only check if we have user data with fullName
    if (userData?.fullName) {
      checkExistingAmbassador();
    } else {
      console.log('📝 No user data available, skipping ambassador check');
      setIsCheckingExistingAmbassador(false);
    }
  }, [userData?.fullName, setLocation]);

  // Save onboarding data to user-scoped localStorage
  const saveOnboardingData = async (data: OnboardingData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log('💾 Saving onboarding data for user:', userId, data);
      setOnboardingData(data);
      
      if (userId) {
        const key = getUserScopedKey('ambassadorOnboarding', userId);
        localStorage.setItem(key, JSON.stringify(data));
        console.log('✅ User-scoped onboarding data saved:', key);
        
        // Diagnostic: Log what was written
        console.log(`📊 LOCALSTORAGE WRITE [${key}]:`, localStorage.getItem(key));
      } else {
        console.warn('⚠️ No user ID found - onboarding data not persisted');
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  // Save user data to user-scoped localStorage
  const saveUserData = async (data: UserData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log('💾 Saving user data for user:', userId, data);
      setUserData(data);
      
      if (userId) {
        const key = getUserScopedKey('ambassadorUser', userId);
        localStorage.setItem(key, JSON.stringify(data));
        console.log('✅ User-scoped user data saved:', key);
        
        // Diagnostic: Log what was written
        console.log(`📊 LOCALSTORAGE WRITE [${key}]:`, localStorage.getItem(key));
      } else {
        console.warn('⚠️ No user ID found - user data not persisted');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Clear all onboarding data (user-scoped)
  const clearOnboardingData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log('🧹 Clearing onboarding data for user:', userId);
      setOnboardingData(null);
      setUserData(null);
      
      if (userId) {
        const onboardingKey = getUserScopedKey('ambassadorOnboarding', userId);
        const userKey = getUserScopedKey('ambassadorUser', userId);
        const businessKey = getUserScopedKey('ambassadorBusinesses', userId);
        
        localStorage.removeItem(onboardingKey);
        localStorage.removeItem(userKey);
        localStorage.removeItem(businessKey);
        console.log('✅ User-scoped onboarding data cleared');
      }
      
      // Also clear legacy non-scoped keys for cleanup
      localStorage.removeItem('ambassadorOnboarding');
      localStorage.removeItem('ambassadorUser');
      localStorage.removeItem('ambassadorBusinesses');
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  // Determine next step in onboarding flow (only call after data is loaded)
  const getNextStep = () => {
    if (!isDataLoaded) {
      console.log('⚠️ getNextStep called before data loaded, returning current path');
      return window.location.pathname;
    }

    console.log('🔍 getNextStep called with:', {
      onboardingData: onboardingData,
      userData: userData,
      storedBusinesses: localStorage.getItem('ambassadorBusinesses')
    });

    if (!onboardingData?.platforms || !onboardingData?.followerCount) {
      console.log('➡️ getNextStep: Missing platform data, returning /onboarding/ambassador');
      return '/onboarding/ambassador';
    }
    
    if (!userData?.email || !userData?.fullName || !userData?.country) {
      console.log('➡️ getNextStep: Missing user data, returning /onboarding/ambassador/account');
      return '/onboarding/ambassador/account';
    }
    
    const storedBusinesses = localStorage.getItem('ambassadorBusinesses');
    if (!storedBusinesses) {
      console.log('➡️ getNextStep: Missing businesses, returning /onboarding/ambassador/list-builder');
      return '/onboarding/ambassador/list-builder';
    }
    
    console.log('➡️ getNextStep: All data present, returning /onboarding/ambassador/branding');
    return '/onboarding/ambassador/branding';
  };

  // Safe navigation wrapper that waits for data to load
  const safeNavigateToNextStep = (setLocation: (path: string) => void) => {
    if (!isDataLoaded) {
      console.log('⚠️ Navigation blocked: waiting for data to load');
      return false;
    }
    const nextStep = getNextStep();
    setLocation(nextStep);
    return true;
  };

  // Check if onboarding is complete
  const isOnboardingComplete = () => {
    return !!(
      onboardingData?.platforms &&
      onboardingData?.followerCount &&
      userData?.email &&
      userData?.fullName &&
      userData?.country &&
      localStorage.getItem('ambassadorBusinesses')
    );
  };

  return {
    onboardingData,
    userData,
    isCheckingExistingAmbassador,
    isDataLoaded,
    saveOnboardingData,
    saveUserData,
    clearOnboardingData,
    getNextStep,
    safeNavigateToNextStep,
    isOnboardingComplete,
  };
}