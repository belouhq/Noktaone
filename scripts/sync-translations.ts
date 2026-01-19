/**
 * Script de synchronisation des traductions
 * 
 * Compare fr.json (source) avec les autres langues et traduit automatiquement
 * les nouvelles clés manquantes en utilisant OpenAI.
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement
config({ path: '.env.local' });

const LOCALES_DIR = path.join(process.cwd(), 'lib/i18n/locales');
const SOURCE_LOCALE = 'fr';
const TARGET_LOCALES = ['en', 'es', 'de', 'it', 'pt', 'ar', 'hi', 'id', 'ja', 'ko', 'zh'];

// Mapping des codes de langue vers les noms complets pour OpenAI
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ar: 'Arabic',
  hi: 'Hindi',
  id: 'Indonesian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
};

interface TranslationFile {
  [key: string]: any;
}

/**
 * Charger un fichier de traduction
 */
function loadTranslationFile(locale: string): TranslationFile {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Sauvegarder un fichier de traduction
 */
function saveTranslationFile(locale: string, data: TranslationFile): void {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Trouver toutes les clés dans un objet (récursif)
 */
function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Obtenir la valeur d'une clé dans un objet (notation pointée)
 */
function getNestedValue(obj: any, key: string): any {
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Définir une valeur dans un objet (notation pointée)
 */
function setNestedValue(obj: any, key: string, value: any): void {
  const parts = key.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Traduire un texte avec OpenAI
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }

  const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${languageName}. 
            
IMPORTANT RULES:
- Keep brand names unchanged: "Nokta One", "NOKTA ONE", "Skane", "SKANE", "Skane Index", "Reset"
- Preserve placeholders exactly: {name}, {count}, %d, etc.
- Use microcopy style: 2–6 words, simple, body-focused, no jargon
- Never use medical/mental-health words: diagnosis, treatment, medical, disease, disorder, stress, anxiety, depression, burnout, therapy, meditation
- Maintain the same tone and style as the original
- Return ONLY the translation, no explanations`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error translating to ${targetLanguage}:`, error);
    throw error;
  }
}

/**
 * Synchroniser les traductions
 */
async function syncTranslations(): Promise<void> {
  console.log('🔄 Starting translation synchronization...\n');

  // Charger le fichier source (français)
  const sourceData = loadTranslationFile(SOURCE_LOCALE);
  const sourceKeys = getAllKeys(sourceData);

  console.log(`📝 Found ${sourceKeys.length} keys in ${SOURCE_LOCALE}.json\n`);

  // Pour chaque langue cible
  for (const targetLocale of TARGET_LOCALES) {
    console.log(`🌍 Processing ${targetLocale}...`);
    
    const targetData = loadTranslationFile(targetLocale);
    const targetKeys = getAllKeys(targetData);
    
    // Trouver les clés manquantes
    const missingKeys = sourceKeys.filter(key => !targetKeys.includes(key));
    
    if (missingKeys.length === 0) {
      console.log(`  ✅ ${targetLocale} is up to date\n`);
      continue;
    }

    console.log(`  ⚠️  Found ${missingKeys.length} missing keys`);
    
    // Traduire chaque clé manquante
    for (const key of missingKeys) {
      const sourceValue = getNestedValue(sourceData, key);
      
      if (typeof sourceValue !== 'string') {
        // Si ce n'est pas une string, copier la structure
        setNestedValue(targetData, key, sourceValue);
        console.log(`  📋 Copied structure for: ${key}`);
        continue;
      }

      try {
        console.log(`  🔄 Translating: ${key}...`);
        const translated = await translateText(sourceValue, targetLocale);
        setNestedValue(targetData, key, translated);
        console.log(`  ✅ Translated: ${key}`);
        
        // Petit délai pour éviter de dépasser les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Error translating ${key}:`, error);
        // En cas d'erreur, copier la valeur source comme fallback
        setNestedValue(targetData, key, sourceValue);
      }
    }

    // Sauvegarder le fichier
    saveTranslationFile(targetLocale, targetData);
    console.log(`  💾 Saved ${targetLocale}.json\n`);
  }

  console.log('✨ Synchronization complete!');
}

// Exécuter le script
if (require.main === module) {
  syncTranslations().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
