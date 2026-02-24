"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi, type UserResponse } from "./api-client";

export type UserPlan = "normal" | "pro";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  plan?: UserPlan;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      // Check both old and new localStorage keys for backward compatibility
      const storedUser =
        localStorage.getItem("user") || localStorage.getItem("vietbuild_user");
      const storedToken = localStorage.getItem("access_token");

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          const userPlan = localStorage.getItem("user_plan") as UserPlan | null;
          setUser({ ...userData, plan: userPlan || "normal" });
        } catch (e) {
          console.error("Failed to parse stored user:", e);
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_plan");
        }
      }
      setIsLoading(false);
    };

    loadUser();

    // Listen for storage events (from login page)
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      // Call backend API
      const tokenResponse = await authApi.login({ username, password });

      // Store token
      localStorage.setItem("access_token", tokenResponse.access_token);

      // Get user info
      const userInfo = await authApi.getCurrentUser(tokenResponse.access_token);
      const userPlan = localStorage.getItem("user_plan") as UserPlan | null;

      // Store user info
      const userWithPlan = { ...userInfo, plan: userPlan || "normal" };
      setUser(userWithPlan);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_plan");
    localStorage.removeItem("vietbuild_user"); // Remove old key too
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
