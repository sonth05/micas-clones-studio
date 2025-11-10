import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerStat {
  user_id: string;
  full_name: string;
  email: string;
  order_count: number;
  total_spent: number;
}

const CustomerStats = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [avgOrdersPerCustomer, setAvgOrdersPerCustomer] = useState(0);
  const [loyalCustomers, setLoyalCustomers] = useState<CustomerStat[]>([]);

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    // Tổng số khách hàng
    const { count: customerCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    setTotalCustomers(customerCount || 0);

    // Thống kê đơn hàng theo khách hàng
    const { data: ordersData } = await supabase
      .from("orders")
      .select("user_id, total_amount, profiles(full_name, email)")
      .eq("status", "delivered");

    if (ordersData) {
      // Tính số đơn hàng trung bình
      const userOrders = ordersData.reduce((acc: any, order) => {
        if (!acc[order.user_id]) {
          acc[order.user_id] = {
            count: 0,
            total: 0,
            full_name: (order.profiles as any)?.full_name || "N/A",
            email: (order.profiles as any)?.email || "N/A"
          };
        }
        acc[order.user_id].count += 1;
        acc[order.user_id].total += Number(order.total_amount);
        return acc;
      }, {});

      const uniqueCustomers = Object.keys(userOrders).length;
      const totalOrders = ordersData.length;
      setAvgOrdersPerCustomer(uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0);

      // Top khách hàng thân thiết
      const topCustomers = Object.entries(userOrders)
        .map(([user_id, data]: [string, any]) => ({
          user_id,
          full_name: data.full_name,
          email: data.email,
          order_count: data.count,
          total_spent: data.total
        }))
        .sort((a, b) => b.order_count - a.order_count)
        .slice(0, 10);

      setLoyalCustomers(topCustomers);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê khách hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tổng quan */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Tổng khách hàng</p>
            </div>
            <p className="text-2xl font-bold">{totalCustomers}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Đơn hàng TB/khách</p>
            </div>
            <p className="text-2xl font-bold">{avgOrdersPerCustomer.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Khách hàng thân thiết</p>
            </div>
            <p className="text-2xl font-bold">{loyalCustomers.length}</p>
          </div>
        </div>

        {/* Danh sách khách hàng thân thiết */}
        <div>
          <h3 className="font-semibold mb-3">Top 10 khách hàng thân thiết</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-right">Số đơn hàng</th>
                  <th className="p-3 text-right">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody>
                {loyalCustomers.map((customer, index) => (
                  <tr key={customer.user_id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.full_name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-sm font-medium">
                        <ShoppingBag className="h-3 w-3" />
                        {customer.order_count}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-primary">
                      {customer.total_spent.toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerStats;
