// ============================================
// /api/stripe/portal/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-helpers';
import { createCustomerPortalSession } from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Récupérer le customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    // Créer la session portail
    const session = await createCustomerPortalSession(
      profile.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/subscription`
    );
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
