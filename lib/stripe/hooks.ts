'use client';

import { useState, useCallback } from 'react';

interface CheckoutOptions {
  plan: 'monthly' | 'annual';
  userId: string;
  email: string;
  locale?: string;
  currency?: string;
}

interface CheckoutResult {
  url: string | null;
  sessionId: string | null;
}

interface UseStripeCheckoutReturn {
  createCheckout: (options: CheckoutOptions) => Promise<CheckoutResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to create Stripe Checkout sessions
 *
 * Note: this calls your existing API route `POST /api/stripe/create-checkout`.
 */
export function useStripeCheckout(): UseStripeCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = useCallback(async (options: CheckoutOptions): Promise<CheckoutResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }

      return {
        url: data.url ?? null,
        sessionId: data.sessionId ?? null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { url: null, sessionId: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createCheckout, isLoading, error };
}

interface UseStripePortalReturn {
  openPortal: (userId: string, returnUrl?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to open Stripe Customer Portal
 *
 * Note: this calls your existing API route `POST /api/stripe/portal`.
 */
export function useStripePortal(): UseStripePortalReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = useCallback(async (userId: string, returnUrl?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, returnUrl }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { openPortal, isLoading, error };
}

interface SubscriptionStatus {
  isPremium: boolean;
  status: string | null;
  plan: 'monthly' | 'annual' | null;
  currentPeriodEnd: Date | null;
  daysRemaining: number | null;
}

/**
 * Utility hook to derive subscription status from a `profiles` row.
 * (No network calls.)
 */
export function useSubscriptionStatus(profile: {
  is_premium?: boolean;
  subscription_status?: string | null;
  subscription_plan?: string | null;
  subscription_current_period_end?: string | null;
} | null): SubscriptionStatus {
  if (!profile) {
    return {
      isPremium: false,
      status: null,
      plan: null,
      currentPeriodEnd: null,
      daysRemaining: null,
    };
  }

  const currentPeriodEnd = profile.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end)
    : null;

  const daysRemaining = currentPeriodEnd
    ? Math.max(0, Math.ceil((currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    isPremium: Boolean(profile.is_premium),
    status: profile.subscription_status ?? null,
    plan: (profile.subscription_plan as 'monthly' | 'annual' | null) ?? null,
    currentPeriodEnd,
    daysRemaining,
  };
}

