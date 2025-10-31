import { MapPin, Phone, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const Locations = () => {
  const locations = [
    {
      id: 1,
      city: "Hà Nội",
      address: "39 Yên Lãng, Đống Đa",
      phone: "024 1234 5678",
      hours: "10:00 - 22:00",
    },
    {
      id: 2,
      city: "Hồ Chí Minh",
      address: "123 Nguyễn Huệ, Quận 1",
      phone: "028 1234 5678",
      hours: "10:00 - 23:00",
    },
    {
      id: 3,
      city: "Đà Nẵng",
      address: "45 Trần Phú, Hải Châu",
      phone: "0236 123 4567",
      hours: "10:00 - 22:30",
    },
  ];

  return (
    <section id="locations" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Chi Nhánh <span className="text-gradient-gold">K-Spice</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hơn 200 chi nhánh trên toàn quốc, sẵn sàng phục vụ bạn
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                  <MapPin className="text-accent" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{location.city}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="text-muted-foreground mt-1 flex-shrink-0" size={20} />
                  <span className="text-muted-foreground">{location.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground flex-shrink-0" size={20} />
                  <span className="text-muted-foreground">{location.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-muted-foreground flex-shrink-0" size={20} />
                  <span className="text-muted-foreground">{location.hours}</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-primary hover:bg-secondary text-primary-foreground font-semibold py-3 rounded-lg transition-colors">
                Chỉ đường
              </button>
            </Card>
          ))}
        </div>

        {/* View All Locations */}
        <div className="text-center">
          <button className="bg-accent hover:bg-accent/90 text-foreground font-bold px-8 py-4 rounded-lg text-lg shadow-glow transition-all hover:shadow-xl">
            Xem tất cả chi nhánh
          </button>
        </div>
      </div>
    </section>
  );
};

export default Locations;
