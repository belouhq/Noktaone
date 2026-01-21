/**
 * API Route: Send OTP via SMS
 * 
 * POST /api/auth/send-otp
 * Body: { phone: string, consent: boolean }
 * 
 * Provider: Twilio (ou alternative comme MessageBird, Vonage)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Types
interface SendOTPRequest {
  phone: string;
  consent: boolean;
}

// Rate limiting simple (en prod: utiliser Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3; // 3 tentatives
const RATE_LIMIT_WINDOW = 60 * 1000; // par minute

// Validation du numéro de téléphone
function isValidPhone(phone: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  return e164Regex.test(phone);
}

// Générer un OTP à 6 chiffres
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limiting check
function checkRateLimit(phone: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(phone);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(phone, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((entry.resetAt - now) / 1000) 
    };
  }

  entry.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const body: SendOTPRequest = await request.json();
    const { phone, consent } = body;

    // Validation
    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Format de numéro invalide" },
        { status: 400 }
      );
    }

    // Consentement OBLIGATOIRE (RGPD/TCPA)
    if (!consent) {
      return NextResponse.json(
        { error: "Le consentement SMS est requis" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateCheck = checkRateLimit(phone);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfter}s`,
          retryAfter: rateCheck.retryAfter 
        },
        { status: 429 }
      );
    }

    // Générer OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Stocker OTP dans Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role pour écriture
    );

    // Upsert dans la table phone_verifications
    const { error: dbError } = await supabase
      .from("phone_verifications")
      .upsert(
        {
          phone,
          otp_hash: await hashOTP(otp), // Ne jamais stocker OTP en clair
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          sms_consent: consent,
          consent_timestamp: new Date().toISOString(),
          consent_ip: request.headers.get("x-forwarded-for") || "unknown",
        },
        { onConflict: "phone" }
      );

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
      );
    }

    // Envoyer SMS via Twilio
    const smsResult = await sendSMSViaTwilio(phone, otp);

    if (!smsResult.success) {
      console.error("SMS Error:", smsResult.error);
      return NextResponse.json(
        { error: "Impossible d'envoyer le SMS. Vérifiez le numéro." },
        { status: 500 }
      );
    }

    // Log pour audit (RGPD)
    console.log(`[OTP] Sent to ${maskPhone(phone)} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Code envoyé",
      expiresIn: 600, // 10 minutes en secondes
    });

  } catch (error: any) {
    console.error("[SendOTP Error]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// Hash OTP pour stockage sécurisé
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + process.env.OTP_SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Masquer le numéro pour les logs
function maskPhone(phone: string): string {
  if (phone.length < 6) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

// Envoi SMS via Twilio
async function sendSMSViaTwilio(
  phone: string, 
  otp: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio credentials missing");
    return { success: false, error: "SMS service not configured" };
  }

  const message = `Nokta One: Votre code de vérification est ${otp}. Valide 10 minutes. Ne le partagez pas.`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || "Twilio error" 
      };
    }

    return { 
      success: true, 
      messageId: data.sid 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
