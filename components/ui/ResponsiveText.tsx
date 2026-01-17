'use client';

import { ReactNode } from 'react';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface ResponsiveTextProps {
  children: ReactNode;
  size?: TextSize;
  className?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'label';
}

const SIZE_CLASSES: Record<TextSize, string> = {
  xs: 'text-responsive-xs',
  sm: 'text-responsive-sm',
  base: 'text-responsive-base',
  lg: 'text-responsive-lg',
  xl: 'text-responsive-xl',
  '2xl': 'text-responsive-2xl',
  '3xl': 'text-responsive-3xl',
  '4xl': 'text-responsive-4xl',
};

export function ResponsiveText({ 
  children, 
  size = 'base', 
  className = '',
  as: Component = 'p'
}: ResponsiveTextProps) {
  return (
    <Component className={`${SIZE_CLASSES[size]} ${className}`}>
      {children}
    </Component>
  );
}
