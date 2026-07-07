"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, ExternalLink, FolderOpen } from "lucide-react";
import type { Paginated, BlogPostDTO } from "@/types";
import { apiGet, apiDelete } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/use-debounce";
import { PageHeader } from "@/features/admin/page-header";
import { CategoryManager } from "@/features/admin/posts/category-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "accent" }> = {
  published: { label: "Công khai", variant: "success" },
  draft: { label: "Nháp", variant: "warning" },
  scheduled: { label: "Hẹn giờ", variant: "accent" },
};

export function PostList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts", debouncedSearch, status, page],
    queryFn: () =>
      apiGet<Paginated<BlogPostDTO>>(
        `/api/posts?search=${encodeURIComponent(debouncedSearch)}&status=${status}&page=${page}&limit=10`
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/posts/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa bài viết");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <PageHeader title="Quản lý bài viết" description="Viết, chỉnh sửa và xuất bản blog.">
        <Button variant="outline" onClick={() => setCategoryOpen(true)}>
          <FolderOpen className="h-4 w-4" /> Danh mục
        </Button>
        <Link href="/admin/posts/new">
          <Button variant="accent">
            <Plus className="h-4 w-4" /> Viết bài
          </Button>
        </Link>
      </PageHeader>

      <CategoryManager open={categoryOpen} onClose={() => setCategoryOpen(false)} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tiêu đề…"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-4 text-sm shadow-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Công khai</option>
          <option value="draft">Nháp</option>
          <option value="scheduled">Hẹn giờ</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Chưa có bài viết nào" description="Bấm 'Viết bài' để bắt đầu." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Bài viết</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Trạng thái</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Danh mục</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Lượt xem</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((post) => {
                  const st = STATUS_LABEL[post.status];
                  const category = typeof post.category === "object" ? post.category : null;
                  return (
                    <tr key={post._id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-4 py-3">
                        <p className="line-clamp-1 font-medium text-primary">{post.title}</p>
                        <p className="text-xs text-muted">
                          {post.status === "scheduled" && post.scheduledAt
                            ? `Đăng lúc ${new Date(post.scheduledAt).toLocaleString("vi-VN")}`
                            : formatDate(post.publishedAt || post.updatedAt)}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-muted lg:table-cell">
                        {category?.name ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-muted lg:table-cell">{post.views}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {post.status === "published" && (
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="icon" aria-label="Xem bài">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          <Link href={`/admin/posts/${post._id}`}>
                            <Button variant="ghost" size="icon" aria-label="Sửa">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Xóa"
                            className="text-danger hover:bg-danger/10"
                            onClick={() => {
                              if (confirm(`Xóa bài viết "${post.title}"?`)) {
                                remove.mutate(post._id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
