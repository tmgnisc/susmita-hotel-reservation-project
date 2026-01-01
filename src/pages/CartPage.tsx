import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError } from "@/lib/api";
import PaymentDialog from "@/components/PaymentDialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Users,
  UtensilsCrossed,
  Loader2,
  ArrowRight,
  CreditCard,
} from "lucide-react";

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getFoodItems,
    getTableItems,
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const foodItems = getFoodItems();
  const tableItems = getTableItems();
  const total = getTotal();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdReservationIds, setCreatedReservationIds] = useState<string[]>([]);
  const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to checkout.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reservationIds: string[] = [];
      const orderIds: string[] = [];

      // Create table reservations first
      for (const tableItem of tableItems) {
        if (tableItem.tableItem?.reservationDate && tableItem.tableItem.reservationTime) {
          const reservation = await api.createReservation({
            tableId: tableItem.tableItem.id,
            reservationDate: tableItem.tableItem.reservationDate,
            reservationTime: tableItem.tableItem.reservationTime,
            duration: tableItem.tableItem.duration || 120,
            guests: tableItem.tableItem.guests || 1,
          });
          if (reservation.reservation?.id) {
            reservationIds.push(reservation.reservation.id);
          }
        }
      }

      // Create food orders
      if (foodItems.length > 0) {
        const order = await api.createFoodOrder({
          items: foodItems.map((item) => ({
            foodItemId: item.foodItem!.id,
            quantity: item.quantity,
          })),
        });
        if (order.order?.id) {
          orderIds.push(order.order.id);
        }
      }

      setCreatedReservationIds(reservationIds);
      setCreatedOrderIds(orderIds);
      setShowPaymentDialog(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Checkout failed",
          description: error.message || "Failed to process your order",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Order placed successfully!",
      description: "Your reservations and orders have been confirmed.",
    });

    clearCart();
    setCreatedReservationIds([]);
    setCreatedOrderIds([]);
    navigate("/user");
  };


  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add tables or food items to your cart to get started.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="gold" asChild>
                <Link to="/tables">
                  Browse Tables
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dining">View Menu</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Table Reservations */}
              {tableItems.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <UtensilsCrossed className="w-5 h-5 text-accent" />
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Table Reservations
                    </h2>
                  </div>
                  {tableItems.map((item) => {
                    const table = item.tableItem!;

                    return (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-border pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
                      >
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0 flex items-center justify-center">
                            <UtensilsCrossed className="w-12 h-12 text-accent/30" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  Table {table.tableNumber}
                                </h3>
                                {table.location && (
                                  <Badge variant="outline" className="mb-2">
                                    {table.location}
                                  </Badge>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                  {table.reservationDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {new Date(table.reservationDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {table.reservationTime && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {new Date(`2000-01-01T${table.reservationTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  )}
                                  {table.guests && (
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      <span>{table.guests} Guests</span>
                                    </div>
                                  )}
                                  {table.capacity && (
                                    <div className="flex items-center gap-1">
                                      <span>Capacity: {table.capacity}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(table.id, "table")}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Table reservation (free)
                                </p>
                                <p className="text-lg font-bold text-foreground mt-1">
                                  $0.00
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Food Items */}
              {foodItems.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <UtensilsCrossed className="w-5 h-5 text-accent" />
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Food Items
                    </h2>
                  </div>
                  {foodItems.map((item) => {
                    const food = item.foodItem!;
                    const subtotal = food.price * item.quantity;

                    return (
                      <motion.div
                        key={food.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-border pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
                      >
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            <img
                              src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                              alt={food.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  {food.name}
                                </h3>
                                <Badge variant="outline" className="capitalize mb-2">
                                  {food.category}
                                </Badge>
                                {food.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {food.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(food.id, "food")}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(food.id, "food", -1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(food.id, "food", 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  ${food.price} each
                                </p>
                                <p className="text-lg font-bold text-foreground mt-1">
                                  ${subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-lg sticky top-24">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {tableItems.map((item) => {
                    const table = item.tableItem!;
                    return (
                      <div key={table.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Table {table.tableNumber} Reservation
                        </span>
                        <span className="font-medium">
                          $0.00
                        </span>
                      </div>
                    );
                  })}
                  {foodItems.map((item) => {
                    const food = item.foodItem!;
                    return (
                      <div key={food.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {food.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(food.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-display font-bold text-accent">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mb-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning">
                      Please sign in to checkout.
                    </p>
                  </div>
                )}

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full mb-4"
                  onClick={handleCheckout}
                  disabled={isProcessing || !isAuthenticated}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                {!isAuthenticated && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to="/auth">Sign In to Checkout</Link>
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                  <Link to="/tables">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={total}
        onSuccess={handlePaymentSuccess}
        reservationIds={createdReservationIds}
        orderIds={createdOrderIds}
      />

      <Footer />
    </div>
  );
}

