import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(100),
  email: z.string().email("Email không hợp lệ"),
  subject: z.string().max(200).optional().or(z.literal("")),
  content: z.string().min(10, "Nội dung tối thiểu 10 ký tự").max(5000),
});

export const projectImageSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  order: z.number().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(2, "Tên dự án tối thiểu 2 ký tự").max(200),
  slug: z.string().optional(),
  summary: z.string().max(500).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  gallery: z.array(projectImageSchema).optional(),
  videoUrl: z.string().optional().or(z.literal("")),
  githubUrl: z.string().optional().or(z.literal("")),
  demoUrl: z.string().optional().or(z.literal("")),
  techStack: z.array(z.string()).optional(),
  role: z.string().optional().or(z.literal("")),
  challenges: z.string().optional().or(z.literal("")),
  solutions: z.string().optional().or(z.literal("")),
  results: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  completedAt: z.string().optional().or(z.literal("")),
  order: z.number().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(2, "Tiêu đề tối thiểu 2 ký tự").max(200),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  scheduledAt: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional().or(z.literal("")),
      metaDescription: z.string().optional().or(z.literal("")),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional().or(z.literal("")),
      canonicalUrl: z.string().optional().or(z.literal("")),
    })
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().optional().or(z.literal("")),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(["frontend", "backend", "database", "devops", "tools", "other"]),
  level: z.number().min(1).max(100),
  icon: z.string().optional().or(z.literal("")),
  order: z.number().optional(),
  visible: z.boolean().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  description: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean().optional(),
  location: z.string().optional().or(z.literal("")),
  technologies: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export const educationSchema = z.object({
  school: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  field: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean().optional(),
  gpa: z.string().optional().or(z.literal("")),
  order: z.number().optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.string().optional().or(z.literal("")),
  credentialUrl: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  order: z.number().optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  url: z.string().url("URL không hợp lệ"),
  order: z.number().optional(),
  visible: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100),
  headline: z.string().max(200).optional().or(z.literal("")),
  about: z.string().optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  avatar: z
    .string()
    .max(3_000_000, "Avatar tối đa 2MB")
    .refine((value) => value === "" || value.startsWith("data:image/") || /^https?:\/\//.test(value), {
      message: "Avatar phải là file ảnh",
    })
    .optional()
    .or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
  careerGoal: z.string().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự").max(128),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  tagline: z.string().max(200).optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  favicon: z.string().optional().or(z.literal("")),
  seo: z
    .object({
      metaTitle: z.string().optional().or(z.literal("")),
      metaDescription: z.string().optional().or(z.literal("")),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional().or(z.literal("")),
    })
    .optional(),
  googleAnalyticsId: z.string().optional().or(z.literal("")),
  googleSearchConsoleId: z.string().optional().or(z.literal("")),
  footerText: z.string().optional().or(z.literal("")),
  theme: z.enum(["light", "dark", "system"]).optional(),
  maintenanceMode: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CertificateInput = z.infer<typeof certificateSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
