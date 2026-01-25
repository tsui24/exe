"use client";

import { Settings, Shield, Database, Bell, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cài Đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cấu hình hệ thống và tùy chọn
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Cài Đặt Chung
            </CardTitle>
            <CardDescription>
              Các tùy chọn cấu hình hệ thống cơ bản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="app-name">Tên Ứng Dụng</Label>
              <Input id="app-name" defaultValue="ConstructionIQ" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Tên Công Ty</Label>
              <Input id="company" defaultValue="ConstructionIQ Corp" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Chế Độ Bảo Trì</Label>
                <p className="text-sm text-muted-foreground">
                  Vô hiệu hóa truy cập cho người dùng không phải quản trị viên
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Auto logout after inactivity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeout">Session Timeout (minutes)</Label>
              <Input
                id="timeout"
                type="number"
                defaultValue="30"
                className="max-w-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Storage Settings
            </CardTitle>
            <CardDescription>
              Configure data storage and retention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="retention">Document Retention (days)</Label>
              <Input
                id="retention"
                type="number"
                defaultValue="365"
                className="max-w-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-size">Max File Size (MB)</Label>
              <Input
                id="max-size"
                type="number"
                defaultValue="50"
                className="max-w-[200px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-delete processed files</Label>
                <p className="text-sm text-muted-foreground">
                  Remove original files after analysis
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email alerts for critical issues
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify admins of high-risk findings
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                defaultValue="admin@vietbuild.ai"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Localization
            </CardTitle>
            <CardDescription>Language and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Default Language</Label>
              <Input
                id="language"
                defaultValue="Vietnamese"
                className="max-w-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                defaultValue="Asia/Ho_Chi_Minh (UTC+7)"
                className="max-w-[300px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
