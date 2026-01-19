import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

/**
 * Supabase Client (Server-side)
 * Use this in API routes and server components
 * Uses service role key for admin operations
 */
export const supabaseAdmin = (() => {
  // Only create client if URL is valid
  if (!supabaseConfig.url || 
      supabaseConfig.url === 'your_supabase_project_url' ||
      !supabaseConfig.url.startsWith('https://')) {
    // Return a mock client that will throw helpful errors
    return createClient(
      'https://placeholder.supabase.co',
      supabaseConfig.serviceRoleKey || supabaseConfig.anonKey || 'placeholder',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  
  return createClient(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey || supabaseConfig.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
})();

// Re-export createClient for convenience
// Allows: import { createClient } from '@/lib/supabase/server'
export { createClient } from '@supabase/supabase-js';
