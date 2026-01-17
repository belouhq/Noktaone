import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/supabase/client';

// This route should not be built if Supabase is not configured
export const dynamic = 'force-dynamic';

/**
 * API Route to test Supabase connection
 * GET /api/supabase/test
 */
export async function GET() {
  const result = await testSupabaseConnection();

  if (result.success) {
    return NextResponse.json(
      {
        status: 'success',
        message: result.message,
        config: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
        },
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      {
        status: 'error',
        message: result.message,
        error: result.error,
        config: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Not set',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
        },
      },
      { status: 500 }
    );
  }
}
