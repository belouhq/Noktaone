/**
 * Guide visuel pour la détection de visage (style Tinder)
 * Affiche un ovale vert quand le visage est bien positionné, rouge sinon
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useFaceDetection, FaceDetectionResult } from "@/lib/hooks/useFaceDetection";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Composant pour visualiser le maillage de scan du visage (style biométrique)
function FacePointsOverlay({ 
  points, 
  width, 
  height,
  isReady
}: { 
  points?: Array<{ x: number; y: number; insideOval: boolean }>; 
  width: number; 
  height: number;
  isReady: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);

    // Si pas de points, on a déjà nettoyé, on peut sortir
    if (!points || points.length === 0) {
      return;
    }

    // Couleur principale : bleu NOKTA si ready, teal/cyan sinon
    const primaryColor = isReady ? '#3B82F6' : '#06B6D4'; // Teal/cyan par défaut
    const secondaryColor = isReady ? '#3B82F6' : '#14B8A6'; // Teal plus foncé
    const glowColor = isReady ? '#3B82F6' : '#06B6D4';

    // Convertir les points en coordonnées canvas
    const canvasPoints = points.map(p => ({
      x: p.x * width,
      y: p.y * height,
      insideOval: p.insideOval,
    }));

    // Plus besoin de créer les connexions - on affiche seulement les points

    // Dessiner les points (nodes du maillage) avec effet lumineux
    canvasPoints.forEach((point) => {
      const color = point.insideOval ? primaryColor : secondaryColor;
      const opacity = point.insideOval ? (isReady ? 0.95 : 0.75) : (isReady ? 0.6 : 0.45);
      const size = point.insideOval ? 4.5 : 3.5;
      
      // Glow effect plus prononcé
      ctx.shadowBlur = isReady ? 15 : 10;
      ctx.shadowColor = color;
      
      // Point principal (cercle extérieur)
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Point intérieur blanc lumineux (effet "glow")
      ctx.shadowBlur = 0; // Pas de shadow pour le point intérieur
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = opacity * 0.8;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Point central très lumineux
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Réinitialiser les styles
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }, [points, width, height, isReady]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 16,
      }}
    />
  );
}

interface FaceDetectionGuideProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  showInstructions?: boolean;
  guideBox?: {
    centerX: number;
    centerY: number;
    width: number;
    height: number;
  };
  onReadyChange?: (isReady: boolean) => void; // Callback pour notifier le parent
  onLowBrightness?: () => void; // Callback pour luminosité faible (auto-flash)
  onBrightnessChange?: (brightness: number) => void; // Callback pour mettre à jour la luminosité
  flashEnabled?: boolean; // Flash activé par l'utilisateur
}

const STABLE_FRAMES_REQUIRED = 12; // Doit correspondre à lib/hooks/useFaceDetection.ts

// Paramètres de l'ovale guide (normalisés 0-1, doivent correspondre à useFaceDetection.ts)
const OVAL_CENTER_X = 0.5;
const OVAL_CENTER_Y = 0.42;
const OVAL_RX = 0.20; // 20% de la largeur
const OVAL_RY = 0.28; // 28% de la hauteur

export default function FaceDetectionGuide({ 
  videoRef, 
  showInstructions = true,
  guideBox = {
    centerX: 0.5,
    centerY: 0.5,
    width: 0.4, // 40% de la largeur vidéo
    height: 0.5, // 50% de la hauteur vidéo
  },
  onReadyChange,
  onLowBrightness,
  onBrightnessChange,
  flashEnabled = false,
}: FaceDetectionGuideProps) {
  const { t } = useTranslation();
  const detection = useFaceDetection({
    videoRef,
    enabled: true,
    guideBox,
  });

  // Notifier le parent quand l'état isReady change
  useEffect(() => {
    if (onReadyChange) {
      onReadyChange(detection.isReady);
    }
  }, [detection.isReady, onReadyChange]);

  // Notifier le parent de la luminosité
  useEffect(() => {
    if (onBrightnessChange && detection.brightness !== undefined) {
      onBrightnessChange(detection.brightness);
    }
  }, [detection.brightness, onBrightnessChange]);

  // Auto-déclencher le flash si luminosité faible et flash activé
  useEffect(() => {
    if (flashEnabled && onLowBrightness && detection.brightness !== undefined) {
      const LOW_BRIGHTNESS_THRESHOLD = 0.35; // Seuil de luminosité faible
      if (detection.brightness < LOW_BRIGHTNESS_THRESHOLD && !detection.isWellLit) {
        // Déclencher le flash automatiquement (avec debounce pour éviter les répétitions)
        const timeoutId = setTimeout(() => {
          onLowBrightness();
        }, 500); // Debounce de 500ms
        return () => clearTimeout(timeoutId);
      }
    }
  }, [flashEnabled, detection.brightness, detection.isWellLit, onLowBrightness]);

  // Couleur du guide selon l'état
  const getGuideColor = (): string => {
    if (detection.isReady) {
      return '#3B82F6'; // Bleu NOKTA: tout est bon
    }
    if (detection.isDetected) {
      return '#F59E0B'; // Orange: visage détecté mais pas optimal
    }
    return '#FFFFFF'; // Blanc subtil par défaut
  };

  // Message d'instruction basé sur le validationStatus
  const getInstruction = (): string => {
    if (detection.isReady) {
      return t('camera.faceReady') || 'Perfect!';
    }

    // Utiliser le failureReason si disponible (plus précis)
    if (detection.validationStatus?.failureReason) {
      switch (detection.validationStatus.failureReason) {
        case 'no_face':
          return t('camera.faceNotFound') || 'Center your face';
        case 'low_confidence':
          return t('camera.moreLight') || 'More light';
        case 'too_small':
          return t('camera.moveCloser') || 'Move closer';
        case 'not_centered':
          return t('camera.faceNotCentered') || 'Center your face';
        case 'multiple_faces':
          return t('camera.onlyOneFace') || 'Only one face';
        case 'outside_guide':
          return t('camera.faceNotCentered') || 'Center your face';
        case 'eyes_covered':
          return t('camera.showEyes') || 'Show your eyes';
        case 'mouth_covered':
          return t('camera.showMouth') || 'Show your mouth';
        default:
          return t('camera.faceAdjusting') || 'Adjusting...';
      }
    }

    // Fallback sur les anciennes conditions
    if (!detection.isDetected) {
      return t('camera.faceNotFound') || 'Center your face';
    }
    if (!detection.isCentered) {
      return t('camera.faceNotCentered') || 'Center your face';
    }
    if (!detection.isWellLit) {
      // Ne pas afficher "More light" si le flash est activé (il va s'auto-déclencher)
      if (flashEnabled) {
        return t('camera.faceAdjusting') || 'Adjusting...';
      }
      if (detection.brightness && detection.brightness < 0.3) {
        return t('camera.moreLight') || 'More light';
      }
      return t('camera.faceTooBright') || 'Too much light';
    }
    return t('camera.faceAdjusting') || 'Adjusting...';
  };

  const guideColor = getGuideColor();
  const instruction = getInstruction();
  
  // Debounce et cooldown pour les hints
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const hintDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const hintCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const lastHintRef = useRef<string | null>(null);
  
  // Gérer le hint avec debounce et cooldown
  useEffect(() => {
    const hint = detection.guidanceHint || 'ok';
    const hintKey = hint === 'ok' ? null : hint;
    
    // Si le hint change, démarrer le debounce
    if (hintKey !== lastHintRef.current) {
      if (hintDebounceRef.current) {
        clearTimeout(hintDebounceRef.current);
      }
      
      hintDebounceRef.current = setTimeout(() => {
        setCurrentHint(hintKey);
        lastHintRef.current = hintKey;
        
        // Cooldown: garder le hint pendant 600ms
        if (hintCooldownRef.current) {
          clearTimeout(hintCooldownRef.current);
        }
        hintCooldownRef.current = setTimeout(() => {
          // Ne pas changer si le hint est toujours le même
          if (lastHintRef.current === hintKey) {
            // Le hint sera mis à jour au prochain changement
          }
        }, 600);
      }, 300); // Debounce: 300ms
    }
    
    // Si faceCount devient 0 ou >1, changer immédiatement
    if (detection.validationStatus?.faceCount === 0 || (detection.validationStatus?.faceCount || 0) > 1) {
      if (hintDebounceRef.current) {
        clearTimeout(hintDebounceRef.current);
      }
      if (hintCooldownRef.current) {
        clearTimeout(hintCooldownRef.current);
      }
      setCurrentHint(hintKey);
      lastHintRef.current = hintKey;
    }
    
    return () => {
      if (hintDebounceRef.current) {
        clearTimeout(hintDebounceRef.current);
      }
      if (hintCooldownRef.current) {
        clearTimeout(hintCooldownRef.current);
      }
    };
  }, [detection.guidanceHint, detection.validationStatus?.faceCount]);
  
  // Obtenir le texte du hint
  const getHintText = (): string | null => {
    if (!currentHint) return null;
    
    const hintKey = `skane.hint.${currentHint}`;
    const text = t(hintKey);
    return text !== hintKey ? text : null; // Retourner null si la clé n'existe pas
  };
  
  const hintText = getHintText();
  
  // Calculer la progression du lock (0-1)
  const lockProgress = (detection.validationStatus?.stableFrames || 0) / STABLE_FRAMES_REQUIRED;

  // Obtenir les dimensions de la vue
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 15 }}
    >
      {/* Canvas overlay pour visualiser le maillage de scan du visage - UNIQUEMENT si visage détecté */}
      {viewportSize.width > 0 && viewportSize.height > 0 && detection.isDetected && detection.validationStatus?.facePoints && detection.validationStatus.facePoints.length > 0 && (
        <FacePointsOverlay
          points={detection.validationStatus.facePoints}
          width={viewportSize.width}
          height={viewportSize.height}
          isReady={detection.isReady}
        />
      )}
      {/* Ovale bleu supprimé comme demandé */}

      {/* Instructions - Affichées UNIQUEMENT quand le visage n'est PAS prêt */}
      {!detection.isReady && (
        <motion.div
          className="absolute bottom-32 left-0 right-0 text-center px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <p
            className="text-base font-medium"
            style={{
              color: guideColor,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {hintText || instruction}
          </p>
        </motion.div>
      )}


      {/* Checkmarks supprimés comme demandé */}
    </div>
  );
}
