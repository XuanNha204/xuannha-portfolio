"use client";

import { useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

interface CrudSectionProps<T extends { _id: string }, F> {
  resource: string;
  title: string;
  addLabel: string;
  emptyForm: F;
  toForm: (item: T) => F;
  toPayload: (form: F) => Record<string, unknown>;
  renderItem: (item: T) => ReactNode;
  renderForm: (form: F, setForm: (form: F) => void) => ReactNode;
  itemName: (item: T) => string;
}

/** Reusable list + dialog-form CRUD block for simple profile resources. */
export function CrudSection<T extends { _id: string }, F>({
  resource,
  title,
  addLabel,
  emptyForm,
  toForm,
  toPayload,
  renderItem,
  renderForm,
  itemName,
}: CrudSectionProps<T, F>) {
  const { list, create, update, remove } = useCrud<T>(resource);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<F>(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setForm(toForm(item));
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = toPayload(form) as Partial<T>;
    const onSuccess = () => setOpen(false);
    if (editing) {
      update.mutate({ id: editing._id, data: payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-primary">{title}</h2>
        <Button variant="accent" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>

      {list.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (list.data ?? []).length === 0 ? (
        <EmptyState title={`Chưa có ${title.toLowerCase()}`} description={`Bấm '${addLabel}' để thêm mới.`} />
      ) : (
        <div className="space-y-3">
          {list.data!.map((item) => (
            <div
              key={item._id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => openEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Xóa"
                  className="text-danger hover:bg-danger/10"
                  onClick={() => {
                    if (confirm(`Xóa "${itemName(item)}"?`)) remove.mutate(item._id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Sửa ${title.toLowerCase()}` : addLabel}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm(form, setForm)}
          <Button
            type="submit"
            variant="accent"
            className="w-full"
            loading={create.isPending || update.isPending}
          >
            {editing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
