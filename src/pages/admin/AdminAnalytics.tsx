import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, Package, Download } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchStats();
    fetchRevenueData();
    fetchProductStats();
    fetchOrderStatusData();
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

  const fetchOrderStatusData = async () => {
    const statusLabels: Record<string, string> = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };

    const { data } = await supabase
      .from("orders")
      .select("status");

    if (data) {
      const statusCount = data.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCount).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count as number,
      }));

      setOrderStatusData(chartData);
    }
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

        <div className="space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Biểu đồ doanh thu 30 ngày</CardTitle>
              <Button variant="outline" size="sm" onClick={exportRevenueToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString()}đ`, 'Doanh thu']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    name="Doanh thu"
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Products Bar Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top sản phẩm bán chạy</CardTitle>
                <Button variant="outline" size="sm" onClick={exportProductsToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productStats.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toLocaleString()}đ`, 'Doanh thu']}
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

            {/* Order Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
