"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "text" | "icon";
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Composant Logo pour NOKTA ONE
 * 
 * @param variant - "text" pour le logo avec texte, "icon" pour le logo seul
 * @param className - Classes CSS additionnelles
 * @param width - Largeur (optionnel, par défaut auto)
 * @param height - Hauteur (optionnel, par défaut auto)
 */
export default function Logo({ 
  variant = "text", 
  className = "",
  width,
  height 
}: LogoProps) {
  const src = variant === "text" 
    ? "/logos/logo-text.svg" 
    : "/logos/logo.svg";
  
  const alt = variant === "text" 
    ? "NOKTA ONE" 
    : "Nokta";

  // Dimensions par défaut selon le variant
  const defaultWidth = variant === "text" ? 200 : 40;
  const defaultHeight = variant === "text" ? 40 : 40;

  return (
    <Image
      src={src}
      alt={alt}
      width={width || defaultWidth}
      height={height || defaultHeight}
      className={className}
      priority
      unoptimized // Pour les SVG, on peut désactiver l'optimisation
      style={{
        width: width ? `${width}px` : "auto",
        height: height ? `${height}px` : "auto",
        maxWidth: "100%",
      }}
    />
  );
}
