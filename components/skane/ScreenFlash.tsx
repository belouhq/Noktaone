"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ScreenFlashProps {
  isActive: boolean;
}

/**
 * ScreenFlash - Simulates a selfie flash using the screen only
 * 
 * Creates a bright white frame around the edges while the center stays darker,
 * allowing the UI to remain visible. This white frame acts as a continuous 
 * light source for the face.
 * 
 * Features:
 * - No phone LED used, screen only
 * - Peripheral light distribution (edges bright, center transparent)
 * - Smooth fade in/out transitions (~150ms)
 * - Compatible with PWA / Safari iOS / Chrome Android
 * - Apple-like soft edges, no harsh cutoff
 */
export default function ScreenFlash({ isActive }: ScreenFlashProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {/* Overlay avec masque radial inversé - centre transparent, bords lumineux */}
          <div
            className="absolute inset-0"
            style={{
              // Utilisation d'un radial-gradient comme masque
              // Le centre est transparent, les bords sont blanc pur
              background: `
                radial-gradient(
                  ellipse 50% 45% at 50% 50%,
                  transparent 0%,
                  transparent 60%,
                  rgba(255, 255, 255, 0.3) 70%,
                  rgba(255, 255, 255, 0.6) 80%,
                  rgba(255, 255, 255, 0.85) 90%,
                  rgba(255, 255, 255, 0.95) 100%
                )
              `,
            }}
          />

          {/* Couche additionnelle pour les bords - plus intense */}
          {/* Top edge */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: "15%",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            }}
          />
          
          {/* Bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: "15%",
              background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            }}
          />
          
          {/* Left edge */}
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{
              width: "10%",
              background: "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            }}
          />
          
          {/* Right edge */}
          <div
            className="absolute top-0 bottom-0 right-0"
            style={{
              width: "10%",
              background: "linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            }}
          />

          {/* Corners - extra brightness */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: "20%",
              height: "20%",
              background: "radial-gradient(circle at top left, rgba(255,255,255,1) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-0 right-0"
            style={{
              width: "20%",
              height: "20%",
              background: "radial-gradient(circle at top right, rgba(255,255,255,1) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: "20%",
              height: "20%",
              background: "radial-gradient(circle at bottom left, rgba(255,255,255,1) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: "20%",
              height: "20%",
              background: "radial-gradient(circle at bottom right, rgba(255,255,255,1) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
