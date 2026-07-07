"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // MongoDB document limit is 16MB; keep avatars modest.

interface AvatarUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  className?: string;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không đọc được file ảnh"));
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({ value, onChange, className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Avatar tối đa 2MB");
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      onChange(dataUrl);
      toast.success("Đã chọn avatar. Bấm Lưu hồ sơ để lưu vào database.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không đọc được file ảnh");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="group relative aspect-square w-full overflow-hidden rounded-full border border-border bg-border/30">
          <Image src={value} alt="Avatar đã chọn" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-primary/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Xóa avatar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-border bg-background text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-sm">{loading ? "Đang đọc ảnh..." : "Tải avatar lên"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
