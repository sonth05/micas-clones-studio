import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, ShoppingCart, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  if (userRole !== 'admin') {
    return null;
  }

  const features = [
    {
      title: "Thống kê & Báo cáo",
      description: "Xem báo cáo doanh thu, sản phẩm và khách hàng chi tiết",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Quản lý sản phẩm",
      description: "Thêm, sửa, xóa sản phẩm và quản lý danh mục",
      icon: Package,
      path: "/admin/products",
      color: "bg-accent/10 text-accent"
    },
    {
      title: "Quản lý đơn hàng",
      description: "Theo dõi và cập nhật trạng thái đơn hàng",
      icon: ShoppingCart,
      path: "/admin/orders",
      color: "bg-secondary/10 text-secondary"
    }
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Chào mừng đến với trang quản trị</h1>
          <p className="text-muted-foreground">Chọn chức năng bạn muốn sử dụng</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.path}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(feature.path);
                    }}
                  >
                    Truy cập
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
