import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processTerraWebhook, TerraWebhookPayload } from '@/lib/services/terra';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TERRA_WEBHOOK_SECRET = process.env.TERRA_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('terra-signature');

    // Valider la signature si configurée
    if (TERRA_WEBHOOK_SECRET && signature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', TERRA_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: TerraWebhookPayload = JSON.parse(body);

    console.log('Terra webhook:', payload.type, payload.user.provider);

    // Traiter le webhook
    await processTerraWebhook(supabase, payload);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Terra webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
