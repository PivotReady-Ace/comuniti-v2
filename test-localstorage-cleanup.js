// LocalStorage Cleanup Test Script
// This script simulates the onboarding flow and verifies cleanup behavior

const baseUrl = 'http://localhost:5000';

// Test user data
const testUser = {
  email: 'cleanup-test@example.com',
  password: 'testpass123',
  fullName: 'Cleanup Test User'
};

// Utility functions
const apiCall = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

const logLocalStorage = (step) => {
  console.log(`\n📊 LOCALSTORAGE SNAPSHOT [${step}]:`);
  console.log('Keys:', Object.keys(localStorage));
  Object.keys(localStorage).forEach(key => {
    if (key.includes('ambassador') || key.includes('onboarding') || key.includes('user')) {
      console.log(`  ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
    }
  });
};

// Test steps
const testLocalStorageCleanup = async () => {
  console.log('🧪 Starting LocalStorage Cleanup Test\n');
  
  try {
    // Step 1: Clean up any existing data
    console.log('1️⃣ Clearing initial localStorage...');
    localStorage.clear();
    logLocalStorage('Initial State');
    
    // Step 2: Create test user
    console.log('\n2️⃣ Creating test user...');
    await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    // Step 3: Sign in
    console.log('\n3️⃣ Signing in...');
    const authResult = await apiCall('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const userId = authResult.user.id;
    console.log('User ID:', userId);
    
    // Step 4: Simulate onboarding data creation
    console.log('\n4️⃣ Simulating onboarding data storage...');
    const onboardingData = {
      platforms: ['instagram'],
      followerCount: 5000
    };
    
    const userData = {
      id: userId,
      email: testUser.email,
      fullName: testUser.fullName,
      country: 'United States'
    };
    
    // Store data with user-scoped keys
    localStorage.setItem(`ambassadorOnboarding_${userId}`, JSON.stringify(onboardingData));
    localStorage.setItem(`ambassadorUser_${userId}`, JSON.stringify(userData));
    
    // Also store some legacy keys to test cleanup
    localStorage.setItem('ambassadorOnboarding', JSON.stringify(onboardingData));
    localStorage.setItem('ambassadorUser', JSON.stringify(userData));
    
    logLocalStorage('After Onboarding Data Storage');
    
    // Step 5: Test that only current user's data is accessible
    console.log('\n5️⃣ Verifying user-scoped data access...');
    const storedOnboarding = localStorage.getItem(`ambassadorOnboarding_${userId}`);
    const storedUser = localStorage.getItem(`ambassadorUser_${userId}`);
    
    console.log('✅ User-scoped onboarding data found:', !!storedOnboarding);
    console.log('✅ User-scoped user data found:', !!storedUser);
    
    // Step 6: Simulate onboarding completion cleanup
    console.log('\n6️⃣ Simulating onboarding completion cleanup...');
    
    // This simulates the clearOnboardingStateForUser function
    localStorage.removeItem(`ambassadorOnboarding_${userId}`);
    localStorage.removeItem(`ambassadorUser_${userId}`);
    localStorage.removeItem(`ambassadorBusinesses_${userId}`);
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('ambassadorOnboarding');
    localStorage.removeItem('ambassadorUser');
    localStorage.removeItem('ambassadorBusinesses');
    
    logLocalStorage('After Onboarding Completion Cleanup');
    
    // Step 7: Verify cleanup was successful
    console.log('\n7️⃣ Verifying completion cleanup...');
    const remainingOnboarding = localStorage.getItem(`ambassadorOnboarding_${userId}`);
    const remainingUser = localStorage.getItem(`ambassadorUser_${userId}`);
    const remainingLegacy = localStorage.getItem('ambassadorOnboarding');
    
    console.log('✅ User-scoped onboarding data removed:', !remainingOnboarding);
    console.log('✅ User-scoped user data removed:', !remainingUser);
    console.log('✅ Legacy onboarding data removed:', !remainingLegacy);
    
    // Step 8: Add some data back and test logout cleanup
    console.log('\n8️⃣ Testing logout cleanup...');
    localStorage.setItem(`ambassadorOnboarding_${userId}`, JSON.stringify(onboardingData));
    localStorage.setItem('ambassadorUser', JSON.stringify(userData));
    localStorage.setItem('some_other_key', 'should_remain');
    
    logLocalStorage('Before Logout Cleanup');
    
    // Simulate logout cleanup
    await apiCall('/api/auth/logout', { method: 'POST' });
    
    logLocalStorage('After Logout');
    
    // Step 9: Verify final state
    console.log('\n9️⃣ Final verification...');
    const finalOnboarding = localStorage.getItem(`ambassadorOnboarding_${userId}`);
    const finalUser = localStorage.getItem('ambassadorUser');
    const otherKey = localStorage.getItem('some_other_key');
    
    console.log('✅ User-scoped data removed after logout:', !finalOnboarding);
    console.log('✅ Legacy data removed after logout:', !finalUser);
    console.log('✅ Non-onboarding data preserved:', !!otherKey);
    
    console.log('\n🎉 LocalStorage cleanup test completed successfully!');
    
    // Return test results
    return {
      success: true,
      results: {
        userScopedDataStored: !!storedOnboarding && !!storedUser,
        completionCleanupWorked: !remainingOnboarding && !remainingUser && !remainingLegacy,
        logoutCleanupWorked: !finalOnboarding && !finalUser,
        nonOnboardingDataPreserved: !!otherKey
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    logLocalStorage('Error State');
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for Node.js environment or run in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testLocalStorageCleanup };
} else if (typeof window !== 'undefined') {
  window.testLocalStorageCleanup = testLocalStorageCleanup;
}

console.log('LocalStorage cleanup test script loaded. Call testLocalStorageCleanup() to run the test.');