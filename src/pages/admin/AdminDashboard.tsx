import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Users, UtensilsCrossed, DollarSign, TrendingUp, CreditCard, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#d4a254", "#1e3a5f", "#4a7c59", "#8b5cf6"];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [reservationsResponse, ordersResponse, paymentsResponse] = await Promise.all([
          api.getReservations(),
          api.getFoodOrders(),
          api.getPayments().catch(() => ({ payments: [] })),
        ]);
        
        setReservations(reservationsResponse.reservations || []);
        setOrders(ordersResponse.orders || []);
        setPayments(paymentsResponse.payments || []);
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
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  // Calculate stats
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed').length;
  const pendingReservations = reservations.filter((r) => r.status === 'pending').length;
  
  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  
  const foodRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  
  const activeReservations = reservations.filter(
    (r) => !['cancelled', 'completed'].includes(r.status)
  ).length;
  
  const activeOrders = orders.filter(
    (o) => !['cancelled', 'delivered'].includes(o.status)
  ).length;

  const statCards = [
    { label: "Total Reservations", value: totalReservations, icon: Calendar, change: `${pendingReservations} pending`, subValue: pendingReservations },
    { label: "Active Orders", value: activeOrders, icon: UtensilsCrossed, change: `$${foodRevenue.toFixed(2)} revenue`, subValue: orders.length },
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, change: `${payments.length} payments`, subValue: totalRevenue },
    { label: "Active Reservations", value: activeReservations, icon: Users, change: `${confirmedReservations} confirmed`, subValue: confirmedReservations },
  ];

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
    if (!timeStr) return '';
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your hotel overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservations Status Chart */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-4">Reservations by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: pendingReservations },
                    { name: 'Confirmed', value: confirmedReservations },
                    { name: 'Seated', value: reservations.filter(r => r.status === 'seated').length },
                    { name: 'Completed', value: reservations.filter(r => r.status === 'completed').length },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Status Chart */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-4">Food Orders by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                  { name: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
                  { name: 'Ready', count: orders.filter(o => o.status === 'ready').length },
                  { name: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#d4a254" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Recent Reservations</h3>
              <Link to="/admin/reservations">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {reservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No reservations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Table {reservation.table_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(reservation.reservation_date)} at {formatTime(reservation.reservation_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
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

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Recent Payments</h3>
              <Link to="/admin/food-orders">
                <Button variant="ghost" size="sm">
                  View Orders <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="font-medium text-foreground">${parseFloat(payment.amount || 0).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.reservation_id ? 'Reservation' : payment.order_id ? 'Food Order' : 'Payment'}
                      </p>
                    </div>
                    <Badge
                      className={
                        payment.status === 'completed'
                          ? 'bg-success/20 text-success border-0'
                          : payment.status === 'pending'
                          ? 'bg-warning/20 text-warning border-0'
                          : 'bg-destructive/20 text-destructive border-0'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
