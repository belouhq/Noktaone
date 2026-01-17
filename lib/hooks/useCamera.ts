import { useState, useEffect, useRef } from 'react';

type CameraState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraState: CameraState;
  requestPermission: () => Promise<void>;
  captureFrame: () => string | null;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('idle');

  // Vérifier si la permission a déjà été accordée
  useEffect(() => {
    checkExistingPermission();
  }, []);

  // Écouter les événements de la vidéo pour détecter quand elle est prête
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.srcObject) {
        if (cameraState !== 'granted') {
          setCameraState('granted');
        }
      }
    };

    const handleLoadedData = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.srcObject) {
        if (cameraState !== 'granted') {
          setCameraState('granted');
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);

    // Vérifier immédiatement si la vidéo est déjà prête
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && video.srcObject) {
      if (cameraState !== 'granted') {
        setCameraState('granted');
      }
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [cameraState]);

  const checkExistingPermission = async () => {
    try {
      // Vérifier le statut de la permission
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (result.state === 'granted') {
        // Permission déjà accordée, démarrer la caméra
        await startCamera();
      } else if (result.state === 'denied') {
        setCameraState('denied');
      } else {
        // 'prompt' - en attente de demande
        setCameraState('idle');
      }
      
      // Écouter les changements de permission
      result.addEventListener('change', () => {
        if (result.state === 'granted') {
          startCamera();
        } else if (result.state === 'denied') {
          setCameraState('denied');
        }
      });
    } catch (error) {
      // Fallback si permissions API non supportée
      setCameraState('idle');
    }
  };

  const requestPermission = async () => {
    setCameraState('requesting');
    await startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Caméra frontale
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Attendre que la vidéo soit vraiment prête
        await new Promise((resolve) => {
          if (videoRef.current) {
            const checkReady = () => {
              if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
                resolve(undefined);
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          } else {
            resolve(undefined);
          }
        });
      }

      setCameraState('granted');
    } catch (error: any) {
      console.error('Camera error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraState('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        // Pas de caméra disponible
        setCameraState('error');
      } else {
        // Autre erreur technique
        setCameraState('error');
      }
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current) {
      console.error('Capture failed: video element not found');
      return null;
    }

    const video = videoRef.current;

    // Vérifier que la vidéo a un stream actif
    if (!video.srcObject) {
      console.error('Capture failed: video has no stream', {
        cameraState
      });
      return null;
    }

    // Vérifier que la vidéo est prête et a des dimensions valides
    if (!video.videoWidth || !video.videoHeight) {
      console.error('Capture failed: video dimensions not ready', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        cameraState
      });
      return null;
    }

    // Vérifier que la vidéo est en cours de lecture
    if (video.readyState < 2) { // HAVE_CURRENT_DATA
      console.error('Capture failed: video not ready', {
        readyState: video.readyState,
        cameraState
      });
      return null;
    }
    
    // Si la vidéo est prête mais l'état n'est pas 'granted', le mettre à jour
    if (cameraState !== 'granted') {
      setCameraState('granted');
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Capture failed: cannot get canvas context');
        return null;
      }

      // Dessiner le frame actuel (inverser horizontalement pour selfie)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Retourner en base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      if (!dataUrl || dataUrl === 'data:,') {
        console.error('Capture failed: invalid data URL');
        return null;
      }

      return dataUrl;
    } catch (error) {
      console.error('Capture failed: error during capture', error);
      return null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraState('idle');
  };

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    cameraState,
    requestPermission,
    captureFrame,
    stopCamera
  };
}
