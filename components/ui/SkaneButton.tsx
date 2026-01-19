"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { haptic } from "@/lib/skane/haptics";

interface SkaneButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export default function SkaneButton({ onClick, disabled }: SkaneButtonProps) {
  const { t } = useTranslation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Haptique courte et sèche (10-15ms)
    haptic.tick();
    
    if (onClick && !disabled) {
      onClick();
    }
  };
  
  return (
    <motion.button
      onClick={handleClick}
      type="button"
      disabled={disabled}
      className="relative rounded-full flex flex-col items-center justify-center z-10"
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        // Diamètre : 64-72mm responsive (sweet spot 68mm)
        width: 'clamp(220px, 28vw, 280px)',
        height: 'clamp(220px, 28vw, 280px)',
        minWidth: '48px', // Accessible hit area
        minHeight: '48px',
        // Forme : cercle parfait
        borderRadius: '50%',
        // Style glassmorphism
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(40px)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 0 60px rgba(255, 255, 255, 0.05)
        `,
      }}
      // Animation passive : breathing (very slow, low amplitude)
      animate={{
        scale: [0.985, 1.0, 0.985], // Amplitude < 3%
      }}
      transition={{
        duration: 4, // 3.5-4.5s (sweet spot 4s)
        repeat: Infinity,
        ease: "easeInOut",
      }}
      // Animation au tap : compression subtile
      whileTap={{
        scale: 0.96, // Compression légère
        transition: {
          duration: 0.14, // 120-160ms (moyenne 140ms)
          ease: "easeOut",
        },
      }}
    >
      {/* Texte : "Press to Skane" */}
      <span 
        className="text-nokta-one-white text-center whitespace-pre-line"
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          fontWeight: 600, // Semi-bold
          letterSpacing: '0.05em', // Tracking légèrement augmenté (+2 à +4)
          lineHeight: 1.3,
        }}
      >
        {t("home.pressToSkane")}
      </span>
    </motion.button>
  );
}
