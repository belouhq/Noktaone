'use client';

import { motion } from 'framer-motion';

interface BreathingCircleProps {
  phase: 'inhale' | 'exhale' | 'hold' | 'pause' | 'action';
  duration: number;
  secondsRemaining: number;
}

export function BreathingCircle({ phase, duration, secondsRemaining }: BreathingCircleProps) {
  // Calculer la taille selon la phase
  const getScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5; // Agrandir
      case 'exhale':
        return 1; // Rétrécir
      case 'hold':
        return 1.5; // Maintenir grand
      case 'pause':
        return 1; // Maintenir petit
      case 'action':
        return 1.2; // Taille moyenne
      default:
        return 1;
    }
  };

  // Couleur selon la phase
  const getColor = () => {
    switch (phase) {
      case 'inhale':
        return '#3B82F6'; // Bleu
      case 'exhale':
        return '#10B981'; // Vert
      case 'hold':
        return '#8B5CF6'; // Violet
      case 'pause':
        return '#6B7280'; // Gris
      case 'action':
        return '#F59E0B'; // Orange
      default:
        return '#3B82F6';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Cercle principal animé */}
      <motion.div
        className="breathing-circle rounded-full flex items-center justify-center"
        style={{
          backgroundColor: `${getColor()}20`,
          border: `3px solid ${getColor()}`,
        }}
        animate={{
          scale: getScale(),
        }}
        transition={{
          duration: duration,
          ease: phase === 'inhale' ? 'easeIn' : 'easeOut',
        }}
      >
        {/* Compteur au centre */}
        <span 
          className="text-responsive-4xl font-light"
          style={{ color: getColor() }}
        >
          {secondsRemaining}
        </span>
      </motion.div>

      {/* Cercle de progression externe */}
      <svg
        className="absolute breathing-circle-outer"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={283} // 2 * PI * 45
          initial={{ strokeDashoffset: 283 }}
          animate={{ 
            strokeDashoffset: 283 - (283 * (duration - secondsRemaining) / duration)
          }}
          transition={{ duration: 0.5 }}
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  );
}
