import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api, ApiError } from "@/lib/api";
import {
  Bed,
  Users,
  Calendar,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Sparkles,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";

const amenityIcons: { [key: string]: any } = {
  WiFi: Wifi,
  "Free WiFi": Wifi,
  Parking: Car,
  "Free Parking": Car,
  Dining: Utensils,
  "Fine Dining": Utensils,
  Gym: Dumbbell,
  "Fitness Center": Dumbbell,
  Pool: Waves,
  "Infinity Pool": Waves,
  Spa: Sparkles,
  "Spa & Wellness": Sparkles,
};

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { addRoomItem } = useCart();
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [addToCartMode, setAddToCartMode] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await api.getRoom(id);
        setRoom(response.room);
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message || "Failed to load room details",
            variant: "destructive",
          });
        }
        navigate("/rooms");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [id, navigate, toast]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to book a room.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!room || room.status !== "available") {
      toast({
        title: "Room unavailable",
        description: "This room is not available for booking.",
        variant: "destructive",
      });
      return;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Invalid dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    if (checkInDate < new Date()) {
      toast({
        title: "Invalid date",
        description: "Check-in date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(bookingData.guests) > room.capacity) {
      toast({
        title: "Too many guests",
        description: `This room can accommodate up to ${room.capacity} guests.`,
        variant: "destructive",
      });
      return;
    }

    if (addToCartMode) {
      // Add to cart instead of booking directly
      addRoomItem(
        {
          id: room.id,
          name: room.name,
          price: room.price,
          images: room.images,
          type: room.type,
          capacity: room.capacity,
        },
        bookingData.checkIn,
        bookingData.checkOut,
        parseInt(bookingData.guests)
      );

      toast({
        title: "Added to cart!",
        description: "Room has been added to your cart.",
      });

      navigate("/cart");
      return;
    }

    try {
      setIsBooking(true);
      await api.createBooking({
        roomId: room.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
      });

      toast({
        title: "Booking successful!",
        description: "Your room has been booked successfully.",
      });

      navigate("/user");
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Booking failed",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    } finally {
      setIsBooking(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (amenity.toLowerCase().includes(key.toLowerCase())) {
        return Icon;
      }
    }
    return Check;
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

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Room not found</p>
            <Button asChild>
              <Link to="/rooms">Back to Rooms</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = room.images && room.images.length > 0 
    ? room.images 
    : ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"];

  const amenities = room.amenities || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium capitalize">
              {room.type}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                room.status === "available"
                  ? "bg-success/20 text-success"
                  : room.status === "booked"
                  ? "bg-warning/20 text-warning"
                  : "bg-destructive/20 text-destructive"
              }`}
            >
              {room.status}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {room.name}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {room.description || "Experience luxury and comfort in this beautifully designed room."}
          </p>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                <img
                  src={images[selectedImageIndex]}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {images.slice(0, 4).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-24 lg:h-32 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-accent"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${room.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Info */}
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Room Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Capacity</span>
                    </div>
                    <p className="font-semibold text-foreground">{room.capacity} Guests</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Bed className="w-5 h-5" />
                      <span className="text-sm">Room</span>
                    </div>
                    <p className="font-semibold text-foreground">
                      {room.room_number || `Floor ${room.floor}`}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">Floor</span>
                    </div>
                    <p className="font-semibold text-foreground">Floor {room.floor}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Star className="w-5 h-5" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <p className="font-semibold text-foreground">4.9</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Amenities
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity: string) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
                        >
                          <Icon className="w-5 h-5 text-accent" />
                          <span className="text-sm font-medium text-foreground">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {room.description && (
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    About This Room
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{room.description}</p>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-lg sticky top-24">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-display font-bold text-foreground">
                      ${room.price}
                    </span>
                    <span className="text-muted-foreground">/ night</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prices may vary based on dates
                  </p>
                </div>

                {room.status === "available" ? (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, checkIn: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, checkOut: e.target.value })
                        }
                        min={
                          bookingData.checkIn
                            ? new Date(
                                new Date(bookingData.checkIn).getTime() + 24 * 60 * 60 * 1000
                              )
                                .toISOString()
                                .split("T")[0]
                            : new Date().toISOString().split("T")[0]
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guests">Guests</Label>
                      <select
                        id="guests"
                        value={bookingData.guests}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, guests: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      >
                        {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!isAuthenticated && (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-sm text-warning">
                          Please sign in to book this room.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={() => {
                          setAddToCartMode(true);
                          const form = document.querySelector('form');
                          if (form) form.requestSubmit();
                        }}
                        disabled={isBooking || !isAuthenticated}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        className="flex-1"
                        onClick={() => setAddToCartMode(false)}
                        disabled={isBooking || !isAuthenticated}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          "Book Now"
                        )}
                      </Button>
                    </div>

                    {!isAuthenticated && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full"
                        asChild
                      >
                        <Link to="/auth">Sign In to Book</Link>
                      </Button>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">
                        This room is currently {room.status}
                      </p>
                    </div>
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <Link to="/rooms">View Other Rooms</Link>
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      <span>Free cancellation</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      <span>24/7 Concierge</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      <span>Best price guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

