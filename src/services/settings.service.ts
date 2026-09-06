import { cache } from "react";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { serialize } from "./serialize";
import type { SiteSettingsDTO } from "@/types";
import { defaultSiteContent } from "@/lib/site-content";

const FALLBACK_SETTINGS: SiteSettingsDTO = {
  siteName: "Xuân Nhã",
  tagline: "Code. Khám phá. Sáng tạo.",
  content: defaultSiteContent,
  seo: {
    metaTitle: "Xuân Nhã — Một chút tò mò. Vô hạn ý tưởng.",
    metaDescription:
      "Giới thiệu, kết nối và hợp tác cùng Xuân Nhã.",
    keywords: ["portfolio", "developer", "nextjs", "vibe coding"],
  },
  theme: "light",
  maintenanceMode: false,
};

export const getSiteSettings = cache(async (): Promise<SiteSettingsDTO> => {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      settings = (await SiteSettings.create({})).toObject();
    }
    return serialize<SiteSettingsDTO>(settings);
  } catch {
    return FALLBACK_SETTINGS;
  }
});
