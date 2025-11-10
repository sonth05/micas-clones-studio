import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  email: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      orderNumber,
      fullName,
      phone,
      address,
      items,
      totalAmount,
      paymentMethod,
    }: InvoiceRequest = await req.json();

    console.log("Sending invoice to:", email);

    const paymentMethodText = 
      paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" :
      paymentMethod === "e_wallet" ? "Ví điện tử" : "Tiền mặt";

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatPrice(item.subtotal)}</td>
        </tr>
      `
      )
      .join("");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "K-Spice <onboarding@resend.dev>",
        to: [email],
        subject: `Hóa đơn đơn hàng #${orderNumber} - K-Spice`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">K-Spice Restaurant</h1>
              <p style="color: #666; margin: 5px 0;">Hóa đơn điện tử</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Đơn hàng #${orderNumber}</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p style="margin: 5px 0; color: #666;"><strong>Khách hàng:</strong> ${fullName}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Số điện thoại:</strong> ${phone}</p>
                </div>
                <div>
                  <p style="margin: 5px 0; color: #666;"><strong>Địa chỉ:</strong> ${address}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Thanh toán:</strong> ${paymentMethodText}</p>
                </div>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white;">
              <thead>
                <tr style="background-color: #d32f2f; color: white;">
                  <th style="padding: 12px; text-align: left;">Sản phẩm</th>
                  <th style="padding: 12px; text-align: center;">Số lượng</th>
                  <th style="padding: 12px; text-align: right;">Đơn giá</th>
                  <th style="padding: 12px; text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #f5f5f5;">
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">
                    Tổng cộng:
                  </td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #d32f2f;">
                    ${formatPrice(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;">
                <strong>Lưu ý:</strong> Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận và giao hàng.
              </p>
            </div>

            <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Cảm ơn bạn đã tin tưởng K-Spice!</p>
              <p>Mọi thắc mắc vui lòng liên hệ: support@kspice.com</p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error("Failed to send invoice email");
    }

    const data = await res.json();
    console.log("Invoice sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-invoice function:", error);
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
