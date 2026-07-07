import { Hero } from "@/features/home/hero";
import { AboutPreview } from "@/features/home/about-preview";
import { FeaturedProjects } from "@/features/home/featured-projects";
import { LatestBlog } from "@/features/home/latest-blog";
import { SkillsSection } from "@/features/home/skills-section";
import { StatsSection } from "@/features/home/stats-section";
import { ContactCta } from "@/features/home/contact-cta";
import { getProfile, getSkills, getSocialLinks } from "@/services/profile.service";
import { getFeaturedProjects, getPublishedProjects } from "@/services/project.service";
import { getLatestPosts, getPublishedPosts } from "@/services/blog.service";
import { getDashboardStats } from "@/services/stats.service";

export const revalidate = 60;

export default async function HomePage() {
  const [profile, socialLinks, featured, allProjects, latestPosts, allPosts, skills, stats] =
    await Promise.all([
      getProfile(),
      getSocialLinks(),
      getFeaturedProjects(6),
      getPublishedProjects(),
      getLatestPosts(3),
      getPublishedPosts({ limit: 1 }),
      getSkills(),
      getDashboardStats(),
    ]);

  const featuredList = featured.length > 0 ? featured : allProjects.slice(0, 6);

  return (
    <>
      <Hero profile={profile} socialLinks={socialLinks} />
      <AboutPreview profile={profile} />
      <FeaturedProjects projects={featuredList} />
      <StatsSection
        projects={allProjects.length}
        posts={allPosts.total}
        skills={skills.length}
        views={stats.totalViews}
      />
      <SkillsSection skills={skills} />
      <LatestBlog posts={latestPosts} />
      <ContactCta />
    </>
  );
}
