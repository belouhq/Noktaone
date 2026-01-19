"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function FaceGuide() {
  const { t } = useTranslation();

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" 
      style={{ zIndex: 15 }}
    >
      {/* Cercle de guidage - PARFAITEMENT ROND */}
      <div
        className="relative"
        style={{
          // Utiliser la même valeur pour width et height = cercle parfait
          width: "min(280px, 70vw)",
          height: "min(280px, 70vw)",
        }}
      >
        {/* Cercle principal avec animation pulse subtile */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "3px solid #10B981",
            boxShadow: "0 0 30px rgba(16, 185, 129, 0.4), inset 0 0 30px rgba(16, 185, 129, 0.1)",
          }}
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Croix de centrage (optionnelle, aide au positionnement) */}
        {/* Ligne horizontale */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "60%",
            height: "1px",
            background: "linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.4) 30%, rgba(16, 185, 129, 0.4) 70%, transparent 100%)",
          }}
        />
        {/* Ligne verticale */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "1px",
            height: "60%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0.4) 30%, rgba(16, 185, 129, 0.4) 70%, transparent 100%)",
          }}
        />

        {/* Point central */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.6)",
          }}
        />
      </div>

      {/* Instruction texte - claire et simple */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-white text-center text-lg font-medium px-4"
        style={{
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
        }}
      >
        {t("skane.centerFace") || "Centrez votre visage"}
      </motion.p>
    </div>
  );
}
