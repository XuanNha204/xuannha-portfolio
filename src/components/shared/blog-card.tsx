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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/30 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-border/30">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <FileText className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2.5 text-xs text-muted">
          {category && <Badge variant="accent">{category.name}</Badge>}
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>

        <h3 className="mt-3.5 line-clamp-2 font-heading text-lg font-semibold tracking-tight text-primary transition-colors duration-200 group-hover:text-accent">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {post.readingTime} phút đọc
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {post.views.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
