import type { Metadata } from "next";
import { FolderGit2 } from "lucide-react";
import { getPublishedProjects } from "@/services/project.service";
import { ProjectSlider } from "@/features/projects/project-slider";
import { ProjectCard } from "@/components/shared/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { T } from "@/components/site/site-preferences";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dự án",
  description: "Các dự án phần mềm tôi đã xây dựng — từ ý tưởng đến sản phẩm hoàn chỉnh.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="py-24 md:py-28">
      <div className="container-page">
        <Reveal className="mb-16 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {"// projects"}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-primary md:text-5xl">
            <T k="projects.title" />
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
            {projects.length > 0 ? (
              <>
                {projects.length} <T k="projects.countSuffix" />
              </>
            ) : (
              <T k="projects.emptyLead" />
            )}
          </p>
        </Reveal>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderGit2 className="h-6 w-6" />}
            title={<T k="projects.emptyTitle" />}
            description={<T k="projects.emptyDesc" />}
          />
        ) : (
          <>
            <Reveal>
              <ProjectSlider projects={featured.length > 0 ? featured : projects} />
            </Reveal>

            {featured.length > 0 && rest.length > 0 && (
              <div className="mt-20">
                <h2 className="mb-8 font-heading text-2xl font-bold text-primary">
                  <T k="projects.all" />
                </h2>
                <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((project) => (
                    <RevealItem key={project._id}>
                      <ProjectCard project={project} />
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
