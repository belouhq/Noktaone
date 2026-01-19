"use client";

import { LucideIcon, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SettingItemProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  dataSetting?: string;
}

export default function SettingItem({
  icon: Icon,
  emoji,
  label,
  onClick,
  rightElement,
  showChevron = false,
  dataSetting,
}: SettingItemProps) {
  const Component = (onClick || dataSetting) ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      data-setting={dataSetting}
      className={clsx(
        "glass-card w-full p-4 flex items-center justify-between",
        (onClick || dataSetting) && "cursor-pointer"
      )}
      style={{
        pointerEvents: 'auto',
      }}
      whileHover={(onClick || dataSetting) ? { scale: 1.01 } : {}}
      whileTap={(onClick || dataSetting) ? { scale: 0.99 } : {}}
    >
      <div className="flex items-center gap-3">
        {emoji ? (
          <span className="text-xl">{emoji}</span>
        ) : Icon ? (
          <Icon size={20} className="text-nokta-one-white" />
        ) : null}
        <span className="text-nokta-one-white" suppressHydrationWarning>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        {showChevron && <ChevronRight size={20} className="text-gray-400" />}
      </div>
    </Component>
  );
}
