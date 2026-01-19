import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route: POST /api/track/share-click
 * 
 * Tracker quand quelqu'un clique sur un lien de partage.
 * Permet de mesurer le taux de conversion partage → scan.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role pour écriture
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { share_id, action } = body;

    if (!share_id) {
      return NextResponse.json(
        { error: "share_id required" },
        { status: 400 }
      );
    }

    // Incrémenter le compteur de clics
    const { error } = await supabase.rpc("increment_share_click", {
      p_share_id: share_id,
      p_action: action || "click",
    });

    if (error) {
      console.error("Error tracking share click:", error);
      // Ne pas bloquer l'UX en cas d'erreur de tracking
      return NextResponse.json({ success: true, tracked: false });
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error("Error in share-click API:", error);
    return NextResponse.json({ success: true, tracked: false });
  }
}
