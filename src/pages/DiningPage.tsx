import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { FoodCategory, FoodItem } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories: { value: FoodCategory | "all"; label: string }[] = [
  { value: "all", label: "All Menu" },
  { value: "appetizer", label: "Appetizers" },
  { value: "main", label: "Main Courses" },
  { value: "dessert", label: "Desserts" },
  { value: "beverage", label: "Beverages" },
];

interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export default function DiningPage() {
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadFoodItems = async () => {
      try {
        setIsLoading(true);
        const filters: any = { available: true };
        if (selectedCategory !== "all") {
          filters.category = selectedCategory;
        }
        const response = await api.getFoodItems(filters);
        setFoodItems(response.items || []);
      } catch (error) {
        console.error("Failed to load food items:", error);
        setFoodItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFoodItems();
  }, [selectedCategory]);

  const filteredItems = foodItems
    .filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      }
      return true;
    });

  const addToCart = (item: FoodItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to order food.",
        variant: "destructive",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.foodItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.foodItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { foodItem: item, quantity: 1 }];
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.foodItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.foodItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const getCategoryIcon = (category: FoodCategory) => {
    switch (category) {
      case "appetizer":
        return "🥗";
      case "main":
        return "🍽️";
      case "dessert":
        return "🍰";
      case "beverage":
        return "🍷";
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
              backgroundImage: `url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920")`,
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
              Fine <span className="text-gradient-gold">Dining</span>
            </h1>
            <p className="text-cream/80 max-w-2xl mx-auto">
              Indulge in exquisite culinary creations prepared by our world-class chefs.
              Room service available 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs & Search */}
      <section className="sticky top-16 lg:top-20 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.value
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-12 container mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur text-xs font-medium">
                    {getCategoryIcon(item.category)} {item.category}
                  </span>
                </div>
                {!item.available && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <span className="px-4 py-2 rounded-lg bg-card text-foreground font-medium">
                      Currently Unavailable
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <span className="text-xl font-display font-bold text-accent shrink-0">
                    ${item.price}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {item.preparation_time || item.preparationTime || 0} min
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={!item.available}
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No items found.</p>
          </div>
        )}
      </section>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-4 rounded-full bg-accent text-accent-foreground shadow-gold hover:shadow-lg transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">{cartCount} items</span>
          <span className="font-display font-bold">${cartTotal.toFixed(2)}</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/50 z-50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-background shadow-lg"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-xl font-semibold">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.foodItem.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary"
                  >
                    <img
                      src={item.foodItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                      alt={item.foodItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.foodItem.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.foodItem.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.foodItem.id, -1)}
                        className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.foodItem.id, 1)}
                        className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display font-bold text-foreground">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <Button variant="gold" size="lg" className="w-full" asChild>
                    <Link to="/user/orders" onClick={() => setIsCartOpen(false)}>
                      Proceed to Order
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      <Footer />
    </div>
  );
}
