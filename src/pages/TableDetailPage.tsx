import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api, ApiError } from "@/lib/api";
import PaymentDialog from "@/components/PaymentDialog";
import {
  UtensilsCrossed,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";

export default function TableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { addTableItem } = useCart();
  const [table, setTable] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [addToCartMode, setAddToCartMode] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);
  const [reservationAmount, setReservationAmount] = useState(0);

  const [reservationData, setReservationData] = useState({
    reservationDate: "",
    reservationTime: "",
    duration: "120",
    guests: "1",
    specialRequests: "",
  });

  useEffect(() => {
    const loadTable = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await api.getTable(id);
        setTable(response.table);
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message || "Failed to load table details",
            variant: "destructive",
          });
        }
        navigate("/tables");
      } finally {
        setIsLoading(false);
      }
    };

    loadTable();
  }, [id, navigate, toast]);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!table || table.status !== "available") {
      toast({
        title: "Table unavailable",
        description: "This table is not available for reservation.",
        variant: "destructive",
      });
      return;
    }

    const reservationDate = new Date(reservationData.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      toast({
        title: "Invalid date",
        description: "Reservation date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(reservationData.guests) > table.capacity) {
      toast({
        title: "Too many guests",
        description: `This table can accommodate up to ${table.capacity} guests.`,
        variant: "destructive",
      });
      return;
    }

    if (!reservationData.reservationDate || !reservationData.reservationTime) {
      toast({
        title: "Missing information",
        description: "Please select both date and time for your reservation.",
        variant: "destructive",
      });
      return;
    }

    if (addToCartMode) {
      // Add to cart instead of booking directly
      addTableItem(
        {
          id: table.id,
          tableNumber: table.table_number,
          capacity: table.capacity,
          location: table.location,
        },
        reservationData.reservationDate,
        reservationData.reservationTime,
        parseInt(reservationData.duration),
        parseInt(reservationData.guests)
      );

      toast({
        title: "Added to cart!",
        description: "Table reservation has been added to your cart.",
      });

      navigate("/cart");
      return;
    }

    try {
      setIsBooking(true);
      
      // Create reservation first (with pending status)
      const reservation = await api.createReservation({
        tableId: table.id,
        reservationDate: reservationData.reservationDate,
        reservationTime: reservationData.reservationTime,
        duration: parseInt(reservationData.duration),
        guests: parseInt(reservationData.guests),
        specialRequests: reservationData.specialRequests || undefined,
        userId: user?.id || undefined,
      });

      if (reservation.reservation?.id) {
        // Set reservation fee (minimum $1 for Stripe, or you can make it configurable)
        const fee = 1.00; // $1 reservation fee
        setReservationAmount(fee);
        setCreatedReservationId(reservation.reservation.id);
        
        // Open payment dialog
        setShowPaymentDialog(true);
      } else {
        throw new Error("Failed to create reservation");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Reservation failed",
          description: error.message || "Failed to create reservation",
          variant: "destructive",
        });
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!table) {
    return null;
  }

  const handlePaymentSuccess = () => {
    toast({
      title: "Reservation confirmed!",
      description: "Your table has been reserved and payment processed successfully.",
    });

    setCreatedReservationId(null);
    setReservationAmount(0);
    setShowPaymentDialog(false);
    
    // Navigate to user dashboard or tables page
    if (user) {
      navigate("/user");
    } else {
      navigate("/tables");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success";
      case "reserved":
        return "bg-warning/20 text-warning";
      case "occupied":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/tables")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tables
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl overflow-hidden"
              >
                <div className="h-96 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <UtensilsCrossed className="w-32 h-32 text-accent/30" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                        Table {table.table_number}
                      </h1>
                      {table.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{table.location}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        table.status
                      )}`}
                    >
                      {table.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">
                          Capacity: {table.capacity} guests
                        </span>
                      </div>
                    </div>

                    {table.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {table.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Reservation Form */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-sm"
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Reserve This Table
                </h2>

                <form onSubmit={handleReservation} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reservationDate">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </Label>
                      <Input
                        id="reservationDate"
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={reservationData.reservationDate}
                        onChange={(e) =>
                          setReservationData({
                            ...reservationData,
                            reservationDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reservationTime">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Time
                      </Label>
                      <Input
                        id="reservationTime"
                        type="time"
                        required
                        value={reservationData.reservationTime}
                        onChange={(e) =>
                          setReservationData({
                            ...reservationData,
                            reservationTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="30"
                        step="30"
                        value={reservationData.duration}
                        onChange={(e) =>
                          setReservationData({
                            ...reservationData,
                            duration: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guests">
                        <Users className="w-4 h-4 inline mr-2" />
                        Guests
                      </Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={table.capacity}
                        required
                        value={reservationData.guests}
                        onChange={(e) =>
                          setReservationData({
                            ...reservationData,
                            guests: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      rows={3}
                      value={reservationData.specialRequests}
                      onChange={(e) =>
                        setReservationData({
                          ...reservationData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="bg-secondary/50 rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Reservation Fee:</span>
                        <span className="font-semibold text-foreground">$1.00</span>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full"
                      disabled={isBooking || table.status !== "available"}
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Reserve Now - $1.00
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        setAddToCartMode(true);
                        const fakeEvent = {
                          preventDefault: () => {},
                        } as React.FormEvent;
                        handleReservation(fakeEvent);
                      }}
                      disabled={table.status !== "available"}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={reservationAmount}
        onSuccess={handlePaymentSuccess}
        reservationIds={createdReservationId ? [createdReservationId] : undefined}
      />

      <Footer />
    </div>
  );
}

