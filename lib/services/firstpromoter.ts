// ============================================
// NOKTA ONE - FirstPromoter Service
// ============================================
// Fichier: lib/services/firstpromoter.ts
// ============================================

const FIRSTPROMOTER_API_KEY = process.env.FIRSTPROMOTER_API_KEY!;
const FIRSTPROMOTER_API_URL = 'https://firstpromoter.com/api/v1';
const FIRSTPROMOTER_ACCOUNT_ID = process.env.FIRSTPROMOTER_ACCOUNT_ID!;

// ============================================
// TYPES
// ============================================

interface Promoter {
  id: number;
  cust_id: string;
  email: string;
  temp_password?: string;
  default_ref_id: string;
  earnings_balance: {
    cash: number;
  };
  current_balance: {
    cash: number;
  };
  paid_balance: {
    cash: number;
  };
  note?: string;
  auth_token?: string;
  profile: {
    id: number;
    first_name: string;
    last_name: string;
    website?: string;
    paypal_email?: string;
    avatar_url?: string;
    social_accounts?: Record<string, string>;
  };
  promotions: Promotion[];
  created_at: string;
}

interface Promotion {
  id: number;
  status: 'active' | 'paused' | 'disabled';
  ref_id: string;
  promo_code?: string;
  target_reached_at?: string;
  campaign_id: number;
  campaign: {
    id: number;
    name: string;
    color: string;
  };
  referral_link: string;
  current_referral_reward?: {
    type: string;
    unit: string;
    amount: number;
  };
  current_promotion_reward?: {
    type: string;
    unit: string;
    amount: number;
  };
  visitors_count: number;
  leads_count: number;
  customers_count: number;
}

interface Referral {
  id: number;
  state: 'signup' | 'lead' | 'customer' | 'cancelled' | 'denied';
  email?: string;
  uid?: string;
  customer?: {
    id: number;
    cust_id: string;
    email: string;
  };
  promoter: {
    id: number;
    cust_id: string;
    email: string;
  };
  created_at: string;
}

interface Reward {
  id: number;
  amount: number;
  unit: string;
  status: 'pending' | 'approved' | 'denied' | 'paid';
  promoter: {
    id: number;
    cust_id: string;
    email: string;
  };
  referral?: {
    id: number;
    state: string;
  };
  created_at: string;
}

interface CreatePromoterParams {
  email: string;
  firstName?: string;
  lastName?: string;
  custId?: string;
  refId?: string;
  campaignId?: number;
}

interface TrackReferralParams {
  email: string;
  uid?: string;
  refId?: string;
  eventId?: string;
  amount?: number;
  currency?: string;
  plan?: string;
}

interface WebhookPayload {
  event:
    | 'promoter_accepted'
    | 'promoter_denied'
    | 'new_referral'
    | 'referral_converted'
    | 'reward_created'
    | 'reward_approved'
    | 'reward_denied'
    | 'payout_created';
  data: any;
}

// ============================================
// FIRSTPROMOTER SERVICE
// ============================================

class FirstPromoterService {
  private apiKey: string;
  private accountId: string;

  constructor() {
    this.apiKey = FIRSTPROMOTER_API_KEY;
    this.accountId = FIRSTPROMOTER_ACCOUNT_ID;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${FIRSTPROMOTER_API_URL}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`FirstPromoter API Error: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // ============================================
  // PROMOTERS (Affiliés)
  // ============================================

  /**
   * Créer un nouveau promoteur (affilié)
   */
  async createPromoter(params: CreatePromoterParams): Promise<Promoter> {
    return this.request<Promoter>('/promoters/create', 'POST', {
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      cust_id: params.custId,
      ref_id: params.refId,
      campaign_id: params.campaignId,
    });
  }

  /**
   * Récupérer un promoteur par email ou cust_id
   */
  async getPromoter(identifier: { email?: string; custId?: string }): Promise<Promoter | null> {
    try {
      const params = new URLSearchParams();
      if (identifier.email) params.append('email', identifier.email);
      if (identifier.custId) params.append('cust_id', identifier.custId);

      return this.request<Promoter>(`/promoters/show?${params.toString()}`);
    } catch (error) {
      // Promoteur non trouvé
      return null;
    }
  }

  /**
   * Mettre à jour un promoteur
   */
  async updatePromoter(
    identifier: { email?: string; custId?: string },
    data: Partial<{
      firstName: string;
      lastName: string;
      paypalEmail: string;
      note: string;
    }>
  ): Promise<Promoter> {
    const params = new URLSearchParams();
    if (identifier.email) params.append('email', identifier.email);
    if (identifier.custId) params.append('cust_id', identifier.custId);

    return this.request<Promoter>(`/promoters/update?${params.toString()}`, 'PUT', {
      first_name: data.firstName,
      last_name: data.lastName,
      paypal_email: data.paypalEmail,
      note: data.note,
    });
  }

  /**
   * Lister tous les promoteurs
   */
  async listPromoters(page: number = 1, limit: number = 100): Promise<Promoter[]> {
    return this.request<Promoter[]>(`/promoters/list?page=${page}&limit=${limit}`);
  }

  // ============================================
  // REFERRALS (Parrainages)
  // ============================================

  /**
   * Tracker un nouveau referral (signup)
   */
  async trackReferral(params: TrackReferralParams): Promise<Referral> {
    return this.request<Referral>('/referrals/create', 'POST', {
      email: params.email,
      uid: params.uid,
      ref_id: params.refId,
      event_id: params.eventId,
    });
  }

  /**
   * Convertir un referral en client (après paiement)
   */
  async trackSale(params: {
    email: string;
    uid?: string;
    eventId?: string;
    amount: number;
    currency?: string;
    plan?: string;
    quantity?: number;
    refId?: string;
  }): Promise<any> {
    return this.request('/track/sale', 'POST', {
      email: params.email,
      uid: params.uid,
      event_id: params.eventId,
      amount: params.amount,
      currency: params.currency || 'EUR',
      plan: params.plan,
      quantity: params.quantity || 1,
      ref_id: params.refId,
    });
  }

  /**
   * Tracker un lead (essai gratuit)
   */
  async trackLead(params: { email: string; uid?: string; refId?: string }): Promise<any> {
    return this.request('/track/signup', 'POST', {
      email: params.email,
      uid: params.uid,
      ref_id: params.refId,
    });
  }

  /**
   * Annuler/rembourser une vente
   */
  async cancelSale(params: { email?: string; uid?: string; eventId?: string }): Promise<any> {
    return this.request('/track/cancellation', 'POST', {
      email: params.email,
      uid: params.uid,
      event_id: params.eventId,
    });
  }

  /**
   * Récupérer un referral
   */
  async getReferral(referralId: number): Promise<Referral> {
    return this.request<Referral>(`/referrals/show?id=${referralId}`);
  }

  // ============================================
  // REWARDS (Commissions)
  // ============================================

  /**
   * Lister les rewards d'un promoteur
   */
  async listRewards(promoterId: number, status?: string): Promise<Reward[]> {
    let url = `/rewards/list?promoter_id=${promoterId}`;
    if (status) url += `&status=${status}`;
    return this.request<Reward[]>(url);
  }

  /**
   * Approuver un reward
   */
  async approveReward(rewardId: number): Promise<Reward> {
    return this.request<Reward>(`/rewards/approve?id=${rewardId}`, 'PUT');
  }

  /**
   * Refuser un reward
   */
  async denyReward(rewardId: number, reason?: string): Promise<Reward> {
    return this.request<Reward>(`/rewards/deny?id=${rewardId}`, 'PUT', { reason });
  }

  // ============================================
  // CLICKS & TRACKING
  // ============================================

  /**
   * Récupérer le ref_id depuis le cookie/URL
   */
  getRefIdFromRequest(request: Request): string | null {
    // Chercher dans les cookies
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const match = cookies.match(/_fprom_track=([^;]+)/);
      if (match) return match[1];
    }

    // Chercher dans l'URL
    const url = new URL(request.url);
    const ref = url.searchParams.get('ref') || url.searchParams.get('via') || url.searchParams.get('fp_ref');
    if (ref) return ref;

    return null;
  }

  /**
   * Générer le script de tracking
   */
  getTrackingScript(): string {
    return `
      <script>
        (function(w,d,t,u,n,a,m){w['FirstPromoterObject']=n;
          w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},w[n].l=1*new Date();
          a=d.createElement(t),m=d.getElementsByTagName(t)[0];
          a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://cdn.firstpromoter.com/fpr.js','$fpr');
        $fpr('init', {cid: '${this.accountId}'});
        $fpr('click');
      </script>
    `;
  }

  // ============================================
  // WEBHOOK HANDLING
  // ============================================

  /**
   * Valider et parser un webhook
   */
  parseWebhook(payload: any, signature?: string): WebhookPayload {
    // TODO: Valider la signature si FirstPromoter l'implémente
    return payload as WebhookPayload;
  }
}

// Export singleton
export const firstPromoterService = new FirstPromoterService();

// ============================================
// HELPER: Sync avec Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';

export async function syncAffiliateWithSupabase(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  referralCode: string
): Promise<void> {
  try {
    // Vérifier si le user est déjà un promoteur
    let promoter = await firstPromoterService.getPromoter({ email });

    // Si non, le créer
    if (!promoter) {
      promoter = await firstPromoterService.createPromoter({
        email,
        custId: userId,
        refId: referralCode,
      });
    }

    // Sync avec Supabase
    const defaultPromotion = promoter.promotions?.[0];

    await supabase.from('affiliate_tracking').upsert(
      {
        user_id: userId,
        firstpromoter_id: promoter.id.toString(),
        referral_code: defaultPromotion?.ref_id || referralCode,
        referral_link: defaultPromotion?.referral_link,
        clicks_count: defaultPromotion?.visitors_count || 0,
        signups_count: defaultPromotion?.leads_count || 0,
        conversions_count: defaultPromotion?.customers_count || 0,
        total_commission_earned: promoter.earnings_balance?.cash || 0,
        commission_pending: promoter.current_balance?.cash || 0,
        commission_paid: promoter.paid_balance?.cash || 0,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (error) {
    console.error('Error syncing affiliate with FirstPromoter:', error);
    throw error;
  }
}

/**
 * Tracker un referral signup
 */
export async function trackReferralSignup(
  supabase: ReturnType<typeof createClient>,
  newUserId: string,
  email: string,
  refCode: string
): Promise<void> {
  try {
    // Tracker chez FirstPromoter
    await firstPromoterService.trackReferral({
      email,
      uid: newUserId,
      refId: refCode,
    });

    // Trouver l'affilié qui a parrainé
    const { data: affiliate } = await supabase
      .from('affiliate_tracking')
      .select('id, user_id')
      .eq('referral_code', refCode)
      .single();

    if (affiliate) {
      // Mettre à jour le profil du nouveau user
      await supabase
        .from('user_profile')
        .update({
          // Référé par cet affilié
        })
        .eq('user_id', newUserId);

      // Créer une conversion
      await supabase.from('affiliate_conversions').insert({
        affiliate_id: affiliate.id,
        converted_user_id: newUserId,
        conversion_type: 'signup',
        status: 'pending',
      });

      // Incrémenter le compteur
      await supabase
        .from('affiliate_tracking')
        .update({
          signups_count: supabase.rpc('increment', { x: 1 }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', affiliate.id);
    }
  } catch (error) {
    console.error('Error tracking referral signup:', error);
    // Ne pas faire échouer le signup pour autant
  }
}

/**
 * Tracker une conversion (paiement)
 */
export async function trackReferralConversion(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  amount: number,
  plan: string,
  currency: string = 'EUR'
): Promise<void> {
  try {
    // Tracker chez FirstPromoter
    await firstPromoterService.trackSale({
      email,
      uid: userId,
      amount,
      currency,
      plan,
    });

    // Mettre à jour dans Supabase si ce user a été référé
    const { data: conversion } = await supabase
      .from('affiliate_conversions')
      .select('id, affiliate_id')
      .eq('converted_user_id', userId)
      .eq('conversion_type', 'signup')
      .single();

    if (conversion) {
      // Mettre à jour la conversion
      await supabase
        .from('affiliate_conversions')
        .update({
          conversion_type: 'paid',
          status: 'approved',
          plan_type: plan,
          processed_at: new Date().toISOString(),
        })
        .eq('id', conversion.id);

      // Incrémenter le compteur de l'affilié
      await supabase
        .from('affiliate_tracking')
        .update({
          conversions_count: supabase.rpc('increment', { x: 1 }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversion.affiliate_id);
    }
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
  }
}
