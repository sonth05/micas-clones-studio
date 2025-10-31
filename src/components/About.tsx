import restaurantInterior from "@/assets/restaurant-interior.jpg";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img
              src={restaurantInterior}
              alt="Restaurant Interior"
              className="rounded-lg shadow-elegant w-full h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-accent text-foreground p-6 rounded-lg shadow-glow">
              <div className="text-4xl font-bold">200+</div>
              <div className="text-sm font-semibold">Chi nhánh toàn quốc</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Về <span className="text-gradient-gold">K-Spice</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Với niềm đam mê nền ẩm thực Hàn Quốc và quyết tâm đưa những "tinh hoa ẩm thực" 
                của xứ sở kim chi về Việt Nam, thương hiệu K-Spice được ra đời vào năm 2016.
              </p>
              <p>
                Từ một cửa hàng nhỏ với diện tích 80m², đến nay chúng tôi đã phát triển hơn 
                200 chi nhánh trên toàn quốc, phục vụ hàng triệu thực khách mỗi năm.
              </p>
              <p className="font-semibold text-foreground">
                Cam kết của chúng tôi:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nguyên liệu tươi ngon, nhập khẩu từ Hàn Quốc</li>
                <li>Công thức chế biến truyền thống, đảm bảo hương vị đúng chuẩn</li>
                <li>Đội ngũ đầu bếp chuyên nghiệp, được đào tạo bài bản</li>
                <li>Không gian hiện đại, sạch sẽ, phục vụ tận tâm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
