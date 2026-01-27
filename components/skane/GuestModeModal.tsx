'use client';

import { motion } from 'framer-motion';
import { UserPlus, Check, Shield } from 'lucide-react';

interface GuestModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationsCount: number;
  onActivateGuestMode: () => void;
}

export default function GuestModeModal({ 
  isOpen, 
  onClose, 
  invitationsCount,
  onActivateGuestMode 
}: GuestModeModalProps) {
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

        {/* Icône */}
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <UserPlus size={28} className="text-blue-400" />
        </div>

        {/* Titre */}
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          Mode Invité
        </h2>
        <p className="text-white/50 text-center mb-6">
          Faites découvrir Nokta One à vos proches
        </p>

        {/* Règles */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={14} className="text-green-400" />
            </div>
            <p className="text-white/80 text-sm">1 invitation = 1 personne peut essayer</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={14} className="text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Gagnez 1 invitation toutes les 3 skanes</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={14} className="text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Les invités peuvent partager leur Skane Index</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Shield size={14} className="text-blue-400" />
            </div>
            <p className="text-white/80 text-sm">Aucune donnée sauvegardée pour les invités</p>
          </div>
        </div>

        {/* Compteur d'invitations */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Invitations disponibles</span>
            <span className="text-2xl font-bold text-blue-400">{invitationsCount}</span>
          </div>
        </div>

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onActivateGuestMode();
              onClose();
            }}
            disabled={invitationsCount === 0}
            className={`
              w-full py-4 rounded-full font-semibold transition-all active:scale-95
              ${invitationsCount > 0
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
              }
            `}
          >
            {invitationsCount > 0 
              ? 'Activer le mode invité' 
              : 'Aucune invitation disponible'
            }
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-white/50 text-sm active:scale-95 transition-transform"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
