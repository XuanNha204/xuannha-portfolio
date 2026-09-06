import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteSettings } from "@/services/settings.service";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

/** Hash ngắn để version hóa URL favicon — đổi ảnh trong CMS là đổi URL, khỏi kẹt cache. */
function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/**
 * Favicon do CMS quản lý (Cài đặt > Favicon):
 * - data URL (upload từ CMS) → trỏ qua /api/favicon để không phình <head>.
 * - URL http(s) → dùng trực tiếp.
 * - Chưa cấu hình → bộ icon tĩnh mặc định trong /public.
 */
function faviconIcons(favicon: string | undefined): Metadata["icons"] {
  if (favicon) {
    const url = favicon.startsWith("data:")
      ? `/api/favicon?v=${shortHash(favicon)}`
      : favicon;
    return { icon: url, shortcut: url, apple: url };
  }
  return { icon: "/icon.png", shortcut: "/favicon.ico", apple: "/apple-icon.png" };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seo?.metaTitle || `${settings.siteName}${settings.tagline ? ` — ${settings.tagline}` : ""}`;
  const description =
    settings.seo?.metaDescription ||
    "Giới thiệu, kết nối và hợp tác cùng Xuân Nhã.";

  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: title,
      template: `%s | ${settings.siteName}`,
    },
    description,
    keywords: settings.seo?.keywords,
    openGraph: {
      title,
      description,
      url: absoluteUrl(),
      siteName: settings.siteName,
      type: "website",
      locale: "vi_VN",
      ...(settings.seo?.ogImage ? { images: [settings.seo.ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    icons: faviconIcons(settings.favicon),
    alternates: {
      canonical: absoluteUrl(),
    },
    verification: settings.googleSearchConsoleId
      ? { google: settings.googleSearchConsoleId }
      : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      data-site-theme="dark"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
