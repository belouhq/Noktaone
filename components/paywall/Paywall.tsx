// ============================================
// NOKTA PAYWALL COMPONENT
// Version: 1.0.0
// Design: Premium "Liquid Glass" aesthetic
// ============================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { formatPrice } from '@/lib/utils/formatPrice';
import { PAYWALL_CONFIG } from '@/lib/paywall/constants';
import { useTranslation } from '@/lib/hooks/useTranslation';
import type { 
  PricingDisplay, 
  TrialProgress, 
  PaywallTrigger,
  SupportedCurrency,
} from '@/lib/paywall/types';

// ===================
// TYPES
// ===================

interface PaywallProps {
  isVisible: boolean;
  onDismiss: () => void;
  onSubscribe: (plan: 'monthly' | 'annual') => void;
  pricing: PricingDisplay;
  trialProgress: TrialProgress | null;
  trigger: PaywallTrigger | null;
  userName?: string;
  userCount?: number;
  rating?: { score: number; count: number };
  testimonials?: Array<{
    name: string;
    text: string;
    result: string;
    avatar?: string;
  }>;
  isProcessing?: boolean;
}

// ===================
// SUB-COMPONENTS
// ===================

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const { t } = useTranslation();
  const { timeRemaining, isExpired } = useCountdown(targetDate);
  
  if (isExpired) return null;
  
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 
                    text-white text-center py-3 px-4 shadow-lg shadow-cyan-500/20">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium text-sm">{t("paywall.countdown.expires")}</span>
        <span className="font-mono font-bold text-lg tracking-wider bg-white/20 px-2 py-0.5 rounded">
          {timeRemaining}
        </span>
      </div>
    </div>
  );
};

const SocialProof: React.FC<{
  userCount: number;
  rating: { score: number; count: number };
}> = ({ userCount, rating }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                         border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] text-white font-bold"
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <span className="ml-1">{t("paywall.socialProof.users", { count: userCount })}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg 
              key={star}
              className={`w-4 h-4 ${star <= Math.floor(rating.score) ? 'text-yellow-400' : 'text-gray-600'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span>{t("paywall.socialProof.rating", { score: rating.score, count: rating.count })}</span>
      </div>
    </div>
  );
};

const BeforeAfterVisualization: React.FC<{ progress: TrialProgress }> = ({ progress }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center gap-4 p-5 
                    bg-gradient-to-br from-white/5 to-white/[0.02] 
                    rounded-2xl border border-white/10 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-3xl font-bold text-red-400 drop-shadow-lg">
          {Math.round(progress.averageScoreBefore)}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
          {t("paywall.beforeAfter.before")}
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="text-xs text-cyan-400 font-semibold">
          {progress.averageImprovement > 0 ? '+' : ''}{Math.round(progress.averageImprovement)}%
        </span>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-green-400 drop-shadow-lg">
          {Math.round(progress.averageScoreAfter)}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
          {t("paywall.beforeAfter.after")}
        </div>
      </div>
    </div>
  );
};

const PricingCard: React.FC<{
  plan: 'monthly' | 'annual';
  isSelected: boolean;
  onSelect: () => void;
  price: number;
  originalPrice?: number;
  perPeriod: string;
  badge?: string;
  savings?: string;
  currency: SupportedCurrency;
  influencerDiscount?: { code: string; influencerName: string; percent: number } | null;
}> = ({ 
  plan, isSelected, onSelect, price, originalPrice, perPeriod, badge, savings, currency, influencerDiscount,
}) => {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
        ${isSelected 
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 scale-[1.02]' 
          : 'border-gray-700/50 bg-white/[0.02] hover:border-gray-600 hover:bg-white/[0.04]'
        }`}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 animate-pulse" />
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-600'}`}>
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
          </div>
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {plan === 'annual' ? t("paywall.pricing.annual") : t("paywall.pricing.monthly")}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-cyan-400 to-blue-500 
                               text-black rounded-full uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </div>
            
            {plan === 'annual' && (
              <div className="text-xs text-gray-400">
                {formatPrice(price / 12, currency)}{t("paywall.pricing.perMonth")}
              </div>
            )}
            
            {influencerDiscount && plan === 'monthly' && (
              <div className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t("paywall.pricing.influencerDiscount", { 
                  percent: influencerDiscount.percent, 
                  code: influencerDiscount.code 
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {originalPrice && originalPrice !== price && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice, currency)}{perPeriod}
            </div>
          )}
          <div className="font-bold text-white text-lg">
            {formatPrice(price, currency)}{perPeriod}
          </div>
          {savings && <div className="text-xs text-cyan-400 font-medium">{savings}</div>}
        </div>
      </div>
    </button>
  );
};

const TrustBadges: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>{t("paywall.trust.securePayment")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{t("paywall.trust.cancelAnytime")}</span>
      </div>
    </div>
  );
};

const MoneyBackGuarantee: React.FC<{ days: number }> = ({ days }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span>{t("paywall.trust.moneyBack", { days })}</span>
    </div>
  );
};

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center gap-4 opacity-60">
      <span className="text-xs text-gray-500">{t("paywall.payment.applePay")}</span>
      <span className="text-xs text-gray-500">{t("paywall.payment.googlePay")}</span>
      <span className="text-xs text-gray-500 font-bold italic">VISA</span>
      <div className="flex">
        <div className="w-4 h-4 rounded-full bg-red-500 opacity-80" />
        <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80 -ml-1.5" />
      </div>
    </div>
  );
};

const FAQSection: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  questions: Array<{ question: string; answer: string }>;
}> = ({ isOpen, onToggle, questions }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-6">
      <button
        onClick={onToggle}
        className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors 
                   flex items-center justify-center gap-2"
      >
        <span>{t("paywall.faq.title")}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-3">
          {questions.map((faq, index) => (
            <div key={index} className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <h4 className="font-medium text-white text-sm">{faq.question}</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Testimonials: React.FC<{
  testimonials: Array<{ name: string; text: string; result: string; avatar?: string }>;
}> = ({ testimonials }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-6 space-y-3">
      <h4 className="text-sm font-medium text-gray-400 text-center">{t("paywall.testimonials.title")}</h4>
      {testimonials.slice(0, 2).map((testimonial, index) => (
        <div key={index} className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                          flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {testimonial.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{testimonial.name}</span>
                <span className="text-xs text-cyan-400 font-medium px-2 py-0.5 bg-cyan-400/10 rounded-full">
                  {testimonial.result}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">"{testimonial.text}"</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===================
// MAIN COMPONENT
// ===================

export const Paywall: React.FC<PaywallProps> = ({
  isVisible,
  onDismiss,
  onSubscribe,
  pricing,
  trialProgress,
  trigger,
  userName = '',
  userCount = PAYWALL_CONFIG.TRUST_ELEMENTS.USER_COUNT,
  rating = { 
    score: PAYWALL_CONFIG.TRUST_ELEMENTS.RATING_SCORE, 
    count: PAYWALL_CONFIG.TRUST_ELEMENTS.RATING_COUNT 
  },
  testimonials = PAYWALL_CONFIG.DEFAULT_TESTIMONIALS,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [showFAQ, setShowFAQ] = useState(false);
  
  const countdownTarget = useMemo(() => {
    const target = new Date();
    target.setHours(23, 59, 59, 999);
    return target;
  }, []);
  
  useEffect(() => {
    if (isVisible) setShowFAQ(false);
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  const getHeadline = () => {
    if (!trialProgress) return t("paywall.headline.default");
    if (trigger === 'trial_expired') return t("paywall.headline.trialExpired", { name: userName || '' });
    if (trigger === 'daily_limit_reached') return t("paywall.headline.dailyLimit");
    return t("paywall.headline.trialProgress", { 
      name: userName || '', 
      count: trialProgress.totalSkanes, 
      days: trialProgress.trialDay 
    });
  };
  
  const getSubheadline = () => {
    if (trigger === 'trial_expired') return t("paywall.subheadline.trialExpired");
    if (trialProgress && trialProgress.averageImprovement > 0) {
      return t("paywall.subheadline.improvement", { 
        percent: Math.round(trialProgress.averageImprovement) 
      });
    }
    return t("paywall.subheadline.default");
  };

  const canDismiss = trigger !== 'trial_expired';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
         onClick={canDismiss ? onDismiss : undefined}>
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto 
                     bg-gradient-to-b from-[#0f0f14] to-[#0a0a0f] 
                     rounded-3xl shadow-2xl shadow-cyan-500/10 border border-white/10"
           onClick={(e) => e.stopPropagation()}>
        
        {canDismiss && (
          <button onClick={onDismiss}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white 
                       transition-colors z-20 rounded-full hover:bg-white/10"
            aria-label={t("common.close")}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <CountdownTimer targetDate={countdownTarget} />

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white leading-tight">{getHeadline()}</h2>
            <p className="text-gray-400 text-sm">{getSubheadline()}</p>
          </div>

          {trialProgress && trialProgress.averageImprovement > 0 && (
            <BeforeAfterVisualization progress={trialProgress} />
          )}

          <SocialProof userCount={userCount} rating={rating} />

          <div className="space-y-3">
            <PricingCard
              plan="annual" isSelected={selectedPlan === 'annual'}
              onSelect={() => setSelectedPlan('annual')}
              price={pricing.annual.discounted || pricing.annual.original}
              originalPrice={pricing.annual.discounted ? pricing.annual.original : undefined}
              perPeriod={t("paywall.pricing.perYear")} 
              badge={t("paywall.pricing.bestValue")}
              savings={t("paywall.pricing.savings", { percent: pricing.annual.savingsPercent })}
              currency={pricing.currency}
            />
            <PricingCard
              plan="monthly" isSelected={selectedPlan === 'monthly'}
              onSelect={() => setSelectedPlan('monthly')}
              price={pricing.monthly.discounted || pricing.monthly.original}
              originalPrice={pricing.monthly.discounted ? pricing.monthly.original : undefined}
              perPeriod={t("paywall.pricing.perMonth")} 
              currency={pricing.currency}
              influencerDiscount={pricing.influencerDiscount}
            />
          </div>

          {pricing.influencerDiscount && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {t("paywall.influencer.applied", { 
                    code: pricing.influencerDiscount.code,
                    name: pricing.influencerDiscount.influencerName
                  })}
                </span>
              </div>
              <div className="text-xs text-green-400/70 mt-1 ml-7">
                {t("paywall.influencer.validMonths", { months: pricing.influencerDiscount.validMonths })}
              </div>
            </div>
          )}

          <button
            onClick={() => onSubscribe(selectedPlan)}
            disabled={isProcessing}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 
                       hover:from-cyan-400 hover:to-blue-400
                       disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                       text-white font-bold text-lg rounded-xl transition-all duration-200 
                       transform hover:scale-[1.02] active:scale-[0.98]
                       shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
                       relative overflow-hidden group">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                          bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t("paywall.button.processing")}</span>
                </>
              ) : t("paywall.button.continue")}
            </span>
          </button>

          <TrustBadges />
          <MoneyBackGuarantee days={PAYWALL_CONFIG.TRUST_ELEMENTS.MONEY_BACK_GUARANTEE_DAYS} />
          <PaymentMethods />
          <FAQSection 
            isOpen={showFAQ} 
            onToggle={() => setShowFAQ(!showFAQ)} 
            questions={PAYWALL_CONFIG.FAQ_QUESTIONS.map(q => ({
              question: q.question,
              answer: q.answer,
            }))} 
          />
          {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}

          <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-2">
            <a href="/legal/terms" className="hover:text-gray-400 transition-colors">{t("paywall.footer.terms")}</a>
            <span>•</span>
            <a href="/legal/privacy" className="hover:text-gray-400 transition-colors">{t("paywall.footer.privacy")}</a>
            <span>•</span>
            <a href="mailto:support@nokta.app" className="hover:text-gray-400 transition-colors">{t("paywall.footer.support")}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
