import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  purpose: "signup" | "reset_password";
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, purpose }: SendOTPRequest = await req.json();

    if (!email || !purpose) {
      return new Response(
        JSON.stringify({ error: "Email and purpose are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clean up expired OTPs for this email
    await supabase.rpc('cleanup_expired_otps');

    // Delete previous unverified OTPs for this email and purpose
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", email)
      .eq("purpose", purpose)
      .eq("verified", false);

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: dbError } = await supabase
      .from("otp_verifications")
      .insert({
        email,
        otp_code: otpCode,
        purpose,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store OTP");
    }

    // Send email based on purpose
    const subject =
      purpose === "signup"
        ? "Mã xác thực đăng ký tài khoản K-Spice"
        : "Mã xác thực đặt lại mật khẩu K-Spice";

    const message =
      purpose === "signup"
        ? `Chào bạn,\n\nMã OTP để hoàn tất đăng ký tài khoản của bạn là: <strong>${otpCode}</strong>\n\nMã này có hiệu lực trong 10 phút.\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.`
        : `Chào bạn,\n\nMã OTP để đặt lại mật khẩu của bạn là: <strong>${otpCode}</strong>\n\nMã này có hiệu lực trong 10 phút.\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.`;

    const emailResponse = await resend.emails.send({
      from: "K-Spice <trantramy17112005@gmail.com>",
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d97706;">K-Spice</h1>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
            <h2 style="color: #374151;">${subject}</h2>
            <p style="color: #6b7280; line-height: 1.6;">${message}</p>
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 8px; margin: 0;">${otpCode}</p>
            </div>
            <p style="color: #9ca3af; font-size: 14px;">Trân trọng,<br>Đội ngũ K-Spice</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP đã được gửi đến email của bạn" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
