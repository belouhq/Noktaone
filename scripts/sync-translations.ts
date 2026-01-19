#!/usr/bin/env npx ts-node

/**
 * 🌍 NOKTA ONE - Translation Sync
 * 
 * Synchronise TOUTES les traductions :
 * 1. Prend fr.json comme source de vérité
 * 2. Traduit toutes les clés manquantes dans les 11 autres langues
 * 
 * Usage:
 *   npm run sync-translations
 * 
 * Ajoute dans package.json:
 *   "scripts": {
 *     "sync-translations": "npx ts-node scripts/sync-translations.ts"
 *   }
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === CONFIG ===
const LOCALES_PATH = path.join(process.cwd(), 'lib/i18n/locales');
const SOURCE_LANG = 'fr';
const TARGET_LANGS = ['en', 'es', 'de', 'it', 'pt', 'ar', 'hi', 'id', 'ja', 'ko', 'zh'];

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

// === UTILS ===
function loadJSON(filename: string): Record<string, any> {
  const filePath = path.join(LOCALES_PATH, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveJSON(filename: string, data: Record<string, any>): void {
  const filePath = path.join(LOCALES_PATH, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }
  return result;
}

function unflatten(obj: Record<string, string>): Record<string, any> {
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

// === TRANSLATION ===
async function translateBatch(
  texts: Record<string, string>,
  targetLang: string
): Promise<Record<string, string>> {
  if (Object.keys(texts).length === 0) return {};
  
  const langName = LANG_NAMES[targetLang] || targetLang;
  
  const prompt = `Translate the following French texts to ${langName} for a wellness mobile app called "NOKTA ONE".

CRITICAL RULES:
- Return ONLY a valid JSON object
- Keep all keys exactly as they are
- Only translate the string values
- Keep "Skane", "NOKTA", "NOKTA ONE" unchanged (brand names)
- Keep all placeholders like {{count}}, {{hours}}, {{name}} unchanged
- Keep all emojis unchanged
- Use natural, friendly, conversational language
- Be concise - mobile UI needs short texts
- NEVER use medical terms like "diagnosis", "treatment", "therapy", "anxiety", "depression"

JSON to translate:
${JSON.stringify(texts, null, 2)}

Return ONLY the JSON object with translated values:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    });

    let content = response.choices[0]?.message?.content || '{}';
    
    // Clean markdown code blocks if present
    content = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Find the JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(content);
  } catch (error: any) {
    console.error(`\n   ❌ Error translating to ${targetLang}:`, error.message);
    return {};
  }
}

// === MAIN ===
async function main() {
  console.log('\n🌍 NOKTA ONE - Translation Sync\n');
  console.log('━'.repeat(50));
  
  // Load source (French)
  const frData = loadJSON(`${SOURCE_LANG}.json`);
  const frFlat = flatten(frData);
  const totalKeys = Object.keys(frFlat).length;
  
  console.log(`\n📖 Source: ${SOURCE_LANG}.json (${totalKeys} keys)\n`);
  
  let totalTranslated = 0;
  let totalMissing = 0;
  
  // Process each target language
  for (const lang of TARGET_LANGS) {
    const langData = loadJSON(`${lang}.json`);
    const langFlat = flatten(langData);
    
    // Find missing keys
    const missing: Record<string, string> = {};
    for (const [key, value] of Object.entries(frFlat)) {
      if (!langFlat[key] || langFlat[key] === '') {
        missing[key] = value;
      }
    }
    
    const missingCount = Object.keys(missing).length;
    totalMissing += missingCount;
    
    process.stdout.write(`   ${lang.toUpperCase().padEnd(3)} `);
    
    if (missingCount === 0) {
      console.log(`✅ Complete (${Object.keys(langFlat).length}/${totalKeys})`);
      continue;
    }
    
    console.log(`⏳ ${missingCount} missing...`);
    
    // Translate in batches of 25
    const keys = Object.keys(missing);
    const batchSize = 25;
    let translated = 0;
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      const batch: Record<string, string> = {};
      for (const k of batchKeys) {
        batch[k] = missing[k];
      }
      
      process.stdout.write(`       Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keys.length / batchSize)}...`);
      
      const results = await translateBatch(batch, lang);
      
      for (const [k, v] of Object.entries(results)) {
        if (v && typeof v === 'string' && v.trim()) {
          langFlat[k] = v;
          translated++;
        } else {
          // Fallback: use French text
          langFlat[k] = missing[k];
        }
      }
      
      console.log(` ✓`);
    }
    
    // Save updated translations
    const updated = unflatten(langFlat);
    saveJSON(`${lang}.json`, updated);
    
    totalTranslated += translated;
    console.log(`       ✅ Saved ${translated} new translations\n`);
  }
  
  console.log('━'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   • Source keys: ${totalKeys}`);
  console.log(`   • Missing found: ${totalMissing}`);
  console.log(`   • Translated: ${totalTranslated}`);
  console.log(`\n✅ Sync complete!\n`);
}

main().catch(console.error);
