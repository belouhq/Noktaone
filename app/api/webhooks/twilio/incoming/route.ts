import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Twilio Incoming SMS Webhook
 * 
 * Handles STOP/START/HELP keywords for SMS opt-out
 * Configure in Twilio Console: Phone Numbers → Messaging → A MESSAGE COMES IN
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = formData.get("Body")?.toString()?.toUpperCase().trim();
    const from = formData.get("From")?.toString();

    if (!from) {
      return new NextResponse("Missing From", { status: 400 });
    }

    // Format phone to E.164
    const phone = from.startsWith("+") ? from : `+${from}`;

    // Handle STOP keyword
    if (body === "STOP" || body === "STOPALL" || body === "UNSUBSCRIBE") {
      // Update user profile to opt out
      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          sms_consent: false,
          sms_consent_at: null,
        })
        .eq("phone", phone);

      if (error) {
        console.error("[Twilio webhook] Error updating consent:", error);
      }

      // Twilio expects TwiML response
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Vous avez été désabonné des SMS Nokta One. Répondez START pour réactiver.</Message>
</Response>`,
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Handle START keyword (re-subscribe)
    if (body === "START" || body === "YES" || body === "UNSTOP") {
      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          sms_consent: true,
          sms_consent_at: new Date().toISOString(),
        })
        .eq("phone", phone);

      if (error) {
        console.error("[Twilio webhook] Error updating consent:", error);
      }

      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Vous êtes réabonné aux SMS Nokta One. Répondez STOP pour vous désabonner.</Message>
</Response>`,
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Handle HELP keyword
    if (body === "HELP" || body === "INFO") {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Nokta One - Répondez STOP pour vous désabonner, START pour réactiver.</Message>
</Response>`,
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Default: acknowledge receipt
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error: any) {
    console.error("[Twilio webhook] Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
