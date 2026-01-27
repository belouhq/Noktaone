// Hook pour la détection SKANE avec MediaPipe FaceMesh
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { SkaneState, FaceMetrics, determineSkaneState } from '@/types/skane-detection';

export function useSkaneDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean = true
) {
  const [skaneState, setSkaneState] = useState<SkaneState>('loading');
  const [metrics, setMetrics] = useState<FaceMetrics | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isLandmarkerReady, setIsLandmarkerReady] = useState(false);

  // Initialiser MediaPipe FaceLandmarker
  useEffect(() => {
    let isMounted = true;

    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setSkaneState('no_face');
          setIsLandmarkerReady(true);
        }
      } catch (error) {
        console.error('Erreur initialisation FaceLandmarker:', error);
        if (isMounted) {
          setSkaneState('no_face');
          setIsLandmarkerReady(false);
        }
      }
    };

    initializeFaceLandmarker();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Fonction pour calculer les métriques du visage
  const calculateFaceMetrics = useCallback((
    landmarks: any[],
    video: HTMLVideoElement | null
  ): FaceMetrics => {
    if (!video || !landmarks || landmarks.length === 0) {
      return {
        detected: false,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        centerOffset: { x: 0, y: 0 },
        faceSize: 0,
        tiltAngle: 0,
        eyesOpen: true,
        brightness: 1
      };
    }

    // Calculer la bounding box du visage
    const xs = landmarks.map(l => l.x);
    const ys = landmarks.map(l => l.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const faceWidth = (maxX - minX) * 100;
    const faceHeight = (maxY - minY) * 100;
    const faceCenterX = ((minX + maxX) / 2) * 100;
    const faceCenterY = ((minY + maxY) / 2) * 100;

    // Calcul de l'inclinaison (basé sur les yeux)
    // Points approximatifs des coins des yeux dans FaceLandmarker
    const leftEyeOuter = landmarks[33] || landmarks[0];
    const rightEyeOuter = landmarks[263] || landmarks[0];
    
    let tiltAngle = 0;
    if (leftEyeOuter && rightEyeOuter) {
      const dy = rightEyeOuter.y - leftEyeOuter.y;
      const dx = rightEyeOuter.x - leftEyeOuter.x;
      tiltAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Calcul yeux ouverts (distance entre paupières)
    // Points approximatifs des paupières
    const leftEyeTop = landmarks[159] || landmarks[0];
    const leftEyeBottom = landmarks[145] || landmarks[0];
    let eyesOpen = true;
    if (leftEyeTop && leftEyeBottom) {
      const eyeOpenRatio = Math.abs(leftEyeTop.y - leftEyeBottom.y) * 100;
      eyesOpen = eyeOpenRatio > 1.5; // Seuil empirique
    }

    // Calcul de la luminosité (approximation depuis l'image)
    // On utilise une valeur par défaut pour l'instant
    // TODO: Calculer depuis l'image réelle
    const brightness = 0.8;

    return {
      detected: true,
      boundingBox: {
        x: minX * 100,
        y: minY * 100,
        width: faceWidth,
        height: faceHeight
      },
      centerOffset: {
        x: faceCenterX - 50, // Distance du centre (50%)
        y: faceCenterY - 45  // Un peu plus haut que le centre
      },
      faceSize: faceHeight,
      tiltAngle,
      eyesOpen,
      brightness
    };
  }, []);

  // Reset si la caméra n'est pas active
  useEffect(() => {
    if (!isActive) {
      setSkaneState('loading');
      setMetrics(null);
    }
  }, [isActive]);

  // Boucle de détection
  useEffect(() => {
    if (!isActive || !isLandmarkerReady || !faceLandmarkerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    let lastVideoTime = -1;

    const detect = async () => {
      if (!faceLandmarkerRef.current || !videoRef.current) return;

      const currentTime = video.currentTime;
      
      // Éviter de traiter le même frame plusieurs fois
      if (currentTime !== lastVideoTime) {
        lastVideoTime = currentTime;

        try {
          const results = faceLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const metrics = calculateFaceMetrics(landmarks, video);
            setMetrics(metrics);
            const newState = determineSkaneState(metrics);
            setSkaneState(newState);
          } else {
            setMetrics(null);
            setSkaneState('no_face');
          }
        } catch (error) {
          console.error('Erreur détection:', error);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    // Démarrer la détection quand la vidéo est prête
    const handleLoadedMetadata = () => {
      if (video.readyState >= 2) {
        detect();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    if (video.readyState >= 2) {
      detect();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, calculateFaceMetrics, isLandmarkerReady, isActive]);

  return { skaneState, metrics };
}
