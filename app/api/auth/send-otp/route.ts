import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendSMS, generateOTP, formatPhoneNumber, isValidPhoneNumber } from "@/lib/services/twilio";
import crypto from "crypto";

const OTP_SALT = process.env.OTP_SALT || "default-salt-change-in-production";
const OTP_EXPIRY_MINUTES = 10;

/**
 * Hash OTP for storage
 */
function hashOTP(code: string, phone: string): string {
  return crypto
    .createHash("sha256")
    .update(`${code}${phone}${OTP_SALT}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { phone, consent } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
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

    // Generate OTP
    const otpCode = generateOTP();
    const hashedOTP = hashOTP(otpCode, formattedPhone);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in database
    const { error: dbError } = await supabaseAdmin
      .from("phone_otps")
      .insert({
        phone: formattedPhone,
        otp_hash: hashedOTP,
        expires_at: expiresAt.toISOString(),
        consent_sms: consent || false,
      });

    if (dbError) {
      console.error("[send-otp] DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to store OTP" },
        { status: 500 }
      );
    }

    // Send SMS via Twilio
    const smsMessage = `Votre code Nokta One: ${otpCode}. Valide ${OTP_EXPIRY_MINUTES} minutes.`;
    const smsResult = await sendSMS({
      to: formattedPhone,
      message: smsMessage,
    });

    if (!smsResult.success) {
      console.error("[send-otp] SMS error:", smsResult.error);
      // Still return success to avoid revealing phone validation
      // In production, you might want to handle this differently
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent",
    });
  } catch (error: any) {
    console.error("[send-otp] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
