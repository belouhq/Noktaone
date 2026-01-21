/**
 * Twilio Webhook: Handle incoming SMS (STOP, etc.)
 * 
 * POST /api/webhooks/twilio/incoming
 * 
 * Twilio envoie les SMS entrants ici
 * Gère les désabonnements STOP (obligatoire légalement)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Twilio envoie les données en x-www-form-urlencoded
export async function POST(request: NextRequest) {
  try {
    // Vérifier la signature Twilio (important en prod!)
    const twilioSignature = request.headers.get("x-twilio-signature");
    
    // TODO: Implémenter la vérification de signature Twilio
    // https://www.twilio.com/docs/usage/security#validating-requests

    // Parser le body form-urlencoded
    const formData = await request.formData();
    const from = formData.get("From") as string; // Numéro de l'expéditeur
    const body = (formData.get("Body") as string || "").trim().toUpperCase();
    const to = formData.get("To") as string; // Notre numéro Twilio

    if (!from || !body) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    console.log(`[SMS Incoming] From: ${from}, Body: "${body}"`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Traiter les commandes STOP
    const stopKeywords = ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "ARRET", "ARRETER"];
    const isStopRequest = stopKeywords.some(kw => body.includes(kw));

    if (isStopRequest) {
      // Enregistrer le désabonnement
      const { error } = await supabase
        .from("sms_unsubscribes")
        .upsert(
          {
            phone: from,
            unsubscribed_at: new Date().toISOString(),
            reason: "STOP",
          },
          { onConflict: "phone" }
        );

      if (error) {
        console.error("Error recording unsubscribe:", error);
      }

      // Mettre à jour le consentement dans user_profiles
      await supabase
        .from("user_profiles")
        .update({
          sms_consent: false,
          sms_consent_at: null,
        })
        .eq("phone", from);

      // Log
      await supabase
        .from("sms_logs")
        .insert({
          phone: from,
          message_type: "transactional",
          status: "unsubscribed",
          sent_at: new Date().toISOString(),
        });

      console.log(`[SMS] Unsubscribed: ${from}`);

      // Réponse TwiML - Confirmation de désabonnement
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Vous avez été désinscrit des SMS Nokta One. Envoyez START pour vous réabonner.</Message>
</Response>`;

      return new NextResponse(twimlResponse, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Traiter les commandes START (réabonnement)
    const startKeywords = ["START", "YES", "SUBSCRIBE", "OUI"];
    const isStartRequest = startKeywords.some(kw => body.includes(kw));

    if (isStartRequest) {
      // Supprimer de la liste des désabonnés
      await supabase
        .from("sms_unsubscribes")
        .delete()
        .eq("phone", from);

      // Réactiver le consentement dans le profil
      await supabase
        .from("user_profiles")
        .update({
          sms_consent: true,
          sms_consent_at: new Date().toISOString(),
        })
        .eq("phone", from);

      console.log(`[SMS] Resubscribed: ${from}`);

      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Bienvenue à nouveau ! Vous recevrez vos rappels Nokta One. Envoyez STOP pour vous désinscrire.</Message>
</Response>`;

      return new NextResponse(twimlResponse, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Traiter les commandes HELP
    if (body === "HELP" || body === "AIDE" || body === "INFO") {
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Nokta One - Rappels de bien-être. Commandes: STOP pour se désabonner, START pour se réabonner. Support: support@nokta.app</Message>
</Response>`;

      return new NextResponse(twimlResponse, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Autres messages - pas de réponse automatique
    // (évite les boucles et les coûts inutiles)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { "Content-Type": "application/xml" } }
    );

  } catch (error: any) {
    console.error("[Twilio Webhook Error]", error);
    return new NextResponse("Error", { status: 500 });
  }
}

// Twilio peut aussi envoyer des GET pour validation
export async function GET() {
  return new NextResponse("Twilio webhook endpoint", { status: 200 });
}
