/**
 * API Route: Set Username
 * 
 * POST /api/auth/set-username
 * Body: { userId: string, username: string }
 * 
 * Saves username to user profile after signup
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Reserved usernames (same as frontend)
const RESERVED_USERNAMES = [
  "nokta", "noktaone", "admin", "support", "help", "official",
  "app", "api", "www", "mail", "team", "staff", "mod", "moderator",
  "system", "root", "null", "undefined", "test", "demo"
];

// Username validation regex
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username } = body;

    if (!userId || !username) {
      return NextResponse.json(
        { error: "userId and username are required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, letters, numbers, and underscores only" },
        { status: 400 }
      );
    }

    // Check if reserved
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const normalizedUsername = username.toLowerCase();

    // Check availability again (race condition protection)
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("username", normalizedUsername)
      .limit(1)
      .single();

    const { data: existingLegacy } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .limit(1)
      .single();

    if (existingProfile || existingLegacy) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Update user_profiles (primary)
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ username: normalizedUsername })
      .eq("user_id", userId);

    if (updateError) {
      // If user_profiles doesn't have username column, try profiles table
      const { error: legacyError } = await supabase
        .from("profiles")
        .update({ username: normalizedUsername })
        .eq("id", userId);

      if (legacyError) {
        console.error("[Set Username Error]", updateError, legacyError);
        return NextResponse.json(
          { error: "Failed to save username" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      username: normalizedUsername,
    });

  } catch (error: any) {
    console.error("[Set Username Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
