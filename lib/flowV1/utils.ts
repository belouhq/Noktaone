/**
 * Utilitaires FlowV1
 * RNG déterministe et fonctions helper
 */

/**
 * Mulberry32 - RNG déterministe rapide
 */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash simple pour générer un seed depuis une string
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Génère un seed déterministe depuis user_id/device_id + session_id
 */
export function generateSeed(userId: string | null, sessionId: string): number {
  const deviceId = typeof window !== 'undefined' 
    ? localStorage.getItem('device_id') || 'guest'
    : 'guest';
  const id = userId || deviceId;
  return hashString(`${id}_${sessionId}`);
}

/**
 * Clamp un nombre entre min et max
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Entier aléatoire dans une plage [min, max]
 */
export function intInRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Float aléatoire dans une plage [min, max)
 */
export function floatInRange(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

/**
 * Smoothstep interpolation
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
