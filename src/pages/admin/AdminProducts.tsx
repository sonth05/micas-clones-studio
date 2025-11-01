import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus } from "lucide-react";

const AdminProducts = () => {
  const { userRole } = useAuth();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchProducts();
  }, [userRole]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*, categories(name)");
    setProducts(data || []);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Quản lý sản phẩm</h1>
            <Button><Plus className="mr-2 h-4 w-4" />Thêm sản phẩm</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p) => (
              <Card key={p.id} className="p-4">
                <img src={p.image_url} className="w-full h-48 object-cover rounded mb-4" />
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-accent">{p.price.toLocaleString()}đ</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminProducts;
