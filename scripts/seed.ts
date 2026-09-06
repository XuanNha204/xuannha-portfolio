/** Creates an owner and settings only. Existing content is never overwritten. */
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
async function main() {
  loadEnvConfig(process.cwd(), true);
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password, ADMIN_NAME: name } = process.env;
  if (!email || !password || password.length < 8) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters).");
  const { dbConnect } = await import("../src/lib/db");
  const { User } = await import("../src/models/User");
  const { SiteSettings } = await import("../src/models/SiteSettings");
  const { defaultSiteContent } = await import("../src/lib/site-content");
  await dbConnect();
  if (!(await User.exists({ role: "owner" }))) {
    await User.create({ name: name || "Owner", email, password: await bcrypt.hash(password, 12), role: "owner" });
    console.log("Owner created.");
  }
  if (!(await SiteSettings.exists({}))) {
    await SiteSettings.create({ content: defaultSiteContent });
    console.log("Website settings created.");
  }
  console.log("Seed complete. Existing content preserved.");
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Seed failed"); process.exitCode = 1; }).finally(() => mongoose.disconnect());
