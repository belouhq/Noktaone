"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
}

export default function GlassButton({
  children,
  onClick,
  className,
  disabled = false,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  ariaLabel,
  type = "button",
}: GlassButtonProps) {
  const variantClass = {
    primary: "glass-button-primary",
    secondary: "glass-button-secondary",
    ghost: "glass-button-ghost",
  }[variant];

  const sizeClass = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={clsx(
        "glass-button",
        variantClass,
        sizeClass,
        fullWidth && "w-full",
        "no-select",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className
      )}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
