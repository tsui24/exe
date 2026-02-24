"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { authApi } from "@/lib/api-client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "Tính năng cơ bản",
      "Chat với AI",
      "Giới hạn 5 tài liệu",
      "Hỗ trợ cộng đồng",
    ],
  },
  normal: {
    name: "Normal",
    price: 99000,
    features: [
      "Truy cập đầy đủ tính năng cơ bản",
      "Phân tích tài liệu PDF",
      "Chat với AI không giới hạn",
      "Lưu trữ tối đa 50 tài liệu",
    ],
  },
  pro: {
    name: "Pro",
    price: 199000,
    features: [
      "Tất cả tính năng Normal",
      "Phân tích blueprint chi tiết",
      "Ưu tiên xử lý",
      "Lưu trữ không giới hạn",
      "Hỗ trợ ưu tiên 24/7",
    ],
  },
};

export default function RegisterWithPlanPage() {
  const [step, setStep] = useState(1); // 1: Account info, 2: Plan selection
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
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

    // Move to plan selection step
    setStep(2);
  };

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Register user
      const user = await authApi.register({
        username,
        password,
        full_name: fullName || undefined,
      });

      // Auto login after successful registration
      const tokenResponse = await authApi.login({ username, password });

      // Store token and user info
      localStorage.setItem("access_token", tokenResponse.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // If paid plan selected, redirect to payment
      if (selectedPlan !== "free") {
        // Create payment
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/payments/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
            body: JSON.stringify({
              subscription_plan: selectedPlan,
            }),
          },
        );

        if (response.ok) {
          const paymentData = await response.json();
          // Redirect to payment URL
          window.location.href = paymentData.payment_url;
          return;
        } else {
          throw new Error("Không thể tạo thanh toán");
        }
      }

      // For free plan, redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
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

        {/* Step Indicator */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">
                Thông tin tài khoản
              </span>
            </div>
            <div className="h-0.5 w-12 bg-muted" />
            <div
              className={`flex items-center ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Chọn gói dịch vụ</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          // Step 1: Account Information
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <h2 className="text-center text-xl font-semibold">
                Tạo tài khoản mới
              </h2>
              <CardDescription className="text-center">
                Nhập thông tin tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên Đăng Nhập</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Chọn tên đăng nhập (tối thiểu 3 ký tự)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    minLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và Tên (tùy chọn)</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
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
                      minLength={6}
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
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

                <Button type="submit" className="w-full">
                  Tiếp theo
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
            </CardContent>
          </Card>
        ) : (
          // Step 2: Plan Selection
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <h2 className="text-center text-xl font-semibold">
                Chọn gói dịch vụ
              </h2>
              <CardDescription className="text-center">
                Lựa chọn gói phù hợp với nhu cầu của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
                    <Card
                      key={planId}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === planId
                          ? "border-primary ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPlan(planId)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <RadioGroupItem value={planId} id={planId} />
                          <Label
                            htmlFor={planId}
                            className="text-lg font-semibold cursor-pointer"
                          >
                            {plan.name}
                          </Label>
                        </div>

                        <div className="mb-4">
                          <div className="text-3xl font-bold">
                            {plan.price === 0
                              ? "Miễn phí"
                              : formatPrice(plan.price)}
                          </div>
                          {plan.price > 0 && (
                            <div className="text-sm text-muted-foreground">
                              /tháng
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start text-sm"
                            >
                              <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>

              {error && (
                <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : selectedPlan === "free" ? (
                    "Hoàn tất đăng ký"
                  ) : (
                    "Tiếp tục thanh toán"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo
          mật
        </p>
      </div>
    </div>
  );
}
