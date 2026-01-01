import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Calendar, ShoppingBag, UtensilsCrossed, ArrowRight, Loader2, CreditCard, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Load reservations
        const reservationsResponse = await api.getReservations();
        const userReservations = (reservationsResponse.reservations || []).filter(
          (r: any) => r.user_id === user.id
        );
        setReservations(userReservations);

        // Load orders
        try {
          const ordersResponse = await api.getFoodOrders();
          const userOrders = (ordersResponse.orders || []).filter(
            (o: any) => o.user_id === user.id
          );
          setOrders(userOrders);
        } catch (error) {
          // Orders might not be available, set empty array
          setOrders([]);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message || "Failed to load data",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, toast]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-warning/20", text: "text-warning" },
      confirmed: { bg: "bg-success/20", text: "text-success" },
      seated: { bg: "bg-info/20", text: "text-info" },
      completed: { bg: "bg-muted", text: "text-muted-foreground" },
      cancelled: { bg: "bg-destructive/20", text: "text-destructive" },
    };
    const style = variants[status] || variants.pending;
    return (
      <Badge className={`${style.bg} ${style.text} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  const activeReservations = reservations.filter(
    (r) => !['cancelled', 'completed'].includes(r.status)
  );
  const activeOrders = orders.filter(
    (o) => !['cancelled', 'delivered'].includes(o.status)
  );

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">Manage your reservations and orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{activeReservations.length}</p>
            <p className="text-sm text-muted-foreground">Active Reservations</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{activeOrders.length}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </div>
          <div className="bg-gradient-gold rounded-xl p-6 text-primary">
            <UtensilsCrossed className="w-8 h-8 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Reserve a Table</h3>
            <p className="text-sm opacity-80 mb-4">Book your perfect dining experience</p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/tables">Browse Tables <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>

        {/* Reservations */}
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Your Reservations</h3>
            <Link to="/user/reservations" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reservations yet</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/tables">Make a Reservation</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                  <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">Table {reservation.table_number}</p>
                      {reservation.location && (
                        <span className="text-xs text-muted-foreground">• {reservation.location}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(reservation.reservation_date)}</span>
                      <span>{formatTime(reservation.reservation_time)}</span>
                      <span>{reservation.guests} guests</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(reservation.status)}
                    {reservation.status === 'confirmed' && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="w-3 h-3" />
                        <span>Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Your Food Orders</h3>
            <Link to="/user/orders" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${order.total_amount} • {order.items?.length || 0} items
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
