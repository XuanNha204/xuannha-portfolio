import { cache } from "react";
import { dbConnect } from "@/lib/db";
import { Project } from "@/models/Project";
import { serialize } from "./serialize";
import type { Paginated, ProjectDTO } from "@/types";

// Public cards/chat do not need long descriptions or base64-backed galleries.
const PROJECT_LIST_FIELDS =
  "title slug summary coverImage githubUrl techStack featured status completedAt order views createdAt updatedAt";

export const getPublishedProjects = cache(async (limit?: number): Promise<ProjectDTO[]> => {
  try {
    await dbConnect();
    const query = Project.find({ status: "published" })
      .select(PROJECT_LIST_FIELDS)
      .sort({ order: 1, completedAt: -1 });
    if (limit) query.limit(limit);
    return serialize<ProjectDTO[]>(await query.lean());
  } catch {
    return [];
  }
});

export const getFeaturedProjects = cache(async (limit = 6): Promise<ProjectDTO[]> => {
  try {
    await dbConnect();
    const projects = await Project.find({ status: "published", featured: true })
      .select(PROJECT_LIST_FIELDS)
      .sort({ order: 1, completedAt: -1 })
      .limit(limit)
      .lean();
    return serialize<ProjectDTO[]>(projects);
  } catch {
    return [];
  }
});

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDTO | null> => {
  try {
    await dbConnect();
    const project = await Project.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    ).lean();
    return project ? serialize<ProjectDTO>(project) : null;
  } catch {
    return null;
  }
});

export const getProjectSlugs = cache(async (): Promise<string[]> => {
  try {
    await dbConnect();
    const docs = await Project.find({ status: "published" }).select("slug").lean();
    return docs.map((d) => d.slug);
  } catch {
    return [];
  }
});

export async function getAdminProjects(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  featured?: string;
}): Promise<Paginated<ProjectDTO>> {
  await dbConnect();
  const { page = 1, limit = 10, search, status, featured } = params;

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (featured === "true") filter.featured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { techStack: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const [total, items] = await Promise.all([
    Project.countDocuments(filter),
    Project.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    items: serialize<ProjectDTO[]>(items),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getProjectById(id: string): Promise<ProjectDTO | null> {
  try {
    await dbConnect();
    const project = await Project.findById(id).lean();
    return project ? serialize<ProjectDTO>(project) : null;
  } catch {
    return null;
  }
}
