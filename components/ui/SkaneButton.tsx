"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface SkaneButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export default function SkaneButton({ onClick, disabled }: SkaneButtonProps) {
  const { t } = useTranslation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SkaneButton clicked');
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <motion.button
      onClick={handleClick}
      type="button"
      disabled={disabled}
      className="relative skane-button rounded-full flex flex-col items-center justify-center z-10"
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(40px)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 0 60px rgba(255, 255, 255, 0.05)
        `,
      }}
      whileHover={{
        scale: 1.08,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 0 60px rgba(255, 255, 255, 0.05),
          0 0 30px rgba(59, 130, 246, 0.3)
        `,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <span className="text-nokta-one-white text-xl font-medium text-center whitespace-pre-line">
        {t("home.pressToSkane")}
      </span>
    </motion.button>
  );
}
