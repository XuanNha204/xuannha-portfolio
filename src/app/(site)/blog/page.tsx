import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getPublishedPosts, getCategories } from "@/services/blog.service";
import { BlogCard } from "@/components/shared/blog-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { BlogSearchInput } from "@/components/site/blog-search-input";
import { T } from "@/components/site/site-preferences";
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
    <div className="py-24 md:py-28">
      <div className="container-page">
        <Reveal className="mb-14 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {"// blog"}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Blog
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
            <T k="blog.description" />
          </p>
        </Reveal>

        {/* Search + category filter */}
        <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form action="/blog" className="relative w-full max-w-sm">
            <BlogSearchInput defaultValue={q} />
            {category && <input type="hidden" name="category" value={category} />}
          </form>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/blog${buildQuery({ category: undefined, page: undefined })}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  !category
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
                )}
              >
                <T k="blog.all" />
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/blog${buildQuery({ category: cat.slug, page: undefined })}`}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    category === cat.slug
                      ? "border-accent bg-accent text-accent-fg"
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
            title={
              q ? (
                <>
                  <T k="blog.notFoundPrefix" /> “{q}”
                </>
              ) : (
                <T k="blog.emptyTitle" />
              )
            }
            description={<T k="blog.emptyDesc" />}
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
                    ? "border-accent bg-accent text-accent-fg"
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
