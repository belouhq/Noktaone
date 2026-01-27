'use client';

import { motion } from 'framer-motion';

interface SkaneInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkaneInfoModal({ isOpen, onClose }: SkaneInfoModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 rounded-t-3xl p-6 pb-10"
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        {/* Titre */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Qu'est-ce qu'un Skane ?
        </h2>

        {/* Description */}
        <p className="text-white/70 mb-6">
          Un reset corporel de 30 secondes maximum :
        </p>

        {/* Étapes */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan-400 text-sm">1</span>
            </div>
            <div>
              <p className="text-white font-medium">Scan facial IA</p>
              <p className="text-white/50 text-sm">3 secondes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan-400 text-sm">2</span>
            </div>
            <div>
              <p className="text-white font-medium">Micro-action guidée</p>
              <p className="text-white/50 text-sm">20-30 secondes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan-400 text-sm">3</span>
            </div>
            <div>
              <p className="text-white font-medium">Retour à l'équilibre</p>
              <p className="text-white/50 text-sm">Immédiat</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-white/60 text-xs text-center">
          Signal de bien-être uniquement · Juste une action
        </p>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-white/10 rounded-full text-white font-medium active:scale-95 transition-transform"
        >
          Compris
        </button>
      </motion.div>
    </motion.div>
  );
}
