import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  PlayCircle,
  Calendar,
  UserRound,
  Lightbulb,
  Wrench,
  Trophy,
} from "lucide-react";
import { getProjectBySlug, getProjectSlugs } from "@/services/project.service";
import { ProjectGallery } from "@/features/projects/project-gallery";
import { Markdown } from "@/components/shared/markdown";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { formatDate, absoluteUrl, truncate } from "@/lib/utils";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Không tìm thấy dự án" };

  return {
    title: project.title,
    description: project.summary || truncate(project.description, 160),
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      url: absoluteUrl(`/projects/${project.slug}`),
      ...(project.coverImage ? { images: [project.coverImage] } : {}),
    },
    alternates: { canonical: absoluteUrl(`/projects/${project.slug}`) },
  };
}

function DetailBlock({
  icon,
  title,
  content,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          {icon}
        </span>
        <h3 className="font-heading text-lg font-semibold text-primary">{title}</h3>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-secondary">{content}</p>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    ...(project.coverImage ? { image: project.coverImage } : {}),
    ...(project.completedAt ? { dateCreated: project.completedAt } : {}),
  };

  return (
    <article className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-page max-w-5xl">
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Quay lại dự án
        </Link>

        <Reveal className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {project.featured && <Badge variant="mono">Nổi bật</Badge>}
            {project.completedAt && (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <Calendar className="h-4 w-4" />
                Hoàn thành {formatDate(project.completedAt)}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl">
            {project.title}
          </h1>
          {project.summary && <p className="mt-4 text-lg text-muted">{project.summary}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-inverse-fg transition-colors duration-200 hover:bg-inverse-hover"
              >
                <ExternalLink className="h-4 w-4" aria-hidden /> Xem demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-medium text-primary transition-colors duration-200 hover:border-muted/50"
              >
                <Github className="h-4 w-4" /> Mã nguồn
              </a>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-medium text-primary transition-colors duration-200 hover:border-muted/50"
              >
                <PlayCircle className="h-4 w-4" /> Video demo
              </a>
            )}
          </div>
        </Reveal>

        {/* Cover / gallery */}
        <Reveal className="mt-10">
          {project.gallery.length > 0 ? (
            <ProjectGallery
              images={
                project.coverImage
                  ? [{ url: project.coverImage, alt: project.title }, ...project.gallery]
                  : project.gallery
              }
              title={project.title}
            />
          ) : project.coverImage ? (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          ) : null}
        </Reveal>

        {/* Meta: role + tech stack */}
        <Reveal className="mt-10 grid gap-6 sm:grid-cols-2">
          {project.role && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <UserRound className="h-4 w-4 text-accent" /> Vai trò của tôi
              </div>
              <p className="text-sm text-secondary">{project.role}</p>
            </div>
          )}
          {project.techStack.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
              <div className="mb-3 text-sm font-semibold text-primary">Công nghệ sử dụng</div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="accent">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Reveal>

        {/* Description */}
        {project.description && (
          <Reveal className="mt-12">
            <Markdown content={project.description} />
          </Reveal>
        )}

        {/* Challenges / Solutions / Results */}
        {(project.challenges || project.solutions || project.results) && (
          <Reveal className="mt-12 grid gap-6 lg:grid-cols-3">
            {project.challenges && (
              <DetailBlock
                icon={<Lightbulb className="h-4.5 w-4.5" />}
                title="Khó khăn"
                content={project.challenges}
                tone="bg-warning/10 text-warning"
              />
            )}
            {project.solutions && (
              <DetailBlock
                icon={<Wrench className="h-4.5 w-4.5" />}
                title="Giải pháp"
                content={project.solutions}
                tone="bg-accent/10 text-accent"
              />
            )}
            {project.results && (
              <DetailBlock
                icon={<Trophy className="h-4.5 w-4.5" />}
                title="Kết quả"
                content={project.results}
                tone="bg-success/10 text-success"
              />
            )}
          </Reveal>
        )}

        {project.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">
            {project.tags.map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
