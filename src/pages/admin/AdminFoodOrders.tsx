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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  Package,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Download,
  RefreshCw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function AdminFoodOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.getFoodOrders();
      setOrders(response.orders || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message || "Failed to load orders",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.room_number?.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.updateFoodOrderStatus(orderId, newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      loadOrders();
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

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Items", "Total", "Status", "Date"];
    const rows = filteredOrders.map(o => [
      o.id,
      o.user_name || "Guest",
      o.user_email,
      o.items?.length || 0,
      o.total_amount,
      o.status,
      new Date(o.created_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `food-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-warning/20", text: "text-warning", icon: AlertCircle },
      preparing: { bg: "bg-info/20", text: "text-info", icon: Package },
      ready: { bg: "bg-success/20", text: "text-success", icon: CheckCircle },
      delivered: { bg: "bg-muted", text: "text-muted-foreground", icon: Truck },
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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Food Orders Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all food orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Preparing</p>
            <p className="text-2xl font-bold text-info">
              {orders.filter((o) => o.status === "preparing").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-2xl font-bold text-success">
              {orders.filter((o) => o.status === "ready").length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-accent">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, or table..."
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
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.user_name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user_email}
                        </p>
                        {order.room_number && (
                          <p className="text-xs text-muted-foreground">
                            Table: {order.room_number}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 rounded object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="truncate font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No items</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {parseFloat(order.total_amount || 0).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {order.created_at ? formatDateTime(order.created_at) : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusUpdate(order.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
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

        {filteredOrders.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

