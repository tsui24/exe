"use client";

import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments } from "@/lib/document-context";

// Mock user data for demo
const mockUsers = [
  {
    id: "1",
    name: "Nguyen Van A",
    email: "nguyen.a@company.com",
    role: "user",
    documentsUploaded: 12,
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Tran Thi B",
    email: "tran.b@company.com",
    role: "user",
    documentsUploaded: 8,
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Le Van C",
    email: "le.c@company.com",
    role: "user",
    documentsUploaded: 5,
    lastActive: "3 hours ago",
  },
  {
    id: "4",
    name: "Pham Thi D",
    email: "pham.d@company.com",
    role: "user",
    documentsUploaded: 15,
    lastActive: "Just now",
  },
];

const recentActivity = [
  {
    id: "1",
    action: "Document uploaded",
    user: "Nguyen Van A",
    document: "Hoso_Thau_01.pdf",
    time: "5 minutes ago",
    type: "upload",
  },
  {
    id: "2",
    action: "Analysis completed",
    user: "System",
    document: "BVTC_Structure.dwg",
    time: "15 minutes ago",
    type: "analysis",
  },
  {
    id: "3",
    action: "Risk flagged",
    user: "System",
    document: "Fire_Safety_Plan.pdf",
    time: "1 hour ago",
    type: "alert",
  },
  {
    id: "4",
    action: "User login",
    user: "Tran Thi B",
    document: null,
    time: "2 hours ago",
    type: "login",
  },
  {
    id: "5",
    action: "Document deleted",
    user: "Le Van C",
    document: "Old_Report.pdf",
    time: "3 hours ago",
    type: "delete",
  },
];

export default function AdminDashboardPage() {
  const { documents } = useDocuments();

  // Calculate stats
  const totalUsers = mockUsers.length;
  const totalDocuments = documents.length;
  const totalRisks = documents.reduce(
    (acc, doc) => acc + (doc.analysisResults?.risks.length || 0),
    0,
  );
  const processingDocuments = documents.filter(
    (d) => d.status === "processing" || d.status === "uploading",
  ).length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <FileText className="h-4 w-4 text-primary" />;
      case "analysis":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "login":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "delete":
        return <Clock className="h-4 w-4 text-warning-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bảng Điều Khiển Quản Trị</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống và quản lý</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Tổng Người Dùng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDocuments}</p>
              <p className="text-sm text-muted-foreground">Tài Liệu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRisks}</p>
              <p className="text-sm text-muted-foreground">Rủi Ro Đánh Dấu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processingDocuments}</p>
              <p className="text-sm text-muted-foreground">Đang Xử Lý</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Người Dùng Gần Đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {user.documentsUploaded} docs
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.lastActive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Hoạt Động Gần Đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user}
                      {activity.document && ` - ${activity.document}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Avg. Processing Time
                </p>
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success"
                >
                  Good
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">2.3s</p>
              <p className="text-xs text-muted-foreground">per document</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <Badge
                  variant="secondary"
                  className="bg-warning/10 text-warning-foreground"
                >
                  Moderate
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">78%</p>
              <p className="text-xs text-muted-foreground">across all docs</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success"
                >
                  Excellent
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">99.9%</p>
              <p className="text-xs text-muted-foreground">last 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
