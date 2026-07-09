import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { BlogPostDTO } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { BlogCard } from "@/components/shared/blog-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";

export function LatestBlog({ posts }: { posts: BlogPostDTO[] }) {
  return (
    <section className="border-y border-border bg-surface py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="// blog"
          title="Bài viết mới nhất"
          description="Chia sẻ kiến thức, kinh nghiệm và góc nhìn về lập trình hiện đại."
        />

        {posts.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="Chưa có bài viết"
            description="Blog sẽ sớm có nội dung mới."
          />
        ) : (
          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <RevealItem key={post._id}>
                <BlogCard post={post} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        <Reveal className="mt-14 text-center">
          <Link
            href="/blog"
            className="group inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-7 text-[15px] font-medium text-primary transition-colors duration-200 hover:border-muted/50"
          >
            Xem tất cả bài viết
            <ArrowRight
              className="h-4 w-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
