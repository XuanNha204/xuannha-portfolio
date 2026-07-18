"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  function pickFile() {
    inputRef.current?.click();
  }

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
    <div className={cn("space-y-3", className)}>
      {value ? (
        <>
          {/* Bấm vào ảnh cũng mở hộp chọn file để thay avatar */}
          <button
            type="button"
            onClick={pickFile}
            disabled={loading}
            aria-label="Đổi avatar"
            className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-full border border-border bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <Image src={value} alt="Avatar đã chọn" fill unoptimized className="object-cover" />
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-primary/55 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Pencil className="h-4 w-4" /> Đổi avatar
                </>
              )}
            </span>
          </button>

          {/* Nút luôn hiển thị — dùng được cả trên màn hình cảm ứng (không có hover) */}
          <div className="flex items-center justify-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={pickFile} loading={loading}>
              {!loading && <Pencil className="h-3.5 w-3.5" />}
              Đổi avatar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                toast.success("Đã xóa avatar. Bấm Lưu hồ sơ để áp dụng.");
              }}
              className="text-danger hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={pickFile}
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
