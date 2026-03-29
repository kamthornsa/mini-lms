"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileQuestion,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/sections", label: "Sections", icon: Users },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/quizzes", label: "Quizzes", icon: FileQuestion },
  { href: "/admin/submissions", label: "Submissions", icon: FileText },
];

function SidebarInner({
  collapsed,
  userName,
  onClose,
}: {
  collapsed: boolean;
  userName: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b h-14 px-4 shrink-0",
          collapsed ? "justify-center" : "justify-between gap-2",
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-base leading-none">Mini LMS</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t shrink-0">
        {!collapsed && (
          <div className="px-3 py-1 text-xs text-muted-foreground mb-1 truncate">
            {userName}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title={collapsed ? "ออกจากระบบ" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && "ออกจากระบบ"}
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ userName }: { userName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 z-30 bg-background border-b flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <p className="font-bold text-sm">Mini LMS</p>
      </div>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-60 bg-background border-r shadow-xl">
            <SidebarInner
              collapsed={false}
              userName={userName}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Desktop: collapsible sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 bg-background border-r shrink-0 relative transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarInner collapsed={collapsed} userName={userName} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[3.75rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
