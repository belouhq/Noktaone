/**
 * Supabase Server Helpers
 * Helper functions for creating Supabase clients in API routes
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseConfig } from './config';

/**
 * Create a Supabase client for server-side use with user authentication
 * Uses cookies to get the user session
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        getSession: async () => {
          const accessToken = cookieStore.get('sb-access-token')?.value;
          const refreshToken = cookieStore.get('sb-refresh-token')?.value;
          
          if (!accessToken || !refreshToken) {
            return { data: { session: null }, error: null };
          }
          
          // Create a session object
          return {
            data: {
              session: {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: Date.now() / 1000 + 3600, // 1 hour
                expires_in: 3600,
                token_type: 'bearer',
                user: null, // Will be fetched by getUser()
              },
            },
            error: null,
          };
        },
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Create an admin Supabase client with service role key
 * Use this for operations that require admin privileges
 */
export function createAdminClient() {
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
}
