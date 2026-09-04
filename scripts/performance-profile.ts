import { performance } from "node:perf_hooks";
import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

async function timed<T>(name: string, operation: () => Promise<T>): Promise<T | undefined> {
  const start = performance.now();
  try {
    const value = await operation();
    console.log(`${name}\t${(performance.now() - start).toFixed(1)}ms`);
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${name}\tERROR\t${(performance.now() - start).toFixed(1)}ms\t${message}`);
  }
}

async function main() {
  // Match Next.js env parsing exactly (including dotenv variable expansion).
  loadEnvConfig(process.cwd());
  const { dbConnect } = await import("../src/lib/db");
  const { getSiteSettings } = await import("../src/services/settings.service");
  const { getProfile, getSkills, getSocialLinks } = await import(
    "../src/services/profile.service"
  );
  const { getFeaturedProjects, getPublishedProjects } = await import(
    "../src/services/project.service"
  );
  const { getLatestPosts, getPublishedPosts } = await import("../src/services/blog.service");
  const { getDashboardStats } = await import("../src/services/stats.service");
  const { getTotalViews, trackPageView } = await import("../src/services/analytics.service");
  const { Analytics } = await import("../src/models/Analytics");

  await timed("dbConnect.first", () => dbConnect());
  await timed("db.ping", () => mongoose.connection.db!.admin().ping());

  for (let pass = 1; pass <= 2; pass += 1) {
    await timed(`settings.${pass}`, () => getSiteSettings());
    await timed(`profile.${pass}`, () => getProfile());
    await timed(`socials.${pass}`, () => getSocialLinks());
    await timed(`skills.${pass}`, () => getSkills());
    await timed(`featured.${pass}`, () => getFeaturedProjects(6));
    await timed(`projects.${pass}`, () => getPublishedProjects());
    await timed(`latestPosts.${pass}`, () => getLatestPosts(3));
    await timed(`publishedPosts.${pass}`, () => getPublishedPosts({ limit: 1 }));
    await timed(`dashboardStats.${pass}`, () => getDashboardStats());
  }

  await timed("homepage.concurrent", () =>
    Promise.all([
      getProfile(),
      getSocialLinks(),
      getPublishedProjects(),
      getPublishedPosts({ limit: 3 }),
      getSkills(),
      getTotalViews(),
    ])
  );
  await timed("analytics.upsert", () => trackPageView("/__performance_audit_direct__"));
  await timed("analytics.indexes", async () => {
    console.dir(await Analytics.collection.indexes(), { depth: null });
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
