"use client";
import type { SocialLinkDTO } from "@/types";
import { CrudSection } from "@/features/admin/profile/crud-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
type LinkForm = { platform: string; label: string; url: string; visible: boolean; order: number };
export function SocialLinksManager() {
  return <CrudSection<SocialLinkDTO, LinkForm> resource="social-links" title="Mạng xã hội" addLabel="Thêm liên kết"
    emptyForm={{ platform: "github", label: "", url: "", visible: true, order: 0 }}
    toForm={(link) => ({ platform: link.platform, label: link.label, url: link.url, visible: link.visible !== false, order: link.order || 0 })}
    toPayload={(form) => ({ ...form })} itemName={(link) => link.label}
    renderItem={(link) => <div><p className="font-medium">{link.label} {!link.visible && <span className="text-xs text-muted">· Đang ẩn</span>}</p><p className="mt-1 break-all text-xs text-muted">{link.url}</p><p className="mt-1 text-xs text-muted">Thứ tự: {link.order || 0}</p></div>}
    renderForm={(form, setForm) => <>
      <div className="space-y-2"><Label htmlFor="social-platform">Nền tảng</Label><Select id="social-platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
        {["github", "linkedin", "facebook", "zalo", "youtube", "twitter", "instagram", "tiktok", "email", "other"].map((name) => <option key={name} value={name}>{name}</option>)}
      </Select></div>
      <div className="space-y-2"><Label htmlFor="social-label">Tên hiển thị</Label><Input id="social-label" required maxLength={100} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="social-url">Liên kết</Label><Input id="social-url" required type="url" placeholder="https://…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="social-order">Thứ tự (số nhỏ ở trên)</Label><Input id="social-order" type="number" min={0} step={1} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />Hiển thị công khai</label>
    </>}
  />;
}
