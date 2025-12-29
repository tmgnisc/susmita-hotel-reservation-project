import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RoomsPage from "./pages/RoomsPage";
import DiningPage from "./pages/DiningPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StaffDashboard from "./pages/staff/StaffDashboard";
import RoomManagement from "./pages/staff/RoomManagement";
import MenuManagement from "./pages/staff/MenuManagement";
import UserDashboard from "./pages/user/UserDashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/dining" element={<DiningPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/rooms" element={<RoomManagement />} />
            <Route path="/staff/menu" element={<MenuManagement />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/profile" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
