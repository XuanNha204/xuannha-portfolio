import type { Metadata } from "next";
import { FolderGit2 } from "lucide-react";
import { getPublishedProjects } from "@/services/project.service";
import { ProjectSlider } from "@/features/projects/project-slider";
import { ProjectCard } from "@/components/shared/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

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
    <div className="py-20">
      <div className="container-page">
        <Reveal className="mb-14 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            {"// projects"}
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl">
            Dự án của tôi
          </h1>
          <p className="mt-4 text-lg text-muted">
            {projects.length > 0
              ? `${projects.length} dự án — kéo ngang hoặc dùng nút điều hướng để khám phá.`
              : "Danh sách dự án sẽ sớm được cập nhật."}
          </p>
        </Reveal>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderGit2 className="h-6 w-6" />}
            title="Chưa có dự án nào được công bố"
            description="Quay lại sau nhé — các dự án đang được hoàn thiện."
          />
        ) : (
          <>
            <Reveal>
              <ProjectSlider projects={featured.length > 0 ? featured : projects} />
            </Reveal>

            {featured.length > 0 && rest.length > 0 && (
              <div className="mt-20">
                <h2 className="mb-8 font-heading text-2xl font-bold text-primary">
                  Tất cả dự án
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
