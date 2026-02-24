"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PaymentCancelPage() {
  const router = useRouter();

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
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-orange-500" />
              <h2 className="text-xl font-semibold text-orange-600">
                Thanh toán đã bị hủy
              </h2>
              <p className="text-sm text-muted-foreground">
                Bạn đã hủy quá trình thanh toán
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-4 text-sm">
              <p className="text-orange-800 dark:text-orange-200">
                Đừng lo! Bạn vẫn có thể nâng cấp tài khoản bất cứ lúc nào từ
                trang cài đặt.
              </p>
            </div>

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
                onClick={() => router.push("/register")}
              >
                Thử thanh toán lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
