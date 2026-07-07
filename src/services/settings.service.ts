import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models";
import { serialize } from "./serialize";
import type { SiteSettingsDTO } from "@/types";

const FALLBACK_SETTINGS: SiteSettingsDTO = {
  siteName: "XuanNha.Dev",
  tagline: "Vibe Coding Studio",
  seo: {
    metaTitle: "XuanNha.Dev — Vibe Coding Studio",
    metaDescription:
      "Portfolio, blog và dự án của Xuân Nhã — lập trình viên fullstack theo hướng AI-Assisted Development.",
    keywords: ["portfolio", "developer", "nextjs", "vibe coding"],
  },
  theme: "light",
  maintenanceMode: false,
};

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
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
}
