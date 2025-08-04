import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

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

export function useOnboardingState() {
  const [, setLocation] = useLocation();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isCheckingExistingAmbassador, setIsCheckingExistingAmbassador] = useState(true);

  // Load stored onboarding data on mount
  useEffect(() => {
    const storedOnboarding = localStorage.getItem('ambassadorOnboarding');
    const storedUser = localStorage.getItem('ambassadorUser');
    
    if (storedOnboarding) {
      setOnboardingData(JSON.parse(storedOnboarding));
    }
    
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
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

  // Save onboarding data to localStorage
  const saveOnboardingData = (data: OnboardingData) => {
    console.log('💾 Saving onboarding data:', data);
    setOnboardingData(data);
    localStorage.setItem('ambassadorOnboarding', JSON.stringify(data));
    console.log('✅ Onboarding data saved to localStorage');
  };

  // Save user data to localStorage
  const saveUserData = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('ambassadorUser', JSON.stringify(data));
  };

  // Clear all onboarding data
  const clearOnboardingData = () => {
    setOnboardingData(null);
    setUserData(null);
    localStorage.removeItem('ambassadorOnboarding');
    localStorage.removeItem('ambassadorUser');
    localStorage.removeItem('ambassadorBusinesses');
  };

  // Determine next step in onboarding flow
  const getNextStep = () => {
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
    saveOnboardingData,
    saveUserData,
    clearOnboardingData,
    getNextStep,
    isOnboardingComplete,
  };
}