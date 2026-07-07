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
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-border/40">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <FolderGit2 className="h-10 w-10" />
          </div>
        )}
        {project.featured && (
          <Badge variant="mono" className="absolute left-3 top-3">
            Nổi bật
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold text-primary transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

        {project.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{project.summary}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
          {project.techStack.length > 4 && <Badge>+{project.techStack.length - 4}</Badge>}
          {project.githubUrl && (
            <Github className="ml-auto h-4 w-4 text-muted transition-colors group-hover:text-primary" />
          )}
        </div>
      </div>
    </Link>
  );
}
