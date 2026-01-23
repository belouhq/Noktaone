/**
 * Conversion System React Hooks
 * 
 * Custom hooks for managing paywall, pricing, and trial state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { 
  PricingDisplay, 
  TrialProgress, 
  PaywallTrigger,
  SupportedLocale,
  SubscriptionPlan,
} from '../types';
import { PAYWALL_CONFIG } from '@/lib/paywall/constants';
import { LOCALE_PRICING } from '@/lib/notifications/constants';
import { formatPrice } from '@/lib/utils/formatPrice';
import { 
  calculateConversionProbability, 
  getRecommendedTrigger,
  shouldShowPaywall,
} from '../utils';

// ===================
// usePricing Hook
// ===================

interface UsePricingReturn {
  pricing: PricingDisplay;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get pricing for a specific locale
 */
export function usePricing(locale: SupportedLocale = 'fr'): UsePricingReturn {
  const [pricing, setPricing] = useState<PricingDisplay>(PAYWALL_CONFIG.DEFAULT_PRICING);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const localePricing = LOCALE_PRICING[locale] || LOCALE_PRICING.fr;
      
      const pricingData: PricingDisplay = {
        monthly: {
          original: localePricing.monthly,
          discounted: undefined,
        },
        annual: {
          original: localePricing.annual,
          discounted: localePricing.annual * 0.8, // 20% discount
          savingsPercent: 20,
        },
        currency: localePricing.currency,
        influencerDiscount: null,
      };

      setPricing(pricingData);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load pricing'));
      setIsLoading(false);
    }
  }, [locale]);

  return { pricing, isLoading, error };
}

// ===================
// useTrial Hook
// ===================

interface UseTrialParams {
  userId: string | null;
  subscriptionStatus: string | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
}

interface UseTrialReturn {
  trialProgress: TrialProgress | null;
  isLoading: boolean;
  error: Error | null;
  daysRemaining: number;
  isExpired: boolean;
}

/**
 * Hook to get trial progress and status
 */
export function useTrial(params: UseTrialParams): UseTrialReturn {
  const { userId, subscriptionStatus, trialStartDate, trialEndDate } = params;
  const [trialProgress, setTrialProgress] = useState<TrialProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !trialStartDate || !trialEndDate) {
      setIsLoading(false);
      return;
    }

    const fetchTrialProgress = async () => {
      try {
        // TODO: Fetch actual trial progress from API
        // For now, return mock data
        const now = new Date();
        const trialDay = Math.ceil(
          (now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const progress: TrialProgress = {
          totalSkanes: 0, // TODO: Fetch from API
          trialDay,
          averageScoreBefore: 50,
          averageScoreAfter: 45,
          averageImprovement: 10,
        };

        setTrialProgress(progress);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load trial progress'));
        setIsLoading(false);
      }
    };

    fetchTrialProgress();
  }, [userId, trialStartDate, trialEndDate]);

  const daysRemaining = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isExpired = daysRemaining === 0 && trialEndDate && new Date() > trialEndDate;

  return { trialProgress, isLoading, error, daysRemaining, isExpired };
}

// ===================
// usePaywall Hook
// ===================

interface UsePaywallParams {
  userId: string | null;
  locale: SupportedLocale;
  subscriptionStatus?: string | null;
  trialEndDate?: Date | null;
  autoShow?: boolean; // Auto-show paywall when conditions are met
}

interface UsePaywallReturn {
  isVisible: boolean;
  show: (trigger?: PaywallTrigger) => void;
  hide: () => void;
  onSubscribe: (plan: SubscriptionPlan) => Promise<void>;
  trigger: PaywallTrigger | null;
  pricing: PricingDisplay;
  trialProgress: TrialProgress | null;
}

/**
 * Main hook for managing paywall state and subscription flow
 */
export function usePaywall(params: UsePaywallParams): UsePaywallReturn {
  const { userId, locale, subscriptionStatus, trialEndDate, autoShow = false } = params;
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);
  const [trigger, setTrigger] = useState<PaywallTrigger | null>(null);
  
  const { pricing } = usePricing(locale);
  const { trialProgress } = useTrial({
    userId,
    subscriptionStatus: subscriptionStatus || null,
    trialStartDate: trialEndDate ? new Date(trialEndDate.getTime() - 10 * 24 * 60 * 60 * 1000) : null,
    trialEndDate: trialEndDate || null,
  });

  // Auto-show paywall if conditions are met
  useEffect(() => {
    if (autoShow && shouldShowPaywall(subscriptionStatus || 'free', trialEndDate || null)) {
      const recommendedTrigger = getRecommendedTrigger(trialProgress, trialProgress?.trialDay || 0);
      if (recommendedTrigger) {
        setTrigger(recommendedTrigger);
        setIsVisible(true);
      }
    }
  }, [autoShow, subscriptionStatus, trialEndDate, trialProgress]);

  const show = useCallback((customTrigger?: PaywallTrigger) => {
    if (customTrigger) {
      setTrigger(customTrigger);
    } else if (trialProgress) {
      const recommendedTrigger = getRecommendedTrigger(trialProgress, trialProgress.trialDay);
      setTrigger(recommendedTrigger);
    }
    setIsVisible(true);
  }, [trialProgress]);

  const hide = useCallback(() => {
    setIsVisible(false);
    setTrigger(null);
  }, []);

  const onSubscribe = useCallback(async (plan: SubscriptionPlan) => {
    if (!userId) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // TODO: Show error toast
    }
  }, [userId, locale, router]);

  return {
    isVisible,
    show,
    hide,
    onSubscribe,
    trigger,
    pricing,
    trialProgress,
  };
}

// ===================
// useSkaneLimit Hook
// ===================

interface UseSkaneLimitParams {
  subscriptionStatus: string | null;
  userId?: string | null;
}

interface UseSkaneLimitReturn {
  canPerformSkane: boolean;
  remaining: number;
  isLimited: boolean;
  dailyLimit: number;
}

/**
 * Hook to check skane limits based on subscription status
 */
export function useSkaneLimit(
  subscriptionStatus: string | null = 'free',
  userId?: string | null
): UseSkaneLimitReturn {
  const [remaining, setRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || subscriptionStatus === 'active' || subscriptionStatus === 'premium') {
      // Premium users have unlimited skanes
      setRemaining(Infinity);
      setIsLoading(false);
      return;
    }

    // Free/trial users: check daily limit
    const checkDailyLimit = async () => {
      try {
        // TODO: Fetch actual daily count from API
        // For now, use localStorage as fallback
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(`nokta_skane_count_${today}`);
        const count = stored ? parseInt(stored, 10) : 0;
        
        const DAILY_LIMIT_FREE = 3;
        const remainingCount = Math.max(0, DAILY_LIMIT_FREE - count);
        
        setRemaining(remainingCount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking skane limit:', error);
        setRemaining(0);
        setIsLoading(false);
      }
    };

    checkDailyLimit();
  }, [userId, subscriptionStatus]);

  const isPremium = subscriptionStatus === 'active' || subscriptionStatus === 'premium';
  const canPerformSkane = isPremium || remaining > 0;
  const isLimited = !isPremium && remaining < 3;

  return {
    canPerformSkane,
    remaining: isPremium ? Infinity : remaining,
    isLimited,
    dailyLimit: isPremium ? Infinity : 3,
  };
}
