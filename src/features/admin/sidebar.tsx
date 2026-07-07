"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Wrench,
  UserRound,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Dự án", icon: FolderGit2 },
  { href: "/admin/posts", label: "Bài viết", icon: FileText },
  { href: "/admin/skills", label: "Kỹ năng", icon: Wrench },
  { href: "/admin/profile", label: "Hồ sơ", icon: UserRound },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/messages", label: "Tin nhắn", icon: MessageSquare },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent/10 text-accent"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 px-3 py-4">
      <p className="mb-3 truncate px-3 text-xs text-white/50">Đăng nhập: {userName}</p>
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="h-4 w-4" />
        Xem website
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-danger/20 hover:text-danger"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-primary px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-heading font-bold text-white">
          <Terminal className="h-5 w-5 text-accent" /> CMS
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-white"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-primary/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-14 flex h-[calc(100vh-3.5rem)] w-64 flex-col bg-primary">
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-primary lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Terminal className="h-4 w-4" />
          </span>
          <span className="font-heading font-bold text-white">
            XuanNha<span className="text-accent">.CMS</span>
          </span>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
