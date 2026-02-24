"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff, Loader2, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authApi } from "@/lib/api-client";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"normal" | "pro">("normal");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Logging in with username:", username);
      const response = await authApi.login({ username, password });
      console.log("Login response:", response);

      // Store token in localStorage (both keys for compatibility)
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("access_token", response.access_token);

      // Get user info
      const user = await authApi.getCurrentUser(response.access_token);
      console.log("User info:", user);

      // Store user and plan BEFORE redirect
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_plan", selectedPlan);

      // Wait a bit to ensure localStorage is written
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Trigger auth context reload with storage event
      window.dispatchEvent(new Event("storage"));

      // Redirect based on admin status with full page reload
      console.log("Redirecting to:", user.is_admin ? "/admin" : "/dashboard");
      if (user.is_admin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ConstructionIQ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trợ Lý AI Cho Ngành Xây Dựng Việt Nam
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-center text-xl font-semibold">
              Chào mừng trở lại
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Nhập thông tin đăng nhập để tiếp tục
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Loại Tài Khoản</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("normal")}
                    className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      selectedPlan === "normal"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <User className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Cơ Bản</span>
                    <span className="text-xs text-muted-foreground">
                      Hỏi Đáp AI
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("pro")}
                    className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      selectedPlan === "pro"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Crown className="h-6 w-6 text-amber-500" />
                    <span className="text-sm font-medium">Pro</span>
                    <span className="text-xs text-muted-foreground">
                      Toàn Bộ Tính Năng
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Tên Đăng Nhập</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật Khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bằng việc đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách
          bảo mật
        </p>
      </div>
    </div>
  );
}
