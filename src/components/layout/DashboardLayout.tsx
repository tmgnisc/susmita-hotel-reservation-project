import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Bed,
  Calendar,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  ClipboardList,
  ShoppingBag,
  Home,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "staff" | "user";
}

const adminLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: Calendar },
  { href: "/admin/tables", label: "Tables", icon: UtensilsCrossed },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/food-orders", label: "Food Orders", icon: UtensilsCrossed },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const staffLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/reservations", label: "Reservations", icon: Calendar },
  { href: "/staff/tables", label: "Table Management", icon: UtensilsCrossed },
  { href: "/staff/menu", label: "Menu Management", icon: UtensilsCrossed },
  { href: "/staff/orders", label: "Food Orders", icon: ShoppingBag },
];

const userLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/reservations", label: "My Reservations", icon: Calendar },
  { href: "/user/orders", label: "Food Orders", icon: ShoppingBag },
  { href: "/user/profile", label: "Profile", icon: Settings },
];

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = role === "admin" ? adminLinks : role === "staff" ? staffLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleLabel = role === "admin" ? "Super Admin" : role === "staff" ? "Hotel Staff" : "Guest";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0"
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-display font-bold text-xl">L</span>
              </div>
              <span className="font-display text-lg font-semibold text-sidebar-foreground">
                LuxeStay
              </span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-sidebar-foreground" />
              )}
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {link.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold">L</span>
            </div>
            <span className="font-display font-semibold">LuxeStay</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-sidebar"
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-sidebar-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
