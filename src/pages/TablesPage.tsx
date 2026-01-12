import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import {
  Search,
  SlidersHorizontal,
  Users,
  UtensilsCrossed,
  ChevronDown,
  X,
  Loader2,
  MapPin,
} from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "occupied", label: "Occupied" },
];

const capacityOptions = [
  { value: "all", label: "Any Capacity" },
  { value: "1-2", label: "1-2 guests" },
  { value: "3-4", label: "3-4 guests" },
  { value: "5-6", label: "5-6 guests" },
  { value: "7+", label: "7+ guests" },
];

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCapacity, setSelectedCapacity] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"number" | "capacity">("number");

  useEffect(() => {
    const loadTables = async () => {
      try {
        setIsLoading(true);
        const filters: any = {};
        if (selectedStatus !== "all") {
          filters.status = selectedStatus;
        }
        const response = await api.getTables(filters);
        setTables(response.tables || []);
      } catch (error) {
        console.error("Failed to load tables:", error);
        setTables([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, [selectedStatus]);

  const filteredTables = tables
    .filter((table) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          table.table_number.toLowerCase().includes(query) ||
          (table.description && table.description.toLowerCase().includes(query)) ||
          (table.location && table.location.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter((table) => {
      // Capacity filter
      if (selectedCapacity !== "all") {
        if (selectedCapacity === "7+") {
          return table.capacity >= 7;
        }
        const [min, max] = selectedCapacity.split("-").map((c) => parseInt(c));
        return table.capacity >= min && table.capacity <= max;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "number":
          return a.table_number.localeCompare(b.table_number);
        case "capacity":
          return a.capacity - b.capacity;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success";
      case "reserved":
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
              backgroundImage: `url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920")`,
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
              Our <span className="text-gradient-gold">Tables</span>
            </h1>
            <p className="text-cream/80 max-w-2xl mx-auto">
              Reserve your perfect table for an unforgettable dining experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {showFilters ? (
                <X className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-card rounded-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Capacity</label>
                  <select
                    value={selectedCapacity}
                    onChange={(e) => setSelectedCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {capacityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "number" | "capacity")}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="number">Table Number</option>
                    <option value="capacity">Capacity</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Tables Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-16">
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tables found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTables.map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                >
                  <div className="relative h-64 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <UtensilsCrossed className="w-24 h-24 text-accent/30" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur text-xs font-medium">
                        Table {table.table_number}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          table.status
                        )}`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      Table {table.table_number}
                    </h3>
                    {table.location && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{table.location}</span>
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {table.description || "Perfect for your dining experience"}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{table.capacity} guests</span>
                      </div>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      className="w-full"
                      asChild
                      disabled={table.status !== "available"}
                    >
                      <Link to={`/tables/${table.id}`}>
                        {table.status === "available" ? "Reserve Now" : "View Details"}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}






