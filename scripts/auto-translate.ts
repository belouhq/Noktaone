/**
 * Script d'auto-traduction
 * 
 * Scanne le code pour trouver les textes hardcodés et les traduit automatiquement.
 * 
 * Usage:
 *   npm run auto-translate        # Preview + translate
 *   npm run auto-translate:dry    # Preview only
 *   npm run auto-translate:fix    # Translate + replace in code
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { execSync } from 'child_process';

// Charger les variables d'environnement
config({ path: '.env.local' });

const LOCALES_DIR = path.join(process.cwd(), 'lib/i18n/locales');
const SOURCE_LOCALE = 'fr';
const CODE_DIRS = ['app', 'components', 'lib'];

interface HardcodedText {
  file: string;
  line: number;
  text: string;
  context: string;
}

/**
 * Trouver tous les fichiers TypeScript/TSX
 */
function findCodeFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Ignorer node_modules, .next, etc.
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Détecter les textes hardcodés dans un fichier
 */
function findHardcodedTexts(filePath: string): HardcodedText[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings: HardcodedText[] = [];

  // Patterns pour détecter les textes hardcodés
  const patterns = [
    // Textes entre guillemets simples ou doubles (mais pas les imports)
    /["']([^"']{3,})["']/g,
    // Textes dans les templates JSX
    />\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][^<>{}\n]{2,})\s*</g,
  ];

  lines.forEach((line, index) => {
    // Ignorer les lignes de commentaires, imports, etc.
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      line.trim().startsWith('import') ||
      line.trim().startsWith('export') ||
      line.includes('t(') ||
      line.includes('useTranslation') ||
      line.includes('i18n') ||
      line.match(/^[\s]*["']/) && line.includes('://') // URLs
    ) {
      return;
    }

    // Chercher les textes français (avec accents)
    const frenchPattern = /["']([^"']*[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][^"']*)["']/g;
    let match;
    while ((match = frenchPattern.exec(line)) !== null) {
      const text = match[1];
      // Filtrer les textes trop courts ou qui sont des clés/identifiants
      if (
        text.length >= 3 &&
        !text.match(/^[a-z_]+$/i) && // Pas un identifiant simple
        !text.match(/^[0-9]+$/) && // Pas un nombre
        !text.includes('://') && // Pas une URL
        !text.includes('@') && // Pas un email
        !text.includes('className') && // Pas un className
        !text.includes('src=') && // Pas un attribut src
        !text.includes('href=') // Pas un attribut href
      ) {
        findings.push({
          file: filePath,
          line: index + 1,
          text: text,
          context: line.trim().substring(0, 100),
        });
      }
    }
  });

  return findings;
}

/**
 * Générer une clé de traduction à partir d'un texte
 */
function generateTranslationKey(text: string, filePath: string): string {
  // Extraire le nom du composant/page depuis le chemin
  const fileName = path.basename(filePath, path.extname(filePath));
  const dirParts = filePath.split(path.sep);
  const section = dirParts.includes('app') ? 'app' : 
                   dirParts.includes('components') ? 'components' : 
                   'common';

  // Créer une clé basée sur le texte (simplifiée)
  const keyBase = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .substring(0, 30);

  return `${section}.${fileName}.${keyBase}`;
}

/**
 * Ajouter une traduction au fichier fr.json
 */
function addTranslationToFile(key: string, text: string): void {
  const filePath = path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Créer la structure imbriquée
  const parts = key.split('.');
  let current = data;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = text;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Remplacer le texte hardcodé par un appel t()
 */
function replaceInFile(filePath: string, lineNumber: number, oldText: string, newKey: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Remplacer dans la ligne
  const line = lines[lineNumber - 1];
  const newLine = line.replace(
    new RegExp(`(["'])${oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g'),
    `{t("${newKey}")}`
  );
  
  lines[lineNumber - 1] = newLine;
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const shouldFix = args.includes('--fix');

  console.log('🔍 Scanning code for hardcoded texts...\n');

  const allFindings: HardcodedText[] = [];

  // Scanner tous les fichiers de code
  for (const dir of CODE_DIRS) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      continue;
    }

    const files = findCodeFiles(dirPath);
    console.log(`📁 Scanning ${dir}: ${files.length} files`);

    for (const file of files) {
      const findings = findHardcodedTexts(file);
      allFindings.push(...findings);
    }
  }

  console.log(`\n📊 Found ${allFindings.length} potential hardcoded texts\n`);

  if (allFindings.length === 0) {
    console.log('✅ No hardcoded texts found!');
    return;
  }

  // Afficher les résultats
  console.log('📋 Findings:\n');
  allFindings.forEach((finding, index) => {
    const key = generateTranslationKey(finding.text, finding.file);
    console.log(`${index + 1}. ${path.relative(process.cwd(), finding.file)}:${finding.line}`);
    console.log(`   Text: "${finding.text}"`);
    console.log(`   Key:  ${key}`);
    console.log(`   Context: ${finding.context}\n`);
  });

  if (isDryRun) {
    console.log('🔍 Dry run mode - no changes made');
    return;
  }

  if (!shouldFix) {
    console.log('💡 Run with --fix to automatically add translations and replace in code');
    return;
  }

  // Mode fix: ajouter les traductions et remplacer dans le code
  console.log('\n🔧 Fixing hardcoded texts...\n');

  for (const finding of allFindings) {
    const key = generateTranslationKey(finding.text, finding.file);
    
    try {
      // Ajouter au fichier fr.json
      addTranslationToFile(key, finding.text);
      console.log(`✅ Added translation: ${key}`);

      // Remplacer dans le fichier source
      replaceInFile(finding.file, finding.line, finding.text, key);
      console.log(`✅ Replaced in: ${path.relative(process.cwd(), finding.file)}:${finding.line}`);
    } catch (error) {
      console.error(`❌ Error processing ${key}:`, error);
    }
  }

  console.log('\n✨ Done! Run "npm run sync-translations" to translate to other languages.');
}

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
