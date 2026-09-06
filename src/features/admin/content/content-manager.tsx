"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { signOut } from "next-auth/react";
import { SiteContentForm } from "./site-content-form";
const SocialLinksManager = dynamic(() => import("./social-links-manager").then((module) => module.SocialLinksManager), { loading: () => <p role="status">Đang tải…</p> });
const ProfileInfoForm = dynamic(() => import("@/features/admin/profile/profile-info-form").then((module) => module.ProfileInfoForm), { loading: () => <p role="status">Đang tải…</p> });
const ChangePasswordForm = dynamic(() => import("@/features/admin/profile/change-password-form").then((module) => module.ChangePasswordForm), { loading: () => <p role="status">Đang tải…</p> });
const MessageManager = dynamic(() => import("@/features/admin/messages/message-manager").then((module) => module.MessageManager), { loading: () => <p role="status">Đang tải…</p> });
import { cn } from "@/lib/utils";
const sections = [
  { key: "content", label: "Nội dung website" }, { key: "profile", label: "Hồ sơ & ảnh" },
  { key: "links", label: "Mạng xã hội" }, { key: "messages", label: "Tin nhắn" }, { key: "account", label: "Tài khoản" },
] as const;
export function ContentManager() {
  const [active, setActive] = useState<string>("content");
  const [visited, setVisited] = useState<string[]>(["content"]);
  const panels: Record<string, React.ReactNode> = { content: <SiteContentForm />, profile: <ProfileInfoForm />, links: <SocialLinksManager />, messages: <MessageManager />, account: <ChangePasswordForm /> };
  return <div>
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div><p className="compact-eyebrow">Không gian quản trị</p><h1 className="mt-3 text-3xl font-semibold">Nội dung của bạn.</h1><p className="mt-2 text-sm text-muted">Một trang. Một câu chuyện. Quản lý tại đây.</p></div>
      <div className="flex gap-4 text-sm"><a href="/" target="_blank" rel="noopener noreferrer" className="py-3 hover:text-accent">Xem website ↗</a><button type="button" className="py-3 text-muted hover:text-primary" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Đăng xuất</button></div>
    </div>
    <nav aria-label="Mục quản trị" className="mb-8 flex flex-wrap gap-2 border-b border-border pb-5">
      {sections.map((section) => <button key={section.key} type="button" aria-pressed={active === section.key} onClick={() => { setActive(section.key); setVisited((previous) => previous.includes(section.key) ? previous : [...previous, section.key]); }} className={cn("min-h-11 rounded-lg px-4 py-2 text-sm transition-colors", active === section.key ? "bg-inverse text-inverse-fg" : "text-muted hover:bg-surface hover:text-primary")}>{section.label}</button>)}
    </nav>
    {sections.filter((section) => visited.includes(section.key)).map((section) => <section key={section.key} hidden={active !== section.key} aria-label={section.label}>{panels[section.key]}</section>)}
  </div>;
}
