export interface ProjectImageDTO {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
}

export interface ProjectDTO {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: string;
  gallery: ProjectImageDTO[];
  videoUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  techStack: string[];
  role?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
  tags: string[];
  featured: boolean;
  status: "draft" | "published" | "archived";
  completedAt?: string;
  order: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogPostDTO {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category?: CategoryDTO | string | null;
  tags: string[];
  readingTime: number;
  status: "draft" | "published" | "scheduled";
  publishedAt?: string;
  scheduledAt?: string;
  views: number;
  featured: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SkillDTO {
  _id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "tools" | "other";
  icon?: string;
  order: number;
  visible: boolean;
}

export interface ExperienceDTO {
  _id: string;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  location?: string;
  technologies: string[];
  order: number;
}

export interface EducationDTO {
  _id: string;
  school: string;
  degree: string;
  field?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  gpa?: string;
  order: number;
}

export interface CertificateDTO {
  _id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
  image?: string;
  order: number;
}

export interface SocialLinkDTO {
  _id: string;
  platform: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
}

export interface MessageDTO {
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

export interface DashboardStats {
  totalViews: number;
  totalProjects: number;
  totalPosts: number;
  totalMessages: number;
  unreadMessages: number;
  viewsByDay: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
