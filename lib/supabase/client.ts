import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

/**
 * Supabase Client (Client-side)
 * Use this in React components and client-side code
 */
export const supabase = (() => {
  // Only create client if URL is valid
  if (!supabaseConfig.url || 
      supabaseConfig.url === 'your_supabase_project_url' ||
      !supabaseConfig.url.startsWith('https://')) {
    // Return a mock client that will throw helpful errors
    return createClient(
      'https://placeholder.supabase.co',
      supabaseConfig.anonKey || 'placeholder',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  
  return createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
})();

/**
 * Test Supabase connection
 * Call this function to verify Supabase is properly configured
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Check if environment variables are set
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      return {
        success: false,
        message: 'Supabase environment variables are not configured',
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
      };
    }

    // Check if URL is valid
    if (!supabaseConfig.url.startsWith('https://')) {
      return {
        success: false,
        message: 'Invalid Supabase URL',
        error: 'URL must start with https://',
      };
    }

    // Check if URL is not the placeholder
    if (supabaseConfig.url === 'your_supabase_project_url') {
      return {
        success: false,
        message: 'Supabase URL is not configured',
        error: 'Please replace "your_supabase_project_url" with your actual Supabase project URL',
      };
    }

    // Try to connect to Supabase
    // We use a table that doesn't exist to test the connection
    // If we get a "table not found" error, it means the connection works!
    const { data, error } = await supabase.from('_test').select('count').limit(1);

    // If we get an error, check if it's a "table not found" error (which means connection works)
    if (error) {
      // PGRST116 = relation does not exist (expected for test)
      // "Could not find the table" = table not found (expected for test)
      // These errors mean the connection works, but the table doesn't exist (which is fine)
      if (error.code === 'PGRST116' || 
          error.message.includes('Could not find the table') ||
          error.message.includes('relation') ||
          error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Supabase is properly configured and connected! ✅ (Test table does not exist, but connection works)',
        };
      }
      
      // Other errors might indicate connection issues
      return {
        success: false,
        message: 'Supabase connection test failed',
        error: error.message,
      };
    }

    // If no error, connection works (though this shouldn't happen with _test table)
    return {
      success: true,
      message: 'Supabase is properly configured and connected! ✅',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error testing Supabase connection',
      error: error?.message || 'Unknown error',
    };
  }
}
