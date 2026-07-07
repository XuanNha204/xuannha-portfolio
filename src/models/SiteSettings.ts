import { Schema, model, models, type Model } from "mongoose";

export interface ISiteSettings {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: "XuanNha.Dev" },
    tagline: { type: String, default: "Vibe Coding Studio" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: "" },
    },
    googleAnalyticsId: { type: String, default: "" },
    googleSearchConsoleId: { type: String, default: "" },
    footerText: { type: String, default: "" },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
