/**
 * Script pour initialiser Supabase
 * 
 * Ce script exécute le schéma SQL et le seed SQL
 * via le client Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSQL(filePath: string, description: string) {
  console.log(`\n📄 ${description}...`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Supabase ne supporte pas directement l'exécution de SQL via le client JS
    // Il faut utiliser l'API REST ou le dashboard
    console.log(`⚠️  Note: Supabase JS client ne peut pas exécuter du SQL directement.`);
    console.log(`   Veuillez exécuter ce fichier dans le SQL Editor du dashboard Supabase :`);
    console.log(`   ${filePath}\n`);
    
    // Afficher un aperçu
    const lines = sql.split('\n').slice(0, 10);
    console.log('Aperçu (10 premières lignes):');
    lines.forEach((line, i) => {
      if (line.trim() && !line.trim().startsWith('--')) {
        console.log(`   ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
      }
    });
    
    return true;
  } catch (error: any) {
    console.error(`❌ Erreur lors de la lecture de ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Configuration Supabase pour NOKTA ONE\n');
  
  const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
  const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
  
  // Vérifier que les fichiers existent
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Fichier introuvable: ${schemaPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Fichier introuvable: ${seedPath}`);
    process.exit(1);
  }
  
  console.log('✅ Fichiers trouvés');
  console.log(`   Schema: ${schemaPath}`);
  console.log(`   Seed: ${seedPath}`);
  
  // Afficher les instructions
  await executeSQL(schemaPath, 'Schéma SQL');
  await executeSQL(seedPath, 'Seed SQL');
  
  console.log('\n📋 Instructions:');
  console.log('1. Allez sur https://supabase.com/dashboard');
  console.log('2. Sélectionnez votre projet');
  console.log('3. Allez dans "SQL Editor"');
  console.log('4. Créez une nouvelle query');
  console.log('5. Copiez-collez le contenu de supabase/schema.sql');
  console.log('6. Cliquez sur "Run"');
  console.log('7. Répétez avec supabase/seed.sql');
  console.log('\n✅ Ou suivez le guide: SUPABASE_SETUP.md\n');
}

main().catch(console.error);
