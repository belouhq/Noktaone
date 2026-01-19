#!/usr/bin/env npx ts-node

/**
 * 🌍 NOKTA ONE - Automatic Translation Sync (Simplified)
 * 
 * Ce script synchronise automatiquement toutes les traductions.
 * Il détecte les clés manquantes et les traduit via OpenAI.
 * 
 * Usage:
 *   npm run i18n:sync:simple
 *   
 * Ou automatiquement via:
 *   - Pre-commit hook
 *   - GitHub Actions
 *   - npm run build (ajouté dans package.json)
 */

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ============================================
// CONFIGURATION
// ============================================

const SOURCE_LOCALE = 'en'; // Langue source (référence) - en.json est la source de vérité
const LOCALES_DIR = path.join(process.cwd(), 'lib/i18n/locales');

const TARGET_LANGUAGES: Record<string, string> = {
  fr: 'French (France)',
  es: 'Spanish (Spain)',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese (Brazil)',
  ar: 'Arabic',
  hi: 'Hindi',
  id: 'Indonesian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
};

// Mots/phrases à NE PAS traduire (noms de marque, termes techniques)
const PRESERVE_WORDS = [
  'Nokta',
  'NOKTA',
  'NOKTA ONE',
  'Skane',
  'skane',
  'SKANE',
  'Skane Index',
  'Reset',
];

// Mots interdits par langue (ne doivent PAS apparaître dans les traductions)
const FORBIDDEN_WORDS: Record<string, string[]> = {
  en: ['diagnosis', 'diagnose', 'treatment', 'treat', 'medical', 'medicine', 'disease', 'disorder', 'anxiety', 'depression', 'burnout', 'panic', 'therapy', 'therapist'],
  fr: ['diagnostic', 'diagnostiquer', 'traitement', 'traiter', 'médical', 'médecine', 'maladie', 'trouble', 'anxiété', 'dépression', 'burn-out', 'burn out', 'panique', 'thérapie', 'thérapeute'],
  es: ['diagnóstico', 'diagnosticar', 'tratamiento', 'tratar', 'médico', 'medicina', 'enfermedad', 'trastorno', 'ansiedad', 'depresión', 'agotamiento', 'burnout', 'pánico', 'terapia', 'terapeuta'],
  de: ['diagnose', 'diagnostizieren', 'behandlung', 'behandeln', 'medizinisch', 'medizin', 'krankheit', 'störung', 'angst', 'depression', 'burnout', 'panik', 'therapie', 'therapeut'],
  it: ['diagnosi', 'diagnosticare', 'trattamento', 'trattare', 'medico', 'medicina', 'malattia', 'disturbo', 'ansia', 'depressione', 'burnout', 'panico', 'terapia', 'terapeuta'],
  pt: ['diagnóstico', 'diagnosticar', 'tratamento', 'tratar', 'médico', 'medicina', 'doença', 'distúrbio', 'ansiedade', 'depressão', 'burnout', 'pânico', 'terapia', 'terapeuta'],
  ar: ['تشخيص', 'علاج', 'طبي', 'مرض', 'قلق', 'اكتئاب'],
  hi: ['निदान', 'उपचार', 'चिकित्सा', 'रोग', 'चिंता', 'अवसाद'],
  id: ['diagnosis', 'pengobatan', 'medis', 'obat', 'penyakit', 'gangguan', 'kecemasan', 'depresi', 'kelelahan', 'kepanikan', 'terapi', 'terapis'],
  ja: ['診断', '治療', '医学', '病気', '不安', 'うつ病'],
  ko: ['진단', '치료', '의학', '질병', '불안', '우울증'],
  zh: ['诊断', '治疗', '医学', '疾病', '焦虑', '抑郁'],
};

// ============================================
// HELPERS
// ============================================

function loadJSON(locale: string): Record<string, any> {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJSON(locale: string, data: Record<string, any>): void {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Aplatir un objet JSON imbriqué en clés avec points
 * { "a": { "b": "c" } } => { "a.b": "c" }
 */
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

/**
 * Reconstruire un objet imbriqué à partir de clés avec points
 * { "a.b": "c" } => { "a": { "b": "c" } }
 */
function unflattenObject(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
}

/**
 * Trouver les clés manquantes
 */
function findMissingKeys(
  source: Record<string, string>,
  target: Record<string, string>
): Record<string, string> {
  const missing: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      missing[key] = value;
    }
  }
  
  return missing;
}

/**
 * Trouver les clés obsolètes (dans target mais pas dans source)
 */
function findObsoleteKeys(
  source: Record<string, string>,
  target: Record<string, string>
): string[] {
  return Object.keys(target).filter(key => !(key in source));
}

/**
 * Vérifier si une traduction contient des mots interdits
 */
function checkForbiddenWords(locale: string, text: string): string[] {
  const forbidden = FORBIDDEN_WORDS[locale] || [];
  const hits: string[] = [];
  
  const lowerText = text.toLowerCase();
  for (const word of forbidden) {
    if (lowerText.includes(word.toLowerCase())) {
      hits.push(word);
    }
  }
  
  return hits;
}

// ============================================
// TRADUCTION OPENAI
// ============================================

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('❌ OPENAI_API_KEY is not set. Add it to .env.local');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

async function translateBatch(
  texts: Record<string, string>,
  targetLanguage: string,
  targetLocale: string
): Promise<Record<string, string>> {
  const entries = Object.entries(texts);
  if (entries.length === 0) return {};

  const client = getOpenAI();
  
  // Construire le prompt
  const textsToTranslate = entries
    .map(([key, value]) => `"${key}": "${value}"`)
    .join('\n');

  const preserveList = PRESERVE_WORDS.join(', ');
  const forbiddenList = (FORBIDDEN_WORDS[targetLocale] || []).join(', ');

  const prompt = `You are a professional translator for a wellness/health app called "NOKTA ONE".

Translate the following English texts to ${targetLanguage}.

STRICT RULES:
1. Keep translations SHORT and NATURAL (same length or shorter than original)
2. DO NOT translate these brand terms (keep them exactly as-is): ${preserveList}
3. Preserve all placeholders like {{count}}, {{hours}}, {{name}}, %d, etc. exactly as-is
4. Preserve \\n for line breaks
5. Use informal/friendly tone (like talking to a friend)
6. For wellness context: focus on body feelings, not medical terms
7. NEVER use these forbidden words/phrases: ${forbiddenList || 'none'}
8. Do NOT use medical framing. Do NOT imply diagnosis or treatment.
9. Avoid mental-health labels.
10. Return ONLY a valid JSON object with the same keys

Texts to translate:
${textsToTranslate}

Return format (JSON only, no markdown):
{"key1": "translation1", "key2": "translation2"}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a translation assistant. Always return valid JSON only, no prose, no markdown code blocks.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    
    // Parser le JSON (enlever les backticks markdown si présents)
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const translated = JSON.parse(cleanContent);
    
    // Vérifier les mots interdits
    const forbiddenHits: Array<{ key: string; words: string[] }> = [];
    for (const [key, value] of Object.entries(translated)) {
      const hits = checkForbiddenWords(targetLocale, String(value));
      if (hits.length > 0) {
        forbiddenHits.push({ key, words: hits });
        console.warn(`   ⚠️  Forbidden words in ${key}: ${hits.join(', ')}`);
      }
    }
    
    if (forbiddenHits.length > 0) {
      console.warn(`   ⚠️  Warning: ${forbiddenHits.length} translations contain forbidden words`);
    }
    
    return translated;
  } catch (error) {
    console.error(`   ⚠️  Translation API error:`, error);
    
    // Fallback: utiliser le texte source (anglais)
    const fallback: Record<string, string> = {};
    for (const [key, value] of entries) {
      fallback[key] = value; // Garder l'anglais comme fallback
    }
    return fallback;
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🌍 NOKTA ONE - Translation Sync (Simplified)\n');
  console.log('================================\n');

  // Charger la langue source
  const sourceData = loadJSON(SOURCE_LOCALE);
  if (Object.keys(sourceData).length === 0) {
    console.error(`❌ Source file ${SOURCE_LOCALE}.json not found or empty`);
    process.exit(1);
  }
  
  const sourceFlat = flattenObject(sourceData);
  const sourceKeyCount = Object.keys(sourceFlat).length;

  console.log(`📖 Source: ${SOURCE_LOCALE}.json (${sourceKeyCount} keys)\n`);

  let totalMissing = 0;
  let totalTranslated = 0;
  let totalObsolete = 0;

  // Pour chaque langue cible
  for (const [langCode, langName] of Object.entries(TARGET_LANGUAGES)) {
    process.stdout.write(`🔄 ${langName} (${langCode})... `);

    // Charger le fichier cible
    const targetData = loadJSON(langCode);
    const targetFlat = flattenObject(targetData);

    // Trouver les clés manquantes
    const missingKeys = findMissingKeys(sourceFlat, targetFlat);
    const missingCount = Object.keys(missingKeys).length;

    // Trouver les clés obsolètes
    const obsoleteKeys = findObsoleteKeys(sourceFlat, targetFlat);
    const obsoleteCount = obsoleteKeys.length;

    if (missingCount === 0 && obsoleteCount === 0) {
      console.log('✅ Up to date');
      continue;
    }

    totalMissing += missingCount;
    totalObsolete += obsoleteCount;

    // Supprimer les clés obsolètes
    if (obsoleteCount > 0) {
      for (const key of obsoleteKeys) {
        delete targetFlat[key];
      }
    }

    // Traduire les clés manquantes
    if (missingCount > 0) {
      console.log(`\n   📝 ${missingCount} missing, translating...`);
      
      // Traduire par lots de 20 pour éviter les limites
      const missingEntries = Object.entries(missingKeys);
      const batchSize = 20;
      const translated: Record<string, string> = {};

      for (let i = 0; i < missingEntries.length; i += batchSize) {
        const batch = Object.fromEntries(missingEntries.slice(i, i + batchSize));
        const batchTranslated = await translateBatch(batch, langName, langCode);
        Object.assign(translated, batchTranslated);
        
        // Petit délai pour éviter le rate limiting
        if (i + batchSize < missingEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Fusionner
      Object.assign(targetFlat, translated);
      totalTranslated += Object.keys(translated).length;
      
      console.log(`   ✅ Translated ${Object.keys(translated).length} keys`);
    }

    if (obsoleteCount > 0) {
      console.log(`   🗑️  Removed ${obsoleteCount} obsolete keys`);
    }

    // Reconstruire et sauvegarder
    const mergedNested = unflattenObject(targetFlat);
    saveJSON(langCode, mergedNested);
  }

  // Résumé
  console.log('\n================================');
  console.log('📊 Summary:');
  console.log(`   • Source keys: ${sourceKeyCount}`);
  console.log(`   • Missing found: ${totalMissing}`);
  console.log(`   • Translated: ${totalTranslated}`);
  console.log(`   • Obsolete removed: ${totalObsolete}`);
  console.log('\n✨ Translation sync complete!\n');
}

// Exécuter
main().catch(error => {
  console.error('\n❌ Sync failed:', error);
  process.exit(1);
});
