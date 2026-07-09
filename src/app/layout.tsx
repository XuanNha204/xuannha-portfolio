import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
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
    ...(settings.favicon ? { icons: { icon: settings.favicon } } : {}),
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
        <Providers>
          {children}
          <AnalyticsTracker />
        </Providers>
      </body>
    </html>
  );
}
