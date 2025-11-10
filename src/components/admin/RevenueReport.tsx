import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

type DateFilter = "day" | "week" | "month" | "quarter" | "year" | "custom";

const RevenueReport = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      let start = new Date();
      let end = new Date();

      if (dateFilter === "custom") {
        if (!startDate || !endDate) {
          alert("Vui lòng chọn ngày bắt đầu và kết thúc");
          setLoading(false);
          return;
        }
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        switch (dateFilter) {
          case "day":
            start.setDate(start.getDate() - 7);
            break;
          case "week":
            start.setDate(start.getDate() - 30);
            break;
          case "month":
            start.setMonth(start.getMonth() - 6);
            break;
          case "quarter":
            start.setMonth(start.getMonth() - 12);
            break;
          case "year":
            start.setFullYear(start.getFullYear() - 2);
            break;
        }
      }

      const { data } = await supabase
        .from("daily_revenue")
        .select("*")
        .gte("date", start.toISOString().split('T')[0])
        .lte("date", end.toISOString().split('T')[0])
        .order("date", { ascending: true });

      setRevenueData(data || []);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
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

  const totalRevenue = revenueData.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + Number(item.order_count || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo doanh thu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bộ lọc thời gian */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Khoảng thời gian</Label>
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Theo ngày (7 ngày)</SelectItem>
                <SelectItem value="week">Theo tuần (30 ngày)</SelectItem>
                <SelectItem value="month">Theo tháng (6 tháng)</SelectItem>
                <SelectItem value="quarter">Theo quý (1 năm)</SelectItem>
                <SelectItem value="year">Theo năm (2 năm)</SelectItem>
                <SelectItem value="custom">Tùy chọn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <Button onClick={fetchRevenueReport} disabled={loading} className="w-full">
              {loading ? "Đang tải..." : "Xem báo cáo"}
            </Button>
          </div>
        </div>

        {revenueData.length > 0 && (
          <>
            {/* Bảng tổng hợp */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giá trị đơn TB</p>
                <p className="text-2xl font-bold">{avgOrderValue.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            {/* Biểu đồ */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Bảng chi tiết */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Ngày</th>
                    <th className="p-3 text-right">Số đơn</th>
                    <th className="p-3 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-right">{item.order_count}</td>
                      <td className="p-3 text-right font-semibold">
                        {Number(item.total_revenue).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueReport;
