import { Hero } from "@/features/home/hero";
import { AboutPreview } from "@/features/home/about-preview";
import { FeaturedProjects } from "@/features/home/featured-projects";
import { LatestBlog } from "@/features/home/latest-blog";
import { SkillsSection } from "@/features/home/skills-section";
import { StatsSection } from "@/features/home/stats-section";
import { ContactCta } from "@/features/home/contact-cta";
import { getProfile, getSkills, getSocialLinks } from "@/services/profile.service";
import { getPublishedProjects } from "@/services/project.service";
import { getPublishedPosts } from "@/services/blog.service";
import { getTotalViews } from "@/services/analytics.service";
import { logPerformance } from "@/lib/performance";

export const revalidate = 60;

export default async function HomePage() {
  const dataStartedAt = performance.now();
  const [profile, socialLinks, allProjects, posts, skills, totalViews] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getPublishedProjects(),
    getPublishedPosts({ limit: 3 }),
    getSkills(),
    getTotalViews(),
  ]);
  logPerformance("page.home.data", performance.now() - dataStartedAt, {
    projects: allProjects.length,
    posts: posts.total,
    skills: skills.length,
  });

  const featured = allProjects.filter((project) => project.featured).slice(0, 6);
  const featuredList = featured.length > 0 ? featured : allProjects.slice(0, 6);

  return (
    <>
      <Hero profile={profile} socialLinks={socialLinks} />
      <AboutPreview profile={profile} />
      <FeaturedProjects projects={featuredList} />
      <StatsSection
        projects={allProjects.length}
        posts={posts.total}
        skills={skills.length}
        views={totalViews}
      />
      <SkillsSection skills={skills} />
      <LatestBlog posts={posts.items} />
      <ContactCta />
    </>
  );
}
