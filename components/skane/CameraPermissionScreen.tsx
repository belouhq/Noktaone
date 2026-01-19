'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, AlertCircle, Settings, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { BottomNav } from '@/components/ui/BottomNav';

interface CameraPermissionScreenProps {
  state: 'idle' | 'requesting' | 'denied' | 'error';
  onRequestPermission: () => void;
}

export function CameraPermissionScreen({ state, onRequestPermission }: CameraPermissionScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Fallback si la traduction n'est pas chargée
  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  // Détecter le navigateur — retourne des clés i18n pour le vocabulaire NOKTA
  const getBrowserInstructions = (): { browserKey: string; icon: string; stepKeys: string[] } => {
    const stepKeys = ['camera.browserStep1', 'camera.browserStep2', 'camera.browserStep3', 'camera.browserStep4'];
    if (typeof window === 'undefined') {
      return { browserKey: 'camera.browserDefault', icon: '⚙️', stepKeys };
    }
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) {
      return { browserKey: 'camera.browserChrome', icon: '🔒', stepKeys };
    }
    if (userAgent.includes('safari')) {
      return { browserKey: 'camera.browserSafari', icon: '⚙️', stepKeys };
    }
    if (userAgent.includes('firefox')) {
      return { browserKey: 'camera.browserFirefox', icon: '🔒', stepKeys };
    }
    return { browserKey: 'camera.browserDefault', icon: '⚙️', stepKeys };
  };

  // Bouton retour commun à tous les états
  const BackButton = () => (
    <button
      onClick={() => router.push('/')}
      className="absolute top-4 left-4 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
    >
      <ArrowLeft className="w-5 h-5 text-nokta-one-white" />
    </button>
  );

  // État : demande initiale
  if (state === 'idle') {
    return (
      <div className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center p-8">
        <BackButton />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
            <Camera className="w-12 h-12 text-nokta-one-blue" />
          </div>
          
          <h1 className="text-2xl font-semibold text-nokta-one-white mb-4">
            {t("camera.accessRequired")}
          </h1>
          
          <p className="text-gray-400 mb-8 max-w-xs">
            {t("camera.description")}
          </p>
          
          <div className="text-left text-sm text-gray-500 mb-8 space-y-2">
            <p>✓ {t("camera.noPhotoStored")}</p>
            <p>✓ {t("camera.instantAnalysis")}</p>
            <p>✓ {t("camera.revocableAnytime")}</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRequestPermission}
            className="px-8 py-4 bg-nokta-one-blue text-nokta-one-white rounded-full font-medium text-lg"
          >
            {t("camera.allowCamera")}
          </motion.button>
        </motion.div>
        
        <BottomNav />
      </div>
    );
  }

  // État : chargement
  if (state === 'requesting') {
    return (
      <div className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center">
        <BackButton />
        <div className="w-16 h-16 border-4 border-nokta-one-blue border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">{t("camera.activatingCamera")}</p>
        <BottomNav />
      </div>
    );
  }

  // État : refusé
  if (state === 'denied') {
    const instructions = getBrowserInstructions();
    
    return (
      <div className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center p-8">
        <BackButton />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-semibold text-nokta-one-white mb-4">
            {t("camera.accessDenied")}
          </h1>
          
          <p className="text-gray-400 mb-8 max-w-xs">
            {t("camera.description")} {t("camera.howToEnable")}
          </p>
          
          <div className="text-left text-sm text-gray-500 mb-8 space-y-2 bg-white/5 p-4 rounded-xl">
            <p className="font-medium text-nokta-one-white mb-2">
              {instructions.icon} {t('camera.howToEnableOn', { browser: t(instructions.browserKey) })}
            </p>
            {instructions.stepKeys.map((key, index) => (
              <p key={index}>{index + 1}. {t(key)}</p>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-nokta-one-blue text-nokta-one-white rounded-full font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {t("camera.refreshPage")}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // État : erreur technique
  if (state === 'error') {
    return (
      <div className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center p-8">
        <BackButton />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20">
            <AlertCircle className="w-12 h-12 text-orange-500" />
          </div>
          
          <h1 className="text-2xl font-semibold text-nokta-one-white mb-4">
            {getTranslation("camera.accessError", "Erreur technique")}
          </h1>
          
          <p className="text-gray-400 mb-8 max-w-xs">
            {getTranslation("camera.cannotAccessCamera", "Impossible d'accéder à la caméra.")}
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              {getTranslation("camera.noCameraFound", "Vérifiez qu'une caméra est connectée et qu'aucune autre app ne l'utilise.")}
            </span>
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRequestPermission}
            className="px-8 py-4 bg-nokta-one-blue text-nokta-one-white rounded-full font-medium"
          >
            {getTranslation("common.retry", "Réessayer")}
          </motion.button>
        </motion.div>
        
        <BottomNav />
      </div>
    );
  }

  return null;
}
