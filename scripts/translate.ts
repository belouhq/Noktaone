import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.local
const envPath = path.join(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || apiKey.includes('NOUVELLE_CLE') || !apiKey.startsWith('sk-')) {
  console.error('❌ Invalid API key detected. Please check .env.local');
  console.error('   Key starts with:', apiKey?.substring(0, 10) || 'NOT FOUND');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Langues cibles (code ISO → nom pour le prompt)
const TARGET_LANGUAGES: Record<string, string> = {
  en: 'English (US)',
  es: 'Spanish (Spain)',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese (Simplified)',
  ar: 'Arabic (Modern Standard Arabic)',
  pt: 'Portuguese (Brazil)',
  hi: 'Hindi',
  id: 'Indonesian',
  ja: 'Japanese',
  ko: 'Korean',
};

// Chemin vers les fichiers de traduction
const LOCALES_PATH = path.join(process.cwd(), 'lib/i18n/locales');

// Charger un fichier JSON
function loadJSON(filename: string): Record<string, any> {
  const filePath = path.join(LOCALES_PATH, filename);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Sauvegarder un fichier JSON
function saveJSON(filename: string, data: Record<string, any>): void {
  const filePath = path.join(LOCALES_PATH, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Saved: ${filename}`);
}

// Aplatir un objet imbriqué en clés avec points
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

// Reconstruire un objet imbriqué depuis des clés avec points
function unflattenObject(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in flat) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = flat[key];
  }
  
  return result;
}

// Trouver les clés manquantes dans une langue
// Si la valeur cible est identique à la source (français), on considère qu'elle doit être traduite
function findMissingKeys(source: Record<string, string>, target: Record<string, string>): Record<string, string> {
  const missing: Record<string, string> = {};
  
  for (const key in source) {
    // Si la clé n'existe pas OU si la valeur est identique au français (pas encore traduite)
    if (!target[key] || target[key] === source[key]) {
      missing[key] = source[key];
    }
  }
  
  return missing;
}

// Traduire un batch de textes avec OpenAI
async function translateBatch(
  texts: Record<string, string>,
  targetLanguage: string
): Promise<Record<string, string>> {
  if (Object.keys(texts).length === 0) {
    return {};
  }

  const prompt = `You are a professional translator for a wellness/health app called "NOKTA ONE".

Translate the following JSON from French to ${targetLanguage}.

RULES:
- Keep the JSON structure exactly the same
- Keep all keys unchanged (only translate values)
- Keep technical terms like "Skane", "NOKTA" unchanged
- Keep placeholders like {{count}}, {{hours}} unchanged
- Use natural, conversational language appropriate for a mobile app
- Be concise - mobile UI requires short texts

French JSON to translate:
${JSON.stringify(texts, null, 2)}

Return ONLY the translated JSON, no explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Nettoyer la réponse (enlever les backticks markdown si présents)
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error(`❌ Translation error for ${targetLanguage}:`, error);
    return {};
  }
}

// Fonction principale
async function main() {
  console.log('🌍 Starting automatic translation...\n');

  // Charger le fichier source (français)
  const frenchData = loadJSON('fr.json');
  const frenchFlat = flattenObject(frenchData);
  
  console.log(`📖 Found ${Object.keys(frenchFlat).length} keys in fr.json\n`);

  // Pour chaque langue cible
  for (const [langCode, langName] of Object.entries(TARGET_LANGUAGES)) {
    console.log(`\n🔄 Processing ${langName} (${langCode})...`);
    
    // Charger le fichier de la langue cible
    const targetData = loadJSON(`${langCode}.json`);
    const targetFlat = flattenObject(targetData);
    
    // Trouver les clés manquantes
    const missingKeys = findMissingKeys(frenchFlat, targetFlat);
    const missingCount = Object.keys(missingKeys).length;
    
    if (missingCount === 0) {
      console.log(`   ✅ All keys present, skipping.`);
      continue;
    }
    
    console.log(`   📝 Found ${missingCount} missing keys, translating...`);
    
    // Traduire les clés manquantes
    const translated = await translateBatch(missingKeys, langName);
    
    if (Object.keys(translated).length > 0) {
      // Fusionner avec les traductions existantes
      const mergedFlat = { ...targetFlat, ...translated };
      const mergedNested = unflattenObject(mergedFlat);
      
      // Sauvegarder
      saveJSON(`${langCode}.json`, mergedNested);
      console.log(`   ✅ Translated ${Object.keys(translated).length} keys`);
    } else {
      console.log(`   ⚠️ No translations received`);
    }
  }
  
  console.log('\n🎉 Translation complete!\n');
}

main().catch(console.error);
