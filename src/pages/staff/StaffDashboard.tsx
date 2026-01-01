import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar, Users, Clock, CheckCircle, UtensilsCrossed, Loader2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StaffDashboard() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [reservationsResponse, tablesResponse] = await Promise.all([
          api.getReservations(),
          api.getTables(),
        ]);
        
        setReservations(reservationsResponse.reservations || []);
        setTables(tablesResponse.tables || []);
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
  }, [toast]);

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(
    (r) => r.reservation_date === today && !['cancelled', 'completed'].includes(r.status)
  );
  const pendingReservations = reservations.filter(
    (r) => r.status === 'pending'
  );
  const availableTables = tables.filter((t) => t.status === 'available').length;
  const confirmedReservations = reservations.filter(
    (r) => r.status === 'confirmed'
  ).length;

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
      <DashboardLayout role="staff">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="staff">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage reservations, tables, and orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Today's Reservations", value: todayReservations.length, icon: Calendar, color: "text-info" },
            { label: "Pending Reservations", value: pendingReservations.length, icon: Clock, color: "text-warning" },
            { label: "Available Tables", value: availableTables, icon: CheckCircle, color: "text-success" },
            { label: "Confirmed Reservations", value: confirmedReservations, icon: UtensilsCrossed, color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-lg font-semibold mb-4">Today's Reservations</h3>
          {todayReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reservations for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Table {reservation.table_number}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatTime(reservation.reservation_time)}</span>
                        <span>{reservation.guests} guests</span>
                        {reservation.user_name && <span>• {reservation.user_name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(reservation.status)}
                    {reservation.status === 'confirmed' && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <CreditCard className="w-3 h-3" />
                        <span>Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
