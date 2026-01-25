"use client";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff, Loader2, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth, type UserPlan } from "@/lib/auth-context";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>("normal");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(username, password, selectedPlan);
    if (success) {
      // Check if admin
      if (username === "admin" && password === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Invalid username or password");
    }
    setIsLoading(false);
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

              {error && <p className="text-sm text-destructive">{error}</p>}

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

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Tài khoản demo:
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium">Quản trị viên:</span> admin /
                  admin
                </p>
                <p>
                  <span className="font-medium">Người dùng:</span> bất kỳ tên /
                  bất kỳ mật khẩu
                </p>
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Các loại tài khoản:
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Cơ Bản:</span> Chỉ hỏi đáp AI
                  </p>
                  <p>
                    <span className="font-medium">Pro:</span> Tải lên, Phân tích
                    & Tất cả Tài liệu
                  </p>
                </div>
              </div>
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
