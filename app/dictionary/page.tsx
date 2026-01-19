"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import NoktaDictionary from "@/components/NoktaDictionary";

/**
 * PAGE DICTIONNAIRE NOKTA
 * 
 * Page dédiée au glossaire des termes Nokta.
 * Accessible via /dictionary
 */
export default function DictionaryPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black">
      {/* Header avec bouton retour */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10"
      >
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="glass-icon-button w-10 h-10 rounded-full"
            aria-label="Retour"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Nokta Dictionary</h1>
        </div>
      </motion.header>

      {/* Dictionnaire */}
      <div className="h-[calc(100vh-73px)] overflow-hidden">
        <NoktaDictionary isOpen={true} onClose={() => router.back()} variant="inline" />
      </div>
    </main>
  );
}
