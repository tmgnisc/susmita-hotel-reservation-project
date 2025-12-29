import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockBookings, mockRooms } from "@/data/mockData";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

export default function StaffDashboard() {
  const todayCheckIns = mockBookings.filter(b => b.status === "confirmed").length;
  const todayCheckOuts = mockBookings.filter(b => b.status === "checked_in").length;
  const availableRooms = mockRooms.filter(r => r.status === "available").length;

  return (
    <DashboardLayout role="staff">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage check-ins, rooms, and orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Pending Check-ins", value: todayCheckIns, icon: Calendar, color: "text-info" },
            { label: "Pending Check-outs", value: todayCheckOuts, icon: Clock, color: "text-warning" },
            { label: "Available Rooms", value: availableRooms, icon: CheckCircle, color: "text-success" },
            { label: "Active Guests", value: 42, icon: Users, color: "text-accent" },
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
          <h3 className="font-display text-lg font-semibold mb-4">Today's Check-ins</h3>
          <div className="space-y-3">
            {mockBookings.filter(b => b.status === "confirmed").map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium">Room {mockRooms.find(r => r.id === booking.roomId)?.roomNumber}</p>
                  <p className="text-sm text-muted-foreground">{booking.guests} guest(s)</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium">
                  Check In
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
