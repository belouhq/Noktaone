"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getUserId } from "@/lib/skane/supabase-tracker";

export default function AnalyzingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Analyzing body patterns...");
  const hasAnalyzed = useRef(false);

  useEffect(() => {
    if (hasAnalyzed.current) return;
    hasAnalyzed.current = true;

    // Récupérer l'image capturée
    const imageBase64 = sessionStorage.getItem("skane_captured_image");
    
    if (!imageBase64) {
      router.push("/skane");
      return;
    }

    // Animation de progression
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    // Changer le texte de statut
    setTimeout(() => setStatusText("Detecting activation signals..."), 1500);

    // Appeler l'API d'analyse
    analyzeImage(imageBase64)
      .then((result) => {
        clearInterval(progressInterval);
        setProgress(100);

        // Stocker le résultat
        // Stocker dans les deux formats pour compatibilité
        sessionStorage.setItem("skane_result", JSON.stringify(result));
        sessionStorage.setItem("skane_analysis_result", JSON.stringify(result));

        // Rediriger vers la page de résultat
        setTimeout(() => {
          router.push("/skane/result");
        }, 500);
      })
      .catch((error) => {
        console.error("Analysis error:", error);
        clearInterval(progressInterval);
        setProgress(100);
        // Utiliser un résultat par défaut en cas d'erreur
        const fallbackResult = {
          success: true,
          internal_state: "REGULATED",
          signal_label: "Clear Signal",
          micro_action: {
            id: "box_breathing",
            duration_seconds: 24,
            category: "breathing",
          },
          skane_index: 45,
        };
        // Stocker dans les deux formats pour compatibilité
        sessionStorage.setItem("skane_result", JSON.stringify(fallbackResult));
        sessionStorage.setItem("skane_analysis_result", JSON.stringify(fallbackResult));
        setTimeout(() => {
          router.push("/skane/result");
        }, 500);
      });

    return () => clearInterval(progressInterval);
  }, [router]);

  const analyzeImage = async (imageBase64: string | null) => {
    try {
      const response = await fetch("/api/skane/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          context: {
            time_of_day: getTimeOfDay(),
            last_skane_minutes_ago: null,
            previous_feedback: null,
          },
          userId: getUserId() || undefined,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Analysis error:", error);
      // Retourner un résultat par défaut en cas d'erreur
      return {
        success: true,
        internal_state: "REGULATED",
        signal_label: "Clear Signal",
        micro_action: {
          id: "box_breathing",
          duration_seconds: 24,
          category: "breathing",
        },
        skane_index: 45,
      };
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  // Récupérer l'image pour l'afficher en background
  const capturedImage =
    typeof window !== "undefined"
      ? sessionStorage.getItem("skane_captured_image")
      : null;

  return (
    <div className="fixed inset-0 bg-black">
      {/* Image de fond (la capture) */}
      <div className="absolute inset-0">
        {capturedImage ? (
          <img
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt="Scan"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Spinner de chargement au centre */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>

      {/* Texte de statut en bas */}
      <div className="absolute bottom-24 left-0 right-0 text-center">
        <motion.p
          key={statusText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-xl font-light"
        >
          {statusText}
        </motion.p>
      </div>
    </div>
  );
}
