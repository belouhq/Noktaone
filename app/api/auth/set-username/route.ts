/**
 * API: Set username for user
 * POST /api/auth/set-username
 * Body: { userId: string, username: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RESERVED_USERNAMES = [
  "nokta", "noktaone", "admin", "support", "help", "official",
  "app", "api", "www", "mail", "team", "staff", "mod", "moderator",
  "system", "root", "null", "undefined", "test", "demo"
];

export async function POST(request: NextRequest) {
  try {
    const { userId, username } = await request.json();

    if (!userId || !username) {
      return NextResponse.json(
        { error: "userId and username required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim();

    // Validate format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid username format" },
        { status: 400 }
      );
    }

    // Check reserved
    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return NextResponse.json(
        { error: "Username is reserved" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check availability again (race condition protection)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .neq("id", userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Generate referral code
    const referralCode = `@${cleanUsername}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        referral_code: referralCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Set username error:", updateError);
      return NextResponse.json(
        { error: "Failed to save username" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      referralCode,
    });

  } catch (error: any) {
    console.error("Set username error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
