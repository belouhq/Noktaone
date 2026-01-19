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

    // Créer un maillage triangulaire (Delaunay simplifié)
    // Pour simplifier, on connecte les points proches pour former des triangles
    const connections: Array<[number, number]> = [];
    const maxDistance = Math.min(width, height) * 0.12; // Distance max pour connecter (réduite pour maillage plus dense)

    for (let i = 0; i < canvasPoints.length; i++) {
      for (let j = i + 1; j < canvasPoints.length; j++) {
        const dx = canvasPoints[i].x - canvasPoints[j].x;
        const dy = canvasPoints[i].y - canvasPoints[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          connections.push([i, j]);
        }
      }
    }

    // Dessiner les connexions (lignes du maillage) avec glow effect
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = isReady ? 10 : 6;
    ctx.shadowColor = glowColor;

    connections.forEach(([i, j]) => {
      const p1 = canvasPoints[i];
      const p2 = canvasPoints[j];
      
      // Utiliser la couleur selon si les deux points sont dans l'ovale
      const bothInside = p1.insideOval && p2.insideOval;
      ctx.strokeStyle = bothInside ? primaryColor : secondaryColor;
      ctx.globalAlpha = bothInside ? (isReady ? 0.85 : 0.65) : (isReady ? 0.5 : 0.35);
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

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
      {/* Face Frame OVALE fragmenté en tirets */}
      <div
        className="relative"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* OVALE fragmenté en tirets - couleur dynamique */}
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Ovale en tirets - couleur selon l'état */}
          <ellipse
            cx={OVAL_CENTER_X * 100}
            cy={OVAL_CENTER_Y * 100}
            rx={OVAL_RX * 100}
            ry={OVAL_RY * 100}
            fill="none"
            stroke={detection.isReady ? '#3B82F6' : guideColor}
            strokeWidth="0.3"
            strokeDasharray="8 8" // Longueur du trait, espace
            strokeDashoffset="0"
            opacity={detection.isReady ? 0.75 : (detection.isDetected ? 0.5 : 0.4)}
            style={{
              filter: detection.isReady 
                ? `drop-shadow(0 0 8px #3B82F640)`
                : `drop-shadow(0 0 8px ${guideColor}60)`,
            }}
          />
          {/* Deuxième ellipse pour créer l'effet de tirets */}
          <ellipse
            cx={OVAL_CENTER_X * 100}
            cy={OVAL_CENTER_Y * 100}
            rx={OVAL_RX * 100}
            ry={OVAL_RY * 100}
            fill="none"
            stroke={detection.isReady ? '#3B82F6' : guideColor}
            strokeWidth="0.3"
            strokeDasharray="8 8"
            strokeDashoffset="16"
            opacity={detection.isReady ? 0.75 : (detection.isDetected ? 0.5 : 0.4)}
            style={{
              filter: detection.isReady 
                ? `drop-shadow(0 0 8px #3B82F640)`
                : `drop-shadow(0 0 8px ${guideColor}60)`,
            }}
          />
        </svg>

        {/* Animation de pulsation pour les tirets de l'ovale */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
            style={{ overflow: 'visible' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <ellipse
              cx={OVAL_CENTER_X * 100}
              cy={OVAL_CENTER_Y * 100}
              rx={OVAL_RX * 100}
              ry={OVAL_RY * 100}
              fill="none"
              stroke={guideColor}
              strokeWidth="0.2"
              strokeDasharray="4 4"
              strokeDashoffset="0"
              opacity={0.4}
            />
            <ellipse
              cx={OVAL_CENTER_X * 100}
              cy={OVAL_CENTER_Y * 100}
              rx={OVAL_RX * 100}
              ry={OVAL_RY * 100}
              fill="none"
              stroke={guideColor}
              strokeWidth="0.2"
              strokeDasharray="4 4"
              strokeDashoffset="8"
              opacity={0.4}
            />
          </svg>
        </motion.div>

        {/* Box du visage détecté (si détecté) - position relative au guide */}
        {detection.faceBox && detection.isDetected && (() => {
          const video = videoRef.current;
          if (!video || !video.videoWidth || !video.videoHeight) return null;

          // Le guide fait 280x360px et correspond à une zone de la vidéo
          // Zone guide en pixels vidéo
          const guideVideoWidth = guideBox.width * video.videoWidth;
          const guideVideoHeight = guideBox.height * video.videoHeight;
          const guideVideoX = (guideBox.centerX - guideBox.width / 2) * video.videoWidth;
          const guideVideoY = (guideBox.centerY - guideBox.height / 2) * video.videoHeight;

          // Ratio de conversion vidéo → guide
          const scaleX = 280 / guideVideoWidth;
          const scaleY = 360 / guideVideoHeight;

          // Position relative au guide (0,0 = top-left du guide)
          const relativeX = (detection.faceBox.x - guideVideoX) * scaleX;
          const relativeY = (detection.faceBox.y - guideVideoY) * scaleY;
          const relativeWidth = detection.faceBox.width * scaleX;
          const relativeHeight = detection.faceBox.height * scaleY;

          return (
            <motion.div
              className="absolute border-2"
              style={{
                left: `${Math.max(0, relativeX)}px`,
                top: `${Math.max(0, relativeY)}px`,
                width: `${Math.min(relativeWidth, 280 - Math.max(0, relativeX))}px`,
                height: `${Math.min(relativeHeight, 360 - Math.max(0, relativeY))}px`,
                borderColor: detection.isCentered ? '#10B981' : '#F59E0B',
                borderStyle: 'dashed',
                borderRadius: '8px',
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Indicateurs aux 4 coins */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 rounded-full"
                style={{ background: detection.isCentered ? '#10B981' : '#F59E0B' }}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ background: detection.isCentered ? '#10B981' : '#F59E0B' }}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full"
                style={{ background: detection.isCentered ? '#10B981' : '#F59E0B' }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
                style={{ background: detection.isCentered ? '#10B981' : '#F59E0B' }}
              />
            </motion.div>
          );
        })()}
      </div>

      {/* Hint dynamique (nouveau système) - bas-centre */}
      {hintText && (
        <motion.div
          className="absolute bottom-32 left-0 right-0 text-center px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <p
            className="text-sm font-medium"
            style={{
              color: guideColor,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {hintText}
          </p>
        </motion.div>
      )}

      {/* Instructions textuelles (ancien système, gardé pour compatibilité) */}
      {showInstructions && !hintText && (
        <motion.div
          className="absolute bottom-32 left-0 right-0 text-center px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p
            className="text-sm font-medium"
            style={{
              color: guideColor,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {instruction}
          </p>
        </motion.div>
      )}


      {/* "Locked" checkmark (brièvement affiché quand complet) */}
      {detection.isReady && lockProgress >= 1 && (
        <motion.div
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: 17 }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: '#3B82F6',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Indicateur de statut (icône checkmark quand prêt) */}
      {detection.isReady && (
        <motion.div
          className="absolute top-24"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid #3B82F6',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </motion.div>
      )}
    </div>
  );
}
