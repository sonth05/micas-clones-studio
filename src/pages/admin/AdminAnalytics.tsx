import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import RevenueReport from "@/components/admin/RevenueReport";
import ProductReport from "@/components/admin/ProductReport";
import CustomerStats from "@/components/admin/CustomerStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminAnalytics = () => {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchStats();
  }, [userRole]);

  const fetchStats = async () => {
    const [ordersResult, customersResult, productsResult] = await Promise.all([
      supabase.from("orders").select("total_amount").eq("status", "delivered"),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }).eq("is_deleted", false),
    ]);

    const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    setStats({
      totalOrders: ordersResult.data?.length || 0,
      totalRevenue,
      totalCustomers: customersResult.count || 0,
      totalProducts: productsResult.count || 0,
    });
  };

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground">Tổng quan về hoạt động kinh doanh</p>
        </div>

        {/* Tổng quan */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng đơn hàng"
            value={stats.totalOrders}
            icon={ShoppingBag}
          />
          <StatsCard
            title="Doanh thu"
            value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
          />
          <StatsCard
            title="Khách hàng"
            value={stats.totalCustomers}
            icon={Users}
          />
          <StatsCard
            title="Sản phẩm"
            value={stats.totalProducts}
            icon={Package}
          />
        </div>

        {/* Các báo cáo */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="revenue">Báo cáo doanh thu</TabsTrigger>
            <TabsTrigger value="products">Báo cáo sản phẩm</TabsTrigger>
            <TabsTrigger value="customers">Thống kê khách hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <RevenueReport />
          </TabsContent>

          <TabsContent value="products">
            <ProductReport />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerStats />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
