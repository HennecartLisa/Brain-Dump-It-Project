// This file creates a configured Supabase client that can be imported throughout the app
import { createClient } from '@supabase/supabase-js';

// These values are loaded from environment variables (set in .env.local)
export const supabase = createClient(
// Supabase project URL
  import.meta.env.VITE_SUPABASE_URL,
  // Supabase anon/public key for client access
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
