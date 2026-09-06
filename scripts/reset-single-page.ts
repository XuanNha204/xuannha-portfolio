/**
 * Explicit one-time content reset requested for the one-page redesign.
 * Keeps authentication accounts. Only touches the selected local portfolio DB.
 * Run: npx tsx scripts/reset-single-page.ts --apply
 */
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { defaultSiteContent } from "../src/lib/site-content";
import { freshProfile } from "../src/lib/fresh-profile";

async function main() {
  loadEnvConfig(process.cwd(), true);
  const uri = new URL(process.env.MONGODB_URI || "");
  if (!["127.0.0.1", "localhost"].includes(uri.hostname) || uri.pathname !== "/xuannha-dev") {
    throw new Error("Reset is restricted to the local xuannha-dev database.");
  }
  const connection = await mongoose.createConnection(uri.toString(), { autoIndex: false }).asPromise();
  const retired = ["projects", "blogposts", "categories", "tags", "skills", "experiences", "educations", "certificates", "analytics", "media", "messages", "sociallinks", "sitesettings"];
  try {
    const counts = Object.fromEntries(await Promise.all(retired.map(async (name) => [name, await connection.collection(name).countDocuments()])));
    console.log(JSON.stringify({ target: "localhost/xuannha-dev", contentCounts: counts, accountsPreserved: await connection.collection("users").countDocuments() }));
    if (!process.argv.includes("--apply")) { console.log("Read-only. Use --apply for the authorized content reset."); return; }
    if (!(await connection.collection("users").findOne({ role: "owner" }))) throw new Error("No owner account; stopping before reset.");
    for (const name of retired) await connection.collection(name).deleteMany({});
    await connection.collection("users").updateMany({ role: "owner" }, { $set: { ...freshProfile, updatedAt: new Date() } });
    await connection.collection("sitesettings").insertOne({
      siteName: "Xuân Nhã", tagline: "Code. Khám phá. Sáng tạo.",
      content: defaultSiteContent,
      logo: "", favicon: "",
      seo: { metaTitle: "Xuân Nhã — Một chút tò mò. Vô hạn ý tưởng.", metaDescription: "Không gian cá nhân của Huỳnh Xuân Nhã. Lập trình, khám phá AI và cùng tạo nên những trải nghiệm mới.", ogImage: "/media/hero-poster.jpg", keywords: ["Xuân Nhã", "lập trình", "portfolio"] },
      theme: "dark", maintenanceMode: false, footerText: "",
      createdAt: new Date(), updatedAt: new Date(),
    });
    console.log("Old content cleared; new one-page content created. Authentication credentials unchanged.");
  } finally { await connection.close(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Reset failed"); process.exitCode = 1; });
