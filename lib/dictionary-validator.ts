/**
 * NOKTA DICTIONARY VALIDATOR
 * 
 * Utilitaires pour valider que les traductions respectent
 * les règles du lexique Nokta.
 */

import dictionary from './nokta-dictionary.json';

type Locale = 'en' | 'fr' | 'es' | 'de' | 'ja' | 'pt' | 'it' | 'hi' | 'id' | 'ko' | 'zh' | 'ar';

/**
 * Liste des termes qui ne doivent JAMAIS être traduits
 */
export const NEVER_TRANSLATE = dictionary.neverTranslate;

/**
 * Liste des mots interdits par langue
 */
export const FORBIDDEN_WORDS = dictionary.forbiddenWords;

/**
 * Vérifie si un texte contient des mots interdits
 */
export function containsForbiddenWords(text: string, locale: Locale = 'en'): string[] {
  const words = [
    ...FORBIDDEN_WORDS.universal,
    ...(FORBIDDEN_WORDS[locale as keyof typeof FORBIDDEN_WORDS] || [])
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const word of words) {
    if (lowerText.includes(word.toLowerCase())) {
      found.push(word);
    }
  }
  
  return found;
}

/**
 * Vérifie si un texte a traduit par erreur un terme intouchable
 */
export function hasTranslatedUntranslatable(originalEn: string, translated: string): boolean {
  for (const term of NEVER_TRANSLATE) {
    const termLower = term.toLowerCase();
    
    // Si le terme est dans l'original anglais
    if (originalEn.toLowerCase().includes(termLower)) {
      // Il doit aussi être dans la traduction (identique)
      if (!translated.toLowerCase().includes(termLower)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Suggère des remplacements pour les mots interdits
 */
export function suggestReplacement(forbiddenWord: string, locale: Locale = 'en'): string | null {
  const replacements = dictionary.replacements;
  const key = forbiddenWord.toLowerCase() as keyof typeof replacements;
  
  if (replacements[key]) {
    return locale === 'en' 
      ? replacements[key].use 
      : (replacements[key] as any)[locale] || replacements[key].use;
  }
  
  return null;
}

/**
 * Valide une traduction complète
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'forbidden_word' | 'translated_untranslatable';
  message: string;
  suggestion?: string;
}

export interface ValidationWarning {
  type: 'possible_issue';
  message: string;
}

export function validateTranslation(
  key: string,
  originalEn: string,
  translated: string,
  locale: Locale
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check forbidden words
  const forbidden = containsForbiddenWords(translated, locale);
  for (const word of forbidden) {
    const suggestion = suggestReplacement(word, locale);
    errors.push({
      type: 'forbidden_word',
      message: `Found forbidden word "${word}" in translation for key "${key}"`,
      suggestion: suggestion ? `Use "${suggestion}" instead` : undefined,
    });
  }
  
  // Check untranslatable terms
  if (hasTranslatedUntranslatable(originalEn, translated)) {
    errors.push({
      type: 'translated_untranslatable',
      message: `Key "${key}" appears to have translated a term that should never be translated (${NEVER_TRANSLATE.join(', ')})`,
    });
  }
  
  // Warnings
  if (translated.length > originalEn.length * 2) {
    warnings.push({
      type: 'possible_issue',
      message: `Translation for "${key}" is much longer than original. Nokta prefers short phrases.`,
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valide un fichier de traduction complet
 */
export function validateTranslationFile(
  translations: Record<string, string>,
  englishBase: Record<string, string>,
  locale: Locale
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  
  for (const [key, translated] of Object.entries(translations)) {
    const original = englishBase[key];
    if (!original) continue;
    
    const result = validateTranslation(key, original, translated, locale);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Génère un rapport de validation
 */
export function generateValidationReport(result: ValidationResult): string {
  let report = '';
  
  if (result.isValid) {
    report += '✅ Translation is valid!\n';
  } else {
    report += '❌ Translation has errors:\n\n';
    
    for (const error of result.errors) {
      report += `  ERROR: ${error.message}\n`;
      if (error.suggestion) {
        report += `  💡 Suggestion: ${error.suggestion}\n`;
      }
      report += '\n';
    }
  }
  
  if (result.warnings.length > 0) {
    report += '\n⚠️ Warnings:\n';
    for (const warning of result.warnings) {
      report += `  - ${warning.message}\n`;
    }
  }
  
  return report;
}

/**
 * CLI-friendly validation function
 */
export async function validateLocaleFile(localePath: string, englishPath: string): Promise<void> {
  // This would be used in a build script
  console.log(`Validating ${localePath}...`);
  
  // In real implementation:
  // const locale = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  // const english = JSON.parse(fs.readFileSync(englishPath, 'utf-8'));
  // const result = validateTranslationFile(locale, english, extractLocale(localePath));
  // console.log(generateValidationReport(result));
}

// Export dictionary data
export { dictionary };
