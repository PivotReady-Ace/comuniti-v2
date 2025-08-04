import { createClient } from '@supabase/supabase-js'

// For development, we need to get Supabase credentials from the server-side environment
// Since VITE_ prefixed vars may not be available in all contexts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment check:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    viteUrl: !!import.meta.env.VITE_SUPABASE_URL,
    viteKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  })
  throw new Error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Allow non-standard email domains
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'comuniti-mvp'
    }
  }
})