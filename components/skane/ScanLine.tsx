"use client";

import { motion } from "framer-motion";

export default function ScanLine() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 10 }}>
      <motion.div
        className="absolute left-0 right-0"
        style={{
          height: "4px",
          background: "#3B82F6",
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)",
        }}
        initial={{ top: "-4px" }}
        animate={{ top: "100%" }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </div>
  );
}
