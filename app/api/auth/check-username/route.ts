/**
 * API Route: Check Username Availability
 * 
 * GET /api/auth/check-username?username=xxx
 * 
 * Checks if a username is available (not taken, valid format, not reserved)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Reserved usernames (same as frontend)
const RESERVED_USERNAMES = [
  "nokta", "noktaone", "admin", "support", "help", "official",
  "app", "api", "www", "mail", "team", "staff", "mod", "moderator"
];

// Username validation regex
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({
        available: false,
        reason: "invalid_format",
        message: "Username must be 3-20 characters, letters, numbers, and underscores only",
      });
    }

    // Check if reserved
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return NextResponse.json({
        available: false,
        reason: "reserved",
        message: "This username is reserved",
      });
    }

    // Check database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check in user_profiles (if username column exists)
    const { data: existingProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("username", username.toLowerCase())
      .limit(1)
      .single();

    // Also check in profiles table (legacy)
    const { data: existingLegacy, error: legacyError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .limit(1)
      .single();

    // If found in either table, username is taken
    if (existingProfile || existingLegacy) {
      return NextResponse.json({
        available: false,
        reason: "taken",
        message: "This username is already taken",
      });
    }

    return NextResponse.json({
      available: true,
      username: username.toLowerCase(),
    });

  } catch (error: any) {
    console.error("[Check Username Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
