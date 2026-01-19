'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, ScanFace, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  currentPage?: 'home' | 'skane' | 'settings';
}

const NAV_ITEMS = [
  { id: 'home', icon: Home, path: '/' },
  { id: 'skane', icon: ScanFace, path: '/skane' },
  { id: 'settings', icon: Settings, path: '/settings' },
] as const;

export function BottomNav({ currentPage }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveItem = () => {
    if (currentPage) return currentPage;
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/skane')) return 'skane';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'home';
  };

  const activeItem = getActiveItem();
  
  // Masquer l'icône Skane uniquement sur la page d'accueil et la page skane
  const shouldHideSkaneIcon = pathname === '/' || pathname.startsWith('/skane');
  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.id === 'skane' && shouldHideSkaneIcon) {
      return false;
    }
    return true;
  });

  return (
    <nav className="bottom-nav-container">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {visibleItems.map(({ id, icon: Icon, path }) => {
          const isActive = activeItem === id;
          
          return (
            <motion.button
              key={id}
              data-nav-button={id}
              data-nav-path={path}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(path);
              }}
              className="flex items-center justify-center p-4 transition-colors cursor-pointer relative z-10"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon 
                size={28}
                className={`transition-colors ${
                  isActive 
                    ? 'text-nokta-one-blue' 
                    : 'text-nokta-one-white'
                }`}
                style={isActive ? { color: '#3B82F6' } : undefined}
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
