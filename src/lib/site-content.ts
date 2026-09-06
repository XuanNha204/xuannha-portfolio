import { z } from "zod";

const asset = z.string().max(2048).refine(
  (value) => /^\/media\/[a-zA-Z0-9._/-]+$/.test(value) || /^https:\/\//.test(value),
  "Dùng đường dẫn /media/ hoặc URL https",
);
export const sampleSkills = [
  { title: "Giao diện có cảm xúc.", category: "Frontend", description: "Biến một ý tưởng thành trải nghiệm web rõ ràng, mượt mà và dễ sử dụng.", tools: "React · Next.js · TypeScript", symbol: "01" },
  { title: "Vững từ bên trong.", category: "Backend", description: "Kết nối dữ liệu, xây dựng API và đặt sự ổn định vào từng chi tiết.", tools: "Node.js · REST API · MongoDB", symbol: "02" },
  { title: "Thử điều chưa từng.", category: "AI & sáng tạo", description: "Khám phá AI trong lập trình và những cách mới để giải quyết vấn đề.", tools: "AI integration · Automation · Git", symbol: "03" },
];
export const siteContentSchema = z.object({
  homeTitle: z.string().min(1).max(100).default("Một chút tò mò.\nVô hạn ý tưởng."),
  homeDescription: z.string().max(240).default("Mình là Xuân Nhã. Mình viết code, khám phá AI và tạo nên những trải nghiệm số có cá tính."),
  availability: z.string().max(80).default("Sẵn sàng cho những ý tưởng mới"),
  heroEyebrow: z.string().max(100).default("HUỲNH XUÂN NHÃ / PERSONAL SPACE"),
  heroVideo: asset.default("/media/hero.mp4"),
  heroPoster: asset.default("/media/hero-poster.jpg"),
  aboutTitle: z.string().min(1).max(150).default("Đằng sau mỗi dòng code,\nlà một người thích khám phá."),
  aboutNote: z.string().max(120).default("Luôn học hỏi. Luôn thử nghiệm. Luôn là mình."),
  skillsTitle: z.string().min(1).max(100).default("Từ ý tưởng.\nĐến thực tế."),
  skillsDescription: z.string().max(200).default("Một vài kỹ năng và công nghệ mình đang khám phá trong phát triển phần mềm."),
  skills: z.array(z.object({
    title: z.string().min(1).max(100),
    category: z.string().min(1).max(50),
    description: z.string().max(240),
    tools: z.string().max(150),
    symbol: z.string().max(10),
  })).min(1).max(6).default(sampleSkills),
  projectsTitle: z.string().min(1).max(100).default("Những ý tưởng\nđã thành sản phẩm."),
  projectsDescription: z.string().max(240).default("Mình lưu các dự án và sản phẩm trên GitHub. Ghé xem những gì mình đã xây dựng nhé."),
  projectsUrl: z.string().url().max(2048).refine((value) => { try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "github.com"; } catch { return false; } }, "Dùng liên kết https://github.com").default("https://github.com/XuanNha204"),
  contactTitle: z.string().min(1).max(100).default("Ý tưởng của bạn.\nChương tiếp theo của mình."),
  contactDescription: z.string().max(240).default("Một dự án mới, một lời mời hợp tác, hay chỉ đơn giản là chào nhau."),
  contactEmail: z.string().email("Email không hợp lệ").or(z.literal("")).default("nhahx204@gmail.com"),
  footerNote: z.string().max(240).default("Một không gian nhỏ dành cho những ý tưởng lớn. Được tạo nên bằng sự tò mò và niềm vui khi làm điều mình thích."),
  chatbotEnabled: z.boolean().default(true),
  chatbotName: z.string().min(1).max(30).default("Cam"),
  chatbotGreeting: z.string().max(200).default("Chào bạn, mình là Cam — trợ lý AI của Nhã. Bạn muốn tìm hiểu về mình hay trao đổi một ý tưởng?"),
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export const defaultSiteContent: SiteContent = siteContentSchema.parse({});
export function resolveSiteContent(content?: Partial<SiteContent>): SiteContent {
  const parsed = siteContentSchema.safeParse({ ...defaultSiteContent, ...content });
  return parsed.success ? parsed.data : defaultSiteContent;
}
