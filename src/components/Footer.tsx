const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-accent">K</span>-Spice
            </h3>
            <p className="text-primary-foreground/80">
              Mang hương vị Hàn Quốc chính gốc đến gần hơn với bạn
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#menu" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Thực đơn
                </a>
              </li>
              <li>
                <a href="#locations" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Chi nhánh
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80">Đặt bàn trực tuyến</li>
              <li className="text-primary-foreground/80">Giao hàng tận nơi</li>
              <li className="text-primary-foreground/80">Tổ chức tiệc</li>
              <li className="text-primary-foreground/80">Nhượng quyền</li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-bold mb-4">Giờ mở cửa</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Thứ 2 - Thứ 6: 10:00 - 22:00</li>
              <li>Thứ 7 - Chủ nhật: 10:00 - 23:00</li>
              <li className="mt-4">
                <span className="font-semibold text-accent">Hotline:</span> 1900 1234
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
          <p>&copy; 2024 K-Spice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
