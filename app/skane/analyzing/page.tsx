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

        if (result === null) {
          router.push("/skane/error");
          return;
        }

        const r = result as { microAction?: string; micro_action?: { id?: string; duration_seconds?: number; category?: string } };
        const actionId = r.microAction || r.micro_action?.id || "box_breathing";
        const micro_action = r.micro_action
          ? { ...r.micro_action, id: r.micro_action.id || actionId }
          : { id: actionId, duration_seconds: 24, category: "breathing" as const };
        const toStore = { ...result, microAction: actionId, micro_action };
        sessionStorage.setItem("skane_analysis_result", JSON.stringify(toStore));

        // Aller au briefing (micro-action + explication) avant de faire l'action
        setTimeout(() => router.push("/skane/briefing"), 400);
      })
      .catch((error) => {
        console.error("Analysis error:", error);
        clearInterval(progressInterval);
        setProgress(100);
        router.push("/skane/error");
      });

    return () => clearInterval(progressInterval);
  }, [router]);

  const analyzeImage = async (imageBase64: string | null): Promise<Record<string, unknown> | null> => {
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

      // Si l’API renvoie une erreur (rate limit, etc.), utiliser un fallback pour que
      // l’utilisateur puisse quand même aller vers résultat → indications micro-action.
      if (!response.ok || data.error || data.isFallback) {
        console.warn("Analyze API error", data.error || response.status, data.isFallback);
        return null;
      }

      // S’assurer que le résultat a bien microAction ou micro_action pour la page résultat / briefing
      if (!data.microAction && !data.micro_action?.id) {
        console.warn("Invalid analysis result: missing microAction");
        return null;
      }
      return data;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
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
