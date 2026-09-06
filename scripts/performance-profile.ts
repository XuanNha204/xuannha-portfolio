import { performance } from "node:perf_hooks";
import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";
async function main() {
  loadEnvConfig(process.cwd());
  const { dbConnect } = await import("../src/lib/db");
  const { getSiteSettings } = await import("../src/services/settings.service");
  const { getProfile, getSocialLinks } = await import("../src/services/profile.service");
  const started = performance.now();
  await dbConnect();
  console.log(`Database connection: ${(performance.now() - started).toFixed(1)}ms`);
  const readStart = performance.now();
  await Promise.all([getSiteSettings(), getProfile(), getSocialLinks()]);
  console.log(`Public content reads: ${(performance.now() - readStart).toFixed(1)}ms`);
}
main().catch(() => { console.error("Profile failed; check database connectivity."); process.exitCode = 1; }).finally(() => mongoose.disconnect());
