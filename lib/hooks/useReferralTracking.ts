// ============================================
// NOKTA ONE - Referral Tracking Hook
// ============================================
// Fichier: lib/hooks/useReferralTracking.ts
// Hook pour tracker automatiquement les clics sur les liens de parrainage
// ============================================

"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferralTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (!refCode) {
      // Vérifier aussi le cookie (défini par le middleware)
      const cookieRef = document.cookie
        .split('; ')
        .find(row => row.startsWith('nokta_ref='))
        ?.split('=')[1];
      
      if (!cookieRef) return;
      
      // Utiliser le ref du cookie
      trackReferral(cookieRef);
      return;
    }

    // Tracker le ref de l'URL
    trackReferral(refCode);
  }, [searchParams]);

  function trackReferral(refCode: string) {
    // Vérifier si déjà tracké cette session
    const tracked = sessionStorage.getItem(`ref_tracked_${refCode}`);
    if (tracked) return;

    // Tracker le clic
    fetch('/api/affiliate/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode, action: 'click' }),
    }).catch(console.error);

    // Marquer comme tracké
    sessionStorage.setItem(`ref_tracked_${refCode}`, 'true');

    // Stocker dans localStorage pour l'attribution lors du signup
    localStorage.setItem('nokta_ref', refCode);
  }
}
