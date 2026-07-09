import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github, FolderGit2 } from "lucide-react";
import type { ProjectDTO } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectDTO;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/30 hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-border/30">
        {project.coverImage ? (
          <>
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <FolderGit2 className="h-10 w-10" aria-hidden />
          </div>
        )}
        {project.featured && (
          <Badge variant="mono" className="absolute left-3.5 top-3.5">
            Nổi bật
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-primary transition-colors duration-200 group-hover:text-accent">
            {project.title}
          </h3>
          <ArrowUpRight
            className="h-5 w-5 shrink-0 text-muted/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            aria-hidden
          />
        </div>

        {project.summary && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {project.summary}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
          {project.techStack.length > 4 && <Badge>+{project.techStack.length - 4}</Badge>}
          {project.githubUrl && (
            <Github
              className="ml-auto h-4 w-4 text-muted/60 transition-colors duration-200 group-hover:text-primary"
              aria-hidden
            />
          )}
        </div>
      </div>
    </Link>
  );
}
