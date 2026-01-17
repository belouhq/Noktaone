import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const LOCALES_PATH = path.join(process.cwd(), 'lib/i18n/locales');

function loadJSON(filename: string): Record<string, any> {
  const filePath = path.join(LOCALES_PATH, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJSON(filename: string, data: Record<string, any>): void {
  const filePath = path.join(LOCALES_PATH, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Translate this French text to ${targetLang} for a wellness app. Keep it concise and natural. Keep "Skane" and "NOKTA" unchanged. Keep {{placeholders}} unchanged.

Text: "${text}"

Return ONLY the translation, nothing else.`
    }],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content?.trim() || text;
}

async function main() {
  // Arguments: npm run add-translation "section.key" "Texte en français"
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npm run add-translation "section.key" "Texte en français"');
    console.log('Example: npm run add-translation "home.welcome" "Bienvenue sur NOKTA"');
    process.exit(1);
  }
  
  const [key, frenchText] = args;
  
  console.log(`\n🌍 Adding translation for: ${key}`);
  console.log(`   French: "${frenchText}"\n`);
  
  // 1. Ajouter au fichier français
  const frData = loadJSON('fr.json');
  setNestedValue(frData, key, frenchText);
  saveJSON('fr.json', frData);
  console.log(`✅ Added to fr.json`);
  
  // 2. Traduire et ajouter aux autres langues
  for (const [langCode, langName] of Object.entries(TARGET_LANGUAGES)) {
    const translated = await translateText(frenchText, langName);
    
    const langData = loadJSON(`${langCode}.json`);
    setNestedValue(langData, key, translated);
    saveJSON(`${langCode}.json`, langData);
    
    console.log(`✅ ${langCode}: "${translated}"`);
  }
  
  console.log(`\n🎉 Done! Use: t('${key}')\n`);
}

main().catch(console.error);
