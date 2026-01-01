import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { api, ApiError } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First, try to restore user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLoading(false);
          return;
        } catch (error) {
          // Invalid stored data, remove it
          localStorage.removeItem('user');
        }
      }
      
      // Fallback: try token-based auth if token exists
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userId = localStorage.getItem('userId');
          if (userId) {
            const response = await api.getCurrentUser();
            if (response.user) {
              const userData = {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                role: response.user.role,
                avatar: response.user.avatar,
                phone: response.user.phone,
                createdAt: response.user.created_at || response.user.createdAt,
              };
              setUser(userData);
              // Store user in localStorage for persistence
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await api.login(email, password);
      
      if (response.user && response.token) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          avatar: response.user.avatar,
          phone: response.user.phone,
          createdAt: response.user.created_at || response.user.createdAt,
        };
        setUser(userData);
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id);
        return { success: true, user: userData };
      }
      
      return { success: false, error: "Login failed" };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An error occurred during login" };
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Signup only creates regular users (role: 'user')
      // Staff and admin are created by admin only
      const response = await api.register(email, password, name, phone);
      
      if (response.user && response.token) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role, // Should always be 'user' for signup
          avatar: response.user.avatar,
          phone: response.user.phone,
          createdAt: response.user.created_at || response.user.createdAt,
        };
        setUser(userData);
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id);
        return { success: true };
      }
      
      return { success: false, error: "Registration failed" };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An error occurred during registration" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.updateProfile({
        name: updates.name,
        phone: updates.phone,
        avatar: updates.avatar,
      });
      
      if (response.user) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          avatar: response.user.avatar,
          phone: response.user.phone,
          createdAt: response.user.created_at || response.user.createdAt,
        };
        setUser(userData);
        // Update stored user in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id);
        return { success: true };
      }
      
      return { success: false, error: "Profile update failed" };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An error occurred during profile update" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
