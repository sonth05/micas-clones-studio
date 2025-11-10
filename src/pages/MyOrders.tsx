import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, filterStatus]);

  const fetchOrders = async () => {
    let query = supabase
      .from("orders")
      .select("*, order_items(*, products(name))")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus as any);
    }

    const { data } = await query;
    setOrders(data || []);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled" as const,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id,
        })
        .eq("id", orderId)
        .eq("status", "pending");

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đơn hàng đã được hủy",
      });

      fetchOrders();
      setCancelOrderId(null);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy đơn hàng",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      processing: "default",
      shipping: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    
    const labels: any = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Đơn hàng của tôi</h1>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="font-bold">Mã: {order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(order.status)}
                        {order.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCancelOrderId(order.id)}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.products?.name || item.product_name} x {item.quantity}</span>
                          <span>{item.subtotal.toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-medium">Tổng cộng:</span>
                      <p className="text-xl font-bold text-accent">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.total_amount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelOrderId && handleCancelOrder(cancelOrderId)}>
              Hủy đơn hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyOrders;
