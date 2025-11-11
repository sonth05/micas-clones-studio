import { useState } from "react";
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleSignOut = async () => {
    setShowLogoutDialog(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowLogoutDialog(false);
    navigate('/');
  };

  const customerMenuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Thực đơn", href: "/products" },
    { label: "Giới thiệu", href: "/#about" },
    { label: "Chi nhánh", href: "/#locations" },
    { label: "Liên hệ", href: "/#contact" },
  ];

  const adminMenuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Quản lý sản phẩm", href: "/admin/products" },
    { label: "Quản lý đơn hàng", href: "/admin/orders" },
    { label: "Thống kê", href: "/admin/analytics" },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : customerMenuItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-foreground">
              <span className="text-accent">K</span>-Spice
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-primary-foreground hover:text-accent transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                {userRole === 'customer' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:text-accent"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin/analytics')}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Quản trị
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      Tài khoản của tôi
                    </DropdownMenuItem>
                    {userRole === 'customer' && (
                      <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                        Đơn hàng của tôi
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                className="bg-accent hover:bg-accent/90 text-foreground font-semibold"
                onClick={() => navigate('/auth')}
              >
                Đăng nhập
              </Button>
            )}
          </nav>

          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <nav className="md:hidden py-4 border-t border-primary-foreground/20">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block text-primary-foreground hover:text-accent transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="space-y-2 mt-4">
                {userRole === 'admin' && (
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-foreground"
                    onClick={() => {
                      navigate('/admin/analytics');
                      setIsOpen(false);
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Quản trị
                  </Button>
                )}
                {userRole === 'customer' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      navigate('/cart');
                      setIsOpen(false);
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Giỏ hàng
                  </Button>
                )}
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    navigate('/account');
                    setIsOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Tài khoản
                </Button>
                {userRole === 'customer' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      navigate('/my-orders');
                      setIsOpen(false);
                    }}
                  >
                    Đơn hàng của tôi
                  </Button>
                )}
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-foreground"
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Button
                className="w-full mt-4 bg-accent hover:bg-accent/90 text-foreground"
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }}
              >
                Đăng nhập
              </Button>
            )}
          </nav>
        )}
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSignOut}>Đăng xuất</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;
