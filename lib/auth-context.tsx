"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type UserRole = "user" | "admin";
export type UserPlan = "normal" | "pro";

export interface User {
  username: string;
  role: UserRole;
  plan: UserPlan;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, plan?: UserPlan) => boolean;
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

  const login = (username: string, password: string, plan: UserPlan = "normal"): boolean => {
    // Admin credentials
    if (username === "admin" && password === "admin") {
      const adminUser: User = {
        username: "admin",
        role: "admin",
        plan: "pro",
        name: "Administrator",
      };
      setUser(adminUser);
      localStorage.setItem("vietbuild_user", JSON.stringify(adminUser));
      return true;
    }
    
    // Regular user (any non-empty username/password)
    if (username && password) {
      const regularUser: User = {
        username,
        role: "user",
        plan,
        name: username.charAt(0).toUpperCase() + username.slice(1),
      };
      setUser(regularUser);
      localStorage.setItem("vietbuild_user", JSON.stringify(regularUser));
      return true;
    }
    
    return false;
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
