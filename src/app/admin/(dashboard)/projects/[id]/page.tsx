import { notFound } from "next/navigation";
import { getProjectById } from "@/services/project.service";
import { ProjectForm } from "@/features/admin/projects/project-form";

export const metadata = { title: "Sửa dự án" };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return <ProjectForm project={project} />;
}
