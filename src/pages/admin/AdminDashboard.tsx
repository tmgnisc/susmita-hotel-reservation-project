import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockDashboardStats, mockBookings, mockStaffMembers } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Users, Bed, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";

const COLORS = ["#d4a254", "#1e3a5f", "#4a7c59", "#8b5cf6"];

export default function AdminDashboard() {
  const stats = mockDashboardStats;

  const statCards = [
    { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, change: "+12%" },
    { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, icon: Bed, change: "+5%" },
    { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, change: "+18%" },
    { label: "Active Guests", value: stats.activeGuests, icon: Users, change: "+8%" },
  ];

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
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-6">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-6">Room Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.roomTypeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.roomTypeDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {mockBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-foreground">Booking #{booking.id}</p>
                    <p className="text-sm text-muted-foreground">{booking.checkIn} - {booking.checkOut}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-4">Staff Overview</h3>
            <div className="space-y-4">
              {mockStaffMembers.slice(0, 3).map((staff) => (
                <div key={staff.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                  <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${staff.status === "active" ? "bg-success" : "bg-warning"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
