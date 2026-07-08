/**
 * Seed script — creates the owner account, default site settings and
 * (optionally, with --demo) sample content.
 *
 * Usage:
 *   npm run seed          # owner + settings
 *   npm run seed -- --demo  # owner + settings + demo content
 */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Minimal .env.local loader (no external dependency needed)
function loadEnv(file: string) {
  const envPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    const key = match[1];
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/xuannha-dev";
  console.log(`→ Kết nối MongoDB: ${uri.replace(/\/\/.*@/, "//***@")}`);
  await mongoose.connect(uri);

  const { User, SiteSettings, Skill, Category, SocialLink, Project, BlogPost } = await import(
    "../src/models"
  );

  // 1. Owner account
  const email = process.env.ADMIN_EMAIL || "nhahx204@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const name = process.env.ADMIN_NAME || "Xuân Nhã";

  const existing = await User.findOne({ role: "owner" });
  if (existing) {
    console.log(`✓ Owner đã tồn tại: ${existing.email}`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      password: hashed,
      role: "owner",
      headline: "Fullstack Developer · Vibe Coding Studio",
      location: "Việt Nam",
    });
    console.log(`✓ Đã tạo owner: ${email} / ${password}`);
  }

  // 2. Site settings singleton
  if (!(await SiteSettings.findOne())) {
    await SiteSettings.create({
      siteName: "XuanNha.Dev",
      tagline: "Vibe Coding Studio",
      seo: {
        metaTitle: "XuanNha.Dev — Vibe Coding Studio",
        metaDescription:
          "Portfolio, blog và dự án của Xuân Nhã — lập trình viên fullstack theo hướng AI-Assisted Development.",
        keywords: ["portfolio", "developer", "nextjs", "vibe coding"],
      },
    });
    console.log("✓ Đã tạo Site Settings mặc định");
  }

  // 3. Demo content (optional)
  if (process.argv.includes("--demo")) {
    if ((await Skill.countDocuments()) === 0) {
      await Skill.insertMany([
        { name: "React / Next.js", category: "frontend", order: 1 },
        { name: "TypeScript", category: "frontend", order: 2 },
        { name: "Tailwind CSS", category: "frontend", order: 3 },
        { name: "Node.js", category: "backend", order: 1 },
        { name: "REST API", category: "backend", order: 2 },
        { name: "MongoDB", category: "database", order: 1 },
        { name: "Docker", category: "devops", order: 1 },
        { name: "Git / Github", category: "tools", order: 1 },
        { name: "AI-Assisted Development", category: "tools", order: 2 },
      ]);
      console.log("✓ Đã tạo demo skills");
    }

    let category = await Category.findOne({ slug: "vibe-coding" });
    if (!category) {
      category = await Category.create({
        name: "Vibe Coding",
        slug: "vibe-coding",
        description: "AI-Assisted Development",
      });
      console.log("✓ Đã tạo demo category");
    }

    if ((await SocialLink.countDocuments()) === 0) {
      await SocialLink.insertMany([
        { platform: "github", label: "Github", url: "https://github.com", order: 1 },
        { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", order: 2 },
        { platform: "facebook", label: "Facebook", url: "https://facebook.com", order: 3 },
      ]);
      console.log("✓ Đã tạo demo social links");
    }

    if ((await Project.countDocuments()) === 0) {
      await Project.create({
        title: "XuanNha.Dev — Vibe Coding Studio",
        slug: "xuannha-dev-vibe-coding-studio",
        summary:
          "Website portfolio cá nhân kết hợp Blog, CMS và Project Showcase — xây dựng bằng Next.js 15, MongoDB và AI.",
        description:
          "## Giới thiệu\n\nDự án portfolio cá nhân với đầy đủ CMS quản trị nội dung.\n\n- Next.js 15 App Router + React 19\n- MongoDB + Mongoose\n- NextAuth v5, MongoDB Media storage, Framer Motion, Lenis\n\n## Kiến trúc\n\nToàn bộ nội dung được quản lý qua CMS, không có dữ liệu hardcode.",
        techStack: ["Next.js 15", "React 19", "TypeScript", "MongoDB", "Tailwind CSS"],
        tags: ["portfolio", "fullstack", "vibe-coding"],
        role: "Fullstack Developer",
        challenges: "Xây dựng hệ thống CMS đầy đủ trong thời gian ngắn với một mình.",
        solutions: "Áp dụng Vibe Coding — kết hợp AI để tăng tốc phát triển gấp nhiều lần.",
        results: "Website hoàn chỉnh với CMS, SEO, animation và hiệu năng tối ưu.",
        featured: true,
        status: "published",
        completedAt: new Date(),
      });
      console.log("✓ Đã tạo demo project");
    }

    if ((await BlogPost.countDocuments()) === 0) {
      await BlogPost.create({
        title: "Vibe Coding là gì? Lập trình cùng AI trong năm 2026",
        slug: "vibe-coding-la-gi",
        excerpt:
          "Vibe Coding — phong cách phát triển phần mềm kết hợp AI — đang thay đổi cách chúng ta xây dựng sản phẩm.",
        content:
          "## Vibe Coding là gì?\n\n**Vibe Coding** là phong cách phát triển phần mềm trong đó lập trình viên tập trung vào *ý tưởng và kiến trúc*, còn AI đảm nhận phần lớn việc viết code chi tiết.\n\n### Lợi ích\n\n- Tăng tốc phát triển 5-10 lần\n- Tập trung vào giá trị sản phẩm\n- Giảm lỗi lặp lại nhờ pattern nhất quán\n\n### Quy trình\n\n1. Mô tả yêu cầu rõ ràng (blueprint)\n2. AI sinh code theo kiến trúc đã chọn\n3. Review, test và tinh chỉnh\n\n> Công cụ tốt không thay thế tư duy — nó khuếch đại tư duy.\n\n```ts\nconst future = await ai.build(blueprint);\n```",
        category: category._id,
        tags: ["vibe-coding", "ai", "nextjs"],
        readingTime: 3,
        status: "published",
        publishedAt: new Date(),
        featured: true,
      });
      console.log("✓ Đã tạo demo blog post");
    }
  }

  await mongoose.disconnect();
  console.log("\n✔ Seed hoàn tất!");
}

main().catch((err) => {
  console.error("✗ Seed thất bại:", err);
  process.exit(1);
});
