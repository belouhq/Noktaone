'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';

interface SafeAreaContainerProps {
  children: ReactNode;
  showNav?: boolean;
  currentPage?: 'home' | 'skane' | 'settings';
  className?: string;
}

const PATHS: Record<string, string> = {
  home: '/',
  skane: '/skane',
  settings: '/settings',
};

export function SafeAreaContainer({
  children,
  showNav = true,
  currentPage,
  className = '',
}: SafeAreaContainerProps) {
  const router = useRouter();

  return (
    <div
      className={`
      min-h-[100dvh] bg-nokta-one-black
      ${showNav ? 'safe-container' : 'safe-container-no-nav'}
      ${className}
    `}
    >
      {children}
      {showNav && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={(key) => router.push(PATHS[key] ?? '/')}
        />
      )}
    </div>
  );
}
