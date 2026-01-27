'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Check, RotateCcw, ArrowRight, Clock, Home, ChevronDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import { generateSkaneFilename } from '@/lib/skane/seo-filename';
import { SKANE_COOLDOWN_CONFIG } from '@/config/skane-cooldown';
import { useSkaneCooldown } from '@/lib/hooks/useSkaneCooldown';
import { getMicroActionDetails } from '@/lib/skane/selector';
import type { MicroActionType } from '@/lib/skane/types';
import SharePlatformSelector from '@/components/share/SharePlatformSelector';
import type { ShareData as ShareServiceData, ShareResult } from '@/lib/skane/shareService';
import { getShareStoryMessage, getShareUrl } from '@/lib/skane/shareService';

// ============================================
// TYPES
// ============================================

type FeedbackType = 'clear' | 'reduced' | 'still_high';

interface SkaneIndexProps {
  /** URL du selfie pris après le SKANE */
  selfieUrl: string;
  /** Feedback utilisateur après la micro-action */
  feedback: FeedbackType;
  /** Nom de la micro-action complétée */
  microActionName: string;
  /** Durée de la micro-action en secondes */
  microActionDuration: number;
  /** Username de l'utilisateur (ex: "benjamin" ou "@benjamin") */
  username: string;
  /** User ID pour le cooldown */
  userId?: string;
  /** Micro-action actuelle (pour proposer une alternative) */
  currentMicroAction?: MicroActionType;
  /** Mode invité (delta amplifié) */
  isGuestMode?: boolean;
  /** Callback pour fermer l'écran */
  onClose?: () => void;
  /** Callback pour partager */
  onShare?: (data: ShareData) => void;
  /** Si true, le bouton Partager appelle onShare(d) sans ouvrir le sélecteur interne (flux viral ShareFlowViral) */
  useViralShareFlow?: boolean;
  /** Callback pour refaire avec une autre action (still_high) */
  onRetryWithDifferentAction?: () => void;
  /** Callback pour refaire un Skane (clear/reduced) */
  onRetry?: () => void;
  /** Fourchette précédente (pour anti-répétition) */
  previousRanges?: {
    before: [number, number];
    after: [number, number];
  } | null;
  /**
   * Skane index AVANT la micro-action (état initial).
   * Quand fourni avec afterScore, on utilise la note smiley comme source de vérité
   * pour l’écart avant/après au lieu des zones fixes par feedback.
   */
  skaneIndexBefore?: number;
  /**
   * Score APRÈS dérivé du smiley "Comment te sens-tu ?".
   * C’est l’utilisateur qui juge l’écart avant/après ; ce score est la note.
   */
  afterScore?: number;
}

interface ShareData {
  beforeRange: [number, number];
  afterRange: [number, number];
  microActionName: string;
  selfieUrl: string;
  username: string;
  filename: string;
}

interface GeneratedRanges {
  before: [number, number];
  after: [number, number];
  beforeLabel: string;
  afterLabel: string;
}

// ============================================
// CONSTANTES - ZONES AUTORISÉES PAR FEEDBACK
// ============================================

const FEEDBACK_ZONES = {
  clear: {
    before: { min: 80, max: 100, spread: [15, 20] },
    after: { min: 15, max: 30, spread: [10, 15] },
    beforeLabel: 'Élevé',
    afterLabel: 'Équilibré',
  },
  reduced: {
    before: { min: 75, max: 90, spread: [15, 20] },
    after: { min: 25, max: 40, spread: [10, 15] },
    beforeLabel: 'Élevé',
    afterLabel: 'Apaisé',
  },
  still_high: {
    before: { min: 75, max: 95, spread: [15, 20] },
    after: { min: 40, max: 55, spread: [10, 15] },
    beforeLabel: 'Élevé',
    afterLabel: 'Encore élevé',
  },
} as const;

const MIN_DELTA = 40;
const NOISE_RANGE = { min: 3, max: 7 };
const GUEST_NOISE_RANGE = { min: 5, max: 10 };
const SIMILARITY_THRESHOLD = 5;

// ============================================
// UTILITAIRES
// ============================================

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applyNoise(value: number, noiseRange: { min: number; max: number }): number {
  const noise = randomInRange(noiseRange.min, noiseRange.max);
  const direction = Math.random() > 0.5 ? 1 : -1;
  return value + noise * direction;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function areTooSimilar(
  range1: [number, number],
  range2: [number, number],
  threshold: number
): boolean {
  return (
    Math.abs(range1[0] - range2[0]) < threshold &&
    Math.abs(range1[1] - range2[1]) < threshold
  );
}

function generateRanges(
  feedback: FeedbackType,
  isGuestMode: boolean,
  previousRanges: { before: [number, number]; after: [number, number] } | null,
  maxAttempts: number = 10
): GeneratedRanges {
  const zone = FEEDBACK_ZONES[feedback];
  const noiseRange = isGuestMode ? GUEST_NOISE_RANGE : NOISE_RANGE;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const beforeSpread = randomInRange(zone.before.spread[0], zone.before.spread[1]);
    let beforeLow = randomInRange(zone.before.min, zone.before.max - beforeSpread);
    let beforeHigh = beforeLow + beforeSpread;

    beforeLow = clamp(applyNoise(beforeLow, noiseRange), zone.before.min, 100);
    beforeHigh = clamp(applyNoise(beforeHigh, noiseRange), beforeLow + 10, 100);

    const afterSpread = randomInRange(zone.after.spread[0], zone.after.spread[1]);
    let afterLow = randomInRange(zone.after.min, zone.after.max - afterSpread);
    let afterHigh = afterLow + afterSpread;

    afterLow = clamp(applyNoise(afterLow, noiseRange), 5, zone.after.max);
    afterHigh = clamp(applyNoise(afterHigh, noiseRange), afterLow + 5, zone.after.max + 10);

    const beforeMean = (beforeLow + beforeHigh) / 2;
    const afterMean = (afterLow + afterHigh) / 2;
    const delta = beforeMean - afterMean;

    if (delta < MIN_DELTA) {
      const adjustment = MIN_DELTA - delta + 5;
      beforeLow = clamp(beforeLow + adjustment / 2, zone.before.min, 95);
      beforeHigh = clamp(beforeHigh + adjustment / 2, beforeLow + 10, 100);
      afterLow = clamp(afterLow - adjustment / 2, 5, zone.after.max - 10);
      afterHigh = clamp(afterHigh - adjustment / 2, afterLow + 5, zone.after.max);
    }

    const beforeRange: [number, number] = [Math.round(beforeLow), Math.round(beforeHigh)];
    const afterRange: [number, number] = [Math.round(afterLow), Math.round(afterHigh)];

    if (previousRanges) {
      if (
        areTooSimilar(beforeRange, previousRanges.before, SIMILARITY_THRESHOLD) ||
        areTooSimilar(afterRange, previousRanges.after, SIMILARITY_THRESHOLD)
      ) {
        continue;
      }
    }

    return {
      before: beforeRange,
      after: afterRange,
      beforeLabel: zone.beforeLabel,
      afterLabel: zone.afterLabel,
    };
  }

  return {
    before: [80, 95],
    after: [20, 35],
    beforeLabel: zone.beforeLabel,
    afterLabel: zone.afterLabel,
  };
}

/** Fourchettes dérivées de la note smiley : avant = skaneIndex, après = afterScore (écart jugé par l’utilisateur). */
function rangesFromUserNote(
  skaneIndexBefore: number,
  afterScore: number,
  feedback: FeedbackType
): GeneratedRanges {
  const zone = FEEDBACK_ZONES[feedback];
  const beforeVal = clamp(Math.round(skaneIndexBefore), 0, 100);
  const afterVal = clamp(Math.round(afterScore), 0, 100);
  const spread = 5;
  const beforeRange: [number, number] = [
    Math.max(0, beforeVal - spread),
    Math.min(100, beforeVal + spread),
  ];
  const afterRange: [number, number] = [
    Math.max(0, afterVal - spread),
    Math.min(100, afterVal + spread),
  ];
  return {
    before: beforeRange,
    after: afterRange,
    beforeLabel: zone.beforeLabel,
    afterLabel: zone.afterLabel,
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function SkaneIndexResult({
  selfieUrl,
  feedback,
  microActionName,
  microActionDuration,
  username,
  userId = 'default',
  currentMicroAction,
  isGuestMode = false,
  onClose,
  onShare,
  useViralShareFlow = false,
  onRetryWithDifferentAction,
  onRetry,
  previousRanges = null,
  skaneIndexBefore,
  afterScore,
}: SkaneIndexProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<ShareServiceData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Priorité à la note smiley : quand skaneIndexBefore + afterScore sont fournis,
  // l’écart avant/après est celui jugé par l’utilisateur ("Comment te sens-tu ?").
  const ranges = useMemo(() => {
    if (
      typeof skaneIndexBefore === 'number' &&
      typeof afterScore === 'number' &&
      Number.isFinite(skaneIndexBefore) &&
      Number.isFinite(afterScore)
    ) {
      return rangesFromUserNote(skaneIndexBefore, afterScore, feedback);
    }
    return generateRanges(feedback, isGuestMode, previousRanges);
  }, [feedback, isGuestMode, previousRanges, skaneIndexBefore, afterScore]);

  // Cooldown (uniquement si pas mode invité)
  const { timeRemaining, setCooldown } = useSkaneCooldown(isGuestMode ? 'guest' : userId);

  // Définir le cooldown au montage si feedback positif
  useEffect(() => {
    if (!isGuestMode && (feedback === 'clear' || feedback === 'reduced')) {
      setCooldown(feedback);
    }
  }, [feedback, isGuestMode, setCooldown]);

  // Afficher le bouton "Refaire" après un délai selon le feedback
  useEffect(() => {
    if (isGuestMode) return; // Pas de bouton retry pour les invités
    
    let delay = 0;
    if (feedback === 'clear') {
      delay = 10000; // 10 secondes
    } else if (feedback === 'reduced') {
      delay = 5000; // 5 secondes
    } else if (feedback === 'still_high') {
      delay = 0; // Immédiat
    }

    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowRetryButton(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowRetryButton(true); // Immédiat pour still_high
    }
  }, [feedback, isGuestMode]);

  const getAfterColor = () => {
    switch (feedback) {
      case 'clear': return 'text-green-400';
      case 'reduced': return 'text-green-500';
      case 'still_high': return 'text-orange-500';
    }
  };

  const getAfterStrokeColor = () => {
    switch (feedback) {
      case 'clear': return '#22c55e';
      case 'reduced': return '#22c55e';
      case 'still_high': return '#f97316';
    }
  };

  const isPositiveFeedback = feedback === 'clear' || feedback === 'reduced';
  const beforeScore = (ranges.before[0] + ranges.before[1]) / 2;
  const afterMean = (ranges.after[0] + ranges.after[1]) / 2;

  const handleShare = async () => {
    if (useViralShareFlow && onShare) {
      onShare({
        beforeRange: ranges.before,
        afterRange: ranges.after,
        microActionName,
        selfieUrl,
        username,
        filename: generateSkaneFilename(username),
      });
      return;
    }
    if (!containerRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(containerRef.current, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 2,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const filename = generateSkaneFilename(username);
      const shareMessage = getShareStoryMessage('fr');
      const shareText = `${shareMessage} -${Math.round(beforeScore - afterMean)} points.`;
      const shareUrl = getShareUrl();

      setSharePayload({
        imageBlob: blob,
        imageUrl: dataUrl,
        filename,
        title: 'Skane Story · Nokta One',
        text: shareText,
        url: shareUrl,
      });
      setIsShareSheetOpen(true);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      if (containerRef.current) {
        try {
          const dataUrl = await toPng(containerRef.current, {
            width: 1080,
            height: 1920,
            quality: 1,
            pixelRatio: 2,
          });
          const filename = generateSkaneFilename(username);
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
        } catch (downloadError) {
          console.error('Erreur lors du téléchargement:', downloadError);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareComplete = (result: ShareResult) => {
    if (!result.success) return;
    if (onShare) {
      onShare({
        beforeRange: ranges.before,
        afterRange: ranges.after,
        microActionName,
        selfieUrl,
        username,
        filename: sharePayload?.filename || generateSkaneFilename(username),
      });
    }
  };

  const handleRetryClick = () => {
    if (onRetry) {
      onRetry();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/skane';
    }
  };

  const handleRetryDifferentActionClick = () => {
    if (onRetryWithDifferentAction) {
      onRetryWithDifferentAction();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/skane';
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black flex flex-col">
      {/* Background selfie */}
      <div className="absolute inset-0">
        <img
          src={selfieUrl}
          alt="Votre Skane"
          className="w-full h-full object-cover object-[center_20%]"
          style={{ filter: 'brightness(0.75) contrast(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/75" />
      </div>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <span className="text-white/70 text-sm font-medium tracking-widest">
          SKANE INDEX
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs tracking-widest">
            NOKTA ONE
          </span>
          {onClose && (
            <button 
              onClick={handleCloseClick}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <X size={16} className="text-white/70" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col overflow-y-auto"
      >
        {/* Scores - Cercles */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center gap-6 py-6 mt-28"
        >
          {/* AVANT */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%" cy="50%" r="42%"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50%" cy="50%" r="42%"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: beforeScore / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-red-500">
                  {ranges.before[0]}-{ranges.before[1]}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-white/60 mt-1 uppercase tracking-widest">Avant</span>
            <span className="text-xs text-white/70">{ranges.beforeLabel}</span>
          </div>

          {/* Flèche */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ArrowRight className="text-white/20" size={18} />
          </motion.div>

          {/* APRÈS */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%" cy="50%" r="42%"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50%" cy="50%" r="42%"
                  fill="none"
                  stroke={getAfterStrokeColor()}
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: afterMean / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${getAfterColor()}`}>
                  {ranges.after[0]}-{ranges.after[1]}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-white/60 mt-1 uppercase tracking-widest">Après</span>
            <span className={`text-xs ${getAfterColor()}`}>{ranges.afterLabel}</span>
          </div>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Infos - cachées par défaut */}
        <motion.div variants={itemVariants} className="px-4 pb-2">
          <button
            onClick={() => setShowDetails((prev) => !prev)}
            className="w-full py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs flex items-center justify-center gap-2 hover:text-white/90 transition-colors"
          >
            Détails du Skane
            <ChevronDown size={12} className={showDetails ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <p className="text-white/70 text-[11px] uppercase tracking-widest">
                  Skane terminé
                </p>
                <p className="text-white/90 text-sm">
                  Micro-action : {microActionName}
                </p>
                <p className="text-white/70 text-sm">
                  Temps : {microActionDuration}s. C'est tout.
                </p>
                <p className="text-white/50 text-[10px] mt-1">
                  Disclaimer : Signal de bien-être · Non médical
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* === BOUTONS SELON FEEDBACK === */}
        
        {/* Feedback POSITIF → Cooldown */}
        {isPositiveFeedback && (
          <motion.div variants={itemVariants} className="px-4 pb-8 space-y-3">
            <p className="text-center text-white/50 text-xs">
              {SKANE_COOLDOWN_CONFIG[feedback].encouragement}
            </p>
            
            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="w-full py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 size={18} />
              {isGenerating ? 'Génération...' : 'Partager mon Skane'}
            </button>

            {!isGuestMode && timeRemaining && (
              <div className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-center">
                <p className="text-white/60 text-[10px] mb-0.5">Prochain Skane disponible dans</p>
                <p className="text-white/60 text-sm font-medium flex items-center justify-center gap-1.5">
                  <Clock size={14} className="text-white/60" />
                  {timeRemaining}
                </p>
              </div>
            )}

            {/* Bouton "Refaire" avec délai selon le feedback */}
            <AnimatePresence>
              {showRetryButton && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={handleRetryClick}
                  className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm flex items-center justify-center gap-2 hover:text-white/80 transition-colors"
                >
                  <RotateCcw size={14} />
                  Refaire un Skane
                </motion.button>
              )}
            </AnimatePresence>

            <button 
              onClick={handleCloseClick} 
              className="w-full py-2 text-white/30 text-xs flex items-center justify-center gap-1.5"
            >
              <Home size={12} />
              Retour à l'accueil
            </button>
          </motion.div>
        )}

        {/* Feedback NÉGATIF → Retry immédiat */}
        {feedback === 'still_high' && (
          <motion.div variants={itemVariants} className="px-4 pb-8 space-y-3">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-orange-400 text-sm font-medium">Votre signal est encore élevé</p>
              <p className="text-white/60 text-xs mt-0.5">Essayons une autre micro-action</p>
            </div>
            
            {onRetryWithDifferentAction && (
              <button
                onClick={handleRetryDifferentActionClick}
                className="w-full py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
              >
                <RotateCcw size={18} />
                Essayer une autre action
              </button>
            )}

            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Share2 size={14} />
              {isGenerating ? 'Génération...' : 'Partager quand même'}
            </button>


            <button 
              onClick={handleCloseClick} 
              className="w-full py-2 text-white/30 text-xs"
            >
              Pas maintenant
            </button>
          </motion.div>
        )}
      </motion.div>

      {sharePayload && (
        <SharePlatformSelector
          isOpen={isShareSheetOpen}
          onClose={() => setIsShareSheetOpen(false)}
          shareData={sharePayload}
          allowedPlatforms={['instagram', 'tiktok', 'snapchat', 'facebook']}
          alwaysShowPlatforms={['instagram', 'tiktok', 'snapchat', 'facebook']}
          onShareComplete={handleShareComplete}
        />
      )}
    </div>
  );
}

export { generateRanges, FEEDBACK_ZONES, MIN_DELTA };
export type { FeedbackType, GeneratedRanges, ShareData };
