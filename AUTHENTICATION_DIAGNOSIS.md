# Authentication Flow Diagnosis - Comuniti Platform

## Issue Summary
Users with valid Supabase accounts cannot log in successfully, and completing the branding page redirects to /auth/sign-in instead of allowing edits.

## Root Cause Analysis

### 1. Login Flow Issues

**Current Login Flow:**
```
SignIn Page → /api/auth/signin → Backend Supabase Auth → Redirect to /dashboard
```

**Problem:** Backend-only authentication without frontend session establishment

**Detailed Analysis:**
- `/auth/sign-in` calls `/api/auth/signin` backend endpoint (✓ Working)
- Backend successfully authenticates with Supabase server-side (✓ Working)
- Backend returns user data to frontend (✓ Working)
- Frontend redirects to `/dashboard` (✓ Working)
- **CRITICAL ISSUE:** Frontend Supabase client has no session token
- Dashboard `useEffect` calls `supabase.auth.getSession()` on frontend client
- Frontend client returns null session → redirects to `/auth/sign-in`

**Call Stack:**
```
1. User submits login → /api/auth/signin (server)
2. Server authenticates → Returns user data
3. Frontend redirects to /dashboard
4. Dashboard.useEffect → supabase.auth.getSession() (client)
5. No session found → Redirect to /auth/sign-in
```

### 2. Branding Page Access Issues

**Current Branding Flow:**
```
Branding Page → Safety Checks → Missing localStorage → Redirect via safeNavigateToNextStep
```

**Problems:**
1. **Onboarding State Conflict:** Logged-in users trigger onboarding safety checks
2. **Data Persistence Issue:** `clearOnboardingData()` removes localStorage data after branding submission
3. **Session/LocalStorage Mismatch:** Authenticated users have no onboarding localStorage data

**Detailed Analysis:**
- User completes initial onboarding → localStorage populated
- User submits branding → `clearOnboardingData()` removes localStorage
- User later returns to edit → No localStorage data
- Safety checks fail → `safeNavigateToNextStep()` → Redirect to platform selection
- But user is authenticated → Should load existing ambassador data for editing

**Call Stack for Existing Users:**
```
1. User visits /onboarding/ambassador/branding
2. useEffect safety check runs
3. isDataLoaded = true, but localStorage empty (cleared after previous submission)
4. onboardingData = null, userData = null
5. Safety check fails → safeNavigateToNextStep()
6. getNextStep() → Returns /onboarding/ambassador (platform selection)
7. Redirect to platform selection instead of loading existing data
```

## Solution Design

### 1. Fix Login Session Establishment

**Approach:** Establish frontend session after backend authentication

```typescript
// In SignIn.tsx onSubmit - after backend auth success
const { data, error } = await supabase.auth.setSession({
  access_token: result.session.access_token,
  refresh_token: result.session.refresh_token
});
```

### 2. Fix Branding Page for Existing Users

**Approach:** Detect authenticated users and load existing ambassador data

```typescript
// In AmbassadorBranding.tsx - before safety checks
useEffect(() => {
  const checkAuthenticatedUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Load existing ambassador data for editing
      const response = await fetch('/api/ambassadors');
      // Find user's ambassador and populate form
      // Skip onboarding safety checks
    } else {
      // Run normal onboarding safety checks
    }
  };
}, []);
```

### 3. Enhanced Flow Logic

**For New Users (Onboarding):**
- Use localStorage for step-by-step data collection
- Run safety checks to ensure proper flow
- Clear data after successful submission

**For Existing Users (Editing):**
- Detect authentication status
- Load existing ambassador data from API
- Populate forms with existing data
- Skip onboarding safety checks
- Save changes directly to database

## Implementation Priority

1. **High Priority:** Fix login session establishment
2. **High Priority:** Add authentication detection to branding page
3. **Medium Priority:** Create edit mode vs onboarding mode distinction
4. **Low Priority:** Optimize localStorage clearing strategy

## Expected Behavior After Fix

**Login Flow:**
```
Login → Backend Auth → Frontend Session → Dashboard (✓ Success)
```

**Branding Page Flow:**
```
Authenticated User → Load Existing Data → Edit Mode
New User → Onboarding Safety Checks → Creation Mode
```