"use client";

import { useState } from "react";
import {
  Building2,
  MessageSquare,
  FileUp,
  BookOpen,
  FileCheck,
  Settings,
  ChevronDown,
  User,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: MessageSquare, label: "Trợ Lý AI", active: true },
  { icon: FileUp, label: "Phân Tích Tài Liệu" },
  { icon: BookOpen, label: "Kho Luật Pháp" },
  { icon: FileCheck, label: "Báo Cáo Tuân Thủ" },
  { icon: Settings, label: "Cài Đặt" },
];

type UserMode = "enterprise" | "student";

export function Sidebar() {
  const [userMode, setUserMode] = useState<UserMode>("enterprise");

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Branding */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">ConstructionIQ</h1>
          <p className="text-xs text-sidebar-foreground/60">Trợ Lý Xây Dựng</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-3 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Nguyen Van A</p>
                <p className="text-xs text-sidebar-foreground/60">
                  {userMode === "enterprise" ? "Enterprise" : "Student"} Mode
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setUserMode("enterprise")}>
              <Briefcase className="mr-2 h-4 w-4" />
              Enterprise Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUserMode("student")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Student Mode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
