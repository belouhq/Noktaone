"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function GlassButton({
  children,
  onClick,
  className,
  disabled = false,
}: GlassButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "relative px-8 py-4 rounded-lg",
        "bg-white/10 backdrop-blur-md",
        "border border-white/20",
        "text-nokta-one-white font-medium",
        "transition-all duration-300",
        "hover:bg-white/20 hover:border-white/30",
        "active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
