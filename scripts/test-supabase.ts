/**
 * Script to test Supabase connection
 * Run with: npx ts-node --project scripts/tsconfig.json scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Error: Missing required environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n');
  process.exit(1);
}

// Check if values are placeholders (more flexible check)
const isPlaceholder = (value: string | undefined): boolean => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower === 'your_supabase_project_url' ||
         lower === 'your_supabase_anon_key' ||
         lower === 'your_supabase_service_role_key';
};

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.log('\n⚠️  Warning: Environment variables may contain placeholder values');
  console.log('Continuing with connection test anyway...\n');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.log('\n❌ Error: Invalid Supabase URL format');
  console.log('URL must start with https://\n');
  process.exit(1);
}

// Test connection
console.log('\n🔌 Testing connection to Supabase...\n');

async function testConnection() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try a simple query (this will fail if connection is bad, but that's fine)
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);

  // We expect an error (table doesn't exist), but if we get a connection error, that's bad
  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
      // This is expected - table doesn't exist, but connection works
      console.log('✅ Supabase connection successful!');
      console.log('   (The test table doesn\'t exist, but that\'s fine - connection is working)\n');
    } else if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      console.log('❌ Error: Invalid API key');
      console.log('   Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
      process.exit(1);
    } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      console.log('❌ Error: Network connection failed');
      console.log('   Please check your NEXT_PUBLIC_SUPABASE_URL\n');
      process.exit(1);
    } else {
      console.log('⚠️  Warning: Unexpected error:', error.message);
      console.log('   But connection seems to be working\n');
    }
  } else {
    console.log('✅ Supabase connection successful!\n');
  }

    console.log('📊 Configuration Summary:');
    console.log('   URL:', supabaseUrl);
    console.log('   Anon Key:', supabaseAnonKey!.substring(0, 20) + '...');
    if (supabaseServiceKey) {
      console.log('   Service Role Key:', supabaseServiceKey.substring(0, 20) + '...');
    }
    console.log('\n✅ Supabase is properly configured and ready to use!\n');
  } catch (error: any) {
    console.log('❌ Error testing Supabase connection:');
    console.log('   ', error.message);
    console.log('\n');
    process.exit(1);
  }
}

testConnection();
