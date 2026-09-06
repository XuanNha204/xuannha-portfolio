export interface SocialLinkDTO {
  _id: string;
  platform: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
}

export interface MessageDTO {
  emailNotification?: "pending" | "sent" | "failed" | "not_configured";
  _id: string;
  name: string;
  email: string;
  subject?: string;
  content: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface MediaDTO {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  type: "image" | "video" | "pdf" | "other";
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  folder?: string;
  createdAt: string;
}

export interface ProfileDTO {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  headline?: string;
  about?: string;
  location?: string;
  phone?: string;
  resumeUrl?: string;
  careerGoal?: string;
}

export interface SiteSettingsDTO {
  content?: import("@/lib/site-content").SiteContent;
  _id?: string;
  siteName: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  footerText?: string;
  theme: "light" | "dark" | "system";
  maintenanceMode: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
