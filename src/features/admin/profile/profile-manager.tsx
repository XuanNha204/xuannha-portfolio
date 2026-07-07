"use client";

import { useState } from "react";
import { UserRound, Briefcase, GraduationCap, Award, Share2, KeyRound } from "lucide-react";
import type { ExperienceDTO, EducationDTO, CertificateDTO, SocialLinkDTO } from "@/types";
import { PageHeader } from "@/features/admin/page-header";
import { ProfileInfoForm } from "./profile-info-form";
import { ChangePasswordForm } from "./change-password-form";
import { CrudSection } from "./crud-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";

const TABS = [
  { id: "info", label: "Thông tin", icon: UserRound },
  { id: "experience", label: "Kinh nghiệm", icon: Briefcase },
  { id: "education", label: "Học vấn", icon: GraduationCap },
  { id: "certificates", label: "Chứng chỉ", icon: Award },
  { id: "social", label: "Mạng xã hội", icon: Share2 },
  { id: "security", label: "Bảo mật", icon: KeyRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : "");

export function ProfileManager() {
  const [tab, setTab] = useState<TabId>("info");

  return (
    <div>
      <PageHeader
        title="Quản lý hồ sơ"
        description="Thông tin cá nhân, học vấn, kinh nghiệm, chứng chỉ và liên kết."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <ProfileInfoForm />}

      {tab === "security" && <ChangePasswordForm />}

      {tab === "experience" && (
        <CrudSection<ExperienceDTO, Record<string, string | boolean>>
          resource="experiences"
          title="Kinh nghiệm làm việc"
          addLabel="Thêm kinh nghiệm"
          emptyForm={{
            company: "",
            position: "",
            description: "",
            startDate: "",
            endDate: "",
            current: false,
            location: "",
            technologies: "",
          }}
          toForm={(exp) => ({
            company: exp.company,
            position: exp.position,
            description: exp.description ?? "",
            startDate: toDateInput(exp.startDate),
            endDate: toDateInput(exp.endDate),
            current: exp.current,
            location: exp.location ?? "",
            technologies: exp.technologies.join(", "),
          })}
          toPayload={(form) => ({
            ...form,
            technologies: String(form.technologies)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })}
          itemName={(exp) => `${exp.position} @ ${exp.company}`}
          renderItem={(exp) => (
            <div>
              <p className="font-medium text-primary">{exp.position}</p>
              <p className="text-sm text-accent">{exp.company}</p>
              <p className="mt-1 font-mono text-xs text-muted">
                {formatDate(exp.startDate)} — {exp.current ? "Hiện tại" : formatDate(exp.endDate)}
              </p>
            </div>
          )}
          renderForm={(form, setForm) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Công ty *</Label>
                  <Input
                    value={String(form.company)}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vị trí *</Label>
                  <Input
                    value={String(form.position)}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bắt đầu *</Label>
                  <Input
                    type="date"
                    value={String(form.startDate)}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kết thúc</Label>
                  <Input
                    type="date"
                    value={String(form.endDate)}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    disabled={Boolean(form.current)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Đang làm việc tại đây</Label>
                <Switch
                  checked={Boolean(form.current)}
                  onCheckedChange={(current) => setForm({ ...form, current })}
                />
              </div>
              <div className="space-y-2">
                <Label>Địa điểm</Label>
                <Input
                  value={String(form.location)}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả công việc</Label>
                <Textarea
                  rows={3}
                  value={String(form.description)}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Công nghệ (phân cách bởi dấu phẩy)</Label>
                <Input
                  value={String(form.technologies)}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                />
              </div>
            </>
          )}
        />
      )}

      {tab === "education" && (
        <CrudSection<EducationDTO, Record<string, string | boolean>>
          resource="educations"
          title="Học vấn"
          addLabel="Thêm học vấn"
          emptyForm={{
            school: "",
            degree: "",
            field: "",
            description: "",
            startDate: "",
            endDate: "",
            current: false,
            gpa: "",
          }}
          toForm={(edu) => ({
            school: edu.school,
            degree: edu.degree,
            field: edu.field ?? "",
            description: edu.description ?? "",
            startDate: toDateInput(edu.startDate),
            endDate: toDateInput(edu.endDate),
            current: edu.current,
            gpa: edu.gpa ?? "",
          })}
          toPayload={(form) => ({ ...form })}
          itemName={(edu) => edu.school}
          renderItem={(edu) => (
            <div>
              <p className="font-medium text-primary">{edu.school}</p>
              <p className="text-sm text-accent">
                {edu.degree}
                {edu.field ? ` · ${edu.field}` : ""}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">
                {formatDate(edu.startDate)} — {edu.current ? "Hiện tại" : formatDate(edu.endDate)}
              </p>
            </div>
          )}
          renderForm={(form, setForm) => (
            <>
              <div className="space-y-2">
                <Label>Trường *</Label>
                <Input
                  value={String(form.school)}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bằng cấp *</Label>
                  <Input
                    value={String(form.degree)}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chuyên ngành</Label>
                  <Input
                    value={String(form.field)}
                    onChange={(e) => setForm({ ...form, field: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bắt đầu *</Label>
                  <Input
                    type="date"
                    value={String(form.startDate)}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kết thúc</Label>
                  <Input
                    type="date"
                    value={String(form.endDate)}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    disabled={Boolean(form.current)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Đang theo học</Label>
                <Switch
                  checked={Boolean(form.current)}
                  onCheckedChange={(current) => setForm({ ...form, current })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GPA</Label>
                  <Input
                    value={String(form.gpa)}
                    onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  rows={3}
                  value={String(form.description)}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </>
          )}
        />
      )}

      {tab === "certificates" && (
        <CrudSection<CertificateDTO, Record<string, string>>
          resource="certificates"
          title="Chứng chỉ"
          addLabel="Thêm chứng chỉ"
          emptyForm={{ name: "", issuer: "", issueDate: "", credentialUrl: "" }}
          toForm={(cert) => ({
            name: cert.name,
            issuer: cert.issuer,
            issueDate: toDateInput(cert.issueDate),
            credentialUrl: cert.credentialUrl ?? "",
          })}
          toPayload={(form) => ({ ...form })}
          itemName={(cert) => cert.name}
          renderItem={(cert) => (
            <div>
              <p className="font-medium text-primary">{cert.name}</p>
              <p className="text-sm text-muted">
                {cert.issuer}
                {cert.issueDate ? ` · ${formatDate(cert.issueDate)}` : ""}
              </p>
            </div>
          )}
          renderForm={(form, setForm) => (
            <>
              <div className="space-y-2">
                <Label>Tên chứng chỉ *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tổ chức cấp *</Label>
                  <Input
                    value={form.issuer}
                    onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày cấp</Label>
                  <Input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link chứng chỉ</Label>
                <Input
                  placeholder="https://…"
                  value={form.credentialUrl}
                  onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
                />
              </div>
            </>
          )}
        />
      )}

      {tab === "social" && (
        <CrudSection<SocialLinkDTO, Record<string, string | boolean>>
          resource="social-links"
          title="Liên kết mạng xã hội"
          addLabel="Thêm liên kết"
          emptyForm={{ platform: "github", label: "", url: "", visible: true }}
          toForm={(link) => ({
            platform: link.platform,
            label: link.label,
            url: link.url,
            visible: link.visible,
          })}
          toPayload={(form) => ({ ...form })}
          itemName={(link) => link.label}
          renderItem={(link) => (
            <div className="flex items-center gap-3">
              <Badge variant="accent">{link.platform}</Badge>
              <div className="min-w-0">
                <p className="font-medium text-primary">{link.label}</p>
                <p className="truncate font-mono text-xs text-muted">{link.url}</p>
              </div>
              {!link.visible && <Badge>Ẩn</Badge>}
            </div>
          )}
          renderForm={(form, setForm) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nền tảng</Label>
                  <Select
                    value={String(form.platform)}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  >
                    <option value="github">Github</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                    <option value="zalo">Zalo</option>
                    <option value="email">Email</option>
                    <option value="youtube">Youtube</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="instagram">Instagram</option>
                    <option value="other">Khác</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tên hiển thị *</Label>
                  <Input
                    value={String(form.label)}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  placeholder="https://…"
                  value={String(form.url)}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Hiển thị công khai</Label>
                <Switch
                  checked={Boolean(form.visible)}
                  onCheckedChange={(visible) => setForm({ ...form, visible })}
                />
              </div>
            </>
          )}
        />
      )}
    </div>
  );
}
