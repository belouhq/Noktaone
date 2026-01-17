/**
 * Supabase Configuration
 * 
 * This file provides typed access to Supabase environment variables.
 * Make sure to set these in your .env.local file:
 * 
 * NEXT_PUBLIC_SUPABASE_URL=your_project_url
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 * SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-side only)
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Validate that required public variables are set
if (typeof window !== 'undefined') {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn(
      '⚠️ Supabase environment variables are not set. ' +
      'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    );
  }
}
