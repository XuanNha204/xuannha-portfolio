import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
import type { ProjectDTO } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProjectCard } from "@/components/shared/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";

export function FeaturedProjects({ projects }: { projects: ProjectDTO[] }) {
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="// projects"
          title="Dự án nổi bật"
          description="Những sản phẩm tôi tâm đắc nhất — từ ý tưởng đến triển khai thực tế."
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderGit2 className="h-6 w-6" />}
            title="Chưa có dự án nổi bật"
            description="Các dự án sẽ sớm được cập nhật qua CMS."
          />
        ) : (
          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <RevealItem key={project._id}>
                <ProjectCard project={project} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        <Reveal className="mt-12 text-center">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 font-medium text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Xem tất cả dự án
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
