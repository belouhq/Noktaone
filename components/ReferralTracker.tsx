// ============================================
// NOKTA ONE - Referral Tracker Component
// ============================================
// Fichier: components/ReferralTracker.tsx
// Composant client pour tracker automatiquement les liens de parrainage
// ============================================

"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      trackReferral(refCode);
      return;
    }

    // Si pas de ref dans l'URL, vérifier le cookie (défini par le middleware)
    const cookieRef = document.cookie
      .split('; ')
      .find(row => row.startsWith('nokta_ref='))
      ?.split('=')[1];
    
    if (cookieRef) {
      trackReferral(cookieRef);
    }
  }, [searchParams]);

  function trackReferral(refCode: string) {
    // Éviter double tracking
    const tracked = sessionStorage.getItem(`ref_tracked_${refCode}`);
    if (tracked) return;

    // Tracker le clic
    fetch('/api/affiliate/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode, action: 'click' }),
    })
      .then(() => {
        sessionStorage.setItem(`ref_tracked_${refCode}`, 'true');
        localStorage.setItem('nokta_ref', refCode);
      })
      .catch((error) => {
        console.error('Error tracking referral:', error);
      });
  }

  return null; // Composant invisible
}
