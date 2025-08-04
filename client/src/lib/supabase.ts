import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize a basic client for session management even if not fully configured
// This prevents runtime errors for components that check auth state
const createBasicClient = () => {
  // Use dummy values if environment variables are missing
  const url = supabaseUrl || 'https://dummy.supabase.co'
  const key = supabaseAnonKey || 'dummy-key'
  
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'comuniti-mvp'
      }
    }
  })
}

// Create the Supabase client
export const supabase = createBasicClient()

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)