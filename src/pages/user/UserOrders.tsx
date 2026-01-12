import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Loader2, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function UserOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
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
        const ordersResponse = await api.getFoodOrders();
        const userOrders = (ordersResponse.orders || []).filter(
          (o: any) => o.user_id === user.id
        );
        setOrders(userOrders);
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

    loadData();
  }, [user?.id, toast]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-warning/20", text: "text-warning" },
      confirmed: { bg: "bg-success/20", text: "text-success" },
      preparing: { bg: "bg-info/20", text: "text-info" },
      ready: { bg: "bg-success/20", text: "text-success" },
      delivered: { bg: "bg-muted", text: "text-muted-foreground" },
      cancelled: { bg: "bg-destructive/20", text: "text-destructive" },
    };
    const style = variants[status] || variants.pending;
    return (
      <Badge className={`${style.bg} ${style.text} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
              My Food Orders
            </h1>
            <p className="text-muted-foreground">View all your food orders</p>
          </div>
          <Button asChild>
            <Link to="/dining">Order Food</Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card rounded-xl p-12 shadow-sm text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Orders Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any food orders yet. Browse our menu to get started.
            </p>
            <Button asChild>
              <Link to="/dining">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-6 rounded-lg bg-card border border-border/50 hover:border-accent/50 transition-colors shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground text-base">
                          ${parseFloat(order.total_amount || 0).toFixed(2)}
                        </span>
                        <span>•</span>
                        <span>{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</span>
                        {order.created_at && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDateTime(order.created_at)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Order Items:</p>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-foreground font-medium mb-1">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>Quantity: {item.quantity}</span>
                              <span>•</span>
                              <span>${parseFloat(item.price || 0).toFixed(2)} each</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                      <span className="text-xl font-bold text-foreground">
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {(order.user_name || order.user_email) && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Ordered by: {order.user_name || order.user_email}
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






