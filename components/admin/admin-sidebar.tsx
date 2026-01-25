"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Bảng Điều Khiển",
    href: "/admin",
  },
  {
    icon: Users,
    label: "Người Dùng",
    href: "/admin/users",
  },
  {
    icon: FileText,
    label: "Tất Cả Tài Liệu",
    href: "/admin/documents",
  },
  {
    icon: Settings,
    label: "Cài Đặt",
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Branding */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive">
          <Building2 className="h-6 w-6 text-destructive-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">ConstructionIQ</h1>
          <p className="text-xs text-sidebar-foreground/60">Trang Quản Trị</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-3 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive">
                <Shield className="h-5 w-5 text-destructive-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/60">
                  Quản Trị Viên
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Chuyển Sang Giao Diện Người Dùng</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng Xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
