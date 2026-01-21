/**
 * API Route: Verify OTP and create/login user
 * 
 * POST /api/auth/verify-otp
 * Body: { phone: string, code: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Types
interface VerifyOTPRequest {
  phone: string;
  code: string;
}

// Rate limiting pour vérification
const verifyRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const VERIFY_RATE_LIMIT_MAX = 5; // 5 tentatives
const VERIFY_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkVerifyRateLimit(phone: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = verifyRateLimitMap.get(phone);

  if (!entry || now > entry.resetAt) {
    verifyRateLimitMap.set(phone, { count: 1, resetAt: now + VERIFY_RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= VERIFY_RATE_LIMIT_MAX) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((entry.resetAt - now) / 1000) 
    };
  }

  entry.count++;
  return { allowed: true };
}

// Hash OTP pour comparaison
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + (process.env.OTP_SALT || "default-salt-change-in-production"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();
    const { phone, code } = body;

    // Validation
    if (!phone || !code) {
      return NextResponse.json(
        { error: "Téléphone et code requis" },
        { status: 400 }
      );
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Code invalide (6 chiffres requis)" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateCheck = checkVerifyRateLimit(phone);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfter}s`,
          retryAfter: rateCheck.retryAfter 
        },
        { status: 429 }
      );
    }

    // Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Hash le code fourni
    const codeHash = await hashOTP(code);

    // Récupérer la vérification en cours
    const { data: verification, error: fetchError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("otp_hash", codeHash)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      // Incrémenter les tentatives même en cas d'échec
      await supabase
        .from("phone_verifications")
        .update({ 
          attempts: (verification?.attempts || 0) + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("phone", phone);

      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

    // Vérifier le nombre de tentatives
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "Trop de tentatives. Demandez un nouveau code." },
        { status: 429 }
      );
    }

    // Marquer comme vérifié
    await supabase
      .from("phone_verifications")
      .update({ 
        verified: true,
        verified_at: new Date().toISOString(),
        attempts: verification.attempts + 1,
      })
      .eq("id", verification.id);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("user_id, phone")
      .eq("phone", phone)
      .single();

    let userId: string;

    if (existingProfile?.user_id) {
      // Utilisateur existant - connecter
      userId = existingProfile.user_id;
    } else {
      // Nouvel utilisateur - créer compte
      // Créer l'utilisateur Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${phone.replace(/\D/g, "")}@nokta.phone`,
        phone: phone,
        email_confirm: true,
        phone_confirm: true,
      });

      if (authError || !authData.user) {
        console.error("[verify-otp] Auth error:", authError);
        return NextResponse.json(
          { error: "Erreur lors de la création du compte" },
          { status: 500 }
        );
      }

      userId = authData.user.id;

      // Créer le profil utilisateur
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          phone: phone,
          sms_consent: verification.sms_consent,
          sms_consent_at: verification.consent_timestamp,
        });

      if (profileError) {
        console.error("[verify-otp] Profile error:", profileError);
        // Continue quand même - le profil peut être créé plus tard
      }
    }

    // Log pour audit
    console.log(`[OTP] Verified for ${maskPhone(phone)} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      userId,
      phone: phone,
    });
  } catch (error: any) {
    console.error("[VerifyOTP Error]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// Masquer le numéro pour les logs
function maskPhone(phone: string): string {
  if (phone.length < 6) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}
