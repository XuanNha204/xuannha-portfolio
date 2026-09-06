import { z } from "zod";
import { siteContentSchema } from "@/lib/site-content";

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

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  url: z.string().url("URL không hợp lệ").refine((value) => /^(https?:\/\/|mailto:)/i.test(value), "Chỉ dùng liên kết http, https hoặc mailto"),
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
    .refine((value) => value === "" || /^\/media\/[a-zA-Z0-9._/-]+$/.test(value) || value.startsWith("data:image/") || /^https?:\/\//.test(value), {
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
  content: siteContentSchema.optional(),
  siteName: z.string().min(1).max(100),
  tagline: z.string().max(200).optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  favicon: z
    .string()
    .max(4_000_000, "Favicon tối đa 3MB")
    .refine(
      (value) => value === "" || value.startsWith("data:image/") || /^https?:\/\//.test(value),
      { message: "Favicon phải là file ảnh" }
    )
    .optional()
    .or(z.literal("")),
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
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
