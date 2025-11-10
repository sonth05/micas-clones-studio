import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, ShoppingCart, ArrowRight, DollarSign, Users } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchDashboardData();
    }
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { data: orders } = await supabase.from("orders").select("total_amount, status");
      const { data: profiles } = await supabase.from("profiles").select("id");
      const { data: products } = await supabase.from("products").select("id").eq("is_deleted", false);

      const deliveredOrders = orders?.filter(o => o.status === "delivered") || [];
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalCustomers: profiles?.length || 0,
        totalProducts: products?.length || 0,
      });

      // Fetch revenue chart data (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: revenue } = await supabase
        .from("daily_revenue")
        .select("*")
        .gte("date", sevenDaysAgo.toISOString().split('T')[0])
        .order("date", { ascending: true });

      setRevenueData(revenue || []);

      // Fetch top products
      const { data: productStats } = await supabase
        .from("product_sales_stats")
        .select("*")
        .order("total_revenue", { ascending: false })
        .limit(5);

      setTopProducts(productStats || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

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
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Bảng điều khiển</h1>
          <p className="text-muted-foreground">Tổng quan về hoạt động kinh doanh</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Tổng đơn hàng"
            value={stats.totalOrders}
            icon={ShoppingCart}
            className="bg-gradient-to-br from-primary/5 to-primary/10"
          />
          <StatsCard
            title="Doanh thu"
            value={`${stats.totalRevenue.toLocaleString('vi-VN')}đ`}
            icon={DollarSign}
            className="bg-gradient-to-br from-green-500/5 to-green-500/10"
          />
          <StatsCard
            title="Khách hàng"
            value={stats.totalCustomers}
            icon={Users}
            className="bg-gradient-to-br from-blue-500/5 to-blue-500/10"
          />
          <StatsCard
            title="Sản phẩm"
            value={stats.totalProducts}
            icon={Package}
            className="bg-gradient-to-br from-orange-500/5 to-orange-500/10"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu 7 ngày qua</CardTitle>
              <CardDescription>Biểu đồ doanh thu theo ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    name="Doanh thu"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
              <CardDescription>Xếp hạng theo doanh thu</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="total_revenue" 
                    name="Doanh thu"
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Chức năng quản trị</h2>
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
