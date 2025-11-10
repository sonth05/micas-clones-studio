import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const productSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  description: z.string().optional(),
  price: z.string().min(1, "Vui lòng nhập giá"),
  category_id: z.string().min(1, "Vui lòng chọn danh mục"),
  image_url: z.string().optional(),
  spicy_level: z.string().optional(),
});

const AdminProducts = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category_id: "",
      image_url: "",
      spicy_level: "0",
    },
  });

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchProducts();
    fetchCategories();
  }, [userRole]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      const productData = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        category_id: values.category_id,
        image_url: values.image_url,
        spicy_level: values.spicy_level ? parseInt(values.spicy_level) : 0,
        is_available: true,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Cập nhật sản phẩm thành công",
        });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Thêm sản phẩm thành công",
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url || "",
      spicy_level: product.spicy_level?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_deleted: true })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Xóa sản phẩm thành công",
      });

      fetchProducts();
      setDeleteProductId(null);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Quản lý sản phẩm</h1>
            <p className="text-muted-foreground">Quản lý danh mục sản phẩm của cửa hàng</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  form.reset();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá (VNĐ)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL hình ảnh</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spicy_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Độ cay (0-5)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map((level) => (
                              <SelectItem key={level} value={level.toString()}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">
                      {editingProduct ? "Cập nhật" : "Thêm mới"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <img
                src={p.image_url || "/placeholder.svg"}
                className="w-full h-48 object-cover"
                alt={p.name}
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                <p className="text-accent font-semibold mb-2">
                  {p.price.toLocaleString()}đ
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {p.categories?.name}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(p)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleteProductId(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này không? Sản phẩm sẽ bị ẩn khỏi danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
