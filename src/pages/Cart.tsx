import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  notes: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, price, image_url)")
        .eq("user_id", user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast({
        title: "Đã xóa",
        description: "Sản phẩm đã được xóa khỏi giỏ hàng",
      });
      fetchCartItems();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.products.price * item.quantity,
      0
    );
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Giỏ hàng của tôi
          </h1>

          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-4">
                  Giỏ hàng của bạn đang trống
                </p>
                <Button onClick={() => navigate("/products")}>
                  Khám phá thực đơn
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <img
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">
                            {item.products.name}
                          </h3>
                          <p className="text-accent font-semibold mb-4">
                            {formatPrice(item.products.price)}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mb-4">
                              Ghi chú: {item.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold">Tổng cộng</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span className="font-semibold">
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Tổng:</span>
                          <span className="text-accent">
                            {formatPrice(calculateTotal())}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => navigate("/checkout")}
                    >
                      Tiến hành đặt hàng
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/products")}
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
