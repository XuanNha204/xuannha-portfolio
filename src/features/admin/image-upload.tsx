"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import type { MediaDTO } from "@/types";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  accept?: string;
  label?: string;
}

/** Uploads a file to /api/media, stores it in MongoDB, and returns its data URL. */
export function ImageUpload({
  value,
  onChange,
  folder = "xuannha-dev",
  className,
  accept = "image/*",
  label = "Tải ảnh lên",
}: ImageUploadProps) {
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
      toast.success("Đã tải lên");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-border/30">
          <Image
            src={value}
            alt="Ảnh đã tải lên"
            fill
            unoptimized
            className="object-cover"
            sizes="400px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-primary/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Xóa ảnh"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
          <span className="text-sm">{uploading ? "Đang tải lên…" : label}</span>
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
