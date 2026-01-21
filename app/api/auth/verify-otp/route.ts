/**
 * API Route: Verify OTP
 * 
 * POST /api/auth/verify-otp
 * Body: { phone: string, code: string }
 * 
 * Crée ou connecte l'utilisateur après vérification
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Types
interface VerifyOTPRequest {
  phone: string;
  code: string;
}

// Validation OTP format
function isValidOTPFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

// Hash OTP pour comparaison
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + process.env.OTP_SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Générer un username unique
function generateUsername(): string {
  const adjectives = ["swift", "calm", "bright", "zen", "flow", "pure", "clear"];
  const nouns = ["wave", "light", "mind", "soul", "breath", "focus", "peace"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${noun}${num}`;
}

// Générer un referral code
function generateReferralCode(username: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `@${username}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();
    const { phone, code } = body;

    // Validation basique
    if (!phone || !code) {
      return NextResponse.json(
        { error: "Téléphone et code requis" },
        { status: 400 }
      );
    }

    if (!isValidOTPFormat(code)) {
      return NextResponse.json(
        { error: "Format de code invalide" },
        { status: 400 }
      );
    }

    // Supabase client avec service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer la vérification en attente
    const { data: verification, error: fetchError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", phone)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: "Aucune vérification en cours pour ce numéro" },
        { status: 400 }
      );
    }

    // Vérifier expiration
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Code expiré. Demandez un nouveau code." },
        { status: 400 }
      );
    }

    // Vérifier nombre de tentatives (anti brute-force)
    const MAX_ATTEMPTS = 5;
    if (verification.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Trop de tentatives. Demandez un nouveau code." },
        { status: 429 }
      );
    }

    // Vérifier le code (comparaison hash) AVANT d'incrémenter
    const hashedInput = await hashOTP(code);
    if (hashedInput !== verification.otp_hash) {
      // Incrémenter les tentatives seulement si le code est incorrect
      const newAttempts = verification.attempts + 1;
      await supabase
        .from("phone_verifications")
        .update({ attempts: newAttempts })
        .eq("phone", phone);

      const remaining = MAX_ATTEMPTS - newAttempts;
      return NextResponse.json(
        { 
          error: `Code incorrect. ${remaining} tentative(s) restante(s).`,
          attemptsRemaining: remaining 
        },
        { status: 400 }
      );
    }

    // ✅ Code valide - Créer ou récupérer l'utilisateur

    // Chercher un utilisateur existant avec ce téléphone
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("phone", phone)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      // Utilisateur existant - connexion
      userId = existingProfile.id;
    } else {
      // Nouvel utilisateur - création
      isNewUser = true;

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        phone,
        phone_confirm: true, // Téléphone déjà vérifié
        user_metadata: {
          phone_verified: true,
          sms_consent: verification.sms_consent,
          consent_timestamp: verification.consent_timestamp,
        },
      });

      if (authError || !authData.user) {
        console.error("Auth creation error:", authError);
        return NextResponse.json(
          { error: "Erreur lors de la création du compte" },
          { status: 500 }
        );
      }

      userId = authData.user.id;

      // Créer le profil
      const username = generateUsername();
      const referralCode = generateReferralCode(username);

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          phone,
          username,
          referral_code: referralCode,
          sms_consent: verification.sms_consent,
          sms_consent_at: verification.consent_timestamp,
          language: getLanguageFromRequest(request),
          country: getCountryFromPhone(phone),
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Rollback: supprimer l'utilisateur auth
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: "Erreur lors de la création du profil" },
          { status: 500 }
        );
      }
    }

    // Nettoyer la vérification utilisée
    await supabase
      .from("phone_verifications")
      .delete()
      .eq("phone", phone);

    // Créer un token de session custom
    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    // Insérer la session dans la base de données
    const { error: sessionInsertError } = await supabase
      .from("sessions")
      .insert({
        id: sessionToken,
        user_id: userId,
        expires_at: sessionExpiry.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (sessionInsertError) {
      console.error("Session creation error:", sessionInsertError);
      // Continue quand même - la session cookie sera créée mais pas persistée en DB
      // L'utilisateur pourra toujours utiliser l'app, mais devra se reconnecter après expiration
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpiry,
      path: "/",
    });

    // Log pour audit
    console.log(`[Auth] ${isNewUser ? "New user" : "Login"}: ${phone.slice(0, 4)}****${phone.slice(-2)}`);

    return NextResponse.json({
      success: true,
      userId,
      isNewUser,
      message: isNewUser ? "Compte créé avec succès" : "Connexion réussie",
    });

  } catch (error: any) {
    console.error("[VerifyOTP Error]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// Helpers
function getLanguageFromRequest(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") || "";
  const primary = acceptLang.split(",")[0]?.split("-")[0] || "en";
  const supported = ["fr", "en", "es", "de", "it", "pt", "ar", "hi", "ja", "ko", "zh"];
  return supported.includes(primary) ? primary : "en";
}

function getCountryFromPhone(phone: string): string {
  // Mapping simple des préfixes
  const prefixMap: Record<string, string> = {
    "+33": "FR",
    "+1": "US", // ou CA
    "+44": "GB",
    "+49": "DE",
    "+34": "ES",
    "+39": "IT",
    "+32": "BE",
    "+41": "CH",
    "+212": "MA",
    "+221": "SN",
    "+225": "CI",
    "+261": "MG",
    "+55": "BR",
    "+52": "MX",
    "+81": "JP",
    "+82": "KR",
    "+91": "IN",
    "+971": "AE",
  };

  for (const [prefix, country] of Object.entries(prefixMap)) {
    if (phone.startsWith(prefix)) {
      return country;
    }
  }
  return "XX"; // Unknown
}
