import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminOrders = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchOrders();
  }, [userRole, filterStatus]);

  const fetchOrders = async () => {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus as any);
    }

    const { data } = await query;
    setOrders(data || []);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái đơn hàng thành công",
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
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

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone?.includes(searchTerm)
  );

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Quản lý và cập nhật trạng thái đơn hàng</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo mã đơn, tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
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

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-bold text-lg mb-2">{order.order_number}</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Khách hàng:</span> {order.full_name}</p>
                    <p><span className="font-medium">SĐT:</span> {order.phone}</p>
                    <p><span className="font-medium">Địa chỉ:</span> {order.address_line}, {order.district}, {order.city}</p>
                    <p><span className="font-medium">Phương thức:</span> {order.payment_method === 'e_wallet' ? 'Ví điện tử' : 'Chuyển khoản'}</p>
                    {order.notes && (
                      <p><span className="font-medium">Ghi chú:</span> {order.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-2xl text-accent mb-2">
                      {order.total_amount.toLocaleString()}đ
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {getStatusBadge(order.status)}
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cập nhật trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="shipping">Đang giao</SelectItem>
                        <SelectItem value="delivered">Đã giao</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
