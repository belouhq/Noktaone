// src/utils/nervousSystemScore.ts
// Algorithme de calcul du score du système nerveux pour Nokta
// Ce fichier contient la logique "secret sauce" de Nokta

import {
  NormalizedHealthData,
  NervousSystemScore,
  MicroActionRecommendation,
  HRVData,
  SleepData,
} from '../services/health/types';

/**
 * Plages de référence pour les métriques de santé
 * Basées sur des études scientifiques et ajustées pour la population cible
 */
const REFERENCE_RANGES = {
  hrv: {
    // SDNN en millisecondes
    poor: 20,      // < 20ms = système sympathique très actif (stress élevé)
    low: 30,       // 20-30ms = stress modéré
    normal: 50,    // 30-50ms = équilibré
    good: 70,      // 50-70ms = bonne récupération
    excellent: 100, // > 70ms = parasympathique dominant (très relaxé)
  },
  restingHeartRate: {
    // BPM au repos
    athletic: 50,   // < 50 = athlète
    excellent: 60,  // 50-60 = excellent
    good: 70,       // 60-70 = bon
    average: 80,    // 70-80 = moyen
    elevated: 90,   // 80-90 = élevé (stress)
    high: 100,      // > 90 = stress élevé ou problème de santé
  },
  sleep: {
    // Durée en minutes
    minimum: 360,   // 6h minimum
    recommended: 420, // 7h recommandé
    optimal: 480,   // 8h optimal
    maximum: 600,   // 10h max (trop de sommeil peut indiquer un problème)
  },
};

/**
 * Micro-actions recommandées par Nokta selon l'état
 */
const MICRO_ACTIONS: Record<string, MicroActionRecommendation[]> = {
  stressed: [
    {
      type: 'breathing',
      name: 'Box Breathing',
      duration: 120, // 2 minutes
      description: 'Inspirez 4s, retenez 4s, expirez 4s, retenez 4s. Répétez 5 fois.',
      priority: 'high',
    },
    {
      type: 'grounding',
      name: '5-4-3-2-1 Grounding',
      duration: 60,
      description: 'Identifiez 5 choses que vous voyez, 4 que vous entendez, 3 que vous touchez...',
      priority: 'high',
    },
    {
      type: 'tea',
      name: 'Thé Camomille',
      duration: 300, // 5 minutes pour préparer et boire
      description: 'Une tasse de camomille pour activer le système parasympathique.',
      priority: 'medium',
    },
  ],
  balanced: [
    {
      type: 'breathing',
      name: 'Respiration 4-7-8',
      duration: 90,
      description: 'Inspirez 4s, retenez 7s, expirez 8s. Maintenez l\'équilibre.',
      priority: 'medium',
    },
    {
      type: 'movement',
      name: 'Étirements légers',
      duration: 120,
      description: 'Quelques étirements pour maintenir la circulation.',
      priority: 'low',
    },
    {
      type: 'tea',
      name: 'Thé Vert',
      duration: 300,
      description: 'L-théanine pour la concentration calme.',
      priority: 'low',
    },
  ],
  relaxed: [
    {
      type: 'movement',
      name: 'Activation douce',
      duration: 180,
      description: 'Quelques mouvements dynamiques pour équilibrer l\'énergie.',
      priority: 'low',
    },
    {
      type: 'posture',
      name: 'Power Pose',
      duration: 60,
      description: 'Position debout, épaules en arrière, mains sur les hanches.',
      priority: 'low',
    },
    {
      type: 'tea',
      name: 'Matcha',
      duration: 300,
      description: 'Boost d\'énergie stable grâce à la L-théanine + caféine.',
      priority: 'low',
    },
  ],
};

/**
 * Calcule le score du système nerveux à partir des données de santé
 * 
 * L'algorithme combine:
 * 1. HRV (variabilité cardiaque) - Indicateur principal (60% du score)
 * 2. Fréquence cardiaque au repos - Indicateur secondaire (25% du score)
 * 3. Qualité du sommeil - Contexte de récupération (15% du score)
 * 
 * Score final: 0-100
 * - 0-30: Sympathique dominant (stress, fight-or-flight)
 * - 30-70: Équilibré
 * - 70-100: Parasympathique dominant (relaxation, rest-and-digest)
 */
export function calculateNervousSystemScore(
  data: NormalizedHealthData
): NervousSystemScore {
  const { hrv, restingHeartRate, sleep, heartRate } = data;

  // Calculer les scores individuels
  const hrvScore = calculateHRVScore(hrv);
  const heartRateScore = calculateHeartRateScore(restingHeartRate, heartRate?.average);
  const sleepScore = calculateSleepScore(sleep);

  // Pondération des scores
  const weights = {
    hrv: 0.60,      // HRV est l'indicateur le plus fiable
    heartRate: 0.25, // FC au repos est un bon indicateur secondaire
    sleep: 0.15,    // Sommeil donne le contexte de récupération
  };

  // Score final pondéré
  let finalScore: number;
  let confidence: 'low' | 'medium' | 'high';

  // Ajuster les poids si certaines données manquent
  if (hrvScore !== null && heartRateScore !== null && sleepScore !== null) {
    finalScore = 
      hrvScore * weights.hrv +
      heartRateScore * weights.heartRate +
      sleepScore * weights.sleep;
    confidence = 'high';
  } else if (hrvScore !== null) {
    // HRV seul est assez fiable
    finalScore = hrvScore;
    confidence = 'medium';
  } else if (heartRateScore !== null) {
    // FC seule est moins fiable mais utilisable
    finalScore = heartRateScore;
    confidence = 'low';
  } else {
    // Pas assez de données
    finalScore = 50; // Score neutre
    confidence = 'low';
  }

  // Déterminer l'état
  const state = getStateFromScore(finalScore);

  // Sélectionner la recommandation appropriée
  const recommendation = selectRecommendation(state, data);

  return {
    score: Math.round(finalScore),
    state,
    components: {
      hrvScore: hrvScore ?? 50,
      heartRateScore: heartRateScore ?? 50,
      sleepScore: sleepScore ?? 50,
    },
    recommendation,
    confidence,
    calculatedAt: new Date(),
  };
}

/**
 * Calcule le score basé sur l'HRV (SDNN ou RMSSD)
 * Score de 0 (stress max) à 100 (relaxation max)
 */
function calculateHRVScore(hrv: HRVData | null): number | null {
  if (!hrv) return null;

  // Utiliser SDNN principalement, RMSSD en backup
  const value = hrv.sdnn || (hrv.rmssd ? hrv.rmssd * 1.3 : null);
  if (value === null) return null;

  const { poor, low, normal, good, excellent } = REFERENCE_RANGES.hrv;

  // Mapping linéaire par segments
  if (value < poor) {
    return Math.max(0, (value / poor) * 15); // 0-15
  } else if (value < low) {
    return 15 + ((value - poor) / (low - poor)) * 15; // 15-30
  } else if (value < normal) {
    return 30 + ((value - low) / (normal - low)) * 20; // 30-50
  } else if (value < good) {
    return 50 + ((value - normal) / (good - normal)) * 20; // 50-70
  } else if (value < excellent) {
    return 70 + ((value - good) / (excellent - good)) * 20; // 70-90
  } else {
    return Math.min(100, 90 + ((value - excellent) / 30) * 10); // 90-100
  }
}

/**
 * Calcule le score basé sur la fréquence cardiaque
 * Une FC basse au repos = parasympathique actif = score élevé
 */
function calculateHeartRateScore(
  restingHR: number | null,
  averageHR: number | null
): number | null {
  // Préférer la FC au repos, sinon utiliser la moyenne
  const hr = restingHR ?? averageHR;
  if (hr === null) return null;

  const { athletic, excellent, good, average, elevated, high } = 
    REFERENCE_RANGES.restingHeartRate;

  // Mapping inversé (FC basse = score élevé)
  if (hr <= athletic) {
    return 95; // Excellent
  } else if (hr <= excellent) {
    return 95 - ((hr - athletic) / (excellent - athletic)) * 15; // 80-95
  } else if (hr <= good) {
    return 80 - ((hr - excellent) / (good - excellent)) * 15; // 65-80
  } else if (hr <= average) {
    return 65 - ((hr - good) / (average - good)) * 15; // 50-65
  } else if (hr <= elevated) {
    return 50 - ((hr - average) / (elevated - average)) * 20; // 30-50
  } else if (hr <= high) {
    return 30 - ((hr - elevated) / (high - elevated)) * 15; // 15-30
  } else {
    return Math.max(0, 15 - ((hr - high) / 20) * 15); // 0-15
  }
}

/**
 * Calcule le score basé sur la qualité du sommeil
 */
function calculateSleepScore(sleep: SleepData | null): number | null {
  if (!sleep) return null;

  const duration = sleep.totalDuration;
  const { minimum, recommended, optimal, maximum } = REFERENCE_RANGES.sleep;

  let durationScore: number;

  // Score basé sur la durée
  if (duration < minimum) {
    durationScore = Math.max(0, (duration / minimum) * 40); // 0-40
  } else if (duration < recommended) {
    durationScore = 40 + ((duration - minimum) / (recommended - minimum)) * 30; // 40-70
  } else if (duration <= optimal) {
    durationScore = 70 + ((duration - recommended) / (optimal - recommended)) * 30; // 70-100
  } else if (duration <= maximum) {
    durationScore = 100 - ((duration - optimal) / (maximum - optimal)) * 20; // 80-100
  } else {
    durationScore = 80 - ((duration - maximum) / 120) * 30; // Pénalité pour excès
  }

  // Bonus si le score de qualité est disponible
  if (sleep.qualityScore !== undefined) {
    // Combiner durée (60%) et qualité (40%)
    return durationScore * 0.6 + sleep.qualityScore * 0.4;
  }

  return durationScore;
}

/**
 * Détermine l'état du système nerveux basé sur le score
 */
function getStateFromScore(
  score: number
): 'stressed' | 'balanced' | 'relaxed' | 'unknown' {
  if (score < 30) return 'stressed';
  if (score < 70) return 'balanced';
  if (score <= 100) return 'relaxed';
  return 'unknown';
}

/**
 * Sélectionne la micro-action recommandée
 */
function selectRecommendation(
  state: 'stressed' | 'balanced' | 'relaxed' | 'unknown',
  data: NormalizedHealthData
): MicroActionRecommendation {
  const actions = MICRO_ACTIONS[state] || MICRO_ACTIONS.balanced;
  
  // Logique de sélection intelligente
  // Pour l'instant, on prend l'action avec la priorité la plus haute
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return sortedActions[0];
}

/**
 * Interprète le score en texte lisible
 */
export function interpretScore(score: NervousSystemScore): string {
  const { state, confidence } = score;
  
  const stateDescriptions = {
    stressed: 'Votre système nerveux sympathique est actif. Votre corps est en mode "fight-or-flight".',
    balanced: 'Votre système nerveux est équilibré. C\'est un bon état pour la productivité.',
    relaxed: 'Votre système parasympathique est dominant. Vous êtes en mode récupération.',
    unknown: 'Pas assez de données pour une analyse précise.',
  };

  const confidenceNotes = {
    high: '',
    medium: ' (Analyse basée sur des données partielles)',
    low: ' (Données limitées, résultat approximatif)',
  };

  return stateDescriptions[state] + confidenceNotes[confidence];
}

/**
 * Retourne un emoji représentatif de l'état
 */
export function getStateEmoji(state: NervousSystemScore['state']): string {
  const emojis = {
    stressed: '😰',
    balanced: '😌',
    relaxed: '🧘',
    unknown: '❓',
  };
  return emojis[state];
}

/**
 * Retourne une couleur pour l'UI basée sur l'état
 */
export function getStateColor(state: NervousSystemScore['state']): string {
  const colors = {
    stressed: '#FF6B6B',   // Rouge
    balanced: '#4ECDC4',   // Turquoise
    relaxed: '#95E1D3',    // Vert menthe
    unknown: '#9E9E9E',    // Gris
  };
  return colors[state];
}

export default calculateNervousSystemScore;
