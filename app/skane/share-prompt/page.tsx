"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function SharePromptPage() {
  const router = useRouter();

  return (
    <main className="fixed inset-0 bg-nokta-one-black flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold text-nokta-one-white mb-12 text-center">
        Share your reset?
      </h1>

      <div className="flex gap-6 items-center">
        {/* NO button */}
        <motion.button
          onClick={() => router.push("/")}
          className="w-20 h-20 rounded-full flex items-center justify-center text-nokta-one-white font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          NO
        </motion.button>

        {/* Share button */}
        <motion.button
          onClick={() => router.push("/skane/share")}
          className="w-20 h-20 rounded-full flex items-center justify-center text-nokta-one-white"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Send size={32} className="text-nokta-one-blue" />
        </motion.button>
      </div>
    </main>
  );
}
