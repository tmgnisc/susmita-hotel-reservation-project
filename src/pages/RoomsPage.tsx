import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { mockRooms } from "@/data/mockData";
import { Room, RoomType } from "@/types";
import {
  Search,
  SlidersHorizontal,
  Users,
  Bed,
  ChevronDown,
  Star,
  X,
} from "lucide-react";

const roomTypes: { value: RoomType | "all"; label: string }[] = [
  { value: "all", label: "All Rooms" },
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "penthouse", label: "Penthouse" },
];

const priceRanges = [
  { value: "all", label: "Any Price" },
  { value: "0-200", label: "$0 - $200" },
  { value: "200-400", label: "$200 - $400" },
  { value: "400-800", label: "$400 - $800" },
  { value: "800+", label: "$800+" },
];

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<RoomType | "all">("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">("price-asc");

  const filteredRooms = mockRooms
    .filter((room) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          room.name.toLowerCase().includes(query) ||
          room.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((room) => {
      // Type filter
      if (selectedType !== "all") {
        return room.type === selectedType;
      }
      return true;
    })
    .filter((room) => {
      // Price filter
      if (selectedPrice !== "all") {
        const [min, max] = selectedPrice.split("-").map((p) => parseInt(p) || Infinity);
        return room.price >= min && room.price <= max;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success";
      case "booked":
        return "bg-warning/20 text-warning";
      case "occupied":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">
              Our <span className="text-gradient-gold">Rooms & Suites</span>
            </h1>
            <p className="text-cream/80 max-w-2xl mx-auto">
              Discover our collection of luxurious accommodations, each designed
              to provide the ultimate comfort and elegance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 lg:top-20 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RoomType | "all")}
                className="px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pt-4 space-y-3"
            >
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RoomType | "all")}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background"
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </motion.div>
          )}
        </div>
      </section>

      {/* Room Grid */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredRooms.length}</span> rooms
          </p>
          {(selectedType !== "all" || selectedPrice !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedType("all");
                setSelectedPrice("all");
                setSearchQuery("");
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur text-xs font-medium capitalize">
                    {room.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-card/90 backdrop-blur text-xs">
                    <Users className="w-3 h-3" />
                    {room.capacity}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-card/90 backdrop-blur text-xs">
                    <Bed className="w-3 h-3" />
                    Floor {room.floor}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {room.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-2xl font-display font-bold text-foreground">
                      ${room.price}
                    </span>
                    <span className="text-muted-foreground text-sm"> / night</span>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={room.status !== "available"}
                    asChild={room.status === "available"}
                  >
                    {room.status === "available" ? (
                      <Link to={`/rooms/${room.id}`}>Book Now</Link>
                    ) : (
                      <span>Unavailable</span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No rooms found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedType("all");
                setSelectedPrice("all");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
