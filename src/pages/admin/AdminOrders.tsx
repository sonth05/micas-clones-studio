import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminOrders = () => {
  const { userRole } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchOrders();
  }, [userRole]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Quản lý đơn hàng</h1>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">{order.order_number}</p>
                    <p>{order.full_name} - {order.phone}</p>
                  </div>
                  <div>
                    <Badge>{order.status}</Badge>
                    <p className="font-bold text-accent">{order.total_amount.toLocaleString()}đ</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminOrders;
