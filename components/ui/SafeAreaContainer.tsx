'use client';

import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface SafeAreaContainerProps {
  children: ReactNode;
  showNav?: boolean;
  currentPage?: 'home' | 'skane' | 'settings';
  className?: string;
}

export function SafeAreaContainer({ 
  children, 
  showNav = true, 
  currentPage,
  className = ''
}: SafeAreaContainerProps) {
  return (
    <div className={`
      min-h-[100dvh] bg-nokta-one-black
      ${showNav ? 'safe-container' : 'safe-container-no-nav'}
      ${className}
    `}>
      {children}
      {showNav && <BottomNav currentPage={currentPage} />}
    </div>
  );
}
