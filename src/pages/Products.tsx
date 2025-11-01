import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  spicy_level: number;
  category_id: string;
  is_available: boolean;
  categories: {
    name: string;
  };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thực Đơn <span className="text-gradient-gold">K-Spice</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Khám phá hương vị Hàn Quốc đặc sắc
            </p>
          </div>

          <div className="grid md:grid-cols-[250px_1fr] gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Tìm kiếm</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Tìm món ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Danh mục</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="text-center py-12">Đang tải...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">Không tìm thấy sản phẩm</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        {product.spicy_level > 0 && (
                          <Badge className="absolute top-4 right-4">
                            {"🌶️".repeat(product.spicy_level)}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-2">
                          {product.categories?.name}
                        </Badge>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-2xl font-bold text-accent">
                          {formatPrice(product.price)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
