-- ============================================
-- NOKTA STRIPE SUBSCRIPTION (SAFE MIGRATION)
-- Adds columns/indexes only (no RLS/policy changes)
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_is_premium
ON public.profiles(is_premium);

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID (cus_...)';
COMMENT ON COLUMN public.profiles.is_premium IS 'Whether user has an active premium subscription';
COMMENT ON COLUMN public.profiles.subscription_id IS 'Stripe Subscription ID (sub_...)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe subscription status: active, trialing, past_due, canceled, etc.';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Subscription plan: monthly or annual';
COMMENT ON COLUMN public.profiles.subscription_current_period_end IS 'End of current billing period';
COMMENT ON COLUMN public.profiles.trial_used IS 'Whether user has already used the free trial';

