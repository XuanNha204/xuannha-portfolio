"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MailOpen, Archive, Trash2, RotateCcw } from "lucide-react";
import type { MessageDTO, Paginated } from "@/types";
import { apiGet, apiPatch, apiDelete } from "@/lib/fetcher";
import { PageHeader } from "@/features/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatDate } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "Hộp thư" },
  { id: "unread", label: "Chưa đọc" },
  { id: "archived", label: "Lưu trữ" },
] as const;

export function MessageManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", filter, page],
    queryFn: () =>
      apiGet<Paginated<MessageDTO>>(`/api/messages?filter=${filter}&page=${page}&limit=20`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["messages"] });

  const patch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageDTO> }) =>
      apiPatch(`/api/messages/${id}`, data),
    onSuccess: invalidate,
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/messages/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa tin nhắn");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function toggleExpand(message: MessageDTO) {
    setExpanded(expanded === message._id ? null : message._id);
    if (!message.read) {
      patch.mutate({ id: message._id, data: { read: true } });
    }
  }

  return (
    <div>
      <PageHeader title="Tin nhắn liên hệ" description="Tin nhắn từ form liên hệ trên website." />

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              filter === f.id
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-6 w-6" />}
          title="Không có tin nhắn"
          description="Tin nhắn từ form liên hệ sẽ hiển thị ở đây."
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((message) => (
              <div
                key={message._id}
                className={cn(
                  "rounded-xl border bg-surface shadow-[var(--shadow-card)] transition-colors",
                  message.read ? "border-border" : "border-accent/40 bg-accent/[0.03]"
                )}
              >
                <button
                  onClick={() => toggleExpand(message)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      message.read ? "bg-border/50 text-muted" : "bg-accent/10 text-accent"
                    )}
                  >
                    {message.read ? <MailOpen className="h-4.5 w-4.5" /> : <Mail className="h-4.5 w-4.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("truncate text-sm", message.read ? "font-medium" : "font-bold")}>
                        {message.name}
                      </p>
                      {!message.read && <Badge variant="accent">Mới</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted">
                      {message.email}
                      {message.subject ? ` · ${message.subject}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDate(message.createdAt)}</span>
                </button>

                {expanded === message._id && (
                  <div className="border-t border-border px-4 py-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-secondary">
                      {message.content}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={`mailto:${message.email}?subject=Re: ${message.subject || "Liên hệ từ website"}`}>
                        <Button variant="accent" size="sm">
                          <Mail className="h-3.5 w-3.5" /> Trả lời qua email
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          patch.mutate({
                            id: message._id,
                            data: { archived: !message.archived },
                          })
                        }
                      >
                        {message.archived ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" /> Khôi phục
                          </>
                        ) : (
                          <>
                            <Archive className="h-3.5 w-3.5" /> Lưu trữ
                          </>
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm("Xóa tin nhắn này?")) remove.mutate(message._id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa
                      </Button>
                    </div>
                  </div>
                )}
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
