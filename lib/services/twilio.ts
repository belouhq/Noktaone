/**
 * Twilio SMS Service
 * 
 * Handles SMS sending via Twilio API
 * Used for OTP codes and reminder notifications
 */

interface SendSMSOptions {
  to: string;
  message: string;
}

interface TwilioResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS({ to, message }: SendSMSOptions): Promise<TwilioResponse> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error("[Twilio] Missing configuration");
    return {
      success: false,
      error: "Twilio not configured",
    };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[Twilio] Error:", data);
      return {
        success: false,
        error: data.message || "Failed to send SMS",
      };
    }

    return {
      success: true,
      messageSid: data.sid,
    };
  } catch (error: any) {
    console.error("[Twilio] Exception:", error);
    return {
      success: false,
      error: error.message || "Failed to send SMS",
    };
  }
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format phone number for storage (E.164 format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, "");
  
  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = formatPhoneNumber(phone);
  // E.164 format: + followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(cleaned);
}
