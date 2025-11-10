import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddressSelector from "@/components/AddressSelector";
import PaymentInfo from "@/components/PaymentInfo";

const checkoutSchema = z.object({
  paymentMethod: z.enum(["cod", "bank_transfer", "e_wallet"]),
  notes: z.string().max(500, "Ghi chú quá dài").optional(),
});

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cod",
      notes: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    const { data } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", user?.id);

    setCartItems(data || []);
    setLoading(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.products.price * item.quantity,
      0
    );
  };

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    if (!selectedAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn địa chỉ giao hàng",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderNumber = `ORD${Date.now()}`;
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user?.id,
          full_name: selectedAddress.full_name,
          phone: selectedAddress.phone,
          address_line: selectedAddress.address_line,
          city: selectedAddress.city,
          district: selectedAddress.district,
          address_id: selectedAddress.id,
          total_amount: calculateTotal(),
          payment_method: values.paymentMethod,
          notes: values.notes,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.products.id,
        product_name: item.products.name,
        product_price: item.products.price,
        quantity: item.quantity,
        subtotal: item.products.price * item.quantity,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user?.id);

      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${orderNumber}. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất!`,
      });

      navigate("/my-orders");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Thanh toán
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Address Selection */}
              <Card>
                <CardContent className="p-6">
                  <AddressSelector 
                    onSelectAddress={setSelectedAddress}
                    selectedAddressId={selectedAddress?.id}
                  />
                </CardContent>
              </Card>

              {/* Payment and Notes */}
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Phương thức thanh toán</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cod" id="cod" />
                                  <label htmlFor="cod" className="cursor-pointer">
                                    Thanh toán khi nhận hàng (COD)
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="bank_transfer" id="bank" />
                                  <label htmlFor="bank" className="cursor-pointer">
                                    Chuyển khoản ngân hàng
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="e_wallet" id="wallet" />
                                  <label htmlFor="wallet" className="cursor-pointer">
                                    Ví điện tử (ZaloPay, Momo)
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <PaymentInfo paymentMethod={form.watch("paymentMethod")} />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi chú đơn hàng (tùy chọn)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={3}
                                placeholder="Ví dụ: Gọi chuông trước khi giao..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={!selectedAddress}
                      >
                        Xác nhận đặt hàng
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Đơn hàng của bạn</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.products.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(item.products.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-accent">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
