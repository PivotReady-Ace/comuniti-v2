/**
 * Utility functions for managing onboarding state in localStorage
 */

/**
 * Clear all onboarding-related localStorage keys for a specific user
 */
export const clearOnboardingStateForUser = (userId: string) => {
  console.log('🧹 Clearing onboarding state for user:', userId);
  
  // Remove user-scoped keys
  localStorage.removeItem(`ambassadorOnboarding_${userId}`);
  localStorage.removeItem(`ambassadorUser_${userId}`);
  localStorage.removeItem(`ambassadorBusinesses_${userId}`);
  
  // Remove legacy generic keys if they exist
  localStorage.removeItem('onboardingData');
  localStorage.removeItem('ambassadorOnboarding');
  localStorage.removeItem('ambassadorUser');
  localStorage.removeItem('ambassadorBusinesses');
  
  console.log('✅ Onboarding state cleared for user:', userId);
};

/**
 * Load onboarding data for a specific user
 */
export const loadOnboardingDataForUser = (userId: string) => {
  console.log('📋 Loading onboarding data for user:', userId);
  
  const onboardingKey = `ambassadorOnboarding_${userId}`;
  const userKey = `ambassadorUser_${userId}`;
  
  const onboardingData = localStorage.getItem(onboardingKey);
  const userData = localStorage.getItem(userKey);
  
  console.log('📦 User-scoped onboarding data found:', !!onboardingData);
  console.log('📦 User-scoped user data found:', !!userData);
  
  return {
    onboardingData: onboardingData ? JSON.parse(onboardingData) : null,
    userData: userData ? JSON.parse(userData) : null
  };
};

/**
 * Check if user has any onboarding data in localStorage
 */
export const hasOnboardingDataForUser = (userId: string): boolean => {
  const onboardingKey = `ambassadorOnboarding_${userId}`;
  return localStorage.getItem(onboardingKey) !== null;
};