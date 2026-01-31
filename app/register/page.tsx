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
import { authApi } from "@/lib/api-client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>("normal");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setError("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    if (username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const result = await authApi.register({
        username,
        phone,
        password,
      });

      if ("error" in result) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Auto login after successful registration
      const loginSuccess = await login(phone, password, selectedPlan);
      if (loginSuccess) {
        router.push("/dashboard");
      } else {
        setError(
          "Đăng ký thành công nhưng không thể đăng nhập. Vui lòng thử đăng nhập lại.",
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
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
              Tạo tài khoản mới
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Đăng ký để trải nghiệm AI cho xây dựng
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Chọn Gói Dịch Vụ</Label>
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
                <Label htmlFor="fullName">Họ và Tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số Điện Thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Tên Đăng Nhập</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Chọn tên đăng nhập"
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
                    placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Các gói dịch vụ:
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium">Cơ Bản:</span> Hỏi đáp AI không
                  giới hạn về TCVN/QCVN
                </p>
                <p>
                  <span className="font-medium">Pro:</span> Tải lên tài liệu,
                  phân tích & báo cáo tuân thủ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo
          mật
        </p>
      </div>
    </div>
  );
}
