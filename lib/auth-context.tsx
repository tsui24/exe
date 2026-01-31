"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi, type UserResponse } from "./api-client";

export type UserRole = "user" | "admin";
export type UserPlan = "normal" | "pro";

export interface User {
  id: number;
  username: string;
  phone: string;
  role: UserRole;
  plan: UserPlan;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string, plan?: UserPlan) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("vietbuild_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    phone: string,
    password: string,
    plan: UserPlan = "normal",
  ): Promise<boolean> => {
    try {
      // Check for admin credentials (hardcoded for demo)
      if (phone === "admin" && password === "admin") {
        const adminUser: User = {
          id: 0,
          username: "admin",
          phone: "admin",
          role: "admin",
          plan: "pro",
          name: "Administrator",
        };
        setUser(adminUser);
        localStorage.setItem("vietbuild_user", JSON.stringify(adminUser));
        return true;
      }

      // Call real API for regular users
      const result = await authApi.login({ phone, password });

      if ("error" in result) {
        console.error("Login failed:", result.error);
        return false;
      }

      // Create user object with API response
      const regularUser: User = {
        id: result.id,
        username: result.username,
        phone: result.phone,
        role: "user",
        plan,
        name:
          result.username.charAt(0).toUpperCase() + result.username.slice(1),
      };

      setUser(regularUser);
      localStorage.setItem("vietbuild_user", JSON.stringify(regularUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vietbuild_user");
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
