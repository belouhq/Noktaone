-- ============================================
-- NOKTA STRIPE SUBSCRIPTION MIGRATION
-- Run in Supabase SQL Editor
-- ============================================

-- Add subscription columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_is_premium 
ON public.profiles(is_premium);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID (cus_xxx)';
COMMENT ON COLUMN public.profiles.is_premium IS 'Whether user has active premium subscription';
COMMENT ON COLUMN public.profiles.subscription_id IS 'Stripe Subscription ID (sub_xxx)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe subscription status: active, trialing, past_due, canceled, etc.';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Subscription plan: monthly or annual';
COMMENT ON COLUMN public.profiles.subscription_current_period_end IS 'When current billing period ends';
COMMENT ON COLUMN public.profiles.trial_used IS 'Whether user has already used their free trial';

-- Create a view for premium users (useful for queries)
CREATE OR REPLACE VIEW public.premium_users AS
SELECT 
  id,
  email,
  username,
  subscription_plan,
  subscription_status,
  subscription_current_period_end
FROM public.profiles
WHERE is_premium = TRUE;

-- RLS Policy: Users can only read their own subscription data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.profiles;

-- Create policy for viewing own subscription data
CREATE POLICY "Users can view own subscription" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND is_premium = TRUE
    AND subscription_status IN ('active', 'trialing')
  );
END;
$$;

-- Function to get remaining trial days
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_end TIMESTAMPTZ;
  days_remaining INTEGER;
BEGIN
  SELECT subscription_current_period_end INTO trial_end
  FROM public.profiles
  WHERE id = user_id
  AND subscription_status = 'trialing';
  
  IF trial_end IS NULL THEN
    RETURN NULL;
  END IF;
  
  days_remaining := GREATEST(0, EXTRACT(DAY FROM (trial_end - NOW())));
  RETURN days_remaining;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.premium_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trial_days_remaining TO authenticated;

-- ============================================
-- VERIFICATION QUERY (run after migration)
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- AND column_name IN (
--   'stripe_customer_id',
--   'is_premium',
--   'subscription_id',
--   'subscription_status',
--   'subscription_plan',
--   'subscription_current_period_end',
--   'trial_used'
-- );
