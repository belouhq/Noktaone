// ============================================
// EXEMPLE D'INTÉGRATION: PAYWALL + STRIPE
// Path: components/PaywallWithStripe.tsx
// ============================================

'use client';

import React, { useState } from 'react';
import { Paywall } from '@/lib/ux-quickwins/components';
import { usePricing, usePaywall, useTrialProgress } from '@/lib/ux-quickwins/hooks';
import { useStripeCheckout, useSubscriptionStatus } from '@/lib/stripe/hooks';
import { useAuth } from '@/hooks/useAuth'; // Ton hook auth existant

export function PaywallWithStripe() {
  const { user, profile } = useAuth();
  const { createCheckout, isLoading: isCheckoutLoading } = useStripeCheckout();
  const subscriptionStatus = useSubscriptionStatus(profile);
  
  // Pricing display for current locale
  const pricing = usePricing('fr');
  
  // Trial progress calculation
  const { progress } = useTrialProgress({
    userId: user?.id || '',
    trialStartDate: profile?.trial_start_date 
      ? new Date(profile.trial_start_date) 
      : new Date(),
    trialEndDate: profile?.trial_end_date 
      ? new Date(profile.trial_end_date) 
      : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  });
  
  // Paywall visibility logic
  const { 
    isVisible, 
    trigger, 
    showPaywall, 
    hidePaywall 
  } = usePaywall({
    trialProgress: progress,
    isPremium: subscriptionStatus.isPremium,
    dailySkaneCount: profile?.daily_skane_count || 0,
  });

  // Handle subscription
  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    if (!user?.id || !user?.email) {
      console.error('User not authenticated');
      return;
    }

    const result = await createCheckout({
      plan,
      userId: user.id,
      email: user.email,
      locale: 'fr',
    });

    // If checkout creation failed, error is already set in hook
    // The redirect happens automatically in the hook if successful
  };

  // Handle continue free
  const handleContinueFree = () => {
    hidePaywall();
    // Track analytics
    // analytics.track('paywall_dismissed', { trigger });
  };

  // Don't render if user is premium
  if (subscriptionStatus.isPremium) {
    return null;
  }

  return (
    <Paywall
      isVisible={isVisible}
      onDismiss={hidePaywall}
      onSubscribe={handleSubscribe}
      onContinueFree={handleContinueFree}
      pricing={pricing}
      trialProgress={progress}
      trigger={trigger}
      userName={profile?.first_name || profile?.username || 'there'}
      isProcessing={isCheckoutLoading}
    />
  );
}

// ============================================
// EXEMPLE D'UTILISATION DANS UN LAYOUT
// ============================================

/*
// app/(app)/layout.tsx

import { PaywallWithStripe } from '@/components/PaywallWithStripe';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      {children}
      
      {/* Paywall overlay - s'affiche automatiquement quand nécessaire *}
      <PaywallWithStripe />
    </div>
  );
}
*/

// ============================================
// EXEMPLE: BOUTON UPGRADE MANUEL
// ============================================

export function UpgradeButton() {
  const { showPaywall } = usePaywall({
    trialProgress: null,
    isPremium: false,
    dailySkaneCount: 0,
  });

  return (
    <button
      onClick={() => showPaywall('manual')}
      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold"
    >
      Passer à Premium
    </button>
  );
}

// ============================================
// EXEMPLE: PAGE SUCCESS APRÈS CHECKOUT
// ============================================

/*
// app/subscription/success/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/create-checkout?session_id=${sessionId}`)
        .then(res => res.json())
        .then(setSessionData);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          🎉
        </motion.div>
        
        <h1 className="text-3xl font-bold text-white mb-3">
          Bienvenue dans Premium !
        </h1>
        
        <p className="text-gray-400 mb-8">
          Tu as maintenant accès à toutes les fonctionnalités de Nokta One.
        </p>
        
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold"
        >
          Commencer mon premier Skane Premium
        </a>
      </motion.div>
    </div>
  );
}
*/
