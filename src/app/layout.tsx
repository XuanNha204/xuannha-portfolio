import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { getSiteSettings } from "@/services/settings.service";
import { Providers } from "@/components/providers";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains-mono",
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
  const title = settings.seo?.metaTitle || `${settings.siteName} — ${settings.tagline}`;
  const description =
    settings.seo?.metaDescription ||
    "Portfolio, blog và dự án của Xuân Nhã — Vibe Coding Studio.";

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
      types: { "application/rss+xml": absoluteUrl("/rss.xml") },
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
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        {/* Thanh progress chạy ngay khi bắt đầu điều hướng — phản hồi tức thì
            thay cho màn hình trắng. Màu lấy từ --color-accent nên tự khớp theme. */}
        <NextTopLoader
          color="var(--color-accent)"
          height={2}
          showSpinner={false}
          shadow="0 0 8px var(--color-accent)"
        />
        <Providers>
          {children}
          <AnalyticsTracker />
        </Providers>
      </body>
    </html>
  );
}
