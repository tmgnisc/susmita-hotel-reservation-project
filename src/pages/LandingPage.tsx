import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { api, ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";

const amenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Car, label: "Free Parking" },
  { icon: Utensils, label: "Fine Dining" },
  { icon: Dumbbell, label: "Fitness Center" },
  { icon: Waves, label: "Infinity Pool" },
  { icon: Sparkles, label: "Spa & Wellness" },
];

export default function LandingPage() {
  const [featuredTables, setFeaturedTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setIsLoading(true);
        const response = await api.getTables({ status: "available" });
        // Get first 6 available tables
        setFeaturedTables((response.tables || []).slice(0, 6));
      } catch (error) {
        console.error("Failed to load tables:", error);
        setFeaturedTables([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />

        {/* Content */}
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent mb-8"
            >
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Award-Winning Luxury Hotel</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6"
            >
              Experience{" "}
              <span className="text-gradient-gold">Unparalleled</span>
              <br />
              Luxury & Comfort
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-10"
            >
              Discover a world where elegance meets tranquility. Immerse yourself in
              breathtaking views, world-class dining, and personalized service.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="gold" size="xl" asChild>
                <Link to="/rooms">
                  Explore Rooms
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/dining">View Dining</Link>
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-16"
            >
              {[
                { value: "150+", label: "Luxury Rooms" },
                { value: "4.9", label: "Guest Rating" },
                { value: "24/7", label: "Concierge" },
                { value: "10+", label: "Years Excellence" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-display font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-cream/60">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-cream/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-accent"
            />
          </div>
        </motion.div>
      </section>

      {/* Reservation Bar */}
      <section className="relative -mt-12 z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time
              </label>
              <input
                type="time"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guests
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="gold" size="lg" className="w-full" asChild>
                <Link to="/tables">Find Table</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Amenities Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            World-Class <span className="text-gradient-gold">Amenities</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every detail has been thoughtfully crafted to ensure your stay is nothing
            short of extraordinary.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {amenities.map((amenity, index) => (
            <motion.div
              key={amenity.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <amenity.icon className="w-7 h-7 text-accent" />
              </div>
              <p className="text-sm font-medium text-foreground">{amenity.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Tables */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Available <span className="text-gradient-gold">Tables</span>
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Reserve your perfect table for an unforgettable dining experience.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/tables">
                View All Tables
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : featuredTables.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No tables available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTables.map((table, index) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-accent/20 to-primary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="w-24 h-24 text-accent/30" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur text-xs font-medium">
                      Table {table.table_number}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        table.status === "available"
                          ? "bg-success/20 text-success"
                          : table.status === "reserved"
                          ? "bg-warning/20 text-warning"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {table.status === "available" ? "Available" : table.status === "reserved" ? "Reserved" : "Occupied"}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Table {table.table_number}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {table.description || "Perfect for your dining experience"}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{table.capacity} guests</span>
                    </div>
                    {table.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{table.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <Button variant="gold" size="sm" asChild>
                      <Link to={`/tables/${table.id}`}>Reserve Now</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-accent fill-current" />
            ))}
          </div>
          <blockquote className="font-display text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
            "An absolutely magnificent experience. The attention to detail, the
            impeccable service, and the stunning views made our anniversary
            unforgettable. LuxeStay truly defines luxury hospitality."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                alt="Guest"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Emily Thompson</p>
              <p className="text-sm text-muted-foreground">Guest from New York</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-cream mb-6">
              Ready to Experience <span className="text-gradient-gold">Luxury</span>?
            </h2>
            <p className="text-cream/80 text-lg mb-10">
              Book your stay today and discover why our guests return year after year.
              Special rates available for extended stays.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gold" size="xl" asChild>
                <Link to="/rooms">
                  Book Your Stay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/auth">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
