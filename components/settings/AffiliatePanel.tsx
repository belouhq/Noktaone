// ============================================
// NOKTA ONE - Affiliate Panel Component v2
// ============================================
// Fichier: components/settings/AffiliatePanel.tsx
// Basé sur le pricing réel Nokta PWA
// ============================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  Check, 
  Users, 
  Share2,
  ChevronRight,
  Gift,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";

// ============================================
// CONSTANTS - PRICING NOKTA
// ============================================

const PRICING = {
  // Commission influenceur
  COMMISSION_PER_MONTH: 7, // $7/mois/abonné
  COMMISSION_CAP_MONTHS: 12, // Cap à 12 mois
  MAX_PER_USER: 84, // Maximum $84/utilisateur
  
  // Prix utilisateur (avec réduction influenceur)
  TIERS: {
    nano: { discount: 30, userPrice: 13.29, label: 'Nano' },
    micro: { discount: 25, userPrice: 14.24, label: 'Micro' },
    mid: { discount: 20, userPrice: 15.19, label: 'Mid' },
  },
  
  // Prix standard
  MONTHLY_PRICE: 18.99,
} as const;

// ============================================
// TYPES
// ============================================

interface AffiliateStats {
  referralCode: string;
  referralLink: string;
  // Gains
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  monthlyEarnings: number;
  // Stats
  totalClicks: number;
  totalSignups: number;
  activeSubscribers: number; // Abonnés actifs (qui génèrent encore des commissions)
  // Tier influenceur
  influencerTier: 'nano' | 'micro' | 'mid' | null;
  // Potentiel
  projectedMonthly: number; // Estimation gains mensuels récurrents
}

interface AffiliatePanelProps {
  userId: string;
  locale?: string;
}

// ============================================
// TRANSLATIONS
// ============================================

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Programme Ambassadeur",
    subtitle: "Gagne 7$/mois par abonné",
    yourLink: "Ton lien",
    copied: "Copié !",
    copyLink: "Copier",
    shareLink: "Partager",
    // Stats
    totalEarnings: "Gains totaux",
    thisMonth: "Ce mois",
    pending: "En attente",
    recurring: "Récurrent",
    // Metrics
    clicks: "Clics",
    signups: "Inscrits",
    subscribers: "Abonnés actifs",
    // Commission
    perSubscriber: "par abonné/mois",
    cappedAt: "Plafonné à 12 mois",
    maxPerUser: "max/utilisateur",
    // Discount
    yourDiscount: "Réduction pour tes abonnés",
    insteadOf: "au lieu de",
    // Empty
    noEarningsYet: "Pas encore de gains",
    startSharing: "Partage ton lien pour commencer !",
    // How it works
    howItWorks: "Comment ça marche",
    step1Title: "Partage ton lien",
    step1Desc: "Tes abonnés obtiennent une réduction",
    step2Title: "Ils s'abonnent",
    step2Desc: "Via ta réduction exclusive",
    step3Title: "Tu gagnes 7$/mois",
    step3Desc: "Pendant 12 mois par abonné",
    // Projection
    monthlyRecurring: "Revenus récurrents",
    ifYouGet: "Si tu convertis",
    subscribers_plural: "abonnés",
    youEarn: "tu gagnes",
    perMonth: "/mois",
  },
  en: {
    title: "Ambassador Program",
    subtitle: "Earn $7/month per subscriber",
    yourLink: "Your link",
    copied: "Copied!",
    copyLink: "Copy",
    shareLink: "Share",
    totalEarnings: "Total earnings",
    thisMonth: "This month",
    pending: "Pending",
    recurring: "Recurring",
    clicks: "Clicks",
    signups: "Signups",
    subscribers: "Active subs",
    perSubscriber: "per subscriber/month",
    cappedAt: "Capped at 12 months",
    maxPerUser: "max/user",
    yourDiscount: "Discount for your subscribers",
    insteadOf: "instead of",
    noEarningsYet: "No earnings yet",
    startSharing: "Share your link to get started!",
    howItWorks: "How it works",
    step1Title: "Share your link",
    step1Desc: "Your subscribers get a discount",
    step2Title: "They subscribe",
    step2Desc: "Using your exclusive discount",
    step3Title: "You earn $7/month",
    step3Desc: "For 12 months per subscriber",
    monthlyRecurring: "Recurring revenue",
    ifYouGet: "If you convert",
    subscribers_plural: "subscribers",
    youEarn: "you earn",
    perMonth: "/month",
  },
};

// ============================================
// HELPERS
// ============================================

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace('.00', '')}`;
}

function getTierBadge(tier: string | null): { emoji: string; color: string } {
  switch (tier) {
    case 'nano': return { emoji: '🚀', color: 'from-green-400 to-emerald-600' };
    case 'micro': return { emoji: '⚡', color: 'from-blue-400 to-indigo-600' };
    case 'mid': return { emoji: '🔥', color: 'from-orange-400 to-red-600' };
    default: return { emoji: '⭐', color: 'from-gray-400 to-gray-600' };
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AffiliatePanel({ userId, locale = 'fr' }: AffiliatePanelProps) {
  const t = translations[locale] || translations.en;
  
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    loadAffiliateStats();
  }, [userId]);

  const loadAffiliateStats = async () => {
    try {
      setLoading(true);
      
      // D'abord vérifier si l'utilisateur est un influenceur
      const checkResponse = await fetch(`/api/affiliate/check-influencer?userId=${userId}`);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        setIsInfluencer(checkData.isInfluencer);
        
        if (!checkData.isInfluencer) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      } else {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Si influenceur, charger les stats
      const response = await fetch(`/api/affiliate/stats?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        setAccessDenied(true);
      } else {
        // Données par défaut
        const code = `NOKTA${userId.slice(0, 4).toUpperCase()}`;
        setStats({
          referralCode: code,
          referralLink: `https://noktaone.com/?ref=${code}`,
          totalEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
          monthlyEarnings: 0,
          totalClicks: 0,
          totalSignups: 0,
          activeSubscribers: 0,
          influencerTier: 'nano', // Par défaut nano (30% discount)
          projectedMonthly: 0,
        });
      }
    } catch (error) {
      console.error('Error loading affiliate stats:', error);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleShare = async () => {
    if (!stats) return;
    const shareText = locale === 'fr'
      ? `🧘 Reset ton système nerveux en 30 secondes avec Nokta. Utilise mon lien pour -30% pendant 3 mois !`
      : `🧘 Reset your nervous system in 30 seconds with Nokta. Use my link for 30% off for 3 months!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nokta One',
          text: shareText,
          url: stats.referralLink,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
        <div className="h-5 bg-white/10 rounded w-1/2 mb-3"></div>
        <div className="h-12 bg-white/10 rounded mb-4"></div>
        <div className="h-20 bg-white/10 rounded"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
      >
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-white font-medium mb-1">
            {locale === 'fr' 
              ? 'Accès réservé aux influenceurs' 
              : 'Access restricted to influencers'}
          </p>
          <p className="text-sm text-gray-400">
            {locale === 'fr'
              ? 'Ce panneau est uniquement accessible aux comptes d\'influenceurs avec un code FirstPromoter valide.'
              : 'This panel is only accessible to influencer accounts with a valid FirstPromoter code.'}
          </p>
        </div>
      </motion.div>
    );
  }

  if (!stats) return null;

  const tierInfo = stats.influencerTier ? PRICING.TIERS[stats.influencerTier] : PRICING.TIERS.nano;
  const tierBadge = getTierBadge(stats.influencerTier);

  return (
    <div className="space-y-3">
      
      {/* ===== CARD PRINCIPALE ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/20 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">{t.title}</h3>
            </div>
            <p className="text-sm text-purple-300">{t.subtitle}</p>
          </div>
          
          {/* Tier Badge */}
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${tierBadge.color} text-white text-xs font-medium`}>
            {tierBadge.emoji} {tierInfo.label}
          </div>
        </div>

        {/* Lien de parrainage */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1.5">{t.yourLink}</p>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 overflow-hidden">
              <span className="text-sm text-white/90 font-mono truncate block">
                {stats.referralLink.replace('https://', '')}
              </span>
            </div>
            <motion.button
              onClick={handleCopy}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2.5 rounded-xl bg-purple-500 text-white font-medium text-sm hover:bg-purple-600 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Discount info */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-gray-400 mb-1">{t.yourDiscount}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-green-400">-{tierInfo.discount}%</span>
            <span className="text-sm text-white">{formatCurrency(tierInfo.userPrice)}</span>
            <span className="text-xs text-gray-500">{t.insteadOf} {formatCurrency(PRICING.MONTHLY_PRICE)}</span>
          </div>
        </div>
      </motion.div>

      {/* ===== GAINS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl bg-white/5 border border-white/10"
      >
        {/* Total Earnings - Hero number */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 mb-1">{t.totalEarnings}</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(stats.totalEarnings)}
          </p>
        </div>

        {/* Grid stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-white/5 text-center">
            <p className="text-lg font-semibold text-green-400">{formatCurrency(stats.monthlyEarnings)}</p>
            <p className="text-[10px] text-gray-400">{t.thisMonth}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-center">
            <p className="text-lg font-semibold text-yellow-400">{formatCurrency(stats.pendingEarnings)}</p>
            <p className="text-[10px] text-gray-400">{t.pending}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-center">
            <p className="text-lg font-semibold text-blue-400">{formatCurrency(stats.projectedMonthly)}</p>
            <p className="text-[10px] text-gray-400">{t.recurring}</p>
          </div>
        </div>

        {/* Métriques */}
        <div className="flex justify-between px-2">
          <div className="text-center">
            <p className="text-base font-semibold text-white">{stats.totalClicks}</p>
            <p className="text-[10px] text-gray-500">{t.clicks}</p>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white">{stats.totalSignups}</p>
            <p className="text-[10px] text-gray-500">{t.signups}</p>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-purple-400">{stats.activeSubscribers}</p>
            <p className="text-[10px] text-gray-500">{t.subscribers}</p>
          </div>
        </div>
      </motion.div>

      {/* ===== COMMISSION INFO (collapsible) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white font-medium">{t.howItWorks}</span>
          </div>
          <ChevronRight 
            className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-90' : ''}`} 
          />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              {/* Steps */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">1</div>
                  <div>
                    <p className="text-sm text-white">{t.step1Title}</p>
                    <p className="text-[10px] text-gray-400">{t.step1Desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">2</div>
                  <div>
                    <p className="text-sm text-white">{t.step2Title}</p>
                    <p className="text-[10px] text-gray-400">{t.step2Desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">3</div>
                  <div>
                    <p className="text-sm text-white">{t.step3Title}</p>
                    <p className="text-[10px] text-gray-400">{t.step3Desc}</p>
                  </div>
                </div>
              </div>

              {/* Commission details */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{t.perSubscriber}</span>
                  <span className="text-lg font-bold text-green-400">{formatCurrency(PRICING.COMMISSION_PER_MONTH)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{t.cappedAt}</span>
                  <span>{formatCurrency(PRICING.MAX_PER_USER)} {t.maxPerUser}</span>
                </div>
              </div>

              {/* Projection calculator */}
              <div className="mt-3 p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400 mb-2">{t.monthlyRecurring}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{t.ifYouGet} <span className="text-white font-semibold">10</span> {t.subscribers_plural}</span>
                  <span className="text-green-400 font-bold">{formatCurrency(70)}{t.perMonth}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-300">{t.ifYouGet} <span className="text-white font-semibold">50</span> {t.subscribers_plural}</span>
                  <span className="text-green-400 font-bold">{formatCurrency(350)}{t.perMonth}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-300">{t.ifYouGet} <span className="text-white font-semibold">100</span> {t.subscribers_plural}</span>
                  <span className="text-green-400 font-bold">{formatCurrency(700)}{t.perMonth}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
