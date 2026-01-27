'use client';

import { LucideIcon, ChevronRight } from 'lucide-react';

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  hasArrow?: boolean;
  highlight?: boolean;
  subtle?: boolean;
  onClick?: () => void;
}

export function SettingsRow({ 
  icon: Icon, 
  label, 
  value, 
  hasArrow, 
  highlight,
  subtle,
  onClick
}: SettingsRowProps) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center justify-between p-4 rounded-2xl transition-colors
        ${highlight ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5'}
        ${subtle ? 'bg-white/[0.02]' : ''}
        hover:bg-white/10
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={highlight ? 'text-blue-400' : 'text-white/60'} />
        <span className={subtle ? 'text-white/60 text-sm' : ''}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-white/50">{value}</span>}
        {hasArrow && <ChevronRight size={18} className="text-white/50" />}
      </div>
    </button>
  );
}
