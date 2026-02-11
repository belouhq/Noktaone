"use server";

// NOKTA ONE - API ROUTE : Guest Scans Sync

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn(
    "[guest-scans] SUPABASE env vars are missing. /api/guest-scans/sync will return 500."
  );
}

const supabase =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      })
    : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { userId, deviceId, scansUsed } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("guest_scans")
      .upsert(
        {
          device_id: deviceId,
          user_id: userId || null,
          scans_used: scansUsed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "device_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error syncing guest scans:", error);
      return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Guest scans sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("guest_scans")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    // PGRST116 = row not found → pas grave, on renvoie un état vierge
    if (error && (error as any).code !== "PGRST116") {
      console.error("Error fetching guest scans:", error);
      return NextResponse.json(
        { error: "Failed to fetch" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || { device_id: deviceId, scans_used: 0 },
    });
  } catch (error) {
    console.error("Guest scans fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

