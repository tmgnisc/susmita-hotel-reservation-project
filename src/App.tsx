import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import TablesPage from "./pages/TablesPage";
import TableDetailPage from "./pages/TableDetailPage";
import DiningPage from "./pages/DiningPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffReservations from "./pages/staff/StaffReservations";
import StaffOrders from "./pages/staff/StaffOrders";
import TableManagement from "./pages/staff/TableManagement";
import MenuManagement from "./pages/staff/MenuManagement";
import UserDashboard from "./pages/user/UserDashboard";
import UserReservations from "./pages/user/UserReservations";
import UserOrders from "./pages/user/UserOrders";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/tables/:id" element={<TableDetailPage />} />
            <Route path="/dining" element={<DiningPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/reservations" element={<StaffReservations />} />
            <Route path="/staff/orders" element={<StaffOrders />} />
            <Route path="/staff/tables" element={<TableManagement />} />
            <Route path="/staff/menu" element={<MenuManagement />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/profile" element={<ProfilePage />} />
            <Route path="/user/reservations" element={<UserReservations />} />
            <Route path="/user/orders" element={<UserOrders />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
