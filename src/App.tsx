import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
            {/* Public routes - user only */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['user']}>
                <LandingPage />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/rooms" element={
              <ProtectedRoute allowedRoles={['user']}>
                <RoomsPage />
              </ProtectedRoute>
            } />
            <Route path="/rooms/:id" element={
              <ProtectedRoute allowedRoles={['user']}>
                <RoomDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/tables" element={
              <ProtectedRoute allowedRoles={['user']}>
                <TablesPage />
              </ProtectedRoute>
            } />
            <Route path="/tables/:id" element={
              <ProtectedRoute allowedRoles={['user']}>
                <TableDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/dining" element={
              <ProtectedRoute allowedRoles={['user']}>
                <DiningPage />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['user']}>
                <CartPage />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StaffManagement />
              </ProtectedRoute>
            } />
            
            {/* Staff routes */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />
            <Route path="/staff/reservations" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffReservations />
              </ProtectedRoute>
            } />
            <Route path="/staff/orders" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffOrders />
              </ProtectedRoute>
            } />
            <Route path="/staff/tables" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <TableManagement />
              </ProtectedRoute>
            } />
            <Route path="/staff/menu" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <MenuManagement />
              </ProtectedRoute>
            } />
            
            {/* User routes */}
            <Route path="/user" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/reservations" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserReservations />
              </ProtectedRoute>
            } />
            <Route path="/user/orders" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserOrders />
              </ProtectedRoute>
            } />
            
            {/* Profile routes - all authenticated users */}
            <Route path="/user/profile" element={
              <ProtectedRoute requireAuth={true}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireAuth={true}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
