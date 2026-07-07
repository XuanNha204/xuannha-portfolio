"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Trash2, Copy, FileVideo, FileText, File, Loader2 } from "lucide-react";
import type { MediaDTO, Paginated } from "@/types";
import { apiGet, apiDelete } from "@/lib/fetcher";
import { PageHeader } from "@/features/admin/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["media", type, page],
    queryFn: () => apiGet<Paginated<MediaDTO>>(`/api/media?type=${type}&page=${page}&limit=24`),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/media/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa file");
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  async function handleUpload(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/media", { method: "POST", body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Upload "${file.name}" thất bại`);
        }
      }
      toast.success("Đã tải lên thành công");
      queryClient.invalidateQueries({ queryKey: ["media"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Quản lý Media" description="Ảnh, video, PDF — lưu trực tiếp trong database.">
        <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-36">
          <option value="all">Tất cả</option>
          <option value="image">Ảnh</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
        </Select>
        <Button variant="accent" onClick={() => inputRef.current?.click()} loading={uploading}>
          {!uploading && <Upload className="h-4 w-4" />}
          Tải lên
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="Chưa có file nào"
          description="Bấm 'Tải lên' để thêm ảnh, video hoặc PDF."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.items.map((media) => (
              <div
                key={media._id}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-square bg-border/30">
                  {media.type === "image" ? (
                    <Image
                      src={media.url}
                      alt={media.name}
                      fill
                      unoptimized
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                      {media.type === "video" ? (
                        <FileVideo className="h-8 w-8" />
                      ) : media.type === "pdf" ? (
                        <FileText className="h-8 w-8" />
                      ) : (
                        <File className="h-8 w-8" />
                      )}
                      <span className="px-2 text-center text-xs uppercase">{media.format || media.type}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center gap-2 bg-primary/50 opacity-0 backdrop-blur-sm transition-opacity",
                      "group-hover:opacity-100"
                    )}
                  >
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(media.url);
                        toast.success("Đã copy URL");
                      }}
                      className="rounded-lg bg-white/90 p-2 text-primary transition-transform hover:scale-105"
                      aria-label="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa "${media.name}"?`)) remove.mutate(media._id);
                      }}
                      className="rounded-lg bg-danger/90 p-2 text-white transition-transform hover:scale-105"
                      aria-label="Xóa"
                    >
                      {remove.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-primary">{media.name}</p>
                  <p className="text-[11px] text-muted">{formatBytes(media.bytes)}</p>
                </div>
              </div>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
