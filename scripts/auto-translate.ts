#!/usr/bin/env npx ts-node --project scripts/tsconfig.json

/**
 * auto-translate.ts
 * 
 * Script simplifié qui FONCTIONNE :
 * 1. Lit fr.json (source de vérité)
 * 2. Compare avec chaque langue
 * 3. Traduit les clés manquantes via OpenAI
 * 4. Sauvegarde
 * 
 * Usage: npm run auto-translate
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ============================================
// CONFIG
// ============================================

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const LOCALES_PATH = path.join(process.cwd(), 'lib/i18n/locales');
const SOURCE_LANG = 'fr';

const TARGET_LANGUAGES: Record<string, string> = {
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

// ============================================
// HELPERS
// ============================================

function loadJSON(filename: string): Record<string, any> {
  const filePath = path.join(LOCALES_PATH, filename);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJSON(filename: string, data: Record<string, any>): void {
  const filePath = path.join(LOCALES_PATH, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flatten(obj[key], newKey));
    } else {
      result[newKey] = String(obj[key]);
    }
  }
  return result;
}

function unflatten(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in flat) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = flat[key];
  }
  return result;
}

function findMissingKeys(source: Record<string, string>, target: Record<string, string>): string[] {
  return Object.keys(source).filter(key => !(key in target));
}

// ============================================
// TRANSLATION
// ============================================

async function translateBatch(
  openai: OpenAI,
  texts: Record<string, string>,
  targetLang: string
): Promise<Record<string, string>> {
  if (Object.keys(texts).length === 0) return {};

  const prompt = `Translate this JSON from French to ${targetLang} for a wellness app.

RULES:
- Keep JSON structure exactly
- Keep keys unchanged, only translate values
- Keep "Skane", "NOKTA", "Nokta One" unchanged
- Keep placeholders like {{count}}, {name} unchanged
- Be concise (mobile UI)
- No medical terms

JSON:
${JSON.stringify(texts, null, 2)}

Return ONLY valid JSON, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error(`  ❌ Error translating to ${targetLang}:`, error);
    return {};
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🌍 Auto-translate starting...\n');

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('❌ Missing or invalid OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  // Load source (French)
  const sourceData = loadJSON(`${SOURCE_LANG}.json`);
  const sourceFlat = flatten(sourceData);
  const totalKeys = Object.keys(sourceFlat).length;

  console.log(`📖 Source: ${SOURCE_LANG}.json (${totalKeys} keys)\n`);

  let totalTranslated = 0;
  let totalMissing = 0;

  // Process each target language
  for (const [langCode, langName] of Object.entries(TARGET_LANGUAGES)) {
    process.stdout.write(`${langCode.toUpperCase().padEnd(3)} ${langName.padEnd(20)}`);

    // Load target
    const targetData = loadJSON(`${langCode}.json`);
    const targetFlat = flatten(targetData);

    // Find missing keys
    const missingKeys = findMissingKeys(sourceFlat, targetFlat);

    if (missingKeys.length === 0) {
      console.log(`✅ Complete`);
      continue;
    }

    totalMissing += missingKeys.length;
    process.stdout.write(`⏳ ${missingKeys.length} missing... `);

    // Build texts to translate
    const textsToTranslate: Record<string, string> = {};
    for (const key of missingKeys) {
      textsToTranslate[key] = sourceFlat[key];
    }

    // Translate in batches of 50 keys max
    const keys = Object.keys(textsToTranslate);
    const batchSize = 50;
    let translated: Record<string, string> = {};

    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      const batchTexts: Record<string, string> = {};
      for (const k of batchKeys) {
        batchTexts[k] = textsToTranslate[k];
      }

      const result = await translateBatch(openai, batchTexts, langName);
      translated = { ...translated, ...result };
    }

    const translatedCount = Object.keys(translated).length;

    if (translatedCount > 0) {
      // Merge and save
      const mergedFlat = { ...targetFlat, ...translated };
      const mergedNested = unflatten(mergedFlat);
      saveJSON(`${langCode}.json`, mergedNested);
      totalTranslated += translatedCount;
      console.log(`✅ +${translatedCount} translated`);
    } else {
      console.log(`⚠️  Failed`);
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   Missing keys found: ${totalMissing}`);
  console.log(`   Keys translated:    ${totalTranslated}`);
  console.log('─'.repeat(50) + '\n');

  if (totalTranslated > 0) {
    console.log('✅ Translations complete! Files updated.\n');
  } else if (totalMissing === 0) {
    console.log('✅ All languages are complete!\n');
  } else {
    console.log('⚠️  Some translations failed. Check your API key.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
