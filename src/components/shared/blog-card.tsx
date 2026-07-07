import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, FileText } from "lucide-react";
import type { BlogPostDTO } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post }: { post: BlogPostDTO }) {
  const category = typeof post.category === "object" ? post.category : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-border/40">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <FileText className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          {category && <Badge variant="accent">{category.name}</Badge>}
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>

        <h3 className="mt-3 line-clamp-2 font-heading text-lg font-semibold text-primary transition-colors group-hover:text-accent">
          {post.title}
        </h3>

        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>}

        <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} phút đọc
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.views.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
