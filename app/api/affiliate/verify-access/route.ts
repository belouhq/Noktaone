import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Verify Partnership Access Code
 * 
 * POST /api/affiliate/verify-access
 * Body: { code: string }
 * 
 * Vérifie le code d'accès pour le panneau de gestion des partenariats
 */

// Code d'accès stocké dans les variables d'environnement
// Peut être un code unique ou un mot de passe
const PARTNERSHIP_ACCESS_CODE = process.env.PARTNERSHIP_ACCESS_CODE || "NOkta2025!";

// Rate limiting simple
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // 5 tentatives
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code requis", success: false },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfter}s`,
          success: false,
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Vérifier le code (comparaison insensible à la casse)
    const isValid = code.trim().toLowerCase() === PARTNERSHIP_ACCESS_CODE.toLowerCase();

    if (!isValid) {
      return NextResponse.json(
        { error: "Code incorrect", success: false },
        { status: 401 }
      );
    }

    // Code valide
    return NextResponse.json({
      success: true,
      message: "Accès autorisé",
    });

  } catch (error: any) {
    console.error("[VerifyAccess Error]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue", success: false },
      { status: 500 }
    );
  }
}
