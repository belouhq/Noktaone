"use client";

import { Edit, User } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileCardProps {
  username: string;
  email: string;
  avatar?: string;
  onAvatarClick: () => void;
  onEditClick?: () => void;
}

export default function ProfileCard({
  username,
  email,
  avatar,
  onAvatarClick,
  onEditClick,
}: ProfileCardProps) {
  return (
    <div className="glass-card relative p-4">
      {/* Bouton Edit */}
      <motion.button
        data-profile="edit"
        onClick={onEditClick}
        className="glass-icon-button absolute top-4 right-4 w-8 h-8"
        style={{ pointerEvents: 'auto' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Edit size={16} className="text-white" />
      </motion.button>

      <div className="flex items-center gap-4">
        {/* Photo de profil */}
        <motion.button
          onClick={onAvatarClick}
          className="glass-icon-button w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {avatar ? (
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-nokta-one-white" />
          )}
        </motion.button>

        {/* Info utilisateur */}
        <div className="flex-1">
          <p className="text-lg font-semibold text-nokta-one-white">@{username}</p>
          <p className="text-sm text-gray-400">{email}</p>
        </div>
      </div>
    </div>
  );
}
