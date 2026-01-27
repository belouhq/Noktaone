'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Info, Zap, UserPlus, X } from 'lucide-react';
import { SkaneState } from '@/types/skane-detection';
import { skaneStateConfig } from '@/config/skane-states';
import { useSkaneDetection } from '@/lib/hooks/useSkaneDetection';
import { useCamera } from '@/lib/hooks/useCamera';
import SkaneInfoModal from './SkaneInfoModal';
import GuestModeModal from './GuestModeModal';

interface SkaneScanProps {
  onSkaneComplete: (selfieUrl: string) => void;
  onClose?: () => void;
}

export default function SkaneScan({ onSkaneComplete, onClose }: SkaneScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { videoRef, cameraState, requestPermission, captureFrame } = useCamera();
  const { skaneState, metrics } = useSkaneDetection(videoRef, cameraState === 'granted');
  
  const [readyTimer, setReadyTimer] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGuestModeModalOpen, setIsGuestModeModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [showButtons, setShowButtons] = useState(true);

  // Charger l'état depuis localStorage
  useEffect(() => {
    const savedGuestMode = localStorage.getItem('guestMode');
    const savedFlash = localStorage.getItem('screenFlashEnabled');
    setIsGuestMode(savedGuestMode === 'true');
    setIsFlashEnabled(savedFlash === 'true');
    
    // Calculer le nombre d'invitations (mock pour l'instant)
    const storedSkanes = localStorage.getItem('skanes');
    if (storedSkanes) {
      const skanes = JSON.parse(storedSkanes);
      const count = Math.floor(skanes.length / 3);
      setInvitationsCount(count);
    }
  }, []);

  // Détecter la luminosité faible
  useEffect(() => {
    if (metrics?.brightness !== undefined) {
      setIsLowLight(metrics.brightness < 0.3);
    }
  }, [metrics?.brightness]);

  // Démarrer le Skane après 2 secondes de stabilité "ready"
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (skaneState === 'ready' && !isScanning) {
      interval = setInterval(() => {
        setReadyTimer(prev => {
          if (prev >= 2) {
            startSkane();
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      setReadyTimer(0);
    }
    
    return () => clearInterval(interval);
  }, [skaneState, isScanning]);

  // Cacher les boutons pendant le scan
  useEffect(() => {
    if (isScanning || skaneState === 'scanning') {
      setShowButtons(false);
    } else {
      setShowButtons(true);
    }
  }, [isScanning, skaneState]);

  const startSkane = useCallback(async () => {
    setIsScanning(true);
    
    // Utiliser captureFrame du hook useCamera
    const frame = captureFrame();
    
    if (!frame) {
      setIsScanning(false);
      return;
    }

    // Simuler le temps d'analyse (2-3 sec)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    onSkaneComplete(frame);
  }, [onSkaneComplete, captureFrame]);

  const toggleFlash = () => {
    const newFlash = !isFlashEnabled;
    setIsFlashEnabled(newFlash);
    localStorage.setItem('screenFlashEnabled', newFlash.toString());
  };

  const toggleGuestMode = () => {
    setIsGuestModeModalOpen(true);
  };

  const activateGuestMode = () => {
    const newGuestMode = !isGuestMode;
    setIsGuestMode(newGuestMode);
    localStorage.setItem('guestMode', newGuestMode.toString());
  };

  const config = skaneStateConfig[skaneState];

  // Rendu de l'icône selon l'état
  const renderIcon = () => {
    switch (config.icon) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-white/70" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'check':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Afficher l'écran de permission si nécessaire
  if (cameraState !== 'granted') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-white text-lg mb-4">Autorisation caméra requise</p>
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-blue-500 rounded-full text-white font-medium"
          >
            Autoriser la caméra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Canvas caché pour capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bandeau mode invité (si actif) */}
      {isGuestMode && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-blue-500 py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <UserPlus size={14} className="text-white" />
            <span className="text-white text-sm font-medium">
              Mode Invité actif
            </span>
          </div>
        </div>
      )}

      {/* Zone caméra */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Flux vidéo - géré par useCamera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />

        {/* Overlay sombre sur les bords (effet vignette) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at center, transparent 0%, rgba(0,0,0,0.7) 100%)'
          }}
        />

        {/* Cadre de guidage ovale */}
        <motion.div
          animate={{
            scale: skaneState === 'ready' ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: skaneState === 'ready' ? Infinity : 0,
            ease: 'easeInOut'
          }}
          className={`
            relative w-72 h-96 rounded-[50%] border-[3px] transition-all duration-500
            ${config.borderColor}
            ${config.glowColor || ''}
          `}
        >
          {/* Indicateur de progression circulaire (quand ready) */}
          {skaneState === 'ready' && readyTimer > 0 && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <ellipse
                cx="50%"
                cy="50%"
                rx="48%"
                ry="48%"
                fill="none"
                stroke="rgba(34, 197, 94, 0.8)"
                strokeWidth="3"
                strokeDasharray={`${(readyTimer / 2) * 100} 100`}
                className="transition-all duration-100"
              />
            </svg>
          )}
        </motion.div>

        {/* Boutons (se cachent pendant le scan) */}
        <AnimatePresence>
          {showButtons && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 right-4 flex items-start justify-between z-20"
            >
              {/* Bouton Info (gauche) */}
              <button
                onClick={() => setIsInfoModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="text-white/70 text-sm font-medium">?</span>
              </button>

              {/* Boutons droite */}
              <div className="flex items-center gap-2">
                {/* Flash (apparaît si low light ou activé) */}
                {(isLowLight || isFlashEnabled) && (
                  <button
                    onClick={toggleFlash}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      active:scale-95 transition-all
                      ${isFlashEnabled 
                        ? 'bg-yellow-500/20 border border-yellow-500/50' 
                        : 'bg-white/10 backdrop-blur-sm'
                      }
                    `}
                  >
                    <Zap 
                      size={18} 
                      className={isFlashEnabled ? 'text-yellow-400' : 'text-white/70'} 
                      fill={isFlashEnabled ? 'currentColor' : 'none'}
                    />
                  </button>
                )}

                {/* Mode Invité */}
                <button
                  onClick={toggleGuestMode}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 active:scale-95 transition-transform"
                >
                  <UserPlus size={16} className="text-blue-400" />
                  <span className="text-blue-400 text-xs font-medium">Inviter</span>
                  {invitationsCount > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {invitationsCount}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton fermer (si onClose fourni) */}
        {onClose && showButtons && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <X size={18} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Zone instructions */}
      <div className="relative z-10 px-6 pb-10 pt-6 bg-gradient-to-t from-black via-black/95 to-transparent">
        {/* Message principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={skaneState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            {/* Icône + Message */}
            <div className="flex items-center justify-center gap-2 mb-1">
              {renderIcon()}
              <p className="text-lg font-medium text-white">
                {config.message}
              </p>
            </div>
            
            {/* Sous-message */}
            {config.submessage && (
              <p className="text-sm text-white/50">
                {config.submessage}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bouton manuel (optionnel, si l'utilisateur veut forcer) */}
        {skaneState === 'ready' && !isScanning && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={startSkane}
            className="mt-6 w-full py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium active:scale-95 transition-transform"
          >
            Lancer le Skane maintenant
          </motion.button>
        )}

        {/* Indicateur de scan en cours */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                ))}
              </div>
              <span className="text-white/60 text-sm">Analyse en cours</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <SkaneInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      
      <GuestModeModal
        isOpen={isGuestModeModalOpen}
        onClose={() => setIsGuestModeModalOpen(false)}
        invitationsCount={invitationsCount}
        onActivateGuestMode={activateGuestMode}
      />
    </div>
  );
}
