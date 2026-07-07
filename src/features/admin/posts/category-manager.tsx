"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { CategoryDTO } from "@/types";
import { useCrud } from "@/hooks/use-crud";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CategoryManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { list, create, remove } = useCrud<CategoryDTO>("categories");
  const [name, setName] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name: name.trim() } as Partial<CategoryDTO>, {
      onSuccess: () => setName(""),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Quản lý danh mục">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục mới…"
        />
        <Button type="submit" variant="accent" loading={create.isPending}>
          {!create.isPending && <Plus className="h-4 w-4" />}
          Thêm
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        {list.data?.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">Chưa có danh mục nào.</p>
        )}
        {list.data?.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-primary">{cat.name}</p>
              <p className="font-mono text-xs text-muted">/{cat.slug}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-danger hover:bg-danger/10"
              aria-label="Xóa danh mục"
              onClick={() => {
                if (confirm(`Xóa danh mục "${cat.name}"?`)) remove.mutate(cat._id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
