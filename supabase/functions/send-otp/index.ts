import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: OTPRequest = await req.json();
    
    console.log("Sending OTP to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "K-Spice <onboarding@resend.dev>",
        to: [email],
        subject: "Mã xác thực đăng ký tài khoản K-Spice",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d32f2f; text-align: center;">K-Spice Restaurant</h1>
            <div style="background-color: #f5f5f5; padding: 30px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #333; margin-bottom: 20px;">Mã xác thực của bạn</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Cảm ơn bạn đã đăng ký tài khoản tại K-Spice. Vui lòng sử dụng mã OTP dưới đây để hoàn tất đăng ký:
              </p>
              <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="color: #d32f2f; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                Mã OTP này có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
              </p>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
              Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error("Failed to send OTP email");
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
