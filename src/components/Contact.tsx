import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Liên Hệ <span className="text-gradient-gold">Với Chúng Tôi</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Chúng tôi luôn sẵn sàng lắng nghe và phục vụ bạn
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full flex-shrink-0">
                  <Phone className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Hotline</h3>
                  <p className="text-muted-foreground">1900 1234 (24/7)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full flex-shrink-0">
                  <Mail className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">contact@kspice.vn</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full flex-shrink-0">
                  <MapPin className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Trụ sở chính</h3>
                  <p className="text-muted-foreground">39 Yên Lãng, Đống Đa, Hà Nội</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h3 className="font-semibold text-foreground mb-4">Theo dõi chúng tôi</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="flex items-center justify-center w-12 h-12 bg-accent hover:bg-accent/90 rounded-full transition-all shadow-glow"
                  aria-label="Facebook"
                >
                  <Facebook className="text-foreground" size={24} />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-12 h-12 bg-accent hover:bg-accent/90 rounded-full transition-all shadow-glow"
                  aria-label="Instagram"
                >
                  <Instagram className="text-foreground" size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-lg shadow-elegant">
            <h3 className="text-2xl font-bold text-foreground mb-6">Gửi tin nhắn</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Nội dung *
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-foreground font-bold py-4 rounded-lg shadow-glow transition-all hover:shadow-xl"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
