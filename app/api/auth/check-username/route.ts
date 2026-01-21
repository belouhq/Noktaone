/**
 * API: Check username availability
 * GET /api/auth/check-username?username=xxx
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RESERVED_USERNAMES = [
  "nokta", "noktaone", "admin", "support", "help", "official",
  "app", "api", "www", "mail", "team", "staff", "mod", "moderator",
  "system", "root", "null", "undefined", "test", "demo"
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.toLowerCase().trim();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Format validation
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ 
      available: false, 
      reason: "invalid_format" 
    });
  }

  // Reserved check
  if (RESERVED_USERNAMES.includes(username)) {
    return NextResponse.json({ 
      available: false, 
      reason: "reserved" 
    });
  }

  // Database check
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found (which is good)
    console.error("Username check error:", error);
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }

  return NextResponse.json({
    available: !data,
    reason: data ? "taken" : null
  });
}
