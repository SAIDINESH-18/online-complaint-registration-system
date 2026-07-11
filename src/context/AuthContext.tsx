import React, { createContext, useState, useEffect, useContext } from "react";
import { User, UserRole } from "../types.js";
import { authAPI } from "../services/api.js";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password?: string; role?: UserRole; phone?: string }) => Promise<User>;
  logout: () => void;
  updateUserProfile: (data: { name: string; phone?: string; password?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedToken = localStorage.getItem("complaint_system_token");
    const storedUser = localStorage.getItem("complaint_system_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);

    // Set up a listener for interceptor logout events
    const handleLogoutEvent = () => {
      logout();
    };
    window.addEventListener("auth-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("auth-logout", handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem("complaint_system_token", receivedToken);
      localStorage.setItem("complaint_system_user", JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsLoading(false);
      return receivedUser;
    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    phone?: string;
  }): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(data);
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem("complaint_system_token", receivedToken);
      localStorage.setItem("complaint_system_user", JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsLoading(false);
      return receivedUser;
    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || "Registration failed. Please check inputs.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem("complaint_system_token");
    localStorage.removeItem("complaint_system_user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUserProfile = async (data: { name: string; phone?: string; password?: string }) => {
    setError(null);
    try {
      const res = await authAPI.updateProfile(data);
      const { user: updatedUser } = res.data;
      localStorage.setItem("complaint_system_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Profile update failed.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
