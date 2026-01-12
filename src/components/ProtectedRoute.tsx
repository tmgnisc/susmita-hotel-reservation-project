import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // If specified, only these roles can access
  requireAuth?: boolean; // If true, user must be logged in
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = false 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // If authentication is required and user is not logged in
      if (requireAuth && !user) {
        navigate("/auth");
        return;
      }

      // If specific roles are required
      if (allowedRoles && allowedRoles.length > 0) {
        if (!user) {
          // Not logged in, but role check required
          // For user routes, allow access (public pages)
          if (allowedRoles.includes('user')) {
            return; // Allow access to public pages
          }
          // For admin/staff routes, redirect to auth
          navigate("/auth");
          return;
        }

        // User is logged in, check if their role is allowed
        if (!allowedRoles.includes(user.role)) {
          // Redirect to their appropriate dashboard
          if (user.role === 'admin') {
            navigate("/admin");
          } else if (user.role === 'staff') {
            navigate("/staff");
          } else {
            navigate("/");
          }
        }
      }
    }
  }, [user, isLoading, allowedRoles, requireAuth, navigate]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return <>{children}</>;
}

