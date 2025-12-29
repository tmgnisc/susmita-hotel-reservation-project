import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockBookings, mockRooms, mockFoodOrders } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Calendar, ShoppingBag, Bed, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserDashboard() {
  const { user } = useAuth();
  const userBookings = mockBookings.filter(b => b.userId === "3");
  const userOrders = mockFoodOrders.filter(o => o.userId === "3");

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">Manage your bookings and orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{userBookings.length}</p>
            <p className="text-sm text-muted-foreground">Active Bookings</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{userOrders.length}</p>
            <p className="text-sm text-muted-foreground">Food Orders</p>
          </div>
          <div className="bg-gradient-gold rounded-xl p-6 text-primary">
            <Bed className="w-8 h-8 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Book a Room</h3>
            <p className="text-sm opacity-80 mb-4">Explore our luxury accommodations</p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/rooms">Browse Rooms <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Your Bookings</h3>
            <Link to="/user/bookings" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {userBookings.map((booking) => {
              const room = mockRooms.find(r => r.id === booking.roomId);
              return (
                <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                  <img src={room?.images[0]} alt={room?.name} className="w-20 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{room?.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.checkIn} - {booking.checkOut}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                    {booking.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
