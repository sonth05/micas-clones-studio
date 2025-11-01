import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminAnalytics = () => {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0 });

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchStats();
  }, [userRole]);

  const fetchStats = async () => {
    const { data: orders } = await supabase.from("orders").select("total_amount").eq("status", "delivered");
    const { data: customers } = await supabase.from("profiles").select("id");
    
    setStats({
      totalOrders: orders?.length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
      totalCustomers: customers?.length || 0,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Thống kê & Báo cáo</h1>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tổng đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">
                  {stats.totalRevenue.toLocaleString()}đ
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalytics;
