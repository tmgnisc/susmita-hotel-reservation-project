import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Calendar, UtensilsCrossed, ArrowLeft, Loader2, CheckCircle, Clock, Users, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function UserReservations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const reservationsResponse = await api.getReservations();
        const userReservations = (reservationsResponse.reservations || []).filter(
          (r: any) => r.user_id === user.id
        );
        setReservations(userReservations);
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message || "Failed to load reservations",
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

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/user">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Reservations
            </h1>
            <p className="text-muted-foreground">View all your table reservations</p>
          </div>
          <Button asChild>
            <Link to="/tables">Make New Reservation</Link>
          </Button>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-card rounded-xl p-12 shadow-sm text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Reservations Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't made any table reservations yet. Start by browsing our available tables.
            </p>
            <Button asChild>
              <Link to="/tables">Browse Tables</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="p-6 rounded-lg bg-card border border-border/50 hover:border-accent/50 transition-colors shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">Table {reservation.table_number}</h3>
                        {reservation.capacity && (
                          <span className="text-sm text-muted-foreground">(Capacity: {reservation.capacity})</span>
                        )}
                      </div>
                      {reservation.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{reservation.location}</span>
                        </div>
                      )}
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
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{formatDate(reservation.reservation_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">{formatTime(reservation.reservation_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Guests</p>
                      <p className="font-medium text-foreground">{reservation.guests}</p>
                    </div>
                  </div>
                  {reservation.duration && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium text-foreground">{reservation.duration} min</p>
                      </div>
                    </div>
                  )}
                </div>

                {reservation.special_requests && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests:</p>
                        <p className="text-sm text-foreground">{reservation.special_requests}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(reservation.user_name || reservation.user_email) && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Reserved by: {reservation.user_name || reservation.user_email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

