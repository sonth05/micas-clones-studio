import { Card } from "@/components/ui/card";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";

const Menu = () => {
  const dishes = [
    {
      id: 1,
      name: "Mì Cay Truyền Thống",
      description: "Mì cay đặc biệt với nước dùng cay nồng, thịt bò, trứng và rau củ tươi ngon",
      price: "65.000đ",
      image: dish1,
      spicy: 3,
    },
    {
      id: 2,
      name: "Mì Cay Hải Sản",
      description: "Mì cay kết hợp hải sản tươi sống: tôm, mực, ngao trong nước dùng đậm đà",
      price: "85.000đ",
      image: dish2,
      spicy: 4,
    },
    {
      id: 3,
      name: "Mì Cay Phô Mai",
      description: "Mì cay đặc biệt phủ lớp phô mai tan chảy, hòa quyện hương vị độc đáo",
      price: "75.000đ",
      image: dish3,
      spicy: 3,
    },
  ];

  return (
    <section id="menu" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Thực Đơn <span className="text-gradient-gold">Đặc Biệt</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá những món ăn đặc sắc được yêu thích nhất tại K-Spice
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {dishes.map((dish) => (
            <Card
              key={dish.id}
              className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                {/* Spicy Level Badge */}
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {"🌶️".repeat(dish.spicy)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{dish.name}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{dish.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-accent">{dish.price}</span>
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:bg-secondary transition-colors">
                    Đặt món
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-accent hover:bg-accent/90 text-foreground font-bold px-8 py-4 rounded-lg text-lg shadow-glow transition-all hover:shadow-xl">
            Xem thực đơn đầy đủ
          </button>
        </div>
      </div>
    </section>
  );
};

export default Menu;
