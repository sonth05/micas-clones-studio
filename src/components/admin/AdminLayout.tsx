import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/analytics",
      icon: LayoutDashboard,
    },
    {
      title: "Sản phẩm",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Đơn hàng",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      title: "Thống kê",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col fixed left-0 top-0 bottom-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold">
            <span className="text-accent">K</span>-Spice Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-primary/80"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/20">
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
