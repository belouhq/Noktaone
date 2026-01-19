import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { event, app_id, data } = payload;

    // Vérifier que c'est notre app
    if (app_id !== process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      return NextResponse.json({ error: 'Invalid app_id' }, { status: 400 });
    }

    console.log('OneSignal webhook:', event);

    switch (event) {
      case 'notification.delivered':
        // Notification délivrée
        await handleNotificationDelivered(data);
        break;

      case 'notification.clicked':
        // Notification cliquée
        await handleNotificationClicked(data);
        break;

      case 'subscription.created':
        // Nouveau device enregistré
        await handleSubscriptionCreated(data);
        break;

      case 'subscription.changed':
        // Changement de subscription (opt-out, etc.)
        await handleSubscriptionChanged(data);
        break;

      default:
        console.log('Unhandled OneSignal event:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('OneSignal webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function handleNotificationDelivered(data: any) {
  // Log pour analytics
  await supabase.from('analytics_events').insert({
    event_name: 'notification_delivered',
    event_properties: {
      notification_id: data.notification_id,
      player_id: data.player_id,
    },
  });
}

async function handleNotificationClicked(data: any) {
  // Trouver l'utilisateur
  const { data: device } = await supabase
    .from('notification_devices')
    .select('user_id')
    .eq('onesignal_player_id', data.player_id)
    .single();

  await supabase.from('analytics_events').insert({
    user_id: device?.user_id,
    event_name: 'notification_clicked',
    event_properties: {
      notification_id: data.notification_id,
      player_id: data.player_id,
      action: data.action_id,
    },
  });
}

async function handleSubscriptionCreated(data: any) {
  // Un nouveau device s'est enregistré
  // On le liera à l'utilisateur quand il se connectera
  console.log('New subscription:', data.player_id);
}

async function handleSubscriptionChanged(data: any) {
  const { player_id, subscribed } = data;

  await supabase.from('notification_devices').update({
    push_enabled: subscribed,
    updated_at: new Date().toISOString(),
  }).eq('onesignal_player_id', player_id);
}
