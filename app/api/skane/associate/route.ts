import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Associate a pending Skane session with a newly created user
 * Called after successful signup to link guest Skane data to user account
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, skaneData } = await request.json();

    if (!userId || !skaneData) {
      return NextResponse.json(
        { error: "userId and skaneData required" },
        { status: 400 }
      );
    }

    // Récupérer la session Skane la plus récente en mode guest pour cet utilisateur
    // ou créer une nouvelle session basée sur skaneData
    const { data: recentSession, error: fetchError } = await supabaseAdmin
      .from("skane_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is OK for new users
      console.error("[associate] Error fetching session:", fetchError);
    }

    // Si une session récente existe, la mettre à jour
    if (recentSession) {
      const { error: updateError } = await supabaseAdmin
        .from("skane_sessions")
        .update({
          before_score: skaneData.beforeScore,
          after_score: skaneData.afterScore,
          micro_action_id: skaneData.actionLabel, // Vous devrez peut-être mapper cela à un ID
        })
        .eq("id", recentSession.id);

      if (updateError) {
        console.error("[associate] Error updating session:", updateError);
      }
    } else {
      // Créer une nouvelle session pour l'utilisateur
      const { error: insertError } = await supabaseAdmin
        .from("skane_sessions")
        .insert({
          user_id: userId,
          before_score: skaneData.beforeScore,
          after_score: skaneData.afterScore,
          micro_action_id: skaneData.actionLabel,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("[associate] Error creating session:", insertError);
        return NextResponse.json(
          { error: "Failed to associate Skane" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Skane associated successfully",
    });
  } catch (error: any) {
    console.error("[associate] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
