import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { BlogPostDTO } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { BlogCard } from "@/components/shared/blog-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";

export function LatestBlog({ posts }: { posts: BlogPostDTO[] }) {
  return (
    <section className="border-y border-border bg-surface py-24">
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

        <Reveal className="mt-12 text-center">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-medium text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Xem tất cả bài viết
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
