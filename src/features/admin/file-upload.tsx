"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, FileText, Loader2, Upload, X } from "lucide-react";
import type { MediaDTO } from "@/types";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  accept?: string;
  label?: string;
  fileLabel?: string;
}

/** Uploads a non-image file to /api/media, stores it in MongoDB, and returns its data URL. */
export function FileUpload({
  value,
  onChange,
  folder = "xuannha-dev",
  className,
  accept,
  label = "Tải file lên",
  fileLabel = "File đã tải lên",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Upload thất bại");
      }

      const media = (await res.json()) as MediaDTO;
      onChange(media.url);
      toast.success("Đã tải file lên. Bấm Lưu hồ sơ để lưu thay đổi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary">{fileLabel}</p>
              <p className="truncate font-mono text-[11px] text-muted">{value}</p>
            </div>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-border/50 hover:text-accent"
              aria-label="Mở file"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label="Xóa file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-8 text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-sm">{uploading ? "Đang tải lên..." : label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
