// Types pour la détection faciale SKANE

export type SkaneState = 
  | 'loading'
  | 'no_face'
  | 'too_far'
  | 'too_close'
  | 'not_centered'
  | 'too_dark'
  | 'face_tilted'
  | 'eyes_closed'
  | 'ready'
  | 'scanning';

export interface FaceMetrics {
  detected: boolean;
  boundingBox: { x: number; y: number; width: number; height: number };
  centerOffset: { x: number; y: number }; // Distance du centre de l'écran (%)
  faceSize: number; // % de l'écran occupé par le visage
  tiltAngle: number; // Inclinaison de la tête en degrés
  eyesOpen: boolean;
  brightness: number; // 0-1
}

export function determineSkaneState(metrics: FaceMetrics): SkaneState {
  if (!metrics.detected) return 'no_face';
  
  // Taille du visage (doit occuper ~30-50% de la hauteur)
  if (metrics.faceSize < 25) return 'too_far';
  if (metrics.faceSize > 60) return 'too_close';
  
  // Centrage (tolérance de 15% du centre)
  if (Math.abs(metrics.centerOffset.x) > 15 || Math.abs(metrics.centerOffset.y) > 15) {
    return 'not_centered';
  }
  
  // Inclinaison (tolérance de 10 degrés)
  if (Math.abs(metrics.tiltAngle) > 10) return 'face_tilted';
  
  // Yeux ouverts
  if (!metrics.eyesOpen) return 'eyes_closed';
  
  // Luminosité (minimum 0.3)
  if (metrics.brightness < 0.3) return 'too_dark';
  
  return 'ready';
}
