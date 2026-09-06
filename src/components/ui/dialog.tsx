"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
interface DialogProps { open: boolean; onClose: () => void; title?: string; children: ReactNode; className?: string; }
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <dialog ref={ref} aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : "Chỉnh sửa nội dung"}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}
    className={cn("fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-6 text-primary shadow-2xl backdrop:bg-black/60", className)}>
    <div className="mb-4 flex items-center justify-between gap-4">
      {title && <h2 id={titleId} className="text-lg font-semibold">{title}</h2>}
      <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-border/50" aria-label="Đóng"><X size={20} /></button>
    </div>
    {open && children}
  </dialog>;
}
