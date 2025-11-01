import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  image_url: string;
  spicy_level: number;
  categories: {
    name: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", id)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from("cart_items")
          .update({
            quantity: existingItem.quantity + quantity,
            notes: notes || existingItem.notes,
          })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: id,
          quantity,
          notes,
        });

        if (error) throw error;
      }

      toast({
        title: "Thành công",
        description: "Đã thêm sản phẩm vào giỏ hàng",
      });
      navigate("/cart");
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

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="relative rounded-lg overflow-hidden shadow-elegant">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-[500px] object-cover"
                />
                {product.spicy_level > 0 && (
                  <Badge className="absolute top-4 right-4 text-lg px-4 py-2">
                    {"🌶️".repeat(product.spicy_level)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-2">
                  {product.categories?.name}
                </Badge>
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-accent mb-6">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mô tả</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {product.ingredients && (
                <div>
                  <h3 className="font-semibold mb-2">Nguyên liệu</h3>
                  <p className="text-muted-foreground">{product.ingredients}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Số lượng</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Ghi chú (tùy chọn)</h3>
                <Textarea
                  placeholder="Thêm ghi chú cho món ăn..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
