import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { getPublishedPosts, getCategories } from "@/services/blog.service";
import { BlogCard } from "@/components/shared/blog-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Chia sẻ kiến thức về lập trình web, Next.js, AI và Vibe Coding.",
};

type SearchParams = Promise<{ page?: string; category?: string; q?: string; tag?: string }>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { page = "1", category, q, tag } = await searchParams;

  const [result, categories] = await Promise.all([
    getPublishedPosts({
      page: Number(page) || 1,
      limit: 9,
      category,
      search: q,
      tag,
    }),
    getCategories(),
  ]);

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { category, q, tag, ...params };
    for (const [key, value] of Object.entries(merged)) {
      if (value) sp.set(key, value);
    }
    const s = sp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="py-20">
      <div className="container-page">
        <Reveal className="mb-12 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            {"// blog"}
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-muted">
            Kiến thức, kinh nghiệm và góc nhìn về phát triển phần mềm hiện đại.
          </p>
        </Reveal>

        {/* Search + category filter */}
        <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form action="/blog" className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm kiếm bài viết…"
              className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {category && <input type="hidden" name="category" value={category} />}
          </form>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/blog${buildQuery({ category: undefined, page: undefined })}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  !category
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
                )}
              >
                Tất cả
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/blog${buildQuery({ category: cat.slug, page: undefined })}`}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    category === cat.slug
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </Reveal>

        {result.items.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={q ? `Không tìm thấy bài viết cho “${q}”` : "Chưa có bài viết nào"}
            description="Thử từ khóa khác hoặc quay lại sau nhé."
          />
        ) : (
          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((post) => (
              <RevealItem key={post._id}>
                <BlogCard post={post} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {/* Pagination */}
        {result.pages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-2">
            {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog${buildQuery({ page: String(p) })}`}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                  p === result.page
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
                )}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
