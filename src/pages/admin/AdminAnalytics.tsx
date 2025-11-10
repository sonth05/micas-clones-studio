import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, Package, Download } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import * as XLSX from 'xlsx';

const AdminAnalytics = () => {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<any[]>([]);

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchStats();
    fetchRevenueData();
    fetchProductStats();
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

  const fetchRevenueData = async () => {
    const { data } = await supabase
      .from("daily_revenue")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    setRevenueData(data || []);
  };

  const fetchProductStats = async () => {
    const { data } = await supabase
      .from("product_sales_stats")
      .select("*")
      .order("total_revenue", { ascending: false })
      .limit(10);

    setProductStats(data || []);
  };

  const exportRevenueToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      revenueData.map(item => ({
        'Ngày': new Date(item.date).toLocaleDateString('vi-VN'),
        'Số đơn hàng': item.order_count,
        'Doanh thu': Number(item.total_revenue).toLocaleString('vi-VN') + 'đ'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh thu");
    XLSX.writeFile(workbook, `bao-cao-doanh-thu-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportProductsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      productStats.map(item => ({
        'Sản phẩm': item.name,
        'Số đơn hàng': item.total_orders || 0,
        'Số lượng bán': item.total_quantity_sold || 0,
        'Doanh thu': Number(item.total_revenue || 0).toLocaleString('vi-VN') + 'đ'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");
    XLSX.writeFile(workbook, `bao-cao-san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
              <Button variant="outline" size="sm" onClick={exportRevenueToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueData.slice(0, 10).map((item) => (
                  <div key={item.date} className="flex justify-between items-center">
                    <span className="text-sm">
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold">
                        {Number(item.total_revenue).toLocaleString()}đ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.order_count} đơn
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top 10 sản phẩm bán chạy</CardTitle>
              <Button variant="outline" size="sm" onClick={exportProductsToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productStats.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.total_quantity_sold || 0} đã bán
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      {Number(item.total_revenue || 0).toLocaleString()}đ
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
