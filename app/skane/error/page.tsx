"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function ErrorPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-4">
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#EF4444" }}
        >
          <AlertCircle size={48} className="text-white" strokeWidth={2} />
        </div>
      </motion.div>

      {/* Error Message */}
      <h1 className="text-2xl font-semibold text-nokta-one-white mb-4 text-center">
        We have encountered a problem.
      </h1>

      <p className="text-gray-400 text-center mb-8 max-w-sm">
        Please try again.
      </p>

      {/* Restart Button */}
      <motion.button
        onClick={() => router.push("/skane")}
        className="px-8 py-4 rounded-xl text-nokta-one-white font-medium"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Restart Skane
      </motion.button>
    </main>
  );
}
