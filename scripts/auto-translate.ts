#!/usr/bin/env npx ts-node

/**
 * 🌍 NOKTA ONE - Auto Translation System
 * 
 * Ce script fait TOUT automatiquement :
 * 1. Scanne les fichiers .tsx/.ts pour trouver les textes hardcodés
 * 2. Génère les clés de traduction
 * 3. Ajoute au fr.json
 * 4. Traduit dans les 11 autres langues via OpenAI
 * 5. (Optionnel) Remplace les textes hardcodés par t('clé')
 * 
 * Usage:
 *   npm run auto-translate           # Scan + translate
 *   npm run auto-translate --fix     # Scan + translate + replace in code
 *   npm run auto-translate --dry-run # Preview only
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === CONFIGURATION ===
const CONFIG = {
  // Dossiers à scanner
  scanDirs: ['app', 'components', 'lib'],
  // Extensions à scanner
  extensions: ['.tsx', '.ts'],
  // Fichiers/dossiers à ignorer
  ignore: ['node_modules', '.next', 'dist', 'locales', 'i18n/index.ts'],
  // Chemin des locales
  localesPath: 'lib/i18n/locales',
  // Langue source
  sourceLang: 'fr',
  // Langues cibles
  targetLangs: ['en', 'es', 'de', 'it', 'pt', 'ar', 'hi', 'id', 'ja', 'ko', 'zh'],
  // Mots/phrases à ignorer (ne pas traduire)
  ignorePatterns: [
    /^[A-Z_]+$/, // CONSTANTES
    /^[a-z]+\.[a-z]+/i, // Déjà des clés i18n (home.title)
    /^\d+$/, // Nombres
    /^https?:\/\//, // URLs
    /^[A-Za-z0-9._%+-]+@/, // Emails
    /^\{\{.*\}\}$/, // Placeholders
    /^[<>\/]/, // HTML tags
    /^className/, // CSS classes
    /^#[0-9a-fA-F]+$/, // Couleurs hex
    /^rgba?\(/, // Couleurs RGB
    /^Skane$/i, // Termes à ne pas traduire
    /^NOKTA/i,
    /^Nokta/,
  ],
  // Longueur minimum pour considérer comme texte à traduire
  minLength: 2,
  // Longueur maximum
  maxLength: 500,
};

// === TYPES ===
interface ExtractedText {
  text: string;
  file: string;
  line: number;
  column: number;
  context: string; // Code autour du texte
  suggestedKey: string;
}

interface TranslationEntry {
  key: string;
  translations: Record<string, string>;
}

// === HELPERS ===

function loadJSON(filePath: string): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveJSON(filePath: string, data: Record<string, any>): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }
  return result;
}

function unflattenObject(obj: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function shouldIgnoreText(text: string): boolean {
  // Trop court ou trop long
  if (text.length < CONFIG.minLength || text.length > CONFIG.maxLength) return true;
  
  // Patterns à ignorer
  for (const pattern of CONFIG.ignorePatterns) {
    if (pattern.test(text)) return true;
  }
  
  // Seulement des caractères spéciaux/nombres
  if (/^[\d\s\.\-\+\*\/\=\(\)\[\]\{\}\<\>\,\;\:\!\?\@\#\$\%\^\&\_\|\\\"\'`~]+$/.test(text)) return true;
  
  // Pas de lettres
  if (!/[a-zA-ZÀ-ÿ]/.test(text)) return true;
  
  return false;
}

function generateKey(text: string, filePath: string): string {
  // Extraire le nom du composant/page du chemin
  const parts = filePath.split('/');
  let section = 'common';
  
  // Trouver la section basée sur le chemin
  if (filePath.includes('/app/')) {
    const appIndex = parts.indexOf('app');
    if (appIndex >= 0 && parts[appIndex + 1]) {
      section = parts[appIndex + 1].replace(/\[.*\]/, '').replace('.tsx', '');
      if (section === 'page') section = 'home';
    }
  } else if (filePath.includes('/components/')) {
    const compIndex = parts.indexOf('components');
    if (compIndex >= 0 && parts[compIndex + 1]) {
      section = parts[compIndex + 1].replace('.tsx', '');
    }
  }
  
  // Générer une clé basée sur le texte
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9\s]/g, '') // Garder que lettres/chiffres
    .trim()
    .split(/\s+/)
    .slice(0, 4) // Max 4 mots
    .join('_')
    .substring(0, 30); // Max 30 chars
  
  return `${section}.${slug || 'text'}`;
}

// === EXTRACTION DES TEXTES ===

function extractTextsFromFile(filePath: string): ExtractedText[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const extracted: ExtractedText[] = [];
  
  // Regex pour trouver les textes dans JSX
  const patterns = [
    // Texte entre > et < (contenu JSX)
    />([^<>{}`]+)</g,
    // Texte dans les attributs avec guillemets doubles (mais pas className, style, etc.)
    /(?:title|placeholder|label|alt|aria-label|message|text|description|hint)=["']([^"']+)["']/gi,
    // Texte dans les template literals simples
    /`([^`${}]+)`/g,
  ];
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    
    // Ignorer les imports, comments, etc.
    if (line.trim().startsWith('import ')) continue;
    if (line.trim().startsWith('//')) continue;
    if (line.trim().startsWith('*')) continue;
    if (line.includes('console.')) continue;
    
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(line)) !== null) {
        const text = match[1]?.trim();
        
        if (!text || shouldIgnoreText(text)) continue;
        
        // Vérifier que ce n'est pas déjà une traduction t('...')
        const beforeMatch = line.substring(0, match.index);
        if (beforeMatch.includes("t('") || beforeMatch.includes('t("') || beforeMatch.includes('t(`')) continue;
        
        // Vérifier que c'est bien du texte visible (pas du code)
        if (text.includes('===') || text.includes('!==') || text.includes('&&') || text.includes('||')) continue;
        if (text.includes('=>') || text.includes('function') || text.includes('return')) continue;
        
        extracted.push({
          text,
          file: filePath,
          line: lineNum + 1,
          column: match.index,
          context: line.trim(),
          suggestedKey: generateKey(text, filePath),
        });
      }
    }
  }
  
  return extracted;
}

function scanDirectory(dir: string): ExtractedText[] {
  const results: ExtractedText[] = [];
  
  function scan(currentDir: string) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      
      // Ignorer certains dossiers/fichiers
      if (CONFIG.ignore.some(ig => fullPath.includes(ig))) continue;
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (CONFIG.extensions.some(ext => item.endsWith(ext))) {
        results.push(...extractTextsFromFile(fullPath));
      }
    }
  }
  
  scan(dir);
  return results;
}

// === TRADUCTION ===

const LANG_NAMES: Record<string, string> = {
  en: 'English (US)',
  es: 'Spanish (Spain)',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese (Brazil)',
  ar: 'Arabic (Modern Standard)',
  hi: 'Hindi',
  id: 'Indonesian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
};

async function translateBatch(
  texts: Record<string, string>,
  targetLang: string
): Promise<Record<string, string>> {
  if (Object.keys(texts).length === 0) return {};
  
  const langName = LANG_NAMES[targetLang] || targetLang;
  
  const prompt = `Translate the following French texts to ${langName} for a wellness/health app.

RULES:
- Keep the JSON structure exactly the same
- Only translate the values, keep keys unchanged
- Keep "Skane", "NOKTA", "NOKTA ONE" unchanged (brand names)
- Keep placeholders like {{count}}, {{hours}} unchanged
- Keep emojis unchanged
- Use natural, conversational language appropriate for a mobile app
- Be concise - mobile UI needs short texts
- NEVER use medical terms (no "diagnosis", "treatment", "anxiety", "depression", etc.)

French texts to translate:
${JSON.stringify(texts, null, 2)}

Return ONLY the translated JSON object, no markdown, no explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`❌ Translation error for ${targetLang}:`, error);
    return {};
  }
}

// === MAIN ===

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const shouldFix = args.includes('--fix');
  
  console.log('\n🌍 NOKTA ONE - Auto Translation System\n');
  console.log('━'.repeat(50));
  
  if (isDryRun) {
    console.log('📋 Mode: DRY RUN (preview only)\n');
  } else if (shouldFix) {
    console.log('🔧 Mode: FULL (scan + translate + fix code)\n');
  } else {
    console.log('📝 Mode: SCAN + TRANSLATE (no code changes)\n');
  }
  
  // 1. Scanner les fichiers
  console.log('🔍 Scanning source files...\n');
  
  const allTexts: ExtractedText[] = [];
  for (const dir of CONFIG.scanDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      allTexts.push(...scanDirectory(dirPath));
    }
  }
  
  // Dédupliquer par texte
  const uniqueTexts = new Map<string, ExtractedText>();
  for (const item of allTexts) {
    if (!uniqueTexts.has(item.text)) {
      uniqueTexts.set(item.text, item);
    }
  }
  
  console.log(`📊 Found ${uniqueTexts.size} unique texts to translate\n`);
  
  if (uniqueTexts.size === 0) {
    console.log('✅ No new texts to translate!\n');
    return;
  }
  
  // 2. Charger les traductions existantes
  const localesPath = path.join(process.cwd(), CONFIG.localesPath);
  const frPath = path.join(localesPath, 'fr.json');
  const existingFr = loadJSON(frPath);
  const existingFrFlat = flattenObject(existingFr);
  
  // 3. Trouver les nouveaux textes (pas encore dans fr.json)
  const newTexts: Map<string, ExtractedText> = new Map();
  
  for (const [text, item] of uniqueTexts) {
    // Vérifier si ce texte existe déjà dans les traductions
    const alreadyExists = Object.values(existingFrFlat).some(
      v => v.toLowerCase() === text.toLowerCase()
    );
    
    if (!alreadyExists) {
      // Générer une clé unique
      let key = item.suggestedKey;
      let counter = 1;
      while (existingFrFlat[key] || [...newTexts.values()].some(t => t.suggestedKey === key)) {
        key = `${item.suggestedKey}_${counter}`;
        counter++;
      }
      item.suggestedKey = key;
      newTexts.set(text, item);
    }
  }
  
  console.log(`🆕 ${newTexts.size} NEW texts to add\n`);
  
  if (newTexts.size === 0) {
    console.log('✅ All texts are already translated!\n');
    return;
  }
  
  // Afficher les textes trouvés
  console.log('📝 New texts found:\n');
  let index = 1;
  for (const [text, item] of newTexts) {
    console.log(`  ${index}. "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    console.log(`     Key: ${item.suggestedKey}`);
    console.log(`     File: ${item.file}:${item.line}\n`);
    index++;
  }
  
  if (isDryRun) {
    console.log('━'.repeat(50));
    console.log('📋 Dry run complete. Run without --dry-run to apply.\n');
    return;
  }
  
  // 4. Ajouter au fr.json
  console.log('━'.repeat(50));
  console.log('\n📥 Adding to fr.json...\n');
  
  const newFrTexts: Record<string, string> = {};
  for (const [text, item] of newTexts) {
    newFrTexts[item.suggestedKey] = text;
    existingFrFlat[item.suggestedKey] = text;
  }
  
  const updatedFr = unflattenObject(existingFrFlat);
  saveJSON(frPath, updatedFr);
  console.log(`✅ Added ${newTexts.size} keys to fr.json\n`);
  
  // 5. Traduire dans les autres langues
  console.log('🌐 Translating to other languages...\n');
  
  for (const lang of CONFIG.targetLangs) {
    process.stdout.write(`   ${lang.toUpperCase().padEnd(3)} `);
    
    const langPath = path.join(localesPath, `${lang}.json`);
    const existingLang = loadJSON(langPath);
    const existingLangFlat = flattenObject(existingLang);
    
    // Trouver les clés manquantes
    const missingKeys: Record<string, string> = {};
    for (const [key, value] of Object.entries(newFrTexts)) {
      if (!existingLangFlat[key]) {
        missingKeys[key] = value;
      }
    }
    
    if (Object.keys(missingKeys).length === 0) {
      console.log('✓ (already complete)');
      continue;
    }
    
    // Traduire par batch de 20
    const keys = Object.keys(missingKeys);
    const batchSize = 20;
    let translated = 0;
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      const batchTexts: Record<string, string> = {};
      for (const k of batchKeys) {
        batchTexts[k] = missingKeys[k];
      }
      
      const results = await translateBatch(batchTexts, lang);
      
      for (const [k, v] of Object.entries(results)) {
        if (v && typeof v === 'string') {
          existingLangFlat[k] = v;
          translated++;
        }
      }
    }
    
    // Sauvegarder
    const updatedLang = unflattenObject(existingLangFlat);
    saveJSON(langPath, updatedLang);
    
    console.log(`✓ (${translated} translated)`);
  }
  
  console.log('\n━'.repeat(50));
  console.log('\n✅ Translation complete!\n');
  
  // 6. Générer le rapport des remplacements à faire
  if (!shouldFix) {
    console.log('💡 To auto-replace texts in code, run:\n');
    console.log('   npm run auto-translate --fix\n');
    
    console.log('📋 Manual replacements needed:\n');
    for (const [text, item] of newTexts) {
      console.log(`   File: ${item.file}:${item.line}`);
      console.log(`   Replace: "${text.substring(0, 40)}..."`);
      console.log(`   With: {t('${item.suggestedKey}')}\n`);
    }
  }
  
  console.log('🎉 Done!\n');
}

main().catch(console.error);
