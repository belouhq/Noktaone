/**
 * scripts/i18n-sync.ts
 *
 * Auto-sync translations from lib/i18n/locales/en.json to other locales.
 * - Detect missing keys
 * - Detect changed English strings (via hash cache)
 * - Translate using OpenAI API (gpt-4o-mini)
 * - Enforce NOKTA tone + forbidden words per language
 * - Fallback if API fails (keep existing, fill missing with English)
 *
 * Run: npm run i18n:sync
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

type Dict = Record<string, any>;
type Locale = string;

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "lib/i18n/locales");
const SOURCE_LOCALE: Locale = "en";
const SOURCE_PATH = path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`);

const LOCALES: Locale[] = [
  "fr",
  "es",
  "de",
  "it",
  "pt",
  "ar",
  "hi",
  "id",
  "ja",
  "ko",
  "zh",
];

const MODEL = "gpt-4o-mini";
const CACHE_PATH = path.join(ROOT, ".i18n-sync-cache.json");
const REPORT_PATH = path.join(ROOT, ".i18n-sync-report.json");

// CI behavior
const FAIL_ON_MISSING = process.env.I18N_FAIL_ON_MISSING === "true";
const DRY_RUN = process.env.I18N_DRY_RUN === "true";

// Rate control
const MAX_KEYS_PER_CALL = 35;
const MAX_RETRIES = 2;

// ---- Forbidden words (exact lists) ----
const FORBIDDEN: Record<Locale, string[]> = {
  en: ["diagnosis", "diagnose", "treatment", "treat", "medical", "medicine", "disease", "disorder", "anxiety", "depression", "burnout", "panic", "therapy", "therapist"],
  fr: ["diagnostic", "diagnostiquer", "traitement", "traiter", "médical", "médecine", "maladie", "trouble", "anxiété", "dépression", "burn-out", "burn out", "panique", "thérapie", "thérapeute"],
  es: ["diagnóstico", "diagnosticar", "tratamiento", "tratar", "médico", "medicina", "enfermedad", "trastorno", "ansiedad", "depresión", "agotamiento", "burnout", "pánico", "terapia", "terapeuta"],
  de: ["diagnose", "diagnostizieren", "behandlung", "behandeln", "medizinisch", "medizin", "krankheit", "störung", "angst", "depression", "burnout", "panik", "therapie", "therapeut"],
  it: ["diagnosi", "diagnosticare", "trattamento", "trattare", "medico", "medicina", "malattia", "disturbo", "ansia", "depressione", "burnout", "panico", "terapia", "terapeuta"],
  pt: ["diagnóstico", "diagnosticar", "tratamento", "tratar", "médico", "medicina", "doença", "distúrbio", "ansiedade", "depressão", "burnout", "pânico", "terapia", "terapeuta"],
  ar: ["تشخيص", "علاج", "طبي", "طب", "مرض", "اضطراب", "قلق", "اكتئاب", "إرهاق", "احتراق", "هلع", "علاج نفسي", "معالج"],
  hi: ["निदान", "इलाज", "चिकित्सा", "मेडिकल", "बीमारी", "विकार", "चिंता", "अवसाद", "बर्नआउट", "घबराहट", "थेरेपी", "चिकित्सक"],
  id: ["diagnosis", "pengobatan", "medis", "obat", "penyakit", "gangguan", "kecemasan", "depresi", "kelelahan", "kepanikan", "terapi", "terapis"],
  ja: ["診断", "治療", "医療", "医学", "病気", "障害", "不安", "うつ", "燃え尽き", "パニック", "セラピー", "治療者"],
  ko: ["진단", "치료", "의료", "의학", "질병", "장애", "불안", "우울", "번아웃", "패닉", "치료", "테라피", "치료사"],
  zh: ["诊断", "治疗", "医疗", "医学", "疾病", "障碍", "焦虑", "抑郁", "倦怠", "恐慌", "心理治疗", "治疗师"],
};

// Optional: key-specific allowlist
const ALLOW_FORBIDDEN_ON_KEYS: string[] = [
  "legal.notMedical",
  "legal.notTherapy",
  "legal.notMeditation",
  "legal.disclaimer",
  "skane.disclaimer",
  "info.noDiagnosis",
  "camera.cannotAccessCamera", // May contain "medical" in error context
];

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

function writeJson(p: string, obj: unknown) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

function exists(p: string) {
  return fs.existsSync(p);
}

function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Flatten nested object to dot-notation keys
function flatten(obj: Dict, prefix = ""): Dict {
  const result: Dict = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = String(v);
    }
  }
  return result;
}

// Unflatten dot-notation keys back to nested object
function unflatten(flat: Dict): Dict {
  const result: Dict = {};
  for (const [k, v] of Object.entries(flat)) {
    const parts = k.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) current[part] = {};
      current = current[part] as Dict;
    }
    current[parts[parts.length - 1]] = v;
  }
  return result;
}

type Cache = {
  sourceHashByKey: Record<string, string>;
};

function loadCache(): Cache {
  if (!exists(CACHE_PATH)) return { sourceHashByKey: {} };
  return readJson<Cache>(CACHE_PATH);
}

function saveCache(cache: Cache) {
  writeJson(CACHE_PATH, cache);
}

function ensureLocalesDir() {
  if (!exists(LOCALES_DIR)) fs.mkdirSync(LOCALES_DIR, { recursive: true });
}

function localePath(locale: Locale) {
  return path.join(LOCALES_DIR, `${locale}.json`);
}

function loadLocale(locale: Locale): Dict {
  const p = localePath(locale);
  if (!exists(p)) return {};
  return readJson<Dict>(p);
}

function saveLocale(locale: Locale, dict: Dict) {
  const p = localePath(locale);
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would save ${p}`);
    return;
  }
  writeJson(p, dict);
}

function isForbiddenHit(locale: Locale, key: string, value: string): string[] {
  if (ALLOW_FORBIDDEN_ON_KEYS.includes(key)) return [];
  const list = FORBIDDEN[locale] ?? [];
  const v = value.toLowerCase();
  return list.filter((w) => v.includes(w.toLowerCase()));
}

function buildTranslationPrompt(params: {
  targetLocale: Locale;
  forbidden: string[];
  items: Array<{ key: string; en: string }>;
}) {
  const { targetLocale, forbidden, items } = params;

  return `You translate UI microcopy for NOKTA ONE (wellness app). Output MUST be strict JSON only.

TARGET_LOCALE: ${targetLocale}

Brand lexicon rules:
- NEVER translate these tokens if they appear: "Nokta One", "NOKTA ONE", "SKANE", "Skane", "Skane Index", "Reset".
- Keep "Skane" as a verb if it is used that way in English.
- Keep capitalization in keys like "SKANE COMPLETED" if English is uppercase.

Tone rules (critical):
- Very short phrases. Prefer 2–6 words.
- Simple, concrete, body-focused wording.
- No explanations, no "why".
- No slang. No hype. No guilt.
- Keep questions short.
- Preserve placeholders exactly: {name}, {count}, %d, etc. (do not alter).
- Preserve line breaks \\n if any.

Safety / compliance:
- Do NOT use medical framing. Do NOT imply diagnosis or treatment.
- Avoid mental-health labels.
- Forbidden words/phrases in this locale (must NOT appear anywhere): ${JSON.stringify(forbidden)}

Task:
Translate each English value into ${targetLocale}.
Return JSON object of shape:
{
  "translations": {
    "<key>": "<translated string>",
    ...
  }
}

Items:
${items.map((it) => `- ${it.key}: ${JSON.stringify(it.en)}`).join("\n")}
`.trim();
}

async function openaiTranslateBatch(opts: {
  client: OpenAI;
  targetLocale: Locale;
  forbidden: string[];
  items: Array<{ key: string; en: string }>;
}) {
  const { client, targetLocale, forbidden, items } = opts;

  const prompt = buildTranslationPrompt({ targetLocale, forbidden, items });

  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a translation assistant. Always return valid JSON only, no prose.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const text = res.choices[0]?.message?.content?.trim() ?? "";
  const parsed = JSON.parse(text) as { translations: Record<string, string> };
  if (!parsed?.translations) throw new Error("Invalid response JSON: missing translations");
  return parsed.translations;
}

async function translateWithRetries(opts: {
  client: OpenAI;
  targetLocale: Locale;
  forbidden: string[];
  items: Array<{ key: string; en: string }>;
}) {
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const t = await openaiTranslateBatch(opts);

      // Validate forbidden words
      for (const [k, v] of Object.entries(t)) {
        const hits = isForbiddenHit(opts.targetLocale, k, v);
        if (hits.length) {
          throw new Error(`Forbidden words hit in ${opts.targetLocale}.${k}: ${hits.join(", ")}`);
        }
      }

      return t;
    } catch (e) {
      lastErr = e;
      const waitMs = 500 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function main() {
  ensureLocalesDir();

  if (!exists(SOURCE_PATH)) {
    throw new Error(`Missing source file: ${SOURCE_PATH}`);
  }

  const sourceNested = loadLocale(SOURCE_LOCALE);
  const source = flatten(sourceNested);
  const cache = loadCache();

  // Build source hash map
  const newSourceHashByKey: Record<string, string> = {};
  for (const [k, v] of Object.entries(source)) {
    newSourceHashByKey[k] = sha1(v);
  }

  const changedKeys: string[] = [];
  for (const [k, h] of Object.entries(newSourceHashByKey)) {
    if (cache.sourceHashByKey[k] && cache.sourceHashByKey[k] !== h) changedKeys.push(k);
  }

  const report: any = {
    model: MODEL,
    sourceLocale: SOURCE_LOCALE,
    locales: LOCALES,
    changedKeys,
    results: {},
    apiFallbackUsed: false,
    timestamp: new Date().toISOString(),
  };

  const apiKeyPresent = !!process.env.OPENAI_API_KEY;
  const client = apiKeyPresent ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

  for (const locale of LOCALES) {
    const dictNested = loadLocale(locale);
    const dict = flatten(dictNested);

    const missing = Object.keys(source).filter((k) => !(k in dict));
    const toUpdate = changedKeys.filter((k) => k in dict);

    const needs = Array.from(new Set([...missing, ...toUpdate]));

    report.results[locale] = {
      missingCount: missing.length,
      updateCount: toUpdate.length,
      totalWork: needs.length,
      apiUsed: false,
      fallbackToEnglish: 0,
      forbiddenHits: [],
    };

    if (needs.length === 0) {
      continue;
    }

    // If no API key or client, fallback to English for missing only
    if (!client) {
      report.apiFallbackUsed = true;
      for (const k of missing) {
        dict[k] = source[k];
        report.results[locale].fallbackToEnglish++;
      }
      const updatedNested = unflatten(dict);
      saveLocale(locale, updatedNested);
      continue;
    }

    // Translate in chunks
    const keyChunks = chunk(needs, MAX_KEYS_PER_CALL);
    report.results[locale].apiUsed = true;

    for (const keys of keyChunks) {
      const items = keys.map((k) => ({ key: k, en: source[k] }));

      try {
        const translations = await translateWithRetries({
          client,
          targetLocale: locale,
          forbidden: FORBIDDEN[locale] ?? [],
          items,
        });

        for (const k of keys) {
          const v = translations[k];
          if (typeof v === "string" && v.trim().length) {
            dict[k] = v;
          } else if (!(k in dict)) {
            dict[k] = source[k];
            report.results[locale].fallbackToEnglish++;
          }
        }
      } catch (e) {
        report.apiFallbackUsed = true;
        console.error(`[i18n] Translation failed for ${locale}, chunk:`, e);

        for (const { key: k } of items) {
          if (!(k in dict)) {
            dict[k] = source[k];
            report.results[locale].fallbackToEnglish++;
          }
        }
      }
    }

    // Final forbidden scan
    const forbiddenHits: Array<{ key: string; hits: string[] }> = [];
    for (const [k, v] of Object.entries(dict)) {
      const hits = isForbiddenHit(locale, k, v);
      if (hits.length) forbiddenHits.push({ key: k, hits });
    }
    report.results[locale].forbiddenHits = forbiddenHits;

    const updatedNested = unflatten(dict);
    saveLocale(locale, updatedNested);
  }

  // Save cache
  cache.sourceHashByKey = newSourceHashByKey;
  if (!DRY_RUN) saveCache(cache);

  // Save report
  writeJson(REPORT_PATH, report);

  // Optional CI fail
  if (FAIL_ON_MISSING) {
    const anyFallback = Object.values(report.results).some((r: any) => r.fallbackToEnglish > 0);
    const anyForbidden = Object.values(report.results).some((r: any) => (r.forbiddenHits?.length ?? 0) > 0);
    if (anyFallback || anyForbidden) {
      throw new Error(`i18n sync issues: fallback=${anyFallback}, forbidden=${anyForbidden}. See ${REPORT_PATH}`);
    }
  }

  console.log(`[i18n] sync complete. Report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error("[i18n] sync failed:", err);
  process.exit(1);
});
