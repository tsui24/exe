"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderCode) {
        setError("Mã đơn hàng không hợp lệ");
        setIsVerifying(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/payments/verify/${orderCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const payment = await response.json();
          if (payment.status === "completed") {
            setVerificationSuccess(true);

            // Update user info in localStorage
            const userResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/auth/me`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (userResponse.ok) {
              const user = await userResponse.json();
              localStorage.setItem("user", JSON.stringify(user));
            }
          } else {
            setError("Thanh toán chưa hoàn tất. Vui lòng kiểm tra lại.");
          }
        } else {
          setError("Không thể xác minh thanh toán");
        }
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi xác minh thanh toán");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderCode, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ConstructionIQ
          </h1>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            {isVerifying ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">
                  Đang xác minh thanh toán...
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            ) : verificationSuccess ? (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold text-green-600">
                  Thanh toán thành công!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tài khoản của bạn đã được nâng cấp
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-2xl text-destructive">⚠</span>
                </div>
                <h2 className="text-xl font-semibold text-destructive">
                  Có lỗi xảy ra
                </h2>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!isVerifying && verificationSuccess && (
              <>
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-sm">
                  <p className="text-green-800 dark:text-green-200">
                    Bạn có thể bắt đầu sử dụng các tính năng mới ngay bây giờ!
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Đến Dashboard
                </Button>
              </>
            )}

            {!isVerifying && !verificationSuccess && (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Quay lại Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
