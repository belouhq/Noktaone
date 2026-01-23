// ============================================
// NOKTA CONVERSION SYSTEM - MAIN INDEX
// Version: 1.0.0
// ============================================

/**
 * NOKTA CONVERSION SYSTEM
 * 
 * Système complet de conversion trial-to-paid pour Nokta One
 * Inspiré des best practices de WHOOP, Cal AI, et des études sur le neuromarketing.
 * 
 * ## Architecture
 * 
 * nokta-conversion-system/
 * ├── types/index.ts          - Types TypeScript complets
 * ├── constants/index.ts      - Pricing, trial config, templates
 * ├── utils/index.ts          - Fonctions utilitaires
 * ├── hooks/index.ts          - React hooks (usePaywall, useTrial, etc.)
 * ├── components/Paywall.tsx  - Composant paywall premium
 * ├── services/stripe.ts      - Service Stripe
 * ├── services/notifications.ts - Service OneSignal
 * ├── api/stripe-routes.ts    - API routes Next.js
 * └── styles/paywall.css      - Styles Tailwind
 * 
 * ## Quick Start
 * 
 * ```tsx
 * import { Paywall, usePaywall, usePricing, useTrial } from '@/lib/conversion';
 * 
 * function App() {
 *   const { pricing } = usePricing('fr');
 *   const { trialProgress } = useTrial({ userId, subscriptionStatus, trialStartDate });
 *   const { isVisible, show, hide, onSubscribe } = usePaywall({ userId, locale: 'fr' });
 *   
 *   return (
 *     <Paywall
 *       isVisible={isVisible}
 *       onDismiss={hide}
 *       onSubscribe={onSubscribe}
 *       pricing={pricing}
 *       trialProgress={trialProgress}
 *       trigger="trial_day_10"
 *       userName="Benjamin"
 *     />
 *   );
 * }
 * ```
 */

// ===================
// RE-EXPORTS
// ===================

// Types
export * from './types';

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Hooks
export * from './hooks';

// Components
export { Paywall, default as PaywallComponent } from '@/components/paywall/Paywall';

// Services (server-side only)
// Note: Import these directly in API routes
// export * from './services/stripe';
// export * from './services/notifications';
