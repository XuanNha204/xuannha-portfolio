"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { SkillDTO } from "@/types";
import { useCrud } from "@/hooks/use-crud";
import { PageHeader } from "@/features/admin/page-header";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

const CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "devops", label: "DevOps" },
  { value: "tools", label: "Công cụ" },
  { value: "other", label: "Khác" },
] as const;

const EMPTY_FORM = {
  name: "",
  category: "frontend" as SkillDTO["category"],
  order: 0,
  visible: true,
};

export function SkillManager() {
  const { list, create, update, remove } = useCrud<SkillDTO>("skills");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SkillDTO | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(skill: SkillDTO) {
    setEditing(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      order: skill.order,
      visible: skill.visible,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, order: Number(form.order) };
    const onSuccess = () => setOpen(false);
    if (editing) {
      update.mutate({ id: editing._id, data: payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  }

  const grouped = (list.data ?? []).reduce<Record<string, SkillDTO[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Quản lý kỹ năng" description="Kỹ năng hiển thị trên trang chủ và About.">
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm kỹ năng
        </Button>
      </PageHeader>

      {list.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (list.data ?? []).length === 0 ? (
        <EmptyState title="Chưa có kỹ năng nào" description="Bấm 'Thêm kỹ năng' để bắt đầu." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {CATEGORIES.filter((c) => grouped[c.value]?.length).map((cat) => (
            <div
              key={cat.value}
              className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-accent">
                {cat.label}
              </h2>
              <div className="space-y-2">
                {grouped[cat.value].map((skill) => (
                  <div
                    key={skill._id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-primary">{skill.name}</span>
                      {!skill.visible && <Badge>Ẩn</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Sửa"
                        onClick={() => openEdit(skill)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Xóa"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => {
                          if (confirm(`Xóa kỹ năng "${skill.name}"?`)) remove.mutate(skill._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Sửa kỹ năng" : "Thêm kỹ năng"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Tên kỹ năng *</Label>
            <Input
              id="skill-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="React, Node.js…"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nhóm</Label>
              <Select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as SkillDTO["category"] })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-order">Thứ tự</Label>
              <Input
                id="skill-order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Hiển thị công khai</Label>
            <Switch
              checked={form.visible}
              onCheckedChange={(visible) => setForm({ ...form, visible })}
            />
          </div>
          <Button
            type="submit"
            variant="accent"
            className="w-full"
            loading={create.isPending || update.isPending}
          >
            {editing ? "Cập nhật" : "Thêm kỹ năng"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
