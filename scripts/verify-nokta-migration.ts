/**
 * Vérifie que la migration nokta-v2 est appliquée (tables nokta_sessions, nokta_user_stats).
 * Usage: npx ts-node --project scripts/tsconfig.json scripts/verify-nokta-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  if (!url || !serviceKey) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (ou ANON_KEY) requis dans .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  let ok = true;

  // 1. nokta_sessions
  const { error: e1 } = await supabase.from('nokta_sessions').select('id').limit(1);
  if (e1) {
    if (e1.code === 'PGRST116' || e1.message?.includes('does not exist') || e1.message?.includes('relation')) {
      console.log('❌ nokta_sessions : table absente ou inaccessible');
      ok = false;
    } else {
      console.log('❌ nokta_sessions :', e1.message);
      ok = false;
    }
  } else {
    console.log('✅ nokta_sessions : OK');
  }

  // 2. nokta_user_stats
  const { error: e2 } = await supabase.from('nokta_user_stats').select('user_id').limit(1);
  if (e2) {
    if (e2.code === 'PGRST116' || e2.message?.includes('does not exist') || e2.message?.includes('relation')) {
      console.log('❌ nokta_user_stats : table absente ou inaccessible');
      ok = false;
    } else {
      console.log('❌ nokta_user_stats :', e2.message);
      ok = false;
    }
  } else {
    console.log('✅ nokta_user_stats : OK');
  }

  // 3. Fonction increment_user_session_count (échec FK = fonction présente)
  const { error: e3 } = await supabase.rpc('increment_user_session_count', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_was_shared: false,
  });
  if (e3) {
    if (e3.message?.includes('does not exist') || e3.message?.includes('function')) {
      console.log('❌ increment_user_session_count : fonction absente');
      ok = false;
    } else {
      // FK violation ou autre = la fonction existe et a été appelée
      console.log('✅ increment_user_session_count : OK');
    }
  } else {
    console.log('✅ increment_user_session_count : OK');
  }

  if (ok) {
    console.log('\n✅ Migration nokta-v2 appliquée.\n');
  } else {
    console.log('\n❌ Exécuter supabase/migration-nokta-v2.sql dans le SQL Editor Supabase.\n');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
