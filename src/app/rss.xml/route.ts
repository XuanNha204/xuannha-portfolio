import { getPublishedPosts } from "@/services/blog.service";
import { getSiteSettings } from "@/services/settings.service";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [settings, { items: posts }] = await Promise.all([
    getSiteSettings(),
    getPublishedPosts({ limit: 20 }),
  ]);

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
      <guid>${absoluteUrl(`/blog/${post.slug}`)}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(settings.siteName)} — Blog</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${escapeXml(settings.seo?.metaDescription || settings.tagline || "")}</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
