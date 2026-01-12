import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  MessageSquare,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Plus,
  Activity,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function AdminReservations() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [formData, setFormData] = useState({
    tableId: "",
    reservationDate: "",
    reservationTime: "",
    duration: "60",
    guests: "2",
    specialRequests: "",
    customerName: "",
    customerEmail: "",
  });

  useEffect(() => {
    loadReservations();
    loadTables();
    
    // Auto-refresh every 15 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadReservations();
      }, 15000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadTables = async () => {
    try {
      const response = await api.getTables();
      setTables(response.tables || []);
    } catch (error) {
      console.error("Failed to load tables", error);
    }
  };

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const loadReservations = async (showToast = false) => {
    try {
      setIsLoading(true);
      const response = await api.getReservations();
      setReservations(response.reservations || []);
      setLastUpdated(new Date());
      
      if (showToast) {
        toast({
          title: "Refreshed",
          description: "Reservations data updated",
        });
      }
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

  const filterReservations = () => {
    let filtered = [...reservations];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.table_number?.toString().includes(searchTerm) ||
          r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateFilter === "today") {
      filtered = filtered.filter((r) => r.reservation_date === today);
    } else if (dateFilter === "upcoming") {
      filtered = filtered.filter((r) => r.reservation_date >= today);
    } else if (dateFilter === "past") {
      filtered = filtered.filter((r) => r.reservation_date < today);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(`${a.reservation_date}T${a.reservation_time}`);
      const dateB = new Date(`${b.reservation_date}T${b.reservation_time}`);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredReservations(filtered);
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      await api.updateReservationStatus(reservationId, newStatus);
      toast({
        title: "Success",
        description: "Reservation status updated successfully",
      });
      loadReservations();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message || "Failed to update status",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createReservation({
        tableId: formData.tableId,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        duration: parseInt(formData.duration),
        guests: parseInt(formData.guests),
        specialRequests: formData.specialRequests,
      });

      toast({
        title: "Success",
        description: "Reservation created successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        tableId: "",
        reservationDate: "",
        reservationTime: "",
        duration: "60",
        guests: "2",
        specialRequests: "",
        customerName: "",
        customerEmail: "",
      });
      loadReservations();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message || "Failed to create reservation",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Table", "Customer", "Email", "Date", "Time", "Guests", "Status"];
    const rows = filteredReservations.map(r => [
      r.id,
      r.table_number,
      r.user_name || "Guest",
      r.user_email,
      r.reservation_date,
      r.reservation_time,
      r.guests,
      r.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-warning/20", text: "text-warning", icon: AlertCircle },
      confirmed: { bg: "bg-success/20", text: "text-success", icon: CheckCircle },
      seated: { bg: "bg-info/20", text: "text-info", icon: Users },
      completed: { bg: "bg-muted", text: "text-muted-foreground", icon: CheckCircle },
      cancelled: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
    };
    const style = variants[status] || variants.pending;
    const Icon = style.icon;
    
    return (
      <Badge className={`${style.bg} ${style.text} border-0 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Reservations Management
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              View and manage all table reservations
              <span className="text-xs">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              {autoRefresh && (
                <span className="text-xs flex items-center gap-1 text-success">
                  • <div className="w-2 h-2 bg-success rounded-full animate-pulse" /> Auto-refresh ON
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'text-success' : ''}`} />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Button>
            <Button variant="outline" onClick={() => loadReservations(true)} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{reservations.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">
              {reservations.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-success">
              {reservations.filter((r) => r.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Seated</p>
            <p className="text-2xl font-bold text-info">
              {reservations.filter((r) => r.status === "seated").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold text-accent">
              {
                reservations.filter(
                  (r) =>
                    r.reservation_date === new Date().toISOString().split("T")[0]
                ).length
              }
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by table, name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="seated">Seated</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-card rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reservations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-xs">
                      {reservation.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-accent">
                            {reservation.table_number}
                          </span>
                        </div>
                        {reservation.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {reservation.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.user_name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.user_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatDate(reservation.reservation_date)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTime(reservation.reservation_time)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.guests}</span>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.duration} min</TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>
                      {reservation.status !== "completed" &&
                        reservation.status !== "cancelled" && (
                          <Select
                            value={reservation.status}
                            onValueChange={(value) =>
                              handleStatusUpdate(reservation.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="seated">Seated</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredReservations.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredReservations.length} of {reservations.length} reservations
          </div>
        )}

        {/* Create Reservation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Reservation</DialogTitle>
              <DialogDescription>
                Book a table for a customer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReservation}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tableId">Select Table</Label>
                  <Select
                    value={formData.tableId}
                    onValueChange={(value) => setFormData({ ...formData, tableId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.filter(t => t.status === 'available').map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.table_number} - {table.capacity} guests {table.location && `(${table.location})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservationDate">Date</Label>
                  <Input
                    id="reservationDate"
                    type="date"
                    value={formData.reservationDate}
                    onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservationTime">Time</Label>
                  <Input
                    id="reservationTime"
                    type="time"
                    value={formData.reservationTime}
                    onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Reservation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

