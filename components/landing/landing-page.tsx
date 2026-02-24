"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  MessageSquare,
  FileUp,
  FileSearch,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Crown,
  Users,
  Bot,
  Scale,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Bot,
    title: "Hỏi Đáp AI Thông Minh",
    description:
      "Nhận câu trả lời tức thì về các tiêu chuẩn xây dựng Việt Nam từ AI được đào tạo chuyên sâu.",
  },
  {
    icon: FileUp,
    title: "Tải Lên & Tra Cứu Tài Liệu",
    description:
      "Phân tích tài liệu xây dựng và nhận báo cáo tuân thủ chi tiết với đánh giá rủi ro toàn diện.",
  },
  {
    icon: FileSearch,
    title: "Tra Cứu Bộ Tài Liệu Chuẩn Hóa",
    description:
      "Truy cập kho tài liệu xây dựng được chuẩn hóa, bao gồm TCVN, QCVN và các quy định pháp lý.",
  },
  {
    icon: Shield,
    title: "Đảm Bảo Tuân Thủ Pháp Lý",
    description:
      "Luôn cập nhật với các quy chuẩn xây dựng và yêu cầu pháp lý mới nhất tại Việt Nam.",
  },
];

const stats = [
  { value: "1000+", label: "Tài Liệu Xây Dựng", sublabel: "Được Chuẩn Hóa" },
  { value: "99%", label: "Độ Chính Xác", sublabel: "Trong Phân Tích" },
  { value: "24/7", label: "Hỗ Trợ AI", sublabel: "Luôn Sẵn Sàng" },
  { value: "10x", label: "Nhanh Hơn", sublabel: "So Với Cách Truyền Thống" },
];

const normalFeatures = [
  "Hỏi đáp AI không giới hạn",
  "Truy cập kho kiến thức TCVN/QCVN",
  "Quy định phòng cháy chữa cháy",
  "Hướng dẫn yêu cầu kết cấu",
  "Thông tin giấy phép xây dựng",
  "Giao diện dễ sử dụng",
];

const proFeatures = [
  "Mọi tính năng của Normal, cộng thêm:",
  "Tải lên & phân tích tài liệu",
  "Báo cáo rủi ro tuân thủ chi tiết",
  "Quản lý tất cả tài liệu",
  "Ưu tiên phản hồi AI",
  "Danh sách kiểm tra tuân thủ chi tiết",
  "Xuất báo cáo PDF chuyên nghiệp",
  "Hỗ trợ ưu tiên 24/7",
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/95 backdrop-blur-md shadow-sm"
            : "border-transparent bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                VietBuild AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Tính năng
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Bảng giá
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Về chúng tôi
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="sm"
                  className="gap-2 font-medium shadow-lg shadow-primary/25"
                >
                  Bắt đầu ngay <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-white/95 backdrop-blur-md md:hidden animate-in slide-in-from-top-5">
            <div className="space-y-1 px-4 py-4">
              <a
                href="#features"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tính năng
              </a>
              <a
                href="#pricing"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bảng giá
              </a>
              <a
                href="#about"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Về chúng tôi
              </a>
              <div className="flex gap-2 pt-4">
                <Link href="/login" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                    size="sm"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button className="w-full font-medium" size="sm">
                    Bắt đầu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-background" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-2 px-4 py-2 text-sm animate-in fade-in slide-in-from-top-3 duration-500"
            >
              <Sparkles className="h-4 w-4" />
              AI Cho Tuân Thủ Xây Dựng
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance animate-in fade-in slide-in-from-top-5 duration-700">
              Tuân Thủ Xây Dựng{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Đơn Giản Hơn
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty md:text-xl animate-in fade-in slide-in-from-top-7 duration-1000">
              Trợ lý AI mạnh mẽ cho các tiêu chuẩn xây dựng Việt Nam. Nhận câu
              trả lời tức thì về TCVN, QCVN, phòng cháy chữa cháy và tuân thủ
              xây dựng.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-top-9 duration-1200">
              <Link href="/login">
                <Button
                  size="lg"
                  className="gap-2 font-medium shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all"
                >
                  Dùng Miễn Phí <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="font-medium">
                  Khám Phá Tính Năng
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 md:mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all hover:shadow-3xl">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-muted-foreground font-medium">
                  VietBuild AI Chat
                </span>
              </div>
              <div className="p-6 md:p-8 bg-gradient-to-b from-background to-muted/20">
                <div className="space-y-6">
                  {/* User Message */}
                  <div className="flex justify-end animate-in slide-in-from-right-5 duration-500">
                    <div className="max-w-md rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary/90 px-4 py-3 text-primary-foreground shadow-lg">
                      <p className="text-sm">
                        Độ sụt bê tông tối thiểu cho công trình móng theo TCVN
                        4453 là bao nhiêu?
                      </p>
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex gap-3 animate-in slide-in-from-left-5 duration-700 delay-300">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-xl rounded-2xl rounded-tl-md bg-muted/80 backdrop-blur-sm px-4 py-3 shadow-md">
                      <p className="text-sm text-foreground">
                        Theo{" "}
                        <span className="font-semibold text-primary">
                          TCVN 4453:1995
                        </span>
                        , độ sụt bê tông tối thiểu cho công trình móng là:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span>
                            <strong>80-120mm</strong> cho móng tiêu chuẩn
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span>
                            <strong>100-150mm</strong> cho cốt thép dày đặc
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Everything you need for construction compliance
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              Powerful AI tools designed specifically for Vietnamese
              construction professionals.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border bg-card transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/30 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Choose the plan that fits your needs
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              Start free with our Normal plan or unlock full power with Pro.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {/* Normal Plan */}
            <Card className="relative border-border bg-card">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Normal</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      For individuals
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-foreground">
                    Free
                  </span>
                  <span className="text-muted-foreground"> / forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {normalFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary bg-card">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1 bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3" /> Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pro</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      For professionals
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-foreground">
                    $29
                  </span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block">
                  <Button className="w-full">
                    Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 md:px-16 md:py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
                Ready to simplify construction compliance?
              </h2>
              <p className="mt-4 text-primary-foreground/80 text-pretty">
                Join thousands of Vietnamese construction professionals using
                VietBuild AI to stay compliant and save time.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    Get Started for Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">
                VietBuild AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered Construction Compliance & Legal Assistant for Vietnam
            </p>
            <p className="text-sm text-muted-foreground">
              2026 VietBuild AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
