"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import ShareCardV5 from "@/components/skane/ShareCardV5";
import type { MicroActionType } from "@/lib/skane/types";
import SharePlatformSelector from "@/components/share/SharePlatformSelector";
import shareService, { ShareData } from "@/lib/skane/shareService";
import { generateSEOFilename } from "@/lib/skane/seo-filename";

type Step = "selfie" | "preview";

export default function ShareCardV5Page() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [step, setStep] = useState<Step>("selfie");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [microAction, setMicroAction] = useState<MicroActionType>("physiological_sigh");
  const [beforeScore, setBeforeScore] = useState<number>(85);
  const [afterScore, setAfterScore] = useState<number>(44);
  const [streak, setStreak] = useState<number | undefined>(undefined);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  // Initialisation
  useEffect(() => {
    const storedFeedback = sessionStorage.getItem("skane_feedback");
    if (storedFeedback !== "better") {
      router.push("/");
      return;
    }

    const storedResult = sessionStorage.getItem("skane_analysis_result");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setMicroAction(parsed.microAction || "physiological_sigh");
        
        // Calculer les scores depuis skaneIndex
        const skaneIndex = parsed.skaneIndex || 85;
        setBeforeScore(skaneIndex);
        
        // Calculer afterScore basé sur le feedback
        const feedback = storedFeedback;
        if (feedback === "better") {
          setAfterScore(Math.max(15, skaneIndex - 40)); // Réduction significative
        } else if (feedback === "same") {
          setAfterScore(Math.max(30, skaneIndex - 20)); // Réduction modérée
        } else {
          setAfterScore(Math.max(45, skaneIndex - 10)); // Réduction faible
        }
      } catch (error) {
        console.error("Error parsing skane data:", error);
      }
    }

    // Récupérer le streak depuis localStorage ou sessionStorage
    const storedStreak = localStorage.getItem("skane_streak") || sessionStorage.getItem("skane_streak");
    if (storedStreak) {
      try {
        setStreak(parseInt(storedStreak, 10));
      } catch {
        // Ignore
      }
    }
  }, [router]);

  // Initialiser la caméra
  useEffect(() => {
    if (step !== "selfie") return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraReady(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, facingMode]);

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSelfieUrl(dataUrl);
    setStep("preview");

    // Arrêter la caméra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const retakeSelfie = () => {
    setSelfieUrl(null);
    setStep("selfie");
  };

  const handleShare = async (imageUrl: string) => {
    setIsGeneratingImage(true);
    try {
      // Convertir dataUrl en blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Générer un nom de fichier SEO
      const username = localStorage.getItem("username") || undefined;
      const filename = generateSEOFilename({
        actionId: microAction,
        username,
        scores: {
          before: [beforeScore, beforeScore + 5],
          after: [afterScore, afterScore + 5],
        },
        feedback: "better",
        locale: "en",
      });

      const data: ShareData = {
        image: blob,
        filename,
        title: "My Skane Result",
        text: "Check out my Skane result!",
      };

      setShareData(data);
      setIsShareSheetOpen(true);
      // Le SharePlatformSelector gérera le partage
    } catch (error) {
      console.error("Error preparing share:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async (imageUrl: string) => {
    try {
      const link = document.createElement("a");
      const username = localStorage.getItem("username") || undefined;
      const filename = generateSEOFilename({
        actionId: microAction,
        username,
        scores: {
          before: [beforeScore, beforeScore + 5],
          after: [afterScore, afterScore + 5],
        },
        feedback: "better",
        locale: "en",
      });
      link.download = filename;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  if (step === "selfie") {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
          <motion.button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-icon-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={20} className="text-white" />
          </motion.button>
          <h1 className="text-white font-semibold text-lg">
            {t("share.selfieTitle")}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Camera View */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Overlay instructions */}
          <div className="absolute bottom-32 left-0 right-0 px-6 text-center z-10">
            <p className="text-white text-sm mb-2">
              {t("share.selfieInstructions")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("share.selfieSubtext")}
            </p>
          </div>

          {/* Capture button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
            <motion.button
              onClick={captureSelfie}
              disabled={!isCameraReady}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-md flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera size={32} className="text-white" />
            </motion.button>
          </div>

          {/* Flip camera button */}
          <div className="absolute bottom-8 right-8 z-10">
            <motion.button
              onClick={() => setFacingMode(facingMode === "user" ? "environment" : "user")}
              className="w-12 h-12 rounded-full glass-icon-button flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={20} className="text-white" />
            </motion.button>
          </div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <AnimatePresence>
        {isShareSheetOpen && (
          <SharePlatformSelector
            shareData={{
              image: shareData?.image,
              filename: shareData?.filename,
              title: shareData?.title,
              text: shareData?.text,
            }}
            onClose={() => setIsShareSheetOpen(false)}
            onShareComplete={() => setIsShareSheetOpen(false)}
          />
        )}
      </AnimatePresence>

      {selfieUrl && (
        <ShareCardV5
          selfieUrl={selfieUrl}
          beforeScore={beforeScore}
          afterScore={afterScore}
          microAction={microAction}
          streak={streak}
          onShare={handleShare}
          onSave={handleSave}
        />
      )}

      {/* Retake button */}
      <div className="flex justify-center mt-6">
        <motion.button
          onClick={retakeSelfie}
          className="px-6 py-3 rounded-xl text-white font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("share.retake")}
        </motion.button>
      </div>
    </div>
  );
}
