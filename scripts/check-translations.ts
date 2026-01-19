/**
 * 🔄 Pre-build Translation Check
 * 
 * Ce script vérifie si des traductions sont manquantes AVANT le build.
 * Si oui, il les traduit automatiquement.
 * 
 * Ajoutez dans package.json:
 * "scripts": {
 *   "prebuild": "ts-node --project scripts/tsconfig.json scripts/check-translations.ts",
 *   "i18n:sync": "ts-node --project scripts/tsconfig.json scripts/i18n-sync.ts"
 * }
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const LOCALES_DIR = path.join(process.cwd(), 'lib/i18n/locales');
const SOURCE_LOCALE = 'en'; // Source de vérité selon les règles du projet

const TARGET_LOCALES = ['fr', 'es', 'de', 'it', 'pt', 'ar', 'hi', 'id', 'ja', 'ko', 'zh'];

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  
  return result;
}

function checkTranslations(): { needsSync: boolean; missing: Record<string, number> } {
  const sourcePath = path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`);
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file ${SOURCE_LOCALE}.json not found`);
    process.exit(1);
  }
  
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const sourceFlat = flattenObject(sourceData);
  const sourceKeys = new Set(Object.keys(sourceFlat));

  const missing: Record<string, number> = {};
  let needsSync = false;

  for (const locale of TARGET_LOCALES) {
    const targetPath = path.join(LOCALES_DIR, `${locale}.json`);
    
    if (!fs.existsSync(targetPath)) {
      missing[locale] = sourceKeys.size;
      needsSync = true;
      continue;
    }

    const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    const targetFlat = flattenObject(targetData);
    const targetKeys = new Set(Object.keys(targetFlat));

    const missingCount = Array.from(sourceKeys).filter(k => !targetKeys.has(k)).length;
    
    if (missingCount > 0) {
      missing[locale] = missingCount;
      needsSync = true;
    }
  }

  return { needsSync, missing };
}

function main() {
  console.log('\n🔍 Checking translations...\n');

  const { needsSync, missing } = checkTranslations();

  if (!needsSync) {
    console.log('✅ All translations are up to date!\n');
    return;
  }

  console.log('⚠️  Missing translations detected:\n');
  for (const [locale, count] of Object.entries(missing)) {
    console.log(`   • ${locale}: ${count} missing keys`);
  }

  // Vérifier si OPENAI_API_KEY est disponible
  if (!process.env.OPENAI_API_KEY) {
    console.log('\n⚠️  OPENAI_API_KEY not set. Skipping auto-translation.');
    console.log('   Run "npm run i18n:sync" manually with the API key.\n');
    console.log('   Build will continue, but translations may be incomplete.\n');
    return;
  }

  console.log('\n🚀 Auto-syncing translations...\n');

  try {
    // Utiliser le script de sync principal
    execSync('npm run i18n:sync', {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
    });
    
    console.log('\n✅ Translation sync completed!\n');
  } catch (error) {
    console.error('\n❌ Translation sync failed. Build continues anyway.\n');
    // Ne pas bloquer le build si la sync échoue
  }
}

main();
