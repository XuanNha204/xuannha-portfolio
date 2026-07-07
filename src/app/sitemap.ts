import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/services/project.service";
import { getPostSlugs } from "@/services/blog.service";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, postSlugs] = await Promise.all([getProjectSlugs(), getPostSlugs()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/projects"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...projectSlugs.map((slug) => ({
      url: absoluteUrl(`/projects/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...postSlugs.map((slug) => ({
      url: absoluteUrl(`/blog/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
