import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 }];
}
