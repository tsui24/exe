"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi, type UserResponse } from "./api-client";

export type UserPlan = "free" | "normal" | "pro";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  plan: UserPlan;
  subscription_expires_at?: string;
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
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("access_token");

      if (storedUser && storedToken) {
        try {
          const userData: UserResponse = JSON.parse(storedUser);
          // Map subscription_plan to plan
          setUser({
            ...userData,
            plan: userData.subscription_plan || "free",
            subscription_expires_at: userData.subscription_expires_at,
          });
        } catch (e) {
          console.error("Failed to parse stored user:", e);
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
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

      // Map subscription_plan to plan and store user info
      const userWithPlan = {
        ...userInfo,
        plan: userInfo.subscription_plan || ("free" as UserPlan),
        subscription_expires_at: userInfo.subscription_expires_at,
      };

      localStorage.setItem("user", JSON.stringify(userInfo));
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
