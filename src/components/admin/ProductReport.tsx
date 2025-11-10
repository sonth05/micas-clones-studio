import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpDown } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

type SortBy = "revenue" | "quantity";

const ProductReport = () => {
  const [productStats, setProductStats] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("revenue");

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    const { data } = await supabase
      .from("product_sales_stats")
      .select("*")
      .order("total_revenue", { ascending: false });

    setProductStats(data || []);
  };

  const sortedProducts = [...productStats].sort((a, b) => {
    if (sortBy === "revenue") {
      return Number(b.total_revenue || 0) - Number(a.total_revenue || 0);
    }
    return Number(b.total_quantity_sold || 0) - Number(a.total_quantity_sold || 0);
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sortedProducts.map(item => ({
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Báo cáo sản phẩm</CardTitle>
        <Button variant="outline" size="sm" onClick={exportToExcel}>
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button
            variant={sortBy === "revenue" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("revenue")}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sắp xếp theo doanh thu
          </Button>
          <Button
            variant={sortBy === "quantity" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("quantity")}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sắp xếp theo số lượng
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-right">Số đơn</th>
                <th className="p-3 text-right">Số lượng bán</th>
                <th className="p-3 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product, index) => (
                <tr key={product.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-muted-foreground">#{index + 1}</span>
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">{product.total_orders || 0}</td>
                  <td className="p-3 text-right">{product.total_quantity_sold || 0}</td>
                  <td className="p-3 text-right font-semibold text-primary">
                    {Number(product.total_revenue || 0).toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductReport;
