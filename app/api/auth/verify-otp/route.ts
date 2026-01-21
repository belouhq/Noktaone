import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/services/twilio";
import crypto from "crypto";

const OTP_SALT = process.env.OTP_SALT || "default-salt-change-in-production";

/**
 * Hash OTP for verification
 */
function hashOTP(code: string, phone: string): string {
  return crypto
    .createHash("sha256")
    .update(`${code}${phone}${OTP_SALT}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and code required" },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    if (!isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid OTP format" },
        { status: 400 }
      );
    }

    // Find valid OTP
    const hashedOTP = hashOTP(code, formattedPhone);
    const now = new Date().toISOString();

    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("phone_otps")
      .select("*")
      .eq("phone", formattedPhone)
      .eq("otp_hash", hashedOTP)
      .eq("used", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("phone_otps")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // Check if user exists with this phone
    const { data: existingUser } = await supabaseAdmin
      .from("user_profiles")
      .select("id, user_id")
      .eq("phone", formattedPhone)
      .single();

    let userId: string;

    if (existingUser?.user_id) {
      // Existing user - sign them in
      userId = existingUser.user_id;
    } else {
      // New user - create account
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${formattedPhone.replace(/\D/g, "")}@nokta.phone`,
        phone: formattedPhone,
        email_confirm: true,
        phone_confirm: true,
      });

      if (authError || !authData.user) {
        console.error("[verify-otp] Auth error:", authError);
        return NextResponse.json(
          { error: "Failed to create account" },
          { status: 500 }
        );
      }

      userId = authData.user.id;

      // Create user profile
      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          user_id: userId,
          phone: formattedPhone,
          sms_consent: otpRecord.consent_sms,
          sms_consent_at: otpRecord.consent_sms ? new Date().toISOString() : null,
        });

      if (profileError) {
        console.error("[verify-otp] Profile error:", profileError);
        // Continue anyway - profile can be created later
      }
    }

    // Return session token or user ID
    // In production, you'd want to create a proper session
    return NextResponse.json({
      success: true,
      userId,
      phone: formattedPhone,
    });
  } catch (error: any) {
    console.error("[verify-otp] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
