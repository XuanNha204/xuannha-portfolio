import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { getPostBySlug, getPostSlugs, getRelatedPosts } from "@/services/blog.service";
import { Markdown } from "@/components/shared/markdown";
import { BlogCard } from "@/components/shared/blog-card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { absoluteUrl, formatDate, truncate } from "@/lib/utils";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || truncate(post.content, 160);

  return {
    title,
    description,
    keywords: post.seo?.keywords?.length ? post.seo.keywords : post.tags,
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt,
      ...(post.seo?.ogImage || post.coverImage
        ? { images: [post.seo?.ogImage || post.coverImage] }
        : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      canonical: post.seo?.canonicalUrl || absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export default async function BlogDetailPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const category = typeof post.category === "object" ? post.category : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: absoluteUrl(`/blog/${post.slug}`),
    ...(post.coverImage ? { image: post.coverImage } : {}),
    author: { "@type": "Person", name: "Xuân Nhã", url: absoluteUrl() },
  };

  return (
    <article className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-page max-w-3xl">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Quay lại blog
        </Link>

        <Reveal className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            {category && <Badge variant="accent">{category.name}</Badge>}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime} phút đọc
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {post.views.toLocaleString("vi-VN")} lượt xem
            </span>
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-primary md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && <p className="mt-4 text-lg text-muted">{post.excerpt}</p>}
        </Reveal>

        {post.coverImage && (
          <Reveal className="mt-8">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        <div className="mt-10">
          <Markdown content={post.content} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge className="transition-colors hover:border-accent hover:text-accent">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="container-page mt-20">
          <h2 className="mb-8 font-heading text-2xl font-bold text-primary">
            Bài viết liên quan
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p._id} post={p} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
