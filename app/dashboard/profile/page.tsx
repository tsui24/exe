"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  Crown,
  Bell,
  Globe,
  Palette,
  Shield,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Personal Information
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [documentNotifications, setDocumentNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleSaveProfile = () => {
    toast({
      title: "Đã lưu thay đổi",
      description: "Thông tin hồ sơ của bạn đã được cập nhật thành công.",
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Đã đổi mật khẩu",
      description: "Mật khẩu của bạn đã được cập nhật thành công.",
    });

    // Reset fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cài Đặt Hồ Sơ</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Thông Tin Tài Khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  {user?.plan === "pro" ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="mr-1 h-3 w-3" />
                      Tài Khoản Pro
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Tài Khoản Cơ Bản</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Đổi Ảnh Đại Diện
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Thông Tin Cá Nhân
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin liên hệ và chi tiết công ty của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="mb-1 mr-1 inline-block h-4 w-4" />
                  Họ và Tên
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mb-1 mr-1 inline-block h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mb-1 mr-1 inline-block h-4 w-4" />
                  Số Điện Thoại
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 123 456 789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">
                  <Building2 className="mb-1 mr-1 inline-block h-4 w-4" />
                  Công Ty
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Tên công ty"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="mb-1 mr-1 inline-block h-4 w-4" />
                Địa Chỉ
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ công ty hoặc nơi làm việc"
              />
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Lưu Thay Đổi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" />
              Đổi Mật Khẩu
            </CardTitle>
            <CardDescription>
              Cập nhật mật khẩu của bạn để bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật Khẩu Hiện Tại</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật Khẩu Mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={handleChangePassword}>
                <Lock className="mr-2 h-4 w-4" />
                Cập Nhật Mật Khẩu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Tùy Chọn & Thông Báo
            </CardTitle>
            <CardDescription>
              Quản lý thông báo và các tùy chọn cá nhân hóa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông Báo Email</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo về hoạt động tài khoản qua email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông Báo Tài Liệu</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo khi phân tích tài liệu hoàn tất
                </p>
              </div>
              <Switch
                checked={documentNotifications}
                onCheckedChange={setDocumentNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Xác Thực Hai Yếu Tố (2FA)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tăng cường bảo mật với xác thực hai yếu tố
                </p>
              </div>
              <Switch
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plan & Billing */}
        {user?.plan === "pro" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-amber-500" />
                Gói Dịch Vụ & Thanh Toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-amber-50 p-4 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Gói Pro</h3>
                    <p className="text-sm text-muted-foreground">
                      Truy cập đầy đủ tất cả tính năng
                    </p>
                  </div>
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    Đang Hoạt Động
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chu kỳ thanh toán:</span>
                    <span className="font-medium">Hàng tháng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày gia hạn:</span>
                    <span className="font-medium">25/02/2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giá:</span>
                    <span className="font-medium">2.497.000 VNĐ/tháng</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Quản Lý Thanh Toán
                </Button>
                <Button variant="outline" className="flex-1">
                  Xem Lịch Sử Hóa Đơn
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <Shield className="h-4 w-4" />
              Vùng Nguy Hiểm
            </CardTitle>
            <CardDescription>
              Các hành động không thể hoàn tác
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
              <div>
                <p className="font-medium">Xóa Tài Khoản</p>
                <p className="text-sm text-muted-foreground">
                  Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Xóa Tài Khoản
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
