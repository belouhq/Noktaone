"use client";

import { motion } from "framer-motion";

interface StepThreeProps {
  notificationsEnabled: boolean;
  referralCode: string;
  onNotificationsToggle: (enabled: boolean) => void;
  onSubmit: () => void;
}

export default function StepThree({
  notificationsEnabled,
  referralCode,
  onNotificationsToggle,
  onSubmit,
}: StepThreeProps) {
  return (
    <div className="space-y-6">
      {/* Toggle Notifications */}
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <label className="text-nokta-one-white font-medium">
            Activer les notifications
          </label>
          <motion.button
            onClick={() => onNotificationsToggle(!notificationsEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notificationsEnabled ? "bg-nokta-one-blue" : "bg-gray-600"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              animate={{
                x: notificationsEnabled ? 24 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
        <p className="text-sm text-gray-400">
          Restez informé de vos resets et progrès
        </p>
      </div>

      {/* Referral Code */}
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
        <p className="text-sm text-gray-400 mb-2">Votre code de parrainage :</p>
        <p className="text-lg font-semibold text-nokta-one-blue">{referralCode}</p>
      </div>

      {/* Bouton Create Account */}
      <motion.button
        onClick={onSubmit}
        className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all"
        style={{ background: "#3B82F6" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Create Account
      </motion.button>
    </div>
  );
}
