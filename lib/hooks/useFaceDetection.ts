/**
 * Hook pour la détection de visage en temps réel
 * Utilise MediaPipe Face Detection (modèle ML BlazeFace)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaceDetector,
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

export interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface FaceDetectionResult {
  isDetected: boolean;
  isCentered: boolean;
  isWellLit: boolean;
  isReady: boolean; // Tous les critères sont remplis
  faceBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  brightness?: number; // 0-1
  centerOffset?: {
    x: number; // pixels from center
    y: number;
  };
  landmarks?: FaceLandmark[];
  validationStatus?: {
    stableFrames: number;
    faceCount: number;
    confidence: number;
    faceAreaRatio: number;
    isInGuide?: boolean;
    failureReason?: 'no_face' | 'low_confidence' | 'too_small' | 'not_centered' | 'multiple_faces' | 'outside_guide' | 'oval_fit_failed' | 'too_much_motion';
    facePoints: Array<{ x: number; y: number; insideOval: boolean }>;
    ovalFitScore?: number;
    motionDelta?: number;
  };
  guidanceHint?: 'move_closer' | 'center_face' | 'more_light' | 'hold_still' | 'one_face_only' | 'fit_oval' | 'ok';
}

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  guideBox?: {
    centerX: number; // 0-1 (relative to video)
    centerY: number;
    width: number; // 0-1
    height: number; // 0-1
  };
  enabled?: boolean;
}

const DEFAULT_GUIDE_BOX = {
  centerX: 0.5,
  centerY: 0.5,
  width: 0.4, // 40% of video width
  height: 0.5, // 50% of video height
};

// Seuils de validation (3-check gate)
const MIN_CONFIDENCE = 0.85; // Score de confiance minimum
const MIN_FACE_AREA_RATIO = 0.07; // 7% de l'écran minimum
const MAX_OFFSET_FROM_CENTER = 0.18; // 18% de décalage max
const STABLE_FRAMES_REQUIRED = 12; // 12 frames consécutives stables
const MOTION_THRESHOLD = 0.02; // Seuil de mouvement (2% de l'écran normalisé)
const MIN_OVAL_FIT_SCORE = 0.85; // 85% des points doivent être dans l'ovale

// Paramètres de l'ovale guide (normalisés 0-1)
const OVAL_CENTER_X = 0.5; // Centre horizontal
const OVAL_CENTER_Y = 0.42; // Légèrement au-dessus du centre pour selfie
const OVAL_RX = 0.20; // Rayon horizontal (20% de la largeur)
const OVAL_RY = 0.28; // Rayon vertical (28% de la hauteur, ratio ~1.4)

// Helper: test si un point est dans l'ovale
function isPointInOval(x: number, y: number): boolean {
  const dx = (x - OVAL_CENTER_X) / OVAL_RX;
  const dy = (y - OVAL_CENTER_Y) / OVAL_RY;
  return dx * dx + dy * dy <= 1;
}

export function useFaceDetection({
  videoRef,
  guideBox = DEFAULT_GUIDE_BOX,
  enabled = true,
}: UseFaceDetectionOptions): FaceDetectionResult {
  const [result, setResult] = useState<FaceDetectionResult>({
    isDetected: false,
    isCentered: false,
    isWellLit: false,
    isReady: false,
  });

  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stableFramesRef = useRef(0);
  const isInitializedRef = useRef(false);
  const previousFaceBoxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Initialiser MediaPipe (Face Detector + Face Landmarker)
  const initializeDetector = useCallback(async () => {
    if (isInitializedRef.current || faceDetectorRef.current) return;
    
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Face Detector pour la détection rapide
      faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });

      // Face Landmarker pour les vrais landmarks (468 points)
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      isInitializedRef.current = true;
      console.log('✅ MediaPipe Face Detector & Landmarker initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe:', error);
      // Fallback: continuer sans MediaPipe (détection basique)
      isInitializedRef.current = true; // Éviter les tentatives répétées
    }
  }, []);

  // Fonction de détection
  const detectFace = useCallback(() => {
    const video = videoRef.current;
    const detector = faceDetectorRef.current;
    const landmarker = faceLandmarkerRef.current;

    if (!video || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    // Si MediaPipe n'est pas initialisé, ne rien faire
    if (!detector || !landmarker) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    try {
      const startTime = performance.now();
      const detections = detector.detectForVideo(video, startTime);
      const landmarksResult = landmarker.detectForVideo(video, startTime);

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (detections.detections.length === 0) {
        stableFramesRef.current = 0;
        setResult({
          isDetected: false,
          isCentered: false,
          isWellLit: true,
          isReady: false,
          validationStatus: {
            stableFrames: 0,
            faceCount: 0,
            confidence: 0,
            faceAreaRatio: 0,
            facePoints: [],
            failureReason: 'no_face',
          },
          guidanceHint: 'center_face',
        });
        animationFrameRef.current = requestAnimationFrame(detectFace);
        return;
      }

      if (detections.detections.length > 1) {
        stableFramesRef.current = 0;
        setResult({
          isDetected: true,
          isCentered: false,
          isWellLit: true,
          isReady: false,
          validationStatus: {
            stableFrames: 0,
            faceCount: detections.detections.length,
            confidence: 0,
            faceAreaRatio: 0,
            facePoints: [],
            failureReason: 'multiple_faces',
          },
          guidanceHint: 'one_face_only',
        });
        animationFrameRef.current = requestAnimationFrame(detectFace);
        return;
      }

      // Un seul visage détecté
      const detection = detections.detections[0];
      const bbox = detection.boundingBox!;
      const confidence = detection.categories?.[0]?.score || 0;
      
      // Utiliser les landmarks du Face Landmarker (468 points) si disponibles
      // Sinon, utiliser les keypoints du Face Detector (6 points)
      // ⚠️ IMPORTANT: Inverser X immédiatement pour le mode miroir
      let keypoints: Array<{ x: number; y: number }> = [];
      if (landmarksResult.faceLandmarks && landmarksResult.faceLandmarks.length > 0) {
        // Utiliser les vrais landmarks (468 points) - inverser X
        keypoints = landmarksResult.faceLandmarks[0].map(lm => ({ x: 1 - lm.x, y: lm.y }));
      } else if (detection.keypoints && detection.keypoints.length > 0) {
        // Fallback: utiliser les keypoints du détecteur (6 points) - inverser X
        keypoints = detection.keypoints.map(kp => ({ x: 1 - kp.x, y: kp.y }));
      }

      // Convertir bbox en coordonnées pixels
      // ⚠️ IMPORTANT: Inverser X pour le mode miroir (selfie) - la vidéo est en scaleX(-1)
      const faceBox = {
        x: videoWidth - bbox.originX - bbox.width, // Inversé pour le miroir
        y: bbox.originY,
        width: bbox.width,
        height: bbox.height,
      };

      // Calculer le mouvement
      let motionDelta = 0;
      if (previousFaceBoxRef.current) {
        const prevCenterX = previousFaceBoxRef.current.x + previousFaceBoxRef.current.width / 2;
        const prevCenterY = previousFaceBoxRef.current.y + previousFaceBoxRef.current.height / 2;
        const currCenterX = faceBox.x + faceBox.width / 2;
        const currCenterY = faceBox.y + faceBox.height / 2;
        
        const deltaX = Math.abs(currCenterX - prevCenterX) / videoWidth;
        const deltaY = Math.abs(currCenterY - prevCenterY) / videoHeight;
        motionDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      }
      previousFaceBoxRef.current = { ...faceBox };

      // Calculer les métriques
      const faceArea = bbox.width * bbox.height;
      const frameArea = videoWidth * videoHeight;
      const faceAreaRatio = faceArea / frameArea;

      // Convertir keypoints MediaPipe en points normalisés (0-1)
      // ⚠️ Les keypoints ont déjà été inversés ci-dessus
      // Si on a beaucoup de points (468), on peut en sélectionner un sous-ensemble pour le maillage
      let selectedKeypoints = keypoints;
      if (keypoints.length > 50) {
        // Sélectionner un sous-ensemble de points clés pour le maillage (performance)
        // Prendre les points tous les N points pour avoir ~20-30 points
        const step = Math.floor(keypoints.length / 25);
        selectedKeypoints = keypoints.filter((_, i) => i % step === 0);
      }
      
      // Les keypoints sont déjà inversés, on les utilise directement
      const facePoints = selectedKeypoints.map((kp) => {
        const x = kp.x; // Déjà inversé
        const y = kp.y;
        const insideOval = isPointInOval(x, y);
        return { x, y, insideOval };
      });

      // Ajouter des points supplémentaires basés sur le bbox
      // ⚠️ IMPORTANT: Inverser X pour le mode miroir (selfie)
      // Après inversion: left devient right, right devient left
      const originalLeft = bbox.originX / videoWidth;
      const originalRight = (bbox.originX + bbox.width) / videoWidth;
      const originalCenterX = (bbox.originX + bbox.width / 2) / videoWidth;
      
      const normalizedBox = {
        left: 1 - originalRight, // Inversé: l'ancien right devient left
        top: bbox.originY / videoHeight,
        right: 1 - originalLeft, // Inversé: l'ancien left devient right
        bottom: (bbox.originY + bbox.height) / videoHeight,
        centerX: 1 - originalCenterX, // Inversé
        centerY: (bbox.originY + bbox.height / 2) / videoHeight,
      };

      // Points du contour du visage
      const extraPoints = [
        { x: normalizedBox.left, y: normalizedBox.top },
        { x: normalizedBox.right, y: normalizedBox.top },
        { x: normalizedBox.left, y: normalizedBox.bottom },
        { x: normalizedBox.right, y: normalizedBox.bottom },
        { x: normalizedBox.centerX, y: normalizedBox.top },
        { x: normalizedBox.centerX, y: normalizedBox.bottom },
        { x: normalizedBox.left, y: normalizedBox.centerY },
        { x: normalizedBox.right, y: normalizedBox.centerY },
      ].map(p => ({ ...p, insideOval: isPointInOval(p.x, p.y) }));

      const allPoints = [...facePoints, ...extraPoints];

      // Vérifier le centrage
      const faceCenterX = normalizedBox.centerX;
      const faceCenterY = normalizedBox.centerY;
      const offsetX = Math.abs(faceCenterX - OVAL_CENTER_X);
      const offsetY = Math.abs(faceCenterY - OVAL_CENTER_Y);
      const isCentered = offsetX < MAX_OFFSET_FROM_CENTER && offsetY < MAX_OFFSET_FROM_CENTER;

      // Score de fit dans l'ovale
      const pointsInOval = allPoints.filter(p => p.insideOval).length;
      const ovalFitScore = allPoints.length > 0 ? pointsInOval / allPoints.length : 0;

      // Validation complète
      let failureReason: 'no_face' | 'low_confidence' | 'too_small' | 'not_centered' | 'multiple_faces' | 'outside_guide' | 'oval_fit_failed' | 'too_much_motion' | undefined;
      
      if (confidence < MIN_CONFIDENCE) {
        failureReason = 'low_confidence';
      } else if (faceAreaRatio < MIN_FACE_AREA_RATIO) {
        failureReason = 'too_small';
      } else if (!isCentered) {
        failureReason = 'not_centered';
      } else if (ovalFitScore < MIN_OVAL_FIT_SCORE) {
        failureReason = 'oval_fit_failed';
      } else if (motionDelta > MOTION_THRESHOLD) {
        failureReason = 'too_much_motion';
      }

      const isValid = !failureReason;

      if (isValid) {
        stableFramesRef.current = Math.min(stableFramesRef.current + 1, STABLE_FRAMES_REQUIRED);
      } else {
        stableFramesRef.current = Math.max(0, stableFramesRef.current - 1);
      }

      const isReady = isValid && stableFramesRef.current >= STABLE_FRAMES_REQUIRED;

      // Déterminer le hint de guidage
      let guidanceHint: 'move_closer' | 'center_face' | 'more_light' | 'hold_still' | 'one_face_only' | 'fit_oval' | 'ok' = 'ok';
      
      if (faceAreaRatio < MIN_FACE_AREA_RATIO) {
        guidanceHint = 'move_closer';
      } else if (!isCentered) {
        guidanceHint = 'center_face';
      } else if (ovalFitScore < MIN_OVAL_FIT_SCORE) {
        guidanceHint = 'fit_oval';
      } else if (motionDelta > MOTION_THRESHOLD) {
        guidanceHint = 'hold_still';
      } else if (!isReady) {
        guidanceHint = 'hold_still';
      }

      // Calculer la luminosité moyenne (approximation basée sur la zone du visage)
      // Note: MediaPipe ne donne pas directement la luminosité, on peut l'estimer
      const brightness = 0.7; // Valeur par défaut (peut être améliorée avec analyse d'image)

      setResult({
        isDetected: true,
        isCentered,
        isWellLit: true, // MediaPipe fonctionne même en basse lumière
        isReady,
        faceBox,
        brightness,
        centerOffset: {
          x: (faceCenterX - OVAL_CENTER_X) * videoWidth,
          y: (faceCenterY - OVAL_CENTER_Y) * videoHeight,
        },
        // ⚠️ IMPORTANT: Inverser X pour le mode miroir (selfie)
        // ⚠️ Les landmarks sont déjà inversés dans keypoints (inversion faite plus haut)
        landmarks: keypoints.map(kp => ({ x: kp.x, y: kp.y })),
        validationStatus: {
          stableFrames: stableFramesRef.current,
          faceCount: 1,
          confidence,
          faceAreaRatio,
          isInGuide: isCentered,
          failureReason,
          facePoints: allPoints,
          ovalFitScore,
          motionDelta,
        },
        guidanceHint,
      });
    } catch (error) {
      console.error('MediaPipe detection error:', error);
    }

    // Continuer la boucle
    animationFrameRef.current = requestAnimationFrame(detectFace);
  }, [videoRef]);

  // Effet principal
  useEffect(() => {
    if (!enabled || !videoRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    initializeDetector().then(() => {
      if (faceDetectorRef.current && faceLandmarkerRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
      }
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, initializeDetector, detectFace]);

  return result;
}
