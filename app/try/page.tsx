"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Camera, Clock, Shield, ArrowRight, X } from "lucide-react";
import Logo from "@/components/Logo";

/**
 * PAGE /try - Landing virale pour scan gratuit
 * 
 * Cette page est le point d'entrée depuis un partage.
 * Objectif : convertir un visiteur en utilisateur en 1 tap.
 * 
 * Flow : 
 * 1. Visiteur voit la story/post d'un ami
 * 2. Scanne le QR ou clique le lien → arrive ici
 * 3. 1 tap → lance le scan immédiatement (mode guest)
 * 4. Après le scan → prompt inscription
 */

export default function TryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  
  // Récupérer le referral depuis l'URL
  const refCode = searchParams.get("ref");
  
  useEffect(() => {
    // Stocker le referral pour attribution ultérieure
    if (refCode) {
      localStorage.setItem("nokta_referral_source", refCode);
      localStorage.setItem("nokta_referral_timestamp", Date.now().toString());
    }
    
    // Marquer comme provenant d'un partage
    sessionStorage.setItem("nokta_from_share", "true");
  }, [refCode]);

  const handleStartScan = async () => {
    setIsLoading(true);
    
    // Activer le mode guest automatiquement
    localStorage.setItem("guestMode", "true");
    localStorage.setItem("nokta_trial_scan", "true");
    
    // Tracker l'événement
    if (refCode) {
      try {
        await fetch("/api/track/share-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            share_id: refCode,
            action: "start_scan" 
          }),
        });
      } catch (e) {
        // Silently fail - don't block UX
      }
    }
    
    // Rediriger vers le scan
    router.push("/skane");
  };

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* Background gradient animé */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
        }}
      />
      
      {/* Pattern de points subtil */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Logo variant="text" className="h-8 w-auto" />
        </motion.div>

        {/* Hero message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Mesure ton stress
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              en 30 secondes
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-sm">
            Un ami t'a partagé son reset.
            <br />
            Essaie gratuitement, sans inscription.
          </p>
        </motion.div>

        {/* Benefits rapides */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6 mb-12"
        >
          {[
            { icon: Camera, label: "Scan IA" },
            { icon: Clock, label: "30 sec" },
            { icon: Shield, label: "Privé" },
          ].map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center gap-2"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <item.icon size={24} className="text-white/80" />
              </div>
              <span className="text-white/50 text-xs">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Principal - Le bouton qui compte */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          onClick={handleStartScan}
          disabled={isLoading}
          className="relative group px-12 py-5 rounded-full font-semibold text-lg flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            boxShadow: "0 8px 40px rgba(16, 185, 129, 0.4)"
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span className="text-white">Chargement...</span>
            </>
          ) : (
            <>
              <Sparkles size={24} className="text-white" />
              <span className="text-white">Essayer maintenant</span>
              <ArrowRight size={20} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </>
          )}
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              filter: "blur(20px)",
              zIndex: -1
            }}
          />
        </motion.button>

        {/* Texte rassurant */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-sm mt-6 text-center"
        >
          Gratuit • Sans compte • Données non stockées
        </motion.p>

        {/* "Pourquoi ?" lien */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowWhy(true)}
          className="text-white/30 text-sm mt-8 underline underline-offset-4 hover:text-white/50 transition-colors"
        >
          Comment ça marche ?
        </motion.button>
      </div>

      {/* Modal "Comment ça marche" */}
      <AnimatePresence>
        {showWhy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowWhy(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            {/* Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl p-8"
              style={{
                maxHeight: "80vh",
                overflowY: "auto"
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowWhy(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white/60" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">
                Comment ça marche ?
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Scan facial IA",
                    desc: "Notre IA analyse les micro-expressions de ton visage pour détecter ton niveau d'activation.",
                    time: "3 sec"
                  },
                  {
                    step: "2",
                    title: "Micro-action guidée",
                    desc: "Tu reçois une action personnalisée (respiration, mouvement) adaptée à ton état.",
                    time: "20-30 sec"
                  },
                  {
                    step: "3",
                    title: "Résultat immédiat",
                    desc: "Vois ton niveau de stress avant/après et partage ton reset avec tes proches.",
                    time: "Instant"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)",
                        border: "1px solid rgba(16, 185, 129, 0.3)"
                      }}
                    >
                      <span className="text-emerald-400 font-bold">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        <span className="text-white/40 text-xs px-2 py-0.5 rounded-full bg-white/10">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div 
                className="mt-8 p-4 rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <p className="text-white/50 text-sm">
                  <span className="text-white/80 font-medium">Note :</span> Nokta One est un outil de bien-être, pas un dispositif médical. Les résultats sont des signaux indicatifs, pas des diagnostics.
                </p>
              </div>

              {/* CTA dans la modal */}
              <button
                onClick={() => {
                  setShowWhy(false);
                  handleStartScan();
                }}
                className="w-full mt-8 py-4 rounded-2xl font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                }}
              >
                C'est parti !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
