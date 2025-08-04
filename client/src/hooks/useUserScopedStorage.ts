import { useAuth } from './useAuth';

/**
 * Hook for user-scoped localStorage to prevent cross-user data contamination
 */
export function useUserScopedStorage() {
  const { user } = useAuth();

  const setUserData = (key: string, data: any) => {
    if (!user?.id) {
      console.warn('Cannot set user data: no authenticated user');
      return;
    }
    const scopedKey = `user_${user.id}_${key}`;
    localStorage.setItem(scopedKey, JSON.stringify(data));
    console.log(`🔒 Stored user-scoped data: ${scopedKey}`);
  };

  const getUserData = (key: string) => {
    if (!user?.id) {
      console.warn('Cannot get user data: no authenticated user');
      return null;
    }
    const scopedKey = `user_${user.id}_${key}`;
    const data = localStorage.getItem(scopedKey);
    console.log(`🔓 Retrieved user-scoped data: ${scopedKey}`, data ? 'found' : 'not found');
    return data ? JSON.parse(data) : null;
  };

  const removeUserData = (key: string) => {
    if (!user?.id) {
      console.warn('Cannot remove user data: no authenticated user');
      return;
    }
    const scopedKey = `user_${user.id}_${key}`;
    localStorage.removeItem(scopedKey);
    console.log(`🗑️ Removed user-scoped data: ${scopedKey}`);
  };

  const clearAllUserData = () => {
    if (!user?.id) {
      console.warn('Cannot clear user data: no authenticated user');
      return;
    }
    const userPrefix = `user_${user.id}_`;
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared all data for user ${user.id}: ${keysToRemove.length} items removed`);
  };

  const clearAllLocalStorage = () => {
    console.log('🧹 Clearing ALL localStorage data to prevent cross-user contamination...');
    localStorage.clear();
    console.log('✅ All localStorage data cleared');
  };

  return {
    setUserData,
    getUserData,
    removeUserData,
    clearAllUserData,
    clearAllLocalStorage,
    currentUserId: user?.id || null
  };
}